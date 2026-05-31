import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';
import { VenuesService } from '../../../../core/services/venues/venues.service';
import { IAllcourts } from '../../../interfaces/iallcourts';
import { ICourt } from '../../../interfaces/icourt';
import { CustomerTimeslotService } from '../../../../core/services/CustomerTimeslot/customer-timeslot.service';
import { Icustomertimeslot } from '../../../interfaces/icustomertimeslot';
import { PlayerFRiendlyMatchService } from '../../../../core/services/PlayerFriendlyMatch/player-friendly-match.service';
import { LucideAngularModule } from 'lucide-angular';

type TimeChip = {
  value: string;
  display: string;
  isPrime: boolean;
  id: number;
  startTime: string;
  endTime: string;
};

type CalendarCell = {
  iso: string;
  day: number;
  currentMonth: boolean;
  enabled: boolean;
};

type DateChip = {
  iso: string;
  month: string;
  day: string;
  weekday: string;
};

type MatchTypeOption = {
  value: '5v5' | '7v7';
  label: string;
};

@Component({
  selector: 'app-create-friendly-match',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, PlayernavComponent, LucideAngularModule],
  templateUrl: './create-friendly-match.component.html',
  styleUrls: ['./create-friendly-match.component.scss'],
})
export class CreateFriendlyMatchComponent implements OnInit {
  private readonly venuesService = inject(VenuesService);
  private readonly customerTimeslotService = inject(CustomerTimeslotService);
  private readonly matchesService = inject(PlayerFRiendlyMatchService);
  private readonly router = inject(Router);

  // ── Data ──
  MainCourtsDetails: IAllcourts[] = [];
  CourtsDetails: ICourt[] = [];
  TimeDetails: Icustomertimeslot[] = [];

  // ── Selection state ──
  selectedMainCourt: IAllcourts | null = null;
  selectedCourt: ICourt | null = null;
  selectedCourtId: number | null = null;
  selectedDateISO: string | null = null;
  availableTimeSlots: TimeChip[] = [];
  selectedTimeslots: TimeChip[] = [];

  // ── Legacy single-slot kept for backward compat ──
  selectedTimeSlot: string | null = null;
  selectedTimeslotId: string | null = null;

  formattedMatchTime = '';

  // ── Loading / error flags ──
  timeSlotsLoading = false;
  timeSlotsError = '';
  venuesOpen = false;
  courtsOpen = false;
  mainCourtsLoading = false;
  courtsLoading = false;
  mainCourtsError = '';
  courtsError = '';

  // ── UI state ──
  submitting = false;
  errorMessage = '';
  isMatchCreatedModalOpen = false;
  dateOptions: DateChip[] = [];
  venueSearch = new FormControl<string>('', { nonNullable: true });

  // ── Calendar ──
  weekDayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  calendarYear = new Date().getFullYear();
  calendarMonth = new Date().getMonth();
  calendarCells: CalendarCell[] = [];

  matchTypeOptions: MatchTypeOption[] = [
    { value: '5v5', label: '5v5' },
    { value: '7v7', label: '7v7' },
  ];

  successSummary = { field: '', time: '' };

