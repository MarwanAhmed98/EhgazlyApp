import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';
import { RouterLink } from '@angular/router';
import { PlayerFRiendlyMatchService } from '../../../../core/services/PlayerFriendlyMatch/player-friendly-match.service';
import { IfriendlyMatch } from '../../../interfaces/ifriendly-match';
import { DatePipe, SlicePipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';


type FilterMode = 'date' | 'price' | 'all';

@Component({
  selector: 'app-friendly-match-dashboard',
  standalone: true,
  imports: [PlayernavComponent, FormsModule, RouterLink, DatePipe, SlicePipe, LucideAngularModule],
  templateUrl: './friendly-match-dashboard.component.html',
  styleUrl: './friendly-match-dashboard.component.scss',
})
export class FriendlyMatchDashboardComponent implements OnInit {
  private readonly playerFRiendlyMatchService = inject(PlayerFRiendlyMatchService);

  // ===================== API DATA (SOURCE OF TRUTH) =====================
  allMatches: IfriendlyMatch[] = [];          // original API data
  filteredMatches: IfriendlyMatch[] = [];     // filtered results

  // keep if used elsewhere (optional)
  AllMatchesDetails: IfriendlyMatch[] = [];

  // ===================== FILTER STATE =====================
  query = '';
  filtersModalOpen = false;
  filterMode: FilterMode = 'all';

  readonly priceMinBound = 0;
  readonly priceMaxBound = 200;
  readonly priceStep = 5;

  minPrice = 0;
  maxPrice = 200;

  minPriceInput: number | null = 0;
  maxPriceInput: number | null = 200;

  selectedDateISO: string = '';

  // (keep for future UI; safe no-op if not used in HTML)
  availabilityOnly = false;

  // UI helpers
  priceTrackLeft = 0;
  priceTrackRight = 0;

  constructor() {
    this.resetAllFilters(false);
  }

  ngOnInit(): void {
    this.GetMatches();
  }

  // ===================== MODAL =====================
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

  // ===================== FILTERING (ALWAYS FROM API DATA) =====================
  applyFilters(): void {
    const q = (this.query || '').trim().toLowerCase();

    const base = Array.isArray(this.allMatches) ? this.allMatches : [];

    let result = base
      .filter((m) => {
        // Search by stadium/area + match name (safe)
        if (!q) return true;

        const matchName = String((m as any)?.name ?? '');
        const address = String((m as any)?.court?.maincourt?.address ?? '');
        const courtName = String((m as any)?.court?.name ?? '');

        const hay = `${matchName} ${courtName} ${address}`.toLowerCase();
        return hay.includes(q);
      })
      .filter((m) => {
        // Price range (safe)
        const price = Number((m as any)?.court?.price_per_hour ?? 0);
        if (!Number.isFinite(price)) return false;
        return price >= this.minPrice && price <= this.maxPrice;
      })
      .filter((m) => {
        // Date filter (safe)
        if (!this.selectedDateISO) return true;

        const dateISO = String((m as any)?.timeslot?.date ?? '').slice(0, 10);
        return dateISO === this.selectedDateISO;
      });

    // optional availability filter (based on spots_left if available)
    if (this.availabilityOnly) {
      result = result.filter((m) => Number((m as any)?.spots_left ?? 0) > 0);
    }

    this.filteredMatches = [...result];
  }

  resetAllFilters(closeModal: boolean = false): void {
    this.query = '';
    this.selectedDateISO = '';
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

  // ===================== PRICE UI =====================
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

  // ===================== API =====================
  GetMatches(): void {
    this.playerFRiendlyMatchService.GetAllMatches().subscribe({
      next: (res) => {
        const data: IfriendlyMatch[] = res?.data ?? [];

        // preserve original API data + keep filtered in sync
        this.allMatches = Array.isArray(data) ? data : [];
        this.AllMatchesDetails = this.allMatches; // if used elsewhere

        // apply current filters to NEW api data
        this.applyFilters();
      },
      error: () => {
        this.allMatches = [];
        this.AllMatchesDetails = [];
        this.filteredMatches = [];
      },
    });
  }
}