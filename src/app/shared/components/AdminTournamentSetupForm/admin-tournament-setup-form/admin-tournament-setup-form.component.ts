import { Component, ChangeDetectionStrategy, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';
type ToastType = 'success' | 'error';
type ModalKind = 'none' | 'publishConfirm' | 'draftConfirm' | 'success';

@Component({
  selector: 'app-admin-tournament-setup-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-tournament-setup-form.component.html',
  styleUrl: './admin-tournament-setup-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminTournamentSetupFormComponent implements OnDestroy {
  tournamentForm: FormGroup;

  venues = [
    'Giza Olympic Center Stadium',
    'Al-Ahly Club Stadium',
    'Zamalek SC Ground',
    'Cairo International Stadium',
    'Pyramids FC Arena',
    'The Dream Field Center'
  ];

  // Poster upload state
  posterIsDragging = signal<boolean>(false);
  posterUploadStatus = signal<UploadStatus>('idle');
  posterErrorMessage = signal<string>('');

  posterFile = signal<File | null>(null);
  posterFileName = signal<string>('');
  posterPreviewUrl = signal<string | null>(null);

  private lastSelectedPosterFile: File | null = null;
  private posterUploadTimer: number | null = null;

  // Tournament state
  tournamentStatus = signal<'Draft' | 'Published'>('Draft');

  // Modal state
  isModalOpen = signal<boolean>(false);
  modalKind = signal<ModalKind>('none');
  modalTitle = signal<string>('');
  modalMessage = signal<string>('');

  // Toast state
  toastMessage = signal<string | null>(null);
  toastType = signal<ToastType>('success');
  private toastTimer: number | null = null;

  // Draft persistence key
  private readonly draftKey = 'ehgazly:tournament_setup_draft:v1';

  constructor(private fb: FormBuilder) {
    this.tournamentForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      venue: [''],
      startDate: [''],
      matchTime: [''],
      maxTeams: [16, [Validators.min(2)]],
      entryFee: [1500, [Validators.min(0)]],
      prizePool: [''],
      rules: [''],
      poster: [null, Validators.required],
    });

    this.restoreDraft();
  }

  ngOnDestroy(): void {
    this.clearPosterUploadTimer();
    this.clearToastTimer();
    const url = this.posterPreviewUrl();
    if (url) URL.revokeObjectURL(url);
  }

  // -------------------------
  // VALIDATION HELPERS
  // -------------------------
  isFieldInvalid(field: string): boolean {
    const control = this.tournamentForm.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  // -------------------------
  // POSTER UPLOAD (images only)
  // -------------------------
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
    // Keep current image unchanged if invalid (requirement)
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

      // keep current image unchanged
      this.posterFile.set(currentFile);
      this.posterFileName.set(currentName);
      this.posterPreviewUrl.set(currentUrl);

      this.triggerToast('Upload Failed', 'error');
      return;
    }

    if (file.size > maxBytes) {
      this.posterUploadStatus.set('error');
      this.posterErrorMessage.set('File size exceeds 5MB. Please choose a smaller image.');

      // keep current image unchanged
      this.posterFile.set(currentFile);
      this.posterFileName.set(currentName);
      this.posterPreviewUrl.set(currentUrl);

      this.triggerToast('Upload Failed', 'error');
      return;
    }

    // valid: proceed
    this.posterFile.set(file);
    this.posterFileName.set(file.name);
    this.startPosterUpload(file);
  }

  private startPosterUpload(file: File): void {
    this.clearPosterUploadTimer();

    this.posterUploadStatus.set('uploading');
    this.posterErrorMessage.set('');

    // preview immediately (safe: contain in UI)
    this.setPosterPreview(URL.createObjectURL(file));

    // Simulated upload (replace with real API)
    this.posterUploadTimer = window.setTimeout(() => {
      const shouldFail = Math.random() < 0.1;

      if (shouldFail) {
        this.posterUploadStatus.set('error');
        this.posterErrorMessage.set("Upload Failed");
        this.tournamentForm.get('poster')?.setValue(null);
        this.tournamentForm.get('poster')?.markAsDirty();
        this.tournamentForm.get('poster')?.markAsTouched();
        this.triggerToast('Upload Failed', 'error');
        return;
      }

      this.posterUploadStatus.set('success');
      this.tournamentForm.get('poster')?.setValue(file);
      this.tournamentForm.get('poster')?.markAsDirty();
      this.tournamentForm.get('poster')?.markAsTouched();
      this.triggerToast('Poster uploaded successfully', 'success');
    }, 750);
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
  }

  removePosterUpload(): void {
    this.clearPosterUploadTimer();
    this.posterUploadStatus.set('idle');
    this.posterErrorMessage.set('');

    this.posterFile.set(null);
    this.posterFileName.set('');
    this.lastSelectedPosterFile = null;

    this.tournamentForm.get('poster')?.setValue(null);
    this.tournamentForm.get('poster')?.markAsDirty();
    this.tournamentForm.get('poster')?.markAsTouched();

    this.setPosterPreview(null);
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

  // -------------------------
  // DRAFT + PUBLISH (REAL UI FLOW)
  // -------------------------
  openDraftModal(): void {
    this.modalKind.set('draftConfirm');
    this.isModalOpen.set(true);
  }
  onSaveDraft(): void {
    this.openDraftModal();
  }
  confirmSaveDraft(): void {
    const payload = {
      form: this.tournamentForm.getRawValue(),
      status: 'Draft' as const,
      savedAt: new Date().toISOString(),
      posterName: this.posterFileName(),
    };

    localStorage.setItem(this.draftKey, JSON.stringify(payload));
    this.tournamentStatus.set('Draft');

    this.modalKind.set('success');
    this.modalTitle.set('Draft Saved');
    this.modalMessage.set('Your tournament draft was saved successfully.');
    this.isModalOpen.set(true);

    this.triggerToast('Draft saved successfully', 'success');
  }

  openPublishModal(): void {
    // validate required fields first
    this.tournamentForm.markAllAsTouched();

    if (this.posterUploadStatus() !== 'success') {
      this.posterErrorMessage.set(this.posterErrorMessage() || 'Please upload a tournament poster (jpg/png/webp, max 5MB).');
      this.tournamentForm.get('poster')?.markAsTouched();
      this.tournamentForm.get('poster')?.markAsDirty();
    }

    if (!this.tournamentForm.valid || this.posterUploadStatus() !== 'success') {
      this.triggerToast('Please fix validation errors before publishing', 'error');
      return;
    }

    this.modalKind.set('publishConfirm');
    this.isModalOpen.set(true);
  }

  confirmPublish(): void {
    // final safety validation
    this.tournamentForm.markAllAsTouched();
    if (!this.tournamentForm.valid || this.posterUploadStatus() !== 'success') {
      this.triggerToast('Publish failed: missing required data', 'error');
      return;
    }

    this.tournamentStatus.set('Published');

    // clear draft (optional)
    localStorage.removeItem(this.draftKey);

    this.modalKind.set('success');
    this.modalTitle.set('Tournament Published');
    this.modalMessage.set('Your tournament is now live and visible to users.');
    this.isModalOpen.set(true);

    this.triggerToast('Tournament published successfully', 'success');
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.modalKind.set('none');
  }

  // Keep form submit (if user presses Enter)
  onSubmit(): void {
    this.openPublishModal();
  }

  // -------------------------
  // DRAFT RESTORE
  // -------------------------
  private restoreDraft(): void {
    const raw = localStorage.getItem(this.draftKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (parsed?.form) {
        this.tournamentForm.patchValue(parsed.form);
        this.tournamentStatus.set('Draft');
      }
    } catch {
      // ignore corrupt drafts
    }
  }

  // -------------------------
  // TOAST
  // -------------------------
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