  readonly CreateMatchForm = new FormGroup({
    venueId: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    courtId: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    dateISO: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    time: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    playersNeeded: new FormControl<number>(6, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(20)],
    }),
    matchName: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    description: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    matchType: new FormControl<'5v5' | '7v7'>('5v5', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    price: new FormControl<number>(150, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0), Validators.max(9999)],
    }),
  });

  // ── Lifecycle ──
  ngOnInit(): void {
    this.dateOptions = this.buildNextDates(this.todayISO(), 5);
    this.buildCalendar();
    this.GetMainCourtes();
    this.resetTimeSlotsState();
  }

  // ── Computed getters ──
  get calendarMonthLabel(): string {
    return new Date(this.calendarYear, this.calendarMonth, 1)
      .toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }

  get timeSelectionEnabled(): boolean {
    return !!this.selectedCourtId && !!this.selectedDateISO && !this.timeSlotsLoading;
  }

  get filteredMainCourts(): IAllcourts[] {
    const t = (this.venueSearch.value || '').trim().toLowerCase();
    if (!t) return this.MainCourtsDetails;
    return this.MainCourtsDetails.filter(v =>
      `${v.name} ${v.address}`.toLowerCase().includes(t)
    );
  }

  get totalDurationLabel(): string {
    const count = this.selectedTimeslots.length;
    return `${count} hr${count !== 1 ? 's' : ''}`;
  }

  get bookingRangeLabel(): string {
    if (this.selectedTimeslots.length === 0) return '';
    const sorted = [...this.selectedTimeslots].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
    const start = this.formatTo12Hour(sorted[0].startTime);
    const end = this.formatTo12Hour(sorted[sorted.length - 1].endTime);
    return `${start} – ${end}`;
  }

  // ── Calendar ──
  prevMonth(): void {
    if (this.calendarMonth === 0) {
      this.calendarMonth = 11;
      this.calendarYear--;
    } else {
      this.calendarMonth--;
    }
    this.buildCalendar();
  }

  nextMonth(): void {
    if (this.calendarMonth === 11) {
      this.calendarMonth = 0;
      this.calendarYear++;
    } else {
      this.calendarMonth++;
    }
    this.buildCalendar();
  }

  private buildCalendar(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDay = new Date(this.calendarYear, this.calendarMonth, 1);
    const lastDay = new Date(this.calendarYear, this.calendarMonth + 1, 0);
    const cells: CalendarCell[] = [];
    const startPad = firstDay.getDay();

    // Pad from previous month
    for (let i = startPad - 1; i >= 0; i--) {
      const d = new Date(this.calendarYear, this.calendarMonth, -i);
      cells.push({ iso: this.dateToISO(d), day: d.getDate(), currentMonth: false, enabled: false });
    }

    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(this.calendarYear, this.calendarMonth, d);
      cells.push({
        iso: this.dateToISO(date),
        day: d,
        currentMonth: true,
        enabled: date >= today,
      });
    }

    // Pad to fill 6 rows (42 cells)
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(this.calendarYear, this.calendarMonth + 1, d);
      cells.push({ iso: this.dateToISO(date), day: date.getDate(), currentMonth: false, enabled: false });
    }

    this.calendarCells = cells;
  }

  private dateToISO(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  // ── Multi-select slot logic ──
  isSlotSelected(slot: TimeChip): boolean {
    return this.selectedTimeslots.some(s => s.id === slot.id);
  }

  toggleTimeslot(slot: TimeChip): void {
    if (!this.timeSelectionEnabled) return;

    if (this.isSlotSelected(slot)) {
      this.selectedTimeslots = this.selectedTimeslots.filter(s => s.id !== slot.id);
    } else {
      this.selectedTimeslots = [...this.selectedTimeslots, slot];
    }

    this.selectedTimeslots.sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Keep legacy bindings in sync
    this.selectedTimeSlot = this.selectedTimeslots.length > 0 ? this.selectedTimeslots[0].value : null;
    this.selectedTimeslotId = this.selectedTimeslots.length > 0 ? String(this.selectedTimeslots[0].id) : null;

    this.CreateMatchForm.patchValue({ time: this.selectedTimeslots.length > 0 ? 'selected' : '' });
    this.CreateMatchForm.get('time')?.markAsTouched();
    this.CreateMatchForm.get('time')?.markAsDirty();

    this.formattedMatchTime = this.bookingRangeLabel;
  }

  clearAllSlots(): void {
    this.selectedTimeslots = [];
    this.selectedTimeSlot = null;
    this.selectedTimeslotId = null;
    this.formattedMatchTime = '';
    this.CreateMatchForm.patchValue({ time: '' });
    this.CreateMatchForm.get('time')?.markAsTouched();
  }

  // ── Venue / court ──
  toggleVenuesOpen(): void {
    this.venuesOpen = !this.venuesOpen;
    if (this.venuesOpen && this.MainCourtsDetails.length === 0 && !this.mainCourtsLoading) {
      this.GetMainCourtes();
    }
  }

  toggleCourtsOpen(): void {
    this.courtsOpen = !this.courtsOpen;
  }

  GetMainCourtes(): void {
    this.mainCourtsLoading = true;
    this.mainCourtsError = '';
    this.venuesService
      .GetMainCourtes()
      .pipe(finalize(() => (this.mainCourtsLoading = false)))
      .subscribe({
        next: res => { this.MainCourtsDetails = res?.data ?? []; },
        error: err => {
          this.MainCourtsDetails = [];
          this.mainCourtsError = err?.error?.message ?? 'Failed to load stadiums.';
        },
      });
  }

  selectMainCourt(venue: IAllcourts): void {
    const prevId = this.CreateMatchForm.get('venueId')?.value;
    const nextId = String(venue.id);

    this.selectedMainCourt = venue;
    this.selectedCourt = null;
    this.CourtsDetails = [];
    this.courtsError = '';

    this.resetDateAndTimeState();

    this.CreateMatchForm.patchValue({ venueId: nextId, courtId: '', dateISO: '', time: '' });
    this.CreateMatchForm.get('venueId')?.markAsTouched();
    this.CreateMatchForm.get('venueId')?.markAsDirty();

    if (prevId !== nextId) {
      this.CreateMatchForm.get('courtId')?.markAsPristine();
      this.CreateMatchForm.get('courtId')?.markAsUntouched();
    }

    this.courtsOpen = true;
    this.venuesOpen = false;
    this.GetCourts(nextId);
  }

  GetCourts(mainCourtId: string): void {
    this.courtsLoading = true;
    this.courtsError = '';
    this.venuesService
      .GetCourts(mainCourtId)
      .pipe(finalize(() => (this.courtsLoading = false)))
      .subscribe({
        next: res => { this.CourtsDetails = res?.data ?? []; },
        error: err => {
          this.CourtsDetails = [];
          this.courtsError = err?.error?.message ?? 'Failed to load courts.';
        },
      });
  }

  selectCourt(court: ICourt): void {
    const prevCourtId = this.selectedCourtId;

    this.selectedCourt = court;
    this.selectedCourtId = Number(court.id);

    this.CreateMatchForm.patchValue({ courtId: String(court.id) });
    this.CreateMatchForm.get('courtId')?.markAsTouched();
    this.CreateMatchForm.get('courtId')?.markAsDirty();

    if (prevCourtId !== this.selectedCourtId) {
      this.resetDateAndTimeState();
      this.CreateMatchForm.patchValue({ dateISO: '', time: '' });
    }
  }

  // ── Date ──
  selectDate(iso: string): void {
    if (!this.selectedCourtId) return;

    this.selectedDateISO = iso;

    this.CreateMatchForm.patchValue({ dateISO: iso, time: '' });
    this.CreateMatchForm.get('dateISO')?.markAsTouched();
    this.CreateMatchForm.get('dateISO')?.markAsDirty();

    this.resetTimeSlotsState();
    this.GetTimeAndDate(this.selectedCourtId, iso);
  }

  // ── Time slots ──
  GetTimeAndDate(courtId: number, selectedDateISO: string): void {
    this.timeSlotsLoading = true;
    this.timeSlotsError = '';
    this.availableTimeSlots = [];
    this.selectedTimeslots = [];
    this.selectedTimeSlot = null;
    this.selectedTimeslotId = null;
    this.formattedMatchTime = '';
    this.CreateMatchForm.patchValue({ time: '' });

    this.customerTimeslotService
      .GetCustomerTimeSlot(courtId, selectedDateISO)
      .pipe(finalize(() => (this.timeSlotsLoading = false)))
      .subscribe({
        next: res => {
          this.TimeDetails = res?.data ?? [];
          this.availableTimeSlots = this.mapSlotsToChips(this.TimeDetails);
        },
        error: err => {
          this.TimeDetails = [];
          this.availableTimeSlots = [];
          this.timeSlotsError = err?.error?.message ?? 'Failed to load time slots.';
        },
      });
  }

  private mapSlotsToChips(slots: Icustomertimeslot[]): TimeChip[] {
    return (slots ?? []).map(t => ({
      value: `${t.start_time} - ${t.end_time}`,
      display: `${this.formatTo12Hour(t.start_time)} – ${this.formatTo12Hour(t.end_time)}`,
      isPrime: false,
      id: Number(t.id),
      startTime: t.start_time,
      endTime: t.end_time,
    }));
  }

  // ── Players ──
  incrementPlayers(): void {
    const v = this.CreateMatchForm.get('playersNeeded')?.value || 0;
    this.CreateMatchForm.patchValue({ playersNeeded: Math.min(20, v + 1) });
    this.CreateMatchForm.get('playersNeeded')?.markAsTouched();
  }

  decrementPlayers(): void {
    const v = this.CreateMatchForm.get('playersNeeded')?.value || 0;
    this.CreateMatchForm.patchValue({ playersNeeded: Math.max(1, v - 1) });
    this.CreateMatchForm.get('playersNeeded')?.markAsTouched();
  }

  // ── Submit ──
  onSubmit(): void {
    this.errorMessage = '';
    this.CreateMatchForm.markAllAsTouched();

    if (!this.selectedCourtId || this.selectedTimeslots.length === 0) {
      this.errorMessage = 'Please select a court and at least one time slot.';
      return;
    }

    if (this.CreateMatchForm.invalid) {
      const firstError = document.querySelector('[role="alert"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    this.SubmitForm();
  }

  SubmitForm(): void {
    if (!this.selectedCourtId || this.selectedTimeslots.length === 0) return;

    const timeslotIds = this.selectedTimeslots.map(s => s.id);

    const payload = {
      court_id: String(this.selectedCourtId),
      timeslot_ids: timeslotIds,
      name: String(this.CreateMatchForm.get('matchName')?.value || '').trim(),
      description: String(this.CreateMatchForm.get('description')?.value || '').trim(),
      required_players: String(Number(this.CreateMatchForm.get('playersNeeded')?.value) || 0),
    };

    if (
      !payload.court_id ||
      !payload.timeslot_ids.length ||
      !payload.name ||
      !payload.description ||
      payload.required_players === '0'
    ) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    this.matchesService
      .CreateMatches(payload)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          this.successSummary.field = this.selectedMainCourt?.name ?? 'Selected Venue';
          this.successSummary.time = this.bookingRangeLabel || '--:-- -- – --:-- --';
          this.isMatchCreatedModalOpen = true;

          this.CreateMatchForm.patchValue({ matchName: '', description: '' });
          this.CreateMatchForm.get('matchName')?.markAsPristine();
          this.CreateMatchForm.get('description')?.markAsPristine();
        },
        error: err => {
          this.errorMessage = err?.error?.message ?? 'Failed to create match. Please try again.';
        },
      });
  }

  // ── Helpers ──
  dismissError(controlName: string): void {
    const control = this.CreateMatchForm.get(controlName);
    if (control) {
      control.markAsUntouched();
      control.markAsPristine();
      control.updateValueAndValidity({ emitEvent: false });
    }
  }

  closeSuccess(): void {
    this.isMatchCreatedModalOpen = false;
  }

  goToMatches(): void {
    this.isMatchCreatedModalOpen = false;
    this.router.navigate(['/FriendlyMatches']);
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const placeholder = img.nextElementSibling as HTMLElement;
    if (placeholder) placeholder.style.display = 'flex';
  }

  hasError(controlName: string, errorType?: string): boolean {
    const control = this.CreateMatchForm.get(controlName);
    if (!control) return false;
    const isInvalid = control.invalid && (control.touched || control.dirty);
    if (!errorType) return isInvalid;
    return isInvalid && control.hasError(errorType);
  }

  private resetDateAndTimeState(): void {
    this.selectedDateISO = null;
    this.resetTimeSlotsState();
  }

  private resetTimeSlotsState(): void {
    this.availableTimeSlots = [];
    this.selectedTimeslots = [];
    this.selectedTimeSlot = null;
    this.selectedTimeslotId = null;
    this.formattedMatchTime = '';
    this.timeSlotsError = '';
    this.timeSlotsLoading = false;
    this.CreateMatchForm.patchValue({ time: '' });
    this.CreateMatchForm.get('time')?.markAsPristine();
    this.CreateMatchForm.get('time')?.markAsUntouched();
  }

  private todayISO(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  private buildNextDates(baseISO: string, count: number): DateChip[] {
    const [year, month, day] = baseISO.split('-').map(Number);
    const baseDate = new Date(year, month - 1, day);
    const dates: DateChip[] = [];
    for (let i = 0; i < count; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      dates.push({
        iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        day: String(d.getDate()).padStart(2, '0'),
        weekday: d.toLocaleString('en-US', { weekday: 'short' }).toUpperCase(),
      });
    }
    return dates;
  }

  private formatTo12Hour(time: string | null | undefined): string {
    if (!time) return '';
    const parts = time.split(':');
    if (parts.length < 2) return '';
    const hours = Number(parts[0]);
    const minutes = parts[1];
    if (isNaN(hours)) return '';
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = hours % 12 || 12;
    return `${String(formattedHour).padStart(2, '0')}:${minutes} ${period}`;
  }
  getCalDayClass(cell: CalendarCell): string {
    if (!cell.currentMonth) return 'text-emerald-950/15 cursor-default';
    if (!cell.enabled) return 'text-emerald-950/25 cursor-not-allowed';
    if (this.CreateMatchForm.get('dateISO')?.value === cell.iso) {
      return 'bg-[#146A1E] text-white shadow-md';
    }
    return 'bg-emerald-50 border border-emerald-200/60 text-emerald-950 hover:bg-emerald-100 cursor-pointer';
  }
  getSlotRowClass(slot: TimeChip, last: boolean): string {
    const selected = this.isSlotSelected(slot);
    const border = last ? '' : 'border-b border-emerald-200/40';
    const bg = selected ? 'bg-[#B9F2C2]/65' : '';
    return `${bg} ${border}`.trim();
  }
}