import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';
import { RouterLink } from "@angular/router";

type MatchType = 'football' | 'padel' | 'tennis';

type Match = {
  id: string;
  title: string;
  location: string;
  image: string;
  price: number;
  format: string;
  whenLabel: string;
  startsAtISO: string; // "YYYY-MM-DDTHH:mm:ss"
  playersCurrent: number;
  playersMax: number;
  isPrime: boolean;
  type: MatchType;
};

type FilterMode = 'date' | 'price' | 'all';

@Component({
  selector: 'app-friendly-match-dashboard',
  standalone: true,
  imports: [PlayernavComponent, FormsModule, RouterLink],
  templateUrl: './friendly-match-dashboard.component.html',
  styleUrl: './friendly-match-dashboard.component.scss',
})
export class FriendlyMatchDashboardComponent {
  // ----------------------------
  // UI State
  // ----------------------------
  query = '';
  filtersModalOpen = false;
  filterMode: FilterMode = 'all';

  // ----------------------------
  // Filter State
  // ----------------------------
  readonly priceMinBound = 0;
  readonly priceMaxBound = 200;
  readonly priceStep = 5;

  // Slider values (source of truth)
  minPrice = 0;
  maxPrice = 200;

  // Manual inputs (synced with slider)
  minPriceInput: number | null = 0;
  maxPriceInput: number | null = 200;

  // Date filter
  selectedDateISO: string = ''; // "YYYY-MM-DD" or ""

  // Optional/extendable filters (defined)
  availabilityOnly = false;
  selectedLocations = new Set<string>();
  selectedTypes = new Set<MatchType>();

  // ----------------------------
  // Data
  // ----------------------------
  matches: Match[] = [
    {
      id: 'm1',
      title: 'Friday Night Blitz',
      location: 'Maadi Sports Club',
      image: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1800&q=80',
      price: 50,
      format: '7v7',
      whenLabel: 'Today, 8:00 PM',
      startsAtISO: '2026-04-18T20:00:00',
      playersCurrent: 9,
      playersMax: 12,
      isPrime: true,
      type: 'football',
    },
    {
      id: 'm2',
      title: 'Heliopolis Legends',
      location: 'Club7, Degla',
      image:
        'https://images.unsplash.com/photo-1663832952954-170d73947ba7?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8c3RhZGl1bXxlbnwwfHwwfHx8MA%3D%3D',
      price: 60,
      format: '6v6',
      whenLabel: 'Tomorrow, 9:30 PM',
      startsAtISO: '2026-04-19T21:30:00',
      playersCurrent: 10,
      playersMax: 12,
      isPrime: false,
      type: 'football',
    },
    {
      id: 'm3',
      title: 'Sunrise Scrimmage',
      location: 'Palm Hills Club',
      image: 'https://images.unsplash.com/photo-1434648957308-5e6a859697e8?auto=format&fit=crop&w=1800&q=80',
      price: 40,
      format: '5v5',
      whenLabel: 'Sat, 7:00 AM',
      startsAtISO: '2026-04-20T07:00:00',
      playersCurrent: 9,
      playersMax: 10,
      isPrime: false,
      type: 'football',
    },
    {
      id: 'm4',
      title: 'New Cairo Derby',
      location: 'Petrosport Stadium',
      image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1800&q=80',
      price: 75,
      format: '8v8',
      whenLabel: 'Sun, 10:00 PM',
      startsAtISO: '2026-04-20T22:00:00',
      playersCurrent: 4,
      playersMax: 16,
      isPrime: false,
      type: 'football',
    },
  ];

  filteredMatches: Array<
    Match & {
      fillPct: number;
      slotsLeft: number;
      playersLabel: string;
      availabilityLabel: string;
    }
  > = [];

  // ----------------------------
  // Price Track UI
  // ----------------------------
  priceTrackLeft = 0;
  priceTrackRight = 0;

  constructor() {
    this.resetAllFilters(false);
  }

  // ----------------------------
  // Modal + Mode
  // ----------------------------
  openFilter(mode: FilterMode): void {
    this.filterMode = mode;
    this.filtersModalOpen = true;

    this.syncManualInputsFromSlider();
    this.recalcPriceTrack();
  }

  closeAllFilters(): void {
    this.filtersModalOpen = false;
  }

  applyAndCloseAllFilters(): void {
    this.applyFilters();
    this.closeAllFilters();
  }

