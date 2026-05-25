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

type DateChip = {
  iso: string;
  month: string;
  day: string;
  weekday: string;
};

type TimeChip = {
  value: string;
  isPrime: boolean;
};

type MatchTypeOption = {
  value: '5v5' | '7v7';
  label: string;
};

@Component({
  selector: 'app-create-friendly-match',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, PlayernavComponent],
  templateUrl: './create-friendly-match.component.html',
  styleUrls: ['./create-friendly-match.component.scss'],
})
export class CreateFriendlyMatchComponent implements OnInit {
  private readonly venuesService = inject(VenuesService);
  private readonly customerTimeslotService = inject(CustomerTimeslotService);
  private readonly router = inject(Router);

  // API data
  MainCourtsDetails: IAllcourts[] = [];
  CourtsDetails: ICourt[] = [];
  TimeDetails: Icustomertimeslot[] = [];

  // selection state
  selectedMainCourt: IAllcourts | null = null;
  selectedCourt: ICourt | null = null;

  // REQUIRED state
  selectedCourtId: number | null = null;
  selectedDateISO: string | null = null;
  availableTimeSlots: TimeChip[] = [];
  selectedTimeSlot: string | null = null;

  // loading/error (times)
  timeSlotsLoading = false;
  timeSlotsError = '';

  // UI state
  venuesOpen = false;
  courtsOpen = false;

  // loading/error
  mainCourtsLoading = false;
  courtsLoading = false;
  mainCourtsError = '';
  courtsError = '';

  // search
  venueSearch = new FormControl<string>('', { nonNullable: true });

  submitting = false;
  successOpen = false;
  errorMessage = '';

  dateOptions: DateChip[] = [];

  matchTypeOptions: MatchTypeOption[] = [
    { value: '5v5', label: '5v5' },
    { value: '7v7', label: '7v7' },
  ];

  successSummary = { field: '', time: '' };

