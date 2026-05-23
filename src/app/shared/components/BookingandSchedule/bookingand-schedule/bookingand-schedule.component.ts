import { Component, inject, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';
import { CustomerTimeslotService } from '../../../../core/services/CustomerTimeslot/customer-timeslot.service';
import { Icustomertimeslot } from '../../../interfaces/icustomertimeslot';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IcourtSpecficCourt } from '../../../interfaces/icourt-specfic-court';

type Amenity = { label: string; icon: string };

type Court = {
  id: string;
  name: string;
  amenities: Amenity[];
  basePrice: number;
};

type DateChip = { iso: string; dow: string; day: number };

type Slot = {
  id: string;
  label: string;
  time24: string;
  price: number;
  available: boolean;
  isPrime?: boolean;
};

@Component({
  selector: 'app-bookingand-schedule',
  standalone: true,
  imports: [PlayernavComponent, RouterLink],
  templateUrl: './bookingand-schedule.component.html',
  styleUrl: './bookingand-schedule.component.scss',
})
export class BookingandScheduleComponent implements OnInit, OnDestroy {
  private readonly customerTimeslotService = inject(CustomerTimeslotService);
  private readonly activatedRoute = inject(ActivatedRoute);
  SpecificCourt: IcourtSpecficCourt = {} as IcourtSpecficCourt
  customerTimeSlotsDetails = signal<Icustomertimeslot[]>([]);
  productId: any;
  venue = {
    name: 'Stadium One Elite',
    location: 'New Cairo, District 5',
    rating: 4.9,
    reviews: 124,
    images: [
      'https://images.unsplash.com/photo-1434648957308-5e6a859697e8?auto=format&fit=crop&w=2200&q=80',
      'https://img.freepik.com/free-photo/soccer-players-action-professional-stadium_654080-1820.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtQmBt5UXMU3GtdHQ5ySKLDoj0ZOhcjLszFA&s',
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=2200&q=80',
    ],
  };

  courts: Court[] = [
    {
      id: '1',
      name: 'Court 1',
      basePrice: 450,
      amenities: [
        { label: 'Showers', icon: '🚿' },
        { label: 'Parking', icon: '🅿️' },
        { label: 'Lockers', icon: '🧳' },
        { label: 'FIFA Pro Grass', icon: '🌿' },
      ],
    },
    {
      id: '2',
      name: 'Court 2',
      basePrice: 500,
      amenities: [
        { label: 'Showers', icon: '🚿' },
        { label: 'Parking', icon: '🅿️' },
        { label: 'Lockers', icon: '🧳' },
        { label: 'Pro Lighting', icon: '💡' },
      ],
    },
    {
      id: '3',
      name: 'Court 3',
      basePrice: 380,
      amenities: [
        { label: 'Parking', icon: '🅿️' },
        { label: 'Lockers', icon: '🧳' },
        { label: 'Wi‑Fi', icon: '📶' },
        { label: 'Lounge', icon: '🛋️' },
      ],
    },
  ];

  activeVenueSlide = 0;
  private autoplayTimer: number | null = null;
  private readonly autoplayMs = 4000;

  selectedCourtId: number = 1;

  selectedDateISO = this.toISO(new Date());
  visibleDates: DateChip[] = this.buildDateChips(new Date(), 6);

  selectedSlots: Slot[] = [];

  // Adapt API timeslots to UI Slot model
  apiSlots = computed<Slot[]>(() => {
    const base = this.selectedCourt.basePrice;
    const primeHours = new Set(['18:00', '19:00', '20:00']);

    return this.customerTimeSlotsDetails().map((t) => {
      const start = (t.start_time || '').slice(0, 5); // "HH:mm"
      const end = (t.end_time || '').slice(0, 5);

      const isPrime = primeHours.has(start);
      const price = isPrime ? base + 200 : base;

      const available = (t.status || '').toLowerCase() === 'available';

      return {
        id: `${t.id}`,
        label: start && end ? `${this.to12h(start)} – ${this.to12h(end)}` : 'Timeslot',
        time24: start || '00:00',
        price,
        available,
        isPrime,
      };
    }).sort((a, b) => a.time24.localeCompare(b.time24));
  });

