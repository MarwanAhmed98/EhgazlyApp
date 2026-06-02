import { Component, inject, OnDestroy, OnInit, signal, computed, WritableSignal } from '@angular/core';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';
import { CustomerTimeslotService } from '../../../../core/services/CustomerTimeslot/customer-timeslot.service';
import { Icustomertimeslot } from '../../../interfaces/icustomertimeslot';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IcourtSpecficCourt } from '../../../interfaces/icourt-specfic-court';
import { VenuesService } from '../../../../core/services/venues/venues.service';
import { ICustomerSpecificCourt } from '../../../interfaces/icustomer-specific-court';
import { IspecficCourt } from '../../../interfaces/ispecfic-court';
import { AiComponent } from "../../Ai/ai/ai.component";

type Amenity = { label: string; icon: string };
type Slot = {
  id: string;
  label: string;
  time24: string;
  price: number;
  available: boolean;
  isPrime?: boolean;
};

interface CalendarDay {
  date: Date;
  iso: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}

@Component({
  selector: 'app-bookingand-schedule',
  standalone: true,
  imports: [PlayernavComponent, RouterLink, AiComponent],
  templateUrl: './bookingand-schedule.component.html',
  styleUrl: './bookingand-schedule.component.scss',
})
export class BookingandScheduleComponent implements OnInit, OnDestroy {
  private readonly customerTimeslotService = inject(CustomerTimeslotService);
  private readonly venuesService = inject(VenuesService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  CourtDetails: IspecficCourt = {} as IspecficCourt;
  SpecificCourt: IcourtSpecficCourt = {} as IcourtSpecficCourt;
  customerspecificCourts = signal<ICustomerSpecificCourt[]>([]);
  customerTimeSlotsDetails = signal<Icustomertimeslot[]>([]);
  productId: any;
  paymentMethod: any;

  venue = {
    name: 'Stadium One Elite',
    location: 'New Cairo, District 5',
    rating: 4.9,
    reviews: 124,
  };

  activeVenueSlide = 0;
  private autoplayTimer: number | null = null;
  private readonly autoplayMs = 4000;
  selectedCourtId: WritableSignal<number | string> = signal(0);
  selectedDateISO = this.toISO(new Date());
  selectedSlots: Slot[] = [];

  currentCalendarDate = signal<Date>(new Date(this.selectedDateISO));
  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  calendarDays = computed<CalendarDay[]>(() => {
    const date = this.currentCalendarDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = startDayOfWeek;
    const prevMonthDate = new Date(year, month, 0);
    const daysInPrevMonth = prevMonthDate.getDate();

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(this.selectedDateISO);
    selectedDate.setHours(0, 0, 0, 0);

    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const dateObj = new Date(year, month - 1, dayNum);
      const iso = this.toISO(dateObj);
      days.push({
        date: dateObj,
        iso,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: this.isSameDate(dateObj, today),
        isSelected: this.isSameDate(dateObj, selectedDate),
        isDisabled: this.isBeforeToday(dateObj, today),
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(year, month, i);
      const iso = this.toISO(dateObj);
      days.push({
        date: dateObj,
        iso,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: this.isSameDate(dateObj, today),
        isSelected: this.isSameDate(dateObj, selectedDate),
        isDisabled: this.isBeforeToday(dateObj, today),
      });
    }

    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const dateObj = new Date(year, month + 1, i);
      const iso = this.toISO(dateObj);
      days.push({
        date: dateObj,
        iso,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: this.isSameDate(dateObj, today),
        isSelected: this.isSameDate(dateObj, selectedDate),
        isDisabled: this.isBeforeToday(dateObj, today),
      });
    }

    return days;
  });

  selectedCourt = computed(() => {
    const courts = this.customerspecificCourts();
    const id = this.selectedCourtId();
    return courts.find(c => String(c.id) === String(id)) ?? null;
  });

  amenitiesForSelectedCourt = computed<Amenity[]>(() => {
    const court = this.selectedCourt();
    if (!court) return [];
    return [
      { label: 'Parking', icon: '🅿️' },
      { label: 'Showers', icon: '🚿' },
      { label: 'Lockers', icon: '🧳' },
      { label: court.surface_type === 'Grass' ? 'FIFA Pro Grass' : 'Pro Lighting', icon: court.surface_type === 'Grass' ? '🌿' : '💡' },
    ];
  });

  apiSlots = computed<Slot[]>(() => {
    const court = this.selectedCourt();
    if (!court) return [];
    const backendPrice = Number(court.price_per_hour);
    if (isNaN(backendPrice)) return [];

    return this.customerTimeSlotsDetails()
      .map((t) => {
        const start = (t.start_time || '').slice(0, 5);
        const end = (t.end_time || '').slice(0, 5);
        const price = backendPrice;
        const available = (t.status || '').toLowerCase() === 'available';
        return {
          id: `${t.id}`,
          label: start && end ? `${this.to12h(start)} – ${this.to12h(end)}` : 'Timeslot',
          time24: start || '00:00',
          price: price,
          available,
          isPrime: new Set(['18:00', '19:00', '20:00']).has(start),
        };
      })
      .sort((a, b) => a.time24.localeCompare(b.time24));
  });

  get monthLabel(): string {
    const d = this.currentCalendarDate();
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }

  ngOnInit(): void {
    this.startAutoplay();
    this.activatedRoute.paramMap.subscribe((res) => {
      this.productId = res.get('id');
      if (this.productId) {
        this.venuesService.GetSpecificCourts(this.productId).subscribe({
          next: (res) => {
            this.SpecificCourt = res.data;
            this.CourtDetails = res.data;
            // Reset slide index after images load
            this.activeVenueSlide = 0;
            this.startAutoplay();
          }
        });
        this.GetCourt();
      }
    });
    this.currentCalendarDate.set(new Date(this.selectedDateISO));
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  GetCourt(): void {
    if (!this.productId) return;
    this.venuesService.GetCourts(this.productId).subscribe({
      next: (res) => {
        const courts = (res.data || []) as ICustomerSpecificCourt[];
        this.customerspecificCourts.set(courts);
        if (courts.length > 0 && this.selectedCourtId() === 0) {
          this.selectedCourtId.set(courts[0].id);
          this.fetchTimeslots();
        }
      },
      error: (err) => {
        console.error('Failed to load courts', err);
        this.customerspecificCourts.set([]);
      },
    });
  }

  GetSpecCourt(courtId: string | number): void {
    if (!this.productId || !courtId) return;
    this.venuesService.GetSpecCourts(this.productId, courtId).subscribe({
      next: (res) => {
        console.log('Specific court details loaded:', res.data);
        this.paymentMethod = res.data.maincourt.payment_methods.identifier;
      }
    });
  }

  selectCourt(id: number | string): void {
    if (String(id) === String(this.selectedCourtId())) return;
    const courtExists = this.customerspecificCourts().some(c => String(c.id) === String(id));
    if (!courtExists) return;
    this.selectedCourtId.set(id);
    this.selectedSlots = [];
    this.fetchTimeslots();
    this.GetSpecCourt(id);
  }

  private fetchTimeslots(): void {
    const court = this.selectedCourt();
    if (!court) return;
    const courtId = Number(court.id);
    if (isNaN(courtId)) return;
    this.customerTimeslotService
      .GetCustomerTimeSlot(courtId, this.selectedDateISO)
      .subscribe({
        next: (res) => {
          const list = (res?.data ?? []) as Icustomertimeslot[];
          this.customerTimeSlotsDetails.set(Array.isArray(list) ? list : []);
        },
        error: (err) => {
          console.error('Failed to load timeslots', err);
          this.customerTimeSlotsDetails.set([]);
        },
      });
  }

  selectDate(iso: string): void {
    if (this.isBeforeToday(new Date(iso), new Date())) return;
    this.selectedDateISO = iso;
    this.selectedSlots = [];
    this.currentCalendarDate.set(new Date(iso));
    this.fetchTimeslots();
  }

  prevMonth(): void {
    const newDate = new Date(this.currentCalendarDate());
    newDate.setMonth(newDate.getMonth() - 1);
    this.currentCalendarDate.set(newDate);
  }

  nextMonth(): void {
    const newDate = new Date(this.currentCalendarDate());
    newDate.setMonth(newDate.getMonth() + 1);
    this.currentCalendarDate.set(newDate);
  }

  isSelectedSlot(s: Slot): boolean {
    return this.selectedSlots.some(x => x.id === s.id);
  }

  selectSlot(s: Slot): void {
    if (!s.available) return;
    const exists = this.isSelectedSlot(s);
    if (exists) {
      this.selectedSlots = this.selectedSlots.filter(x => x.id !== s.id);
    } else {
      this.selectedSlots = [...this.selectedSlots, s].sort((a, b) => a.time24.localeCompare(b.time24));
    }
  }

  slotClass(s: Slot): string {
    if (!s.available) {
      return 'bg-red-100/70 dark:bg-red-950/20 border-red-200/70 dark:border-red-900/40 text-red-900/70 dark:text-red-200/70';
    }
    if (this.isSelectedSlot(s)) {
      return 'bg-[#146A1E] border-emerald-900/30 text-white shadow-lg shadow-emerald-900/15';
    }
    return 'bg-emerald-100/60 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40 text-emerald-950 dark:text-white hover:bg-emerald-100';
  }

  get totalDurationLabel(): string {
    const hours = this.selectedSlots.length;
    return `${hours} HOUR${hours === 1 ? '' : 'S'}`;
  }

  get grandTotal(): number {
    return this.selectedSlots.reduce((sum, s) => sum + (s.available ? s.price : 0), 0);
  }

  confirmBooking(): void {
    if (this.selectedSlots.length === 0) return;

    const allSlotIds = this.selectedSlots.map(slot => slot.id).join(',');

    this.router.navigate(
      [
        '/payment',
        this.selectedCourtId(),
        allSlotIds,
        this.selectedDateISO,
        this.grandTotal,
        this.SpecificCourt.name,
        this.productId
      ],
      {
        state: { selectedSlots: this.selectedSlots }
      }
    );
  }

  // --- Slider navigation methods using dynamic image count ---
  private getImageCount(): number {
    return this.SpecificCourt.images?.length ?? 0;
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    const n = this.getImageCount();
    if (n <= 1) return;
    this.autoplayTimer = window.setInterval(() => {
      this.activeVenueSlide = (this.activeVenueSlide + 1) % n;
    }, this.autoplayMs);
  }

  private stopAutoplay(): void {
    if (this.autoplayTimer) {
      window.clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  private resetAutoplay(): void {
    this.startAutoplay();
  }

  prevVenueSlide(): void {
    const n = this.getImageCount();
    if (n <= 1) return;
    this.activeVenueSlide = (this.activeVenueSlide - 1 + n) % n;
    this.resetAutoplay();
  }

  nextVenueSlide(): void {
    const n = this.getImageCount();
    if (n <= 1) return;
    this.activeVenueSlide = (this.activeVenueSlide + 1) % n;
    this.resetAutoplay();
  }

  goToVenueSlide(i: number): void {
    const n = this.getImageCount();
    if (n === 0) return;
    this.activeVenueSlide = Math.max(0, Math.min(i, n - 1));
    this.resetAutoplay();
  }

  // --- Helper methods ---
  private toISO(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private fromISO(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }

  private to12h(hhmm: string): string {
    const [hh, mm] = hhmm.split(':').map(Number);
    const h = hh % 12 || 12;
    const ap = hh >= 12 ? 'PM' : 'AM';
    return `${String(h).padStart(2, '0')}:${String(mm ?? 0).padStart(2, '0')} ${ap}`;
  }

  private isSameDate(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  }

  private isBeforeToday(date: Date, today: Date): boolean {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const t = new Date(today);
    t.setHours(0, 0, 0, 0);
    return d < t;
  }
}