  readonly CreateMatchForm = new FormGroup({
    venueId: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    courtId: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    dateISO: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    time: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    playersNeeded: new FormControl<number>(6, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(20)],
    }),
    matchType: new FormControl<'5v5' | '7v7'>('5v5', { nonNullable: true, validators: [Validators.required] }),
    title: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    location: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    price: new FormControl<number>(150, { nonNullable: true, validators: [Validators.required, Validators.min(0), Validators.max(9999)] }),
  });

  ngOnInit(): void {
    this.dateOptions = this.buildNextDates(this.todayISO(), 5);
    this.GetMainCourtes();

    // IMPORTANT: do NOT call GetTimeAndDate here (needs courtId + selected date)
    this.resetTimeSlotsState();
  }

  // time selection enabled only when court + date selected and not loading
  get timeSelectionEnabled(): boolean {
    return !!this.selectedCourtId && !!this.selectedDateISO && !this.timeSlotsLoading;
  }

  // --- derived lists ---
  get filteredMainCourts(): IAllcourts[] {
    const t = (this.venueSearch.value || '').trim().toLowerCase();
    if (!t) return this.MainCourtsDetails;
    return this.MainCourtsDetails.filter((v) => `${v.name} ${v.address}`.toLowerCase().includes(t));
  }

  // --- UI toggles ---
  toggleVenuesOpen(): void {
    this.venuesOpen = !this.venuesOpen;
    if (this.venuesOpen && this.MainCourtsDetails.length === 0 && !this.mainCourtsLoading) {
      this.GetMainCourtes();
    }
  }

  toggleCourtsOpen(): void {
    this.courtsOpen = !this.courtsOpen;
  }

  // --- API: stadiums ---
  GetMainCourtes(): void {
    this.mainCourtsLoading = true;
    this.mainCourtsError = '';

    this.venuesService
      .GetMainCourtes()
      .pipe(finalize(() => (this.mainCourtsLoading = false)))
      .subscribe({
        next: (res) => {
          this.MainCourtsDetails = res?.data ?? [];
        },
        error: (err) => {
          this.MainCourtsDetails = [];
          this.mainCourtsError = err?.error?.message ?? 'Failed to load stadiums.';
        },
      });
  }

  // --- stadium selection triggers courts fetch ---
  selectMainCourt(venue: IAllcourts): void {
    const prevId = this.CreateMatchForm.get('venueId')?.value;
    const nextId = String(venue.id);

    this.selectedMainCourt = venue;
    this.selectedCourt = null;

    // reset courts & selected court immediately (no stale UI)
    this.CourtsDetails = [];
    this.courtsError = '';

    // IMPORTANT: changing venue/court context resets date & time
    this.resetDateAndTimeState();

    // set form values + reset court
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

  // --- API: courts ---
  GetCourts(mainCourtId: string): void {
    this.courtsLoading = true;
    this.courtsError = '';

    this.venuesService
      .GetCourts(mainCourtId)
      .pipe(finalize(() => (this.courtsLoading = false)))
      .subscribe({
        next: (res) => {
          this.CourtsDetails = res?.data ?? [];
        },
        error: (err) => {
          this.CourtsDetails = [];
          this.courtsError = err?.error?.message ?? 'Failed to load courts.';
        },
      });
  }

  // --- court selection ---
  selectCourt(court: ICourt): void {
    const prevCourtId = this.selectedCourtId;

    this.selectedCourt = court;
    this.selectedCourtId = Number(court.id);

    this.CreateMatchForm.patchValue({ courtId: String(court.id) });
    this.CreateMatchForm.get('courtId')?.markAsTouched();
    this.CreateMatchForm.get('courtId')?.markAsDirty();

    // IMPORTANT: changing court resets date & time slots
    if (prevCourtId !== this.selectedCourtId) {
      this.resetDateAndTimeState();
      this.CreateMatchForm.patchValue({ dateISO: '', time: '' });
    }
  }

  // --- required by template ---
  onSubmit(): void {
    this.errorMessage = '';
    this.CreateMatchForm.markAllAsTouched();

    if (this.CreateMatchForm.invalid) {
      const firstError = document.querySelector('[role="alert"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    this.SubmitForm();
  }

  dismissError(controlName: string): void {
    const control = this.CreateMatchForm.get(controlName);
    if (control) {
      control.markAsUntouched();
      control.markAsPristine();
      control.updateValueAndValidity({ emitEvent: false });
    }
  }

  closeSuccess(): void {
    this.successOpen = false;
  }

  // --- existing flow (keep if you already have it) ---
  SubmitForm(): void {
    this.submitting = true;

    setTimeout(() => {
      this.successSummary.field = this.selectedMainCourt?.name ?? 'Selected Venue';

      const startTime = this.CreateMatchForm.get('time')?.value || '20:00';
      this.successSummary.time = `${startTime} – ${this.addMinutes(startTime, 90)}`;

      this.successOpen = true;
      this.submitting = false;
    }, 900);
  }

  goToMatches(): void {
    this.successOpen = false;
    this.router.navigate(['/matches']);
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

  // ---- Date selection (triggers API call when courtId exists) ----
  selectDate(iso: string): void {
    this.selectedDateISO = iso;

    this.CreateMatchForm.patchValue({ dateISO: iso, time: '' });
    this.CreateMatchForm.get('dateISO')?.markAsTouched();
    this.CreateMatchForm.get('dateISO')?.markAsDirty();

    // changing date refreshes time slots + resets selected time
    this.resetTimeSlotsState();

    if (!this.selectedCourtId) {
      // safe fallback: prevent API call
      return;
    }

    this.GetTimeAndDate(this.selectedCourtId, iso);
  }

  // ---- Time selection (ONE slot) ----
  selectTimeSlot(value: string): void {
    if (!this.timeSelectionEnabled) return;

    this.selectedTimeSlot = value;

    this.CreateMatchForm.patchValue({ time: value });
    this.CreateMatchForm.get('time')?.markAsTouched();
    this.CreateMatchForm.get('time')?.markAsDirty();
  }

  incrementPlayers(): void {
    const currentValue = this.CreateMatchForm.get('playersNeeded')?.value || 0;
    const newValue = Math.min(20, currentValue + 1);
    this.CreateMatchForm.patchValue({ playersNeeded: newValue });
    this.CreateMatchForm.get('playersNeeded')?.markAsTouched();
  }

  decrementPlayers(): void {
    const currentValue = this.CreateMatchForm.get('playersNeeded')?.value || 0;
    const newValue = Math.max(1, currentValue - 1);
    this.CreateMatchForm.patchValue({ playersNeeded: newValue });
    this.CreateMatchForm.get('playersNeeded')?.markAsTouched();
  }

  private resetDateAndTimeState(): void {
    this.selectedDateISO = null;
    this.resetTimeSlotsState();
  }

  private resetTimeSlotsState(): void {
    this.availableTimeSlots = [];
    this.selectedTimeSlot = null;
    this.timeSlotsError = '';
    this.timeSlotsLoading = false;

    // keep form in sync (prevent stale time)
    this.CreateMatchForm.patchValue({ time: '' });
    this.CreateMatchForm.get('time')?.markAsPristine();
    this.CreateMatchForm.get('time')?.markAsUntouched();
  }

  private todayISO(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private buildNextDates(baseISO: string, count: number): DateChip[] {
    const [year, month, day] = baseISO.split('-').map(Number);
    const baseDate = new Date(year, month - 1, day);

    const dates: DateChip[] = [];
    for (let i = 0; i < count; i++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + i);

      dates.push({
        iso: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`,
        month: currentDate.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        day: String(currentDate.getDate()).padStart(2, '0'),
        weekday: currentDate.toLocaleString('en-US', { weekday: 'short' }).toUpperCase(),
      });
    }
    return dates;
  }

  private addMinutes(timeString: string, minutes: number): string {
    const [hours, mins] = timeString.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  }

  // ---- Backend integration: GetTimeAndDate(courtId, selectedDate) ----
  GetTimeAndDate(courtId: number, selectedDateISO: string): void {
    this.timeSlotsLoading = true;
    this.timeSlotsError = '';
    this.availableTimeSlots = [];
    this.selectedTimeSlot = null;

    // keep form synced
    this.CreateMatchForm.patchValue({ time: '' });

    this.customerTimeslotService
      .GetCustomerTimeSlot(courtId, selectedDateISO)
      .pipe(finalize(() => (this.timeSlotsLoading = false)))
      .subscribe({
        next: (res) => {
          this.TimeDetails = res?.data ?? [];

          // map backend response -> chips (keep existing look)
          this.availableTimeSlots = (this.TimeDetails ?? []).map((t: any) => {
            const value =
              t?.time ??
              t?.start_time ??
              t?.startTime ??
              t?.slot ??
              t?.value ??
              '';

            return {
              value: String(value),
              isPrime: !!(t?.isPrime ?? t?.is_prime ?? t?.prime),
            } satisfies TimeChip;
          }).filter((x) => !!x.value);

          // if backend doesn't provide prime flag, keep it false (no redesign)
        },
        error: (err) => {
          this.TimeDetails = [];
          this.availableTimeSlots = [];
          this.timeSlotsError = err?.error?.message ?? 'Failed to load time slots.';
        },
      });
  }
}