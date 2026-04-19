import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';

type Court = {
  id: string;
  name: string;
  meta: string;
  rating: number;
  reviews: number;
  image: string;
};

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
  styleUrls: ['./create-friendly-match.component.scss']
})
export class CreateFriendlyMatchComponent implements OnInit {
  private readonly router = inject(Router);

  submitting = false;
  successOpen = false;
  errorMessage = '';

  courtSearch = new FormControl<string>('', { nonNullable: true });

  courts: Court[] = [
    {
      id: 'c1',
      name: 'Camp Nou Arena',
      meta: 'Maadi, Cairo • 5v5 & 7v7',
      rating: 4.8,
      reviews: 120,
      image: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'c2',
      name: 'The Olympic Hub',
      meta: 'New Cairo • 11v11 Only',
      rating: 4.6,
      reviews: 88,
      // Use a reliable Unsplash image for the second court
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80',
    },
  ];

  dateOptions: DateChip[] = [];
  timeOptions: TimeChip[] = [
    { value: '18:00', isPrime: false },
    { value: '19:00', isPrime: false },
    { value: '20:00', isPrime: true },
    { value: '21:00', isPrime: false },
    { value: '22:00', isPrime: false },
    { value: '23:00', isPrime: false },
  ];

  matchTypeOptions: MatchTypeOption[] = [
    { value: '5v5', label: '5v5' },
    { value: '7v7', label: '7v7' },
  ];

  successSummary = { field: 'Camp Nou Arena', time: '20:00 – 21:30' };

  readonly CreateMatchForm = new FormGroup({
    courtId: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    dateISO: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    time: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    playersNeeded: new FormControl<number>(6, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(20)]
    }),
    matchType: new FormControl<'5v5' | '7v7'>('5v5', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    title: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)]
    }),
    location: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    }),
    price: new FormControl<number>(150, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0), Validators.max(9999)]
    })
  });

  ngOnInit(): void {
    this.dateOptions = this.buildNextDates(this.todayISO(), 5);
  }

  get filteredCourts(): Court[] {
    const searchTerm = (this.courtSearch.value || '').trim().toLowerCase();
    if (!searchTerm) return this.courts;
    return this.courts.filter(court =>
      `${court.name} ${court.meta}`.toLowerCase().includes(searchTerm)
    );
  }

  /** Replaces the broken image with an emoji fallback placeholder */
  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    // Show the sibling placeholder span
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

  dismissError(controlName: string): void {
    const control = this.CreateMatchForm.get(controlName);
    if (control) {
      control.markAsUntouched();
      control.markAsPristine();
      control.updateValueAndValidity({ emitEvent: false });
    }
  }

  selectCourt(id: string): void {
    this.CreateMatchForm.patchValue({ courtId: id });
    this.CreateMatchForm.get('courtId')?.markAsTouched();
    this.CreateMatchForm.get('courtId')?.markAsDirty();
  }

  selectDate(iso: string): void {
    this.CreateMatchForm.patchValue({ dateISO: iso });
    this.CreateMatchForm.get('dateISO')?.markAsTouched();
    this.CreateMatchForm.get('dateISO')?.markAsDirty();
  }

  selectTime(value: string): void {
    this.CreateMatchForm.patchValue({ time: value });
    this.CreateMatchForm.get('time')?.markAsTouched();
    this.CreateMatchForm.get('time')?.markAsDirty();
  }

  selectMatchType(value: '5v5' | '7v7'): void {
    this.CreateMatchForm.patchValue({ matchType: value });
    this.CreateMatchForm.get('matchType')?.markAsTouched();
    this.CreateMatchForm.get('matchType')?.markAsDirty();
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

  SubmitForm(): void {
    this.submitting = true;

    setTimeout(() => {
      const courtId = this.CreateMatchForm.get('courtId')?.value;
      const court = this.courts.find(c => c.id === courtId);
      this.successSummary.field = court?.name ?? 'Camp Nou Arena';

      const startTime = this.CreateMatchForm.get('time')?.value || '20:00';
      this.successSummary.time = `${startTime} – ${this.addMinutes(startTime, 90)}`;

      this.successOpen = true;
      this.submitting = false;
    }, 900);
  }

  onSubmit(): void {
    console.log(this.CreateMatchForm.value);

    this.errorMessage = '';
    this.CreateMatchForm.markAllAsTouched();

    if (this.CreateMatchForm.invalid) {
      const firstError = document.querySelector('[role="alert"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    this.SubmitForm();
  }

  closeSuccess(): void {
    this.successOpen = false;
  }

  goToMatches(): void {
    this.successOpen = false;
    this.router.navigate(['/matches']);
  }

  goToDashboard(): void {
    this.successOpen = false;
    this.router.navigate(['/dashboard']);
  }

  goBack(): void {
    window.history.back();
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
        weekday: currentDate.toLocaleString('en-US', { weekday: 'short' }).toUpperCase()
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
}