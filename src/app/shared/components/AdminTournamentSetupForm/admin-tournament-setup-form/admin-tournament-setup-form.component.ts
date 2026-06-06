import {
  Component,
  ChangeDetectionStrategy,
  signal,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminTournamentsService } from '../../../../core/services/AdminTournaments/admin-tournaments.service';
import { AdminManageCourtsService } from '../../../../core/services/AdminManageCourts/admin-manage-courts.service';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from '../../../../core/services/toast/toast.service';


type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';
type ToastType = 'success' | 'error';
type ModalKind = 'none' | 'publishConfirm' | 'draftConfirm' | 'success';

interface MainCourt {
  id: number;
  name: string;
  courts: Court[];
}

interface Court {
  id: number;
  name: string;
}

interface Timeslot {
  id: number;
  start_time: string;
  end_time: string;
}

@Component({
  selector: 'app-admin-tournament-setup-form',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './admin-tournament-setup-form.component.html',
  styleUrl: './admin-tournament-setup-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminTournamentSetupFormComponent implements OnInit, OnDestroy {
  private adminTournamentsService = inject(AdminTournamentsService);
  private adminManageCourtsService = inject(AdminManageCourtsService);
  private toastService = inject(ToastService);

  @Output() tournamentCreated = new EventEmitter<void>();

  tournamentForm: FormGroup;
  mainCourts = signal<MainCourt[]>([]);
  courts = signal<Court[]>([]);
  selectedCourtId = signal<number | string | null>(null);
  currentDate = signal(new Date());
  calendarDays = signal<{ date: Date; dayNumber: number; isCurrentMonth: boolean }[]>([]);
  selectedDate = signal<Date | null>(null);
  availableSlots = signal<Timeslot[]>([]);
  selectedTimeslotIds = signal<number[]>([]);
  isLoadingSlots = signal(false);
  posterIsDragging = signal<boolean>(false);
  posterUploadStatus = signal<UploadStatus>('idle');
  posterErrorMessage = signal<string>('');
  posterFile = signal<File | null>(null);
  posterFileName = signal<string>('');
  posterPreviewUrl = signal<string | null>(null);

  private lastSelectedPosterFile: File | null = null;
  private posterUploadTimer: number | null = null;
  tournamentStatus = signal<'Draft' | 'Published'>('Draft');
  isModalOpen = signal<boolean>(false);
  modalKind = signal<ModalKind>('none');
  modalTitle = signal<string>('');
  modalMessage = signal<string>('');
  toastMessage = signal<string | null>(null);
  toastType = signal<ToastType>('success');

  private toastTimer: number | null = null;
  private readonly draftKey = 'ehgazly:tournament_setup_draft:v1';

  constructor(private fb: FormBuilder) {
    this.tournamentForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      maincourt_id: ['', Validators.required],
      court_id: ['', Validators.required],
      team_size: ['', Validators.required],
      max_teams: [null, [Validators.required, Validators.min(2)]],
      entryFee: [null, [Validators.required, Validators.min(0)]],
      important_note: [''],
      prize1_title: ['', Validators.required],
      prize1_money: [null, [Validators.required, Validators.min(0)]],
      prize2_title: ['', Validators.required],
      prize2_money: [null, [Validators.required, Validators.min(0)]],
      rules: [''],
      cover_image: [null, Validators.required],
      selectedDate: [null, Validators.required],
      timeslot_ids: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadMainCourts();
    this.restoreDraft();
    this.generateCalendar();

    this.tournamentForm.get('maincourt_id')?.valueChanges.subscribe(mainId => {
      this.updateCourtsDropdown(mainId);
    });

    this.tournamentForm.get('court_id')?.valueChanges.subscribe(courtId => {
      this.selectedCourtId.set(courtId ?? null);
      this.resetSchedule();
    });
  }

  ngOnDestroy(): void {
    this.clearPosterUploadTimer();
    this.clearToastTimer();
    const url = this.posterPreviewUrl();
    if (url) URL.revokeObjectURL(url);
  }
  loadMainCourts(): void {
    this.adminManageCourtsService.ShowAllCourts().subscribe({
      next: (res: any) => {
        if (res?.data) this.mainCourts.set(res.data);
      },
      error: () => this.triggerToast('Failed to load courts data', 'error')
    });
  }

  updateCourtsDropdown(mainCourtId: string | number): void {
    const selectedMain = this.mainCourts().find(c => c.id == mainCourtId);
    this.courts.set(selectedMain?.courts || []);
    this.tournamentForm.get('court_id')?.setValue('');
    this.selectedCourtId.set(null);
    this.resetSchedule();
  }
  isCalendarEnabled(): boolean {
    const mainId = this.tournamentForm.get('maincourt_id')?.value;
    const courtId = this.tournamentForm.get('court_id')?.value;
    return !!(mainId && courtId);
  }

  generateCalendar(): void {
    const year = this.currentDate().getFullYear();
    const month = this.currentDate().getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: { date: Date; dayNumber: number; isCurrentMonth: boolean }[] = [];

    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, dayNumber: date.getDate(), isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ date, dayNumber: i, isCurrentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, dayNumber: date.getDate(), isCurrentMonth: false });
    }

    this.calendarDays.set(days);
  }

  currentMonthYear(): string {
    return this.currentDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  previousMonth(): void {
    this.currentDate.set(new Date(this.currentDate().getFullYear(), this.currentDate().getMonth() - 1, 1));
    this.generateCalendar();
    this.resetSchedule();
  }

  nextMonth(): void {
    this.currentDate.set(new Date(this.currentDate().getFullYear(), this.currentDate().getMonth() + 1, 1));
    this.generateCalendar();
    this.resetSchedule();
  }

  isSameDate(d1: Date, d2: Date): boolean {
    return d1.toDateString() === d2.toDateString();
  }

  onDateSelect(date: Date): void {
    if (!this.isCalendarEnabled()) return;

    this.selectedDate.set(date);
    this.tournamentForm.get('selectedDate')?.setValue(date);
    this.tournamentForm.get('selectedDate')?.markAsDirty();
    this.tournamentForm.get('selectedDate')?.markAsTouched();

    this.availableSlots.set([]);
    this.selectedTimeslotIds.set([]);
    this.tournamentForm.get('timeslot_ids')?.setValue([]);

    this.fetchSlots(date);
  }
  fetchSlots(date: Date): void {
    const courtId = this.selectedCourtId();
    if (!courtId) {
      this.triggerToast('No court selected. Please select a court first.', 'error');
      return;
    }

    this.isLoadingSlots.set(true);
    const formattedDate = this.formatDateForApi(date);

    this.adminTournamentsService.CheckSlots(courtId, formattedDate).subscribe({
      next: (res: any) => {
        this.isLoadingSlots.set(false);

        let timeslots: Timeslot[] = [];

        if (res?.data?.timeslots) {
          timeslots = res.data.timeslots;
        } else if (Array.isArray(res?.data)) {
          timeslots = res.data;
        } else if (Array.isArray(res?.timeslots)) {
          timeslots = res.timeslots;
        } else if (Array.isArray(res)) {
          timeslots = res;
        }

        this.availableSlots.set(timeslots);
      },
      error: (err) => {
        this.isLoadingSlots.set(false);
        console.error('CheckSlots error — courtId:', courtId, 'date:', formattedDate, err);
        this.triggerToast('Failed to load available time slots', 'error');
        this.availableSlots.set([]);
      }
    });
  }

  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  resetSchedule(): void {
    this.selectedDate.set(null);
    this.availableSlots.set([]);
    this.selectedTimeslotIds.set([]);
    this.tournamentForm.get('selectedDate')?.setValue(null);
    this.tournamentForm.get('timeslot_ids')?.setValue([]);
    this.generateCalendar();
  }
  toggleSlot(slot: Timeslot): void {
    const current = this.selectedTimeslotIds();
    const updated = current.includes(slot.id)
      ? current.filter(id => id !== slot.id)
      : [...current, slot.id];

    this.selectedTimeslotIds.set(updated);
    this.tournamentForm.get('timeslot_ids')?.setValue(updated);
    this.tournamentForm.get('timeslot_ids')?.markAsDirty();
    this.tournamentForm.get('timeslot_ids')?.markAsTouched();
  }

  isSlotSelected(slotId: number): boolean {
    return this.selectedTimeslotIds().includes(slotId);
  }
  onPosterDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.posterIsDragging.set(true);
  }

  onPosterDragLeave() {
    this.posterIsDragging.set(false);
  }

  onPosterDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.posterIsDragging.set(false);
    const file = event.dataTransfer?.files?.[0] ?? null;
    if (!file) return;
    this.selectPosterFile(file);
  }

  onPosterFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;
    this.selectPosterFile(file);
    input.value = '';
  }

  private selectPosterFile(file: File) {
    const currentUrl = this.posterPreviewUrl();
    const currentFile = this.posterFile();
    const currentName = this.posterFileName();

    this.posterErrorMessage.set('');
    this.lastSelectedPosterFile = file;

    const allowedMime = new Set(['image/jpeg', 'image/png', 'image/webp']);
    const maxBytes = 5 * 1024 * 1024;

    if (!allowedMime.has(file.type)) {
      this.posterUploadStatus.set('error');
      this.posterErrorMessage.set('Only images are allowed (jpg, jpeg, png, webp).');
      this.posterFile.set(currentFile);
      this.posterFileName.set(currentName);
      this.posterPreviewUrl.set(currentUrl);
      this.triggerToast('Upload Failed', 'error');
      return;
    }

    if (file.size > maxBytes) {
      this.posterUploadStatus.set('error');
      this.posterErrorMessage.set('File size exceeds 5MB. Please choose a smaller image.');
      this.posterFile.set(currentFile);
      this.posterFileName.set(currentName);
      this.posterPreviewUrl.set(currentUrl);
      this.triggerToast('Upload Failed', 'error');
      return;
    }

    this.posterFile.set(file);
    this.posterFileName.set(file.name);
    this.startPosterUpload(file);
  }

  private startPosterUpload(file: File): void {
    this.clearPosterUploadTimer();
    this.posterUploadStatus.set('uploading');
    this.posterErrorMessage.set('');
    this.setPosterPreview(URL.createObjectURL(file));

    this.posterUploadTimer = window.setTimeout(() => {
      this.posterUploadStatus.set('success');
      this.tournamentForm.get('cover_image')?.setValue(file);
      this.tournamentForm.get('cover_image')?.markAsDirty();
      this.tournamentForm.get('cover_image')?.markAsTouched();
      this.triggerToast('Poster ready', 'success');
    }, 500);
  }

  retryPosterUpload(): void {
    if (!this.lastSelectedPosterFile) {
      this.posterUploadStatus.set('idle');
      return;
    }
    this.startPosterUpload(this.lastSelectedPosterFile);
  }

  cancelPosterUpload(): void {
    this.clearPosterUploadTimer();
    this.posterUploadStatus.set('idle');
    this.posterErrorMessage.set('');
    this.posterFile.set(null);
    this.posterFileName.set('');
    this.lastSelectedPosterFile = null;
    this.tournamentForm.get('cover_image')?.setValue(null);
    this.setPosterPreview(null);
  }

  removePosterUpload(): void {
    this.cancelPosterUpload();
  }

  private setPosterPreview(url: string | null) {
    const prev = this.posterPreviewUrl();
    if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
    this.posterPreviewUrl.set(url);
  }

  private clearPosterUploadTimer(): void {
    if (this.posterUploadTimer) {
      window.clearTimeout(this.posterUploadTimer);
      this.posterUploadTimer = null;
    }
  }
  isFieldInvalid(field: string): boolean {
    const control = this.tournamentForm.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  private isFormValid(): boolean {
    this.tournamentForm.markAllAsTouched();

    const requiredFields = [
      'name', 'maincourt_id', 'court_id', 'team_size',
      'max_teams', 'entryFee', 'prize1_title', 'prize1_money',
      'prize2_title', 'prize2_money'
    ];

    for (const field of requiredFields) {
      if (this.tournamentForm.get(field)?.invalid) {
        this.triggerToast(`Please fill all required fields correctly`, 'error');
        return false;
      }
    }

    if (!this.selectedCourtId()) {
      this.triggerToast('Please select a court', 'error');
      return false;
    }

    if (!this.selectedDate()) {
      this.tournamentForm.get('selectedDate')?.setErrors({ required: true });
      this.triggerToast('Please select a date', 'error');
      return false;
    }

    if (this.selectedTimeslotIds().length === 0) {
      this.tournamentForm.get('timeslot_ids')?.setErrors({ required: true });
      this.triggerToast('Please select at least one time slot', 'error');
      return false;
    }

    if (this.posterUploadStatus() !== 'success' || !this.posterFile()) {
      this.posterErrorMessage.set('Tournament poster is required');
      this.triggerToast('Please upload a tournament poster', 'error');
      return false;
    }

    return true;
  }
  onSubmit(): void {
    this.openPublishModal();
  }

  openPublishModal(): void {
    if (!this.isFormValid()) return;
    this.modalKind.set('publishConfirm');
    this.isModalOpen.set(true);
  }
  private formatTimeToHIS(timeStr: string): string {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
      const hours = match[1].padStart(2, '0');
      const minutes = match[2];
      return `${hours}:${minutes}`;
    }
    return '00:00';
  }

  confirmPublish(): void {
    if (!this.isFormValid()) return;

    const formData = new FormData();

    formData.append('maincourt_id', this.tournamentForm.get('maincourt_id')?.value);
    formData.append('court_id', this.tournamentForm.get('court_id')?.value);
    formData.append('name', this.tournamentForm.get('name')?.value);
    formData.append('description', this.tournamentForm.get('description')?.value || '');
    formData.append('important_note', this.tournamentForm.get('important_note')?.value || '');
    formData.append('team_size', this.tournamentForm.get('team_size')?.value);
    formData.append('rules', this.tournamentForm.get('rules')?.value || '');
    formData.append('entry_fee', this.tournamentForm.get('entryFee')?.value);
    formData.append('max_teams', this.tournamentForm.get('max_teams')?.value.toString());
    const slotIds = this.selectedTimeslotIds();
    slotIds.forEach((id, index) => {
      formData.append(`timeslot_ids[${index}]`, id.toString());
    });
    const selectedSlot = this.availableSlots().find(s => s.id === slotIds[0]);
    const scheduledDate = this.formatDateForApi(this.selectedDate()!);
    const scheduledTime = selectedSlot?.start_time
      ? this.formatTimeToHIS(selectedSlot.start_time)
      : '00:00';

    formData.append('schedule[0][scheduled_date]', scheduledDate);
    formData.append('schedule[0][scheduled_time]', scheduledTime);
    formData.append('schedule[0][stage_name]', 'Group Stage');

    // Prizes
    formData.append('prizes[0][position]', '1');
    formData.append('prizes[0][title]', this.tournamentForm.get('prize1_title')?.value);
    formData.append('prizes[0][prize_money]', this.tournamentForm.get('prize1_money')?.value);
    formData.append('prizes[1][position]', '2');
    formData.append('prizes[1][title]', this.tournamentForm.get('prize2_title')?.value);
    formData.append('prizes[1][prize_money]', this.tournamentForm.get('prize2_money')?.value);
    const coverFile = this.posterFile();
    if (coverFile) {
      formData.append('cover_image', coverFile, coverFile.name);
    }

    this.adminTournamentsService.CreateTournament(formData).subscribe({
      next: () => {
        this.tournamentStatus.set('Published');
        localStorage.removeItem(this.draftKey);
        this.modalKind.set('success');
        this.modalTitle.set('Tournament Published');
        this.modalMessage.set('Your tournament is now live and visible to users.');
        this.isModalOpen.set(true);
        this.triggerToast('Tournament created successfully', 'success');
        this.tournamentCreated.emit();
        this.resetForm();
      },
      error: (err) => {
        console.error('Create tournament error', err);
        const backendErrors = err?.error?.data;
        if (backendErrors) {
          const firstError = Object.values(backendErrors)[0];
          const msg = Array.isArray(firstError) ? firstError[0] : String(firstError);
          this.triggerToast(msg, 'error');
        } else {
          this.triggerToast('Failed to create tournament. Please try again.', 'error');
        }
        this.closeModal();
      }
    });
  }

  private resetForm(): void {
    this.tournamentForm.reset();
    this.posterFile.set(null);
    this.posterFileName.set('');
    this.posterPreviewUrl.set(null);
    this.posterUploadStatus.set('idle');
    this.selectedTimeslotIds.set([]);
    this.availableSlots.set([]);
    this.courts.set([]);
    this.selectedDate.set(null);
    this.selectedCourtId.set(null);
    this.generateCalendar();
  }
  openDraftModal(): void {
    this.modalKind.set('draftConfirm');
    this.isModalOpen.set(true);
  }

  confirmSaveDraft(): void {
    const payload = {
      form: this.tournamentForm.getRawValue(),
      status: 'Draft' as const,
      savedAt: new Date().toISOString(),
      posterName: this.posterFileName(),
      selectedDate: this.selectedDate()?.toISOString(),
      selectedSlotIds: this.selectedTimeslotIds(),
      selectedCourtId: this.selectedCourtId()
    };
    localStorage.setItem(this.draftKey, JSON.stringify(payload));
    this.tournamentStatus.set('Draft');
    this.modalKind.set('success');
    this.modalTitle.set('Draft Saved');
    this.modalMessage.set('Your tournament draft was saved successfully.');
    this.isModalOpen.set(true);
    this.triggerToast('Draft saved successfully', 'success');
  }

  private restoreDraft(): void {
    const raw = localStorage.getItem(this.draftKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.form) {
        this.tournamentForm.patchValue(parsed.form);
        this.tournamentStatus.set('Draft');

        if (parsed.selectedCourtId) {
          this.selectedCourtId.set(parsed.selectedCourtId);
        }
        if (parsed.selectedDate) {
          const date = new Date(parsed.selectedDate);
          this.selectedDate.set(date);
          this.fetchSlots(date);
        }
        if (parsed.selectedSlotIds?.length) {
          this.selectedTimeslotIds.set(parsed.selectedSlotIds);
          this.tournamentForm.get('timeslot_ids')?.setValue(parsed.selectedSlotIds);
        }
      }
    } catch {

    }
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.modalKind.set('none');
  }

  private triggerToast(message: string, type: ToastType): void {
    this.toastType.set(type);
    this.toastMessage.set(message);
    this.clearToastTimer();
    this.toastTimer = window.setTimeout(() => {
      this.toastMessage.set(null);
      this.toastTimer = null;
    }, 3500);
  }

  private clearToastTimer(): void {
    if (this.toastTimer) {
      window.clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
  }
}