  // ----------------------------
  // Filtering
  // ----------------------------
  applyFilters(): void {
    const q = this.query.trim().toLowerCase();

    const result = this.matches
      .filter((m) => {
        if (!q) return true;
        const hay = `${m.title} ${m.location}`.toLowerCase();
        return hay.includes(q);
      })
      .filter((m) => m.price >= this.minPrice && m.price <= this.maxPrice)
      .filter((m) => (this.selectedDateISO ? this.getDateISO(m.startsAtISO) === this.selectedDateISO : true))
      .filter((m) => (this.selectedLocations.size ? this.selectedLocations.has(m.location) : true))
      .filter((m) => (this.selectedTypes.size ? this.selectedTypes.has(m.type) : true))
      .map((m) => {
        const slotsLeft = Math.max(0, m.playersMax - m.playersCurrent);
        const fillPct = Math.min(100, Math.round((m.playersCurrent / m.playersMax) * 100));
        const availabilityLabel = slotsLeft === 0 ? 'Full' : slotsLeft <= 2 ? 'Almost Full' : 'Open';

        return {
          ...m,
          slotsLeft,
          fillPct,
          playersLabel: `${m.playersCurrent}/${m.playersMax}`,
          availabilityLabel,
        };
      });

    this.filteredMatches = this.availabilityOnly ? result.filter((m) => m.slotsLeft > 0) : result;
  }

  // ----------------------------
  // Reset / Clear
  // ----------------------------
  resetAllFilters(closeModal: boolean = false): void {
    this.query = '';
    this.selectedDateISO = '';
    this.selectedLocations.clear();
    this.selectedTypes.clear();
    this.availabilityOnly = false;

    this.minPrice = this.priceMinBound;
    this.maxPrice = this.priceMaxBound;

    this.syncManualInputsFromSlider();
    this.recalcPriceTrack();
    this.applyFilters();

    if (closeModal) this.closeAllFilters();
  }

  resetFilters(): void {
    this.resetAllFilters(false);
  }

  clearDate(): void {
    this.selectedDateISO = '';
    this.applyFilters();
  }

  resetDateOnly(): void {
    this.selectedDateISO = '';
    this.applyFilters();
  }

  // ----------------------------
  // Price Sync Logic
  // ----------------------------
  onPriceSliderInput(): void {
    this.minPrice = this.snapToStep(this.clamp(this.minPrice, this.priceMinBound, this.priceMaxBound), this.priceStep);
    this.maxPrice = this.snapToStep(this.clamp(this.maxPrice, this.priceMinBound, this.priceMaxBound), this.priceStep);

    if (this.minPrice > this.maxPrice) {
      const t = this.minPrice;
      this.minPrice = this.maxPrice;
      this.maxPrice = t;
    }

    this.syncManualInputsFromSlider();
    this.recalcPriceTrack();
    this.applyFilters();
  }

  onPriceManualInput(which: 'min' | 'max'): void {
    const minVal = this.safeNum(this.minPriceInput);
    const maxVal = this.safeNum(this.maxPriceInput);

    if (which === 'min' && minVal !== null) this.minPrice = minVal;
    if (which === 'max' && maxVal !== null) this.maxPrice = maxVal;

    this.normalizePriceFromAnySource(false);
    this.recalcPriceTrack();
    this.applyFilters();
  }

  onPriceManualBlur(_which: 'min' | 'max'): void {
    this.normalizePriceFromAnySource(true);
    this.syncManualInputsFromSlider();
    this.recalcPriceTrack();
    this.applyFilters();
  }

  clearPrice(): void {
    this.minPrice = this.priceMinBound;
    this.maxPrice = this.priceMaxBound;
    this.syncManualInputsFromSlider();
    this.recalcPriceTrack();
    this.applyFilters();
  }

  private normalizePriceFromAnySource(snap: boolean): void {
    let min = this.clamp(this.minPrice, this.priceMinBound, this.priceMaxBound);
    let max = this.clamp(this.maxPrice, this.priceMinBound, this.priceMaxBound);

    if (snap) {
      min = this.snapToStep(min, this.priceStep);
      max = this.snapToStep(max, this.priceStep);
    }

    if (min > max) {
      const t = min;
      min = max;
      max = t;
    }

    this.minPrice = min;
    this.maxPrice = max;

    this.minPriceInput = this.minPrice;
    this.maxPriceInput = this.maxPrice;
  }

  private syncManualInputsFromSlider(): void {
    this.minPriceInput = this.minPrice;
    this.maxPriceInput = this.maxPrice;
  }

  private recalcPriceTrack(): void {
    const range = this.priceMaxBound - this.priceMinBound || 1;
    const left = ((this.minPrice - this.priceMinBound) / range) * 100;
    const right = 100 - ((this.maxPrice - this.priceMinBound) / range) * 100;

    this.priceTrackLeft = Math.max(0, Math.min(100, left));
    this.priceTrackRight = Math.max(0, Math.min(100, right));
  }

  // ----------------------------
  // Helpers
  // ----------------------------
  private getDateISO(iso: string): string {
    return iso.slice(0, 10);
  }

  private safeNum(v: number | null): number | null {
    if (v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  private clamp(n: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, n));
  }

  private snapToStep(n: number, step: number): number {
    if (step <= 0) return n;
    return Math.round(n / step) * step;
  }

  expandRadius(): void {
    this.resetAllFilters(true);
  }
}