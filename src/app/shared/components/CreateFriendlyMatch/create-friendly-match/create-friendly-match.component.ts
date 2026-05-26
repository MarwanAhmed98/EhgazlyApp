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
  imports: [ReactiveFormsModule, CommonModule, PlayernavComponent, LucideAngularModule],
  templateUrl: './create-friendly-match.component.html',
  styleUrls: ['./create-friendly-match.component.scss'],
})
export class CreateFriendlyMatchComponent implements OnInit {
  private readonly venuesService = inject(VenuesService);
  private readonly customerTimeslotService = inject(CustomerTimeslotService);
  private readonly matchesService = inject(PlayerFRiendlyMatchService);
  private readonly router = inject(Router);
  MainCourtsDetails: IAllcourts[] = [];
  CourtsDetails: ICourt[] = [];
  TimeDetails: Icustomertimeslot[] = [];
  selectedMainCourt: IAllcourts | null = null;
  selectedCourt: ICourt | null = null;
  selectedCourtId: number | null = null;
  selectedDateISO: string | null = null;
  availableTimeSlots: TimeChip[] = [];
  selectedTimeSlot: string | null = null;
  selectedTimeslotId: string | null = null;
  formattedMatchTime = '';
  timeSlotsLoading = false;
  timeSlotsError = '';
  venuesOpen = false;
  courtsOpen = false;
  mainCourtsLoading = false;
  courtsLoading = false;
  mainCourtsError = '';
  courtsError = '';
  venueSearch = new FormControl<string>('', { nonNullable: true });
  submitting = false;
  successOpen = false;
  errorMessage = '';
  dateOptions: DateChip[] = [];
  isMatchCreatedModalOpen = false;

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

  ngOnInit(): void {
    this.dateOptions = this.buildNextDates(this.todayISO(), 5);
    this.GetMainCourtes();
    this.resetTimeSlotsState();
  }

  get timeSelectionEnabled(): boolean {
    return !!this.selectedCourtId && !!this.selectedDateISO && !this.timeSlotsLoading;
  }