  ngOnInit(): void {
    this.startAutoplay();
    this.fetchTimeslots();
    this.activatedRoute.paramMap.subscribe({
      next: (res) => {
        console.log(res);
        this.productId = res.get('id');
        console.log(this.productId);
        this.customerTimeslotService.GetSpecificCourt(this.productId).subscribe({
          next: (res) => {
            this.SpecificCourt = res.data;
            console.log(this.SpecificCourt);
          }
        })

      }
    })
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  get selectedCourt(): Court {
    return this.courts.find((c) => +c.id === this.selectedCourtId) ?? this.courts[0];
  }

  get monthLabel(): string {
    const d = this.fromISO(this.selectedDateISO);
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }

  get totalDurationLabel(): string {
    const hours = this.selectedSlots.length;
    return `${hours} HOUR${hours === 1 ? '' : 'S'}`;
  }

  get grandTotal(): number {
    return this.selectedSlots.reduce((sum, s) => sum + (s.available ? s.price : 0), 0);
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    const n = this.venue.images.length;
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
    const n = this.venue.images.length;
    if (n <= 1) return;
    this.activeVenueSlide = (this.activeVenueSlide - 1 + n) % n;
    this.resetAutoplay();
  }

  nextVenueSlide(): void {
    const n = this.venue.images.length;
    if (n <= 1) return;
    this.activeVenueSlide = (this.activeVenueSlide + 1) % n;
    this.resetAutoplay();
  }

  goToVenueSlide(i: number): void {
    const n = this.venue.images.length;
    if (n === 0) return;
    this.activeVenueSlide = Math.max(0, Math.min(i, n - 1));
    this.resetAutoplay();
  }

  selectCourt(id: number): void {
    if (id === this.selectedCourtId) return;
    this.selectedCourtId = id;
    this.selectedSlots = [];
    this.fetchTimeslots();
  }

  selectDate(iso: string): void {
    this.selectedDateISO = iso;
    this.selectedSlots = [];
    this.fetchTimeslots();
  }

  isSelectedSlot(s: Slot): boolean {
    return this.selectedSlots.some((x) => x.id === s.id);
  }

  selectSlot(s: Slot): void {
    if (!s.available) return;

    const exists = this.isSelectedSlot(s);
    if (exists) {
      this.selectedSlots = this.selectedSlots.filter((x) => x.id !== s.id);
      return;
    }

    this.selectedSlots = [...this.selectedSlots, s].sort((a, b) => a.time24.localeCompare(b.time24));
  }

  slotClass(s: Slot): string {
    if (!s.available) {
      return 'bg-red-100/70 dark:bg-red-950/20 border-red-200/70 dark:border-red-900/40 text-red-900/70 dark:text-red-200/70 opacity-100';
    }

    if (this.isSelectedSlot(s)) {
      return 'bg-[#146A1E] border-emerald-900/30 text-white shadow-lg shadow-emerald-900/15';
    }

    return 'bg-emerald-100/60 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40 text-emerald-950 dark:text-white hover:bg-emerald-100';
  }

  confirmBooking(): void {
    console.log('Confirm booking', {
      venue: this.venue.name,
      court: this.selectedCourt.name,
      date: this.selectedDateISO,
      slots: this.selectedSlots,
      total: this.grandTotal,
    });
  }

  private buildDateChips(start: Date, count: number): DateChip[] {
    const chips: DateChip[] = [];
    const d = new Date(start);
    for (let i = 0; i < count; i++) {
      const iso = this.toISO(d);
      chips.push({
        iso,
        dow: d.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase(),
        day: d.getDate(),
      });
      d.setDate(d.getDate() + 1);
    }
    return chips;
  }

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

  private fetchTimeslots(): void {
    this.customerTimeslotService.GetCustomerTimeSlot(this.selectedCourtId, this.selectedDateISO).subscribe({
      next: (res) => {
        const list = (res?.data ?? []) as Icustomertimeslot[];
        this.customerTimeSlotsDetails.set(Array.isArray(list) ? list : []);
      },
      error: () => {
        this.customerTimeSlotsDetails.set([]);
      },
    });
  }

  private hash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }
}