import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';

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
  imports: [PlayernavComponent],
  templateUrl: './bookingand-schedule.component.html',
  styleUrl: './bookingand-schedule.component.scss',
})
export class BookingandScheduleComponent implements OnInit, OnDestroy {
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
      id: 'c1',
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
      id: 'c2',
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
      id: 'c3',
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

  // Independent venue slider state (autoplay + manual)
  activeVenueSlide = 0;
  private autoplayTimer: number | null = null;
  private readonly autoplayMs = 4000;

  selectedCourtId = this.courts[0].id;

  selectedDateISO = this.toISO(new Date());
  visibleDates: DateChip[] = this.buildDateChips(new Date(), 6);

  selectedSlots: Slot[] = [];

  ngOnInit(): void {
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  get selectedCourt(): Court {
    return this.courts.find((c) => c.id === this.selectedCourtId) ?? this.courts[0];
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

  // Autoplay controls
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
    // continue normally but restart timing after interaction
    this.startAutoplay();
  }

  // Slider (manual; independent from courts)
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

  // Court selection (unchanged)
  selectCourt(id: string): void {
    if (id === this.selectedCourtId) return;
    this.selectedCourtId = id;
    this.selectedSlots = [];
  }

  // Date selection
  selectDate(iso: string): void {
    this.selectedDateISO = iso;
    this.selectedSlots = [];
  }

  // Slots
  visibleSlots(): Slot[] {
    const base = this.selectedCourt.basePrice;

    const seed = this.hash(`${this.selectedCourtId}-${this.selectedDateISO}`);
    const unavailableIdx = new Set<number>([seed % 8, (seed + 3) % 8]);

    const primeIdx = new Set<number>([5, 6]);
    const labels = [
      { t: '08:00', l: '08:00 AM' },
      { t: '09:00', l: '09:00 AM' },
      { t: '10:00', l: '10:00 AM' },
      { t: '11:00', l: '11:00 AM' },
      { t: '16:00', l: '04:00 PM' },
      { t: '18:00', l: '06:00 PM' },
      { t: '19:00', l: '07:00 PM' },
      { t: '20:00', l: '08:00 PM' },
    ];

    return labels.map((x, idx) => {
      const isPrime = primeIdx.has(idx);
      const available = !unavailableIdx.has(idx);
      const price = isPrime ? base + 200 : base;

      return {
        id: `${this.selectedCourtId}-${this.selectedDateISO}-${x.t}`,
        label: x.l,
        time24: x.t,
        price,
        available,
        isPrime,
      };
    });
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

  // Utils
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

  private hash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }
}