  get filteredMainCourts(): IAllcourts[] {
    const t = (this.venueSearch.value || '').trim().toLowerCase();

    if (!t) return this.MainCourtsDetails;

    return this.MainCourtsDetails.filter((v) =>
      `${v.name} ${v.address}`.toLowerCase().includes(t)
    );
  }

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
        next: (res) => {
          this.MainCourtsDetails = res?.data ?? [];
        },
        error: (err) => {
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

    this.CreateMatchForm.patchValue({
      venueId: nextId,
      courtId: '',
      dateISO: '',
      time: '',
    });

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
        next: (res) => {
          this.CourtsDetails = res?.data ?? [];
        },
        error: (err) => {
          this.CourtsDetails = [];
          this.courtsError = err?.error?.message ?? 'Failed to load courts.';
        },
      });
  }

  selectCourt(court: ICourt): void {
    const prevCourtId = this.selectedCourtId;

    this.selectedCourt = court;
    this.selectedCourtId = Number(court.id);

    this.CreateMatchForm.patchValue({
      courtId: String(court.id),
    });

    this.CreateMatchForm.get('courtId')?.markAsTouched();
    this.CreateMatchForm.get('courtId')?.markAsDirty();

    if (prevCourtId !== this.selectedCourtId) {
      this.resetDateAndTimeState();

      this.CreateMatchForm.patchValue({
        dateISO: '',
        time: '',
      });
    }
  }

  selectDate(iso: string): void {
    this.selectedDateISO = iso;

    this.CreateMatchForm.patchValue({
      dateISO: iso,
      time: '',
    });

    this.CreateMatchForm.get('dateISO')?.markAsTouched();
    this.CreateMatchForm.get('dateISO')?.markAsDirty();

    this.resetTimeSlotsState();

    if (!this.selectedCourtId) return;

    this.GetTimeAndDate(this.selectedCourtId, iso);
  }

  selectTimeSlot(value: string): void {
    if (!this.timeSelectionEnabled) return;

    this.selectedTimeSlot = value;

    const found = (this.TimeDetails ?? []).find(
      (t) => `${t.start_time} - ${t.end_time}` === value
    );

    this.selectedTimeslotId = found ? String(found.id) : null;

    this.CreateMatchForm.patchValue({
      time: value,
    });

    this.CreateMatchForm.get('time')?.markAsTouched();
    this.CreateMatchForm.get('time')?.markAsDirty();

    this.updateFormattedMatchTime();
  }

  incrementPlayers(): void {
    const currentValue = this.CreateMatchForm.get('playersNeeded')?.value || 0;

    const newValue = Math.min(20, currentValue + 1);

    this.CreateMatchForm.patchValue({
      playersNeeded: newValue,
    });

    this.CreateMatchForm.get('playersNeeded')?.markAsTouched();
  }

  decrementPlayers(): void {
    const currentValue = this.CreateMatchForm.get('playersNeeded')?.value || 0;

    const newValue = Math.max(1, currentValue - 1);

    this.CreateMatchForm.patchValue({
      playersNeeded: newValue,
    });

    this.CreateMatchForm.get('playersNeeded')?.markAsTouched();
  }

  private resetDateAndTimeState(): void {
    this.selectedDateISO = null;
    this.resetTimeSlotsState();
  }

  private resetTimeSlotsState(): void {
    this.availableTimeSlots = [];
    this.selectedTimeSlot = null;
    this.selectedTimeslotId = null;
    this.formattedMatchTime = '';

    this.timeSlotsError = '';
    this.timeSlotsLoading = false;

    this.CreateMatchForm.patchValue({
      time: '',
    });

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
        iso: `${currentDate.getFullYear()}-${String(
          currentDate.getMonth() + 1
        ).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`,

        month: currentDate
          .toLocaleString('en-US', { month: 'short' })
          .toUpperCase(),

        day: String(currentDate.getDate()).padStart(2, '0'),

        weekday: currentDate
          .toLocaleString('en-US', { weekday: 'short' })
          .toUpperCase(),
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

  private updateFormattedMatchTime(): void {
    const selectedSlot = this.TimeDetails?.find(
      (slot) => String(slot.id) === this.selectedTimeslotId
    );

    const start = this.formatTo12Hour(selectedSlot?.start_time);
    const end = this.formatTo12Hour(selectedSlot?.end_time);

    this.formattedMatchTime =
      start && end ? `${start} - ${end}` : '';
  }

  private mapSlotsToChips(slots: Icustomertimeslot[]): TimeChip[] {
    return (slots ?? []).map((t) => ({
      value: `${t.start_time} - ${t.end_time}`,
      isPrime: false,
    }));
  }

  GetTimeAndDate(courtId: number, selectedDateISO: string): void {
    this.timeSlotsLoading = true;
    this.timeSlotsError = '';

    this.availableTimeSlots = [];
    this.selectedTimeSlot = null;
    this.selectedTimeslotId = null;
    this.formattedMatchTime = '';

    this.CreateMatchForm.patchValue({
      time: '',
    });

    this.customerTimeslotService
      .GetCustomerTimeSlot(courtId, selectedDateISO)
      .pipe(finalize(() => (this.timeSlotsLoading = false)))
      .subscribe({
        next: (res) => {
          this.TimeDetails = res?.data ?? [];
          this.availableTimeSlots = this.mapSlotsToChips(this.TimeDetails);
        },
        error: (err) => {
          this.TimeDetails = [];
          this.availableTimeSlots = [];

          this.timeSlotsError =
            err?.error?.message ?? 'Failed to load time slots.';
        },
      });
  }

  onSubmit(): void {
    this.errorMessage = '';

    this.CreateMatchForm.markAllAsTouched();

    if (!this.selectedCourtId || !this.selectedTimeslotId) {
      this.errorMessage = 'Please select a court and a time slot.';
      return;
    }

    if (this.CreateMatchForm.invalid) {
      const firstError = document.querySelector('[role="alert"]');

      firstError?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      return;
    }

    this.SubmitForm();
  }

  SubmitForm(): void {
    if (!this.selectedCourtId || !this.selectedTimeslotId) return;

    const requiredPlayersNumber = Number(
      this.CreateMatchForm.get('playersNeeded')?.value
    );

    const payload = {
      court_id: String(this.selectedCourtId),
      timeslot_id: String(this.selectedTimeslotId),
      name: String(this.CreateMatchForm.get('matchName')?.value || '').trim(),
      description: String(this.CreateMatchForm.get('description')?.value || '').trim(),
      required_players: String(
        Number.isFinite(requiredPlayersNumber)
          ? requiredPlayersNumber
          : 0
      ),
    };

    if (
      !payload.court_id ||
      !payload.timeslot_id ||
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
          this.successSummary.time = this.formattedMatchTime || '--:-- -- - --:-- --';

          // open modal ONLY here
          this.isMatchCreatedModalOpen = true;

          this.CreateMatchForm.patchValue({
            matchName: '',
            description: '',
          });

          this.CreateMatchForm.get('matchName')?.markAsPristine();
          this.CreateMatchForm.get('description')?.markAsPristine();
        },
        error: (err) => {
          this.errorMessage =
            err?.error?.message ?? 'Failed to create match. Please try again.';
        },
      });
  }

  dismissError(controlName: string): void {
    const control = this.CreateMatchForm.get(controlName);

    if (control) {
      control.markAsUntouched();
      control.markAsPristine();

      control.updateValueAndValidity({
        emitEvent: false,
      });
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

    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  }

  hasError(controlName: string, errorType?: string): boolean {
    const control = this.CreateMatchForm.get(controlName);

    if (!control) return false;

    const isInvalid = control.invalid && (control.touched || control.dirty);

    if (!errorType) return isInvalid;

    return isInvalid && control.hasError(errorType);
  }
}