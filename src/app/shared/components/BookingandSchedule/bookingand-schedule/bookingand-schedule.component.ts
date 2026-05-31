import { Component, inject, OnDestroy, OnInit, signal, computed, WritableSignal } from '@angular/core';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';
import { CustomerTimeslotService } from '../../../../core/services/CustomerTimeslot/customer-timeslot.service';
import { Icustomertimeslot } from '../../../interfaces/icustomertimeslot';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IcourtSpecficCourt } from '../../../interfaces/icourt-specfic-court';
import { VenuesService } from '../../../../core/services/venues/venues.service';
import { ICustomerSpecificCourt } from '../../../interfaces/icustomer-specific-court';
import { IspecficCourt } from '../../../interfaces/ispecfic-court';

type Amenity = { label: string; icon: string };
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
  private readonly venuesService = inject(VenuesService);
  private readonly activatedRoute = inject(ActivatedRoute);
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
    images: [
      'https://images.unsplash.com/photo-1434648957308-5e6a859697e8?auto=format&fit=crop&w=2200&q=80',
      'https://img.freepik.com/free-photo/soccer-players-action-professional-stadium_654080-1820.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtQmBt5UXMU3GtdHQ5ySKLDoj0ZOhcjLszFA&s',
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=2200&q=80',
    ],
  };

  activeVenueSlide = 0;
  private autoplayTimer: number | null = null;
  private readonly autoplayMs = 4000;
  selectedCourtId: WritableSignal<number | string> = signal(0);
  selectedDateISO = this.toISO(new Date());
  visibleDates: DateChip[] = this.buildDateChips(new Date(), 6);
  selectedSlots: Slot[] = [];

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

  ngOnInit(): void {
    this.startAutoplay();
    this.activatedRoute.paramMap.subscribe((res) => {
      this.productId = res.get('id');
      if (this.productId) {
        this.venuesService.GetSpecificCourts(this.productId).subscribe({
          next: (res) => {
            this.SpecificCourt = res.data;
            this.CourtDetails = res.data;
          }
        });
        this.GetCourt();
      }
    });
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
    this.selectedDateISO = iso;
    this.selectedSlots = [];
    this.fetchTimeslots();
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

  get monthLabel(): string {
    const d = this.fromISO(this.selectedDateISO);
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
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

  private buildDateChips(start: Date, count: number): DateChip[] {
    const chips: DateChip[] = [];
    const d = new Date(start);
    for (let i = 0; i < count; i++) {
      const iso = this.toISO(d);
      chips.push({ iso, dow: d.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase(), day: d.getDate() });
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

}