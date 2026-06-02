import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';
import { RouterLink } from "@angular/router";
import { VenuesService } from '../../../../core/services/venues/venues.service';
import { AiComponent } from "../../Ai/ai/ai.component";

type LocationState = 'unknown' | 'granted' | 'denied';
type ViewState = 'permission' | 'nearby' | 'all';
type TurfFilter = 'all' | 'natural' | 'artificial';
type NearbyView = 'list' | 'map';

type LiveStatus = { type: 'ok' | 'warn' | 'bad'; label: string };

type Stadium = {
  id: string;
  index: number;
  name: string;
  area: string;
  address: string;
  image: string;
  rating: number;
  turf: 'natural' | 'artificial';
  lat: number;
  lng: number;
  distanceKm: number;
  travelMins: number;
  live: LiveStatus;
};

@Component({
  selector: 'app-venues',
  imports: [FormsModule, PlayernavComponent, RouterLink, AiComponent],
  templateUrl: './venues.component.html',
  styleUrl: './venues.component.scss'
})
export class VenuesComponent implements OnInit {
  private readonly venuesService = inject(VenuesService);

  view: ViewState = 'permission';
  locationState: LocationState = 'unknown';

  dismissedBanner = false;

  filter: TurfFilter = 'all';
  sortMode: 'priceAsc' | 'priceDesc' = 'priceAsc';

  nearbyView: NearbyView = 'list';
  radiusKm = 1000;

  currentLocationLabel = 'Your Location';

  userLat: number | null = null;
  userLng: number | null = null;

  loading = false;
  private isFetching = false;

  stadiums: Stadium[] = [];

  // Pagination Variables
  currentPage = 1;
  itemsPerPage = 8;
  protected readonly Math = Math;

  ngOnInit(): void {
    // No automatic loading
  }

  totalPages(): number {
    const count = this.view === 'all' ? this.visibleStadiums().length : this.nearbyStadiums().length;
    return Math.ceil(count / this.itemsPerPage) || 1;
  }

  paginatedData(): Stadium[] {
    const list = this.view === 'all' ? this.visibleStadiums() : this.nearbyStadiums();
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return list.slice(startIndex, startIndex + this.itemsPerPage);
  }

  private loadAllCourtsOnly(): void {
    if (this.isFetching) return;
    this.isFetching = true;
    this.loading = true;

    this.venuesService.GetMainCourtes().subscribe({
      next: (res) => {
        const data = res.data || [];
        this.stadiums = data.map((court: any, index: number): Stadium => ({
          id: court.id.toString(),
          index,
          name: court.name,
          area: court.address,
          address: court.address,
          image: court.primary_image?.url || '',
          rating: 4.5,
          turf: index % 2 === 0 ? 'natural' : 'artificial',
          lat: parseFloat(court.latitude),
          lng: parseFloat(court.longitude),
          distanceKm: 0,
          travelMins: 0,
          live: { type: 'ok', label: 'Available' }
        }));
        this.loading = false;
        this.isFetching = false;
        this.view = 'all';
        this.locationState = 'denied';
        this.currentPage = 1; // Reset pagination
      },
      error: () => {
        this.loading = false;
        this.isFetching = false;
        this.stadiums = [];
        this.view = 'all';
      }
    });
  }

  private loadNearestCourtsOnly(lat: number, lng: number): void {
    if (this.isFetching) return;
    this.isFetching = true;
    this.loading = true;
    console.log('Sending coordinates to backend:', { latitude: lat, longitude: lng });

    this.venuesService.GetNearestCourts(lat, lng).subscribe({
      next: (res) => {
        console.log('Nearest courts response:', res);
        const data = res.data || [];
        this.stadiums = data.map((court: any, index: number): Stadium => ({
          id: court.id.toString(),
          index,
          name: court.name,
          area: court.address,
          address: court.address,
          image: court.primary_image?.url || '',
          rating: 4.5,
          turf: index % 2 === 0 ? 'natural' : 'artificial',
          lat: parseFloat(court.latitude),
          lng: parseFloat(court.longitude),
          distanceKm: court.distance || 0,
          travelMins: Math.max(6, Math.round((court.distance || 1) * 3.5)),
          live: { type: 'ok', label: 'Available' }
        }));
        this.loading = false;
        this.isFetching = false;
        this.view = 'nearby';
        this.locationState = 'granted';
        this.currentPage = 1; // Reset pagination
      },
      error: (err) => {
        console.error('Nearest courts API error:', err);
        this.loading = false;
        this.isFetching = false;
        this.loadAllCourtsOnly();
      }
    });
  }

  allowAccess(): void {
    if (this.isFetching) return;

    if (!navigator?.geolocation) {
      console.warn('Geolocation not supported');
      this.loadAllCourtsOnly();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        console.log('Real browser coordinates:', { lat, lng });
        console.log('Current location (approx):', position.coords);

        this.userLat = lat;
        this.userLng = lng;
        this.currentLocationLabel = await this.getLocationName(lat, lng);
        console.log('Detected location name:', this.currentLocationLabel);
        this.loadNearestCourtsOnly(lat, lng);
      },
      (error) => {
        console.error('Geolocation error:', error.code, error.message);
        this.loadAllCourtsOnly();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  async getLocationName(lat: number, lng: number): Promise<string> {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      const city = data.address.city || data.address.town || data.address.village || data.address.state || 'Your Location';
      console.log('Reverse geocoded city:', city);
      return city;
    } catch {
      return 'Your Location';
    }
  }

  maybeLater(): void {
    if (this.isFetching) return;
    this.loadAllCourtsOnly();
  }

  changeLocation(): void {
    this.view = 'permission';
    this.locationState = 'unknown';
    this.stadiums = [];
    this.userLat = null;
    this.userLng = null;
    this.isFetching = false;
    this.loading = false;
    this.currentPage = 1;
  }

  setNearbyView(v: NearbyView): void {
    this.nearbyView = v;
  }

  nearbyStadiums(): Stadium[] {
    return this.stadiums.filter(s => s.distanceKm <= this.radiusKm);
  }

  setFilter(f: TurfFilter): void {
    this.filter = f;
    this.currentPage = 1; // Reset to page 1 on filter change
  }

  cycleSort(): void {
    this.sortMode = this.sortMode === 'priceAsc' ? 'priceDesc' : 'priceAsc';
    this.currentPage = 1; // Reset to page 1 on sort change
  }

  toggleFilters(): void {
    console.log('filters');
  }

  visibleStadiums(): Stadium[] {
    let list = [...this.stadiums];
    if (this.filter !== 'all') {
      list = list.filter(s => s.turf === this.filter);
    }
    return list;
  }

  openStadium(s: Stadium): void {
    console.log('Open stadium', s.id);
  }

  book(s: Stadium): void {
    console.log('Book field', s.id);
  }

  recomputeNearby(): void {
    if (!this.userLat || !this.userLng) return;
    this.stadiums = this.stadiums.map(s => {
      const d = this.distanceKm(this.userLat!, this.userLng!, s.lat, s.lng);
      const travelMins = Math.max(6, Math.round(d * 3.5));
      return { ...s, distanceKm: d, travelMins };
    }).sort((a, b) => a.distanceKm - b.distanceKm);
    this.currentPage = 1;
  }

  private distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
      Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}