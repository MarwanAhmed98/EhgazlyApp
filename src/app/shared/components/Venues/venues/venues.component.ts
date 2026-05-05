// import { Inearstcourt } from './../../../interfaces/inearstcourt';
// import { Component, inject, OnInit } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';
// import { RouterLink } from "@angular/router";
// import { VenuesService } from '../../../../core/services/venues/venues.service';
// import { IAllcourts } from '../../../interfaces/iallcourts';
// type LocationState = 'unknown' | 'granted' | 'denied';
// type ViewState = 'permission' | 'nearby' | 'all';
// type TurfFilter = 'all' | 'natural' | 'artificial';
// type NearbyView = 'list' | 'map';

// type LiveStatus = { type: 'ok' | 'warn' | 'bad'; label: string };

// type Stadium = {
//   id: string;
//   index: number;
//   name: string;
//   area: string;
//   address: string;
//   image: string;
//   rating: number;
//   pricePerHour: number;
//   turf: 'natural' | 'artificial';
//   lat: number;
//   lng: number;

//   // computed
//   distanceKm: number;
//   travelMins: number;
//   live: LiveStatus;
// };
// @Component({
//   selector: 'app-venues',
//   imports: [FormsModule, PlayernavComponent, RouterLink],
//   templateUrl: './venues.component.html',
//   styleUrl: './venues.component.scss'
// })
// export class VenuesComponent implements OnInit {
//   private readonly venuesService = inject(VenuesService);
//   AllCourtsDetails: IAllcourts = {} as IAllcourts;
//   NearestCourtsDetails: Inearstcourt = {} as Inearstcourt;
//   view: ViewState = 'permission';
//   locationState: LocationState = 'unknown';

//   dismissedBanner = false;

//   filter: TurfFilter = 'all';
//   sortMode: 'priceAsc' | 'priceDesc' = 'priceAsc';

//   nearbyView: NearbyView = 'list';
//   radiusKm = 10;

//   currentLocationLabel = 'Your Location';

//   userLat: number | null = null;
//   userLng: number | null = null;
//   ngOnInit(): void {
//     this.GetAllCourts();
//     this.GetNearestCourts();
//   }
//   GetAllCourts(): void {
//     this.venuesService.GetAllCourts().subscribe({
//       next: (res) => {
//         this.AllCourtsDetails = res.data
//         console.log(this.AllCourtsDetails);
//       }
//     })
//   }
//   GetNearestCourts(): void {
//     this.venuesService.GetNearestCourts(30.1444, 31.3357).subscribe({
//       next: (res) => {
//         console.log(res.data);
//       }
//     })
//   }
//   stadiums: Stadium[] = [
//     {
//       id: 's1',
//       index: 0,
//       name: 'Giza Arena',
//       area: 'Faisal, Giza',
//       address: 'Faisal Street, Giza',
//       image: 'https://images.unsplash.com/photo-1434648957308-5e6a859697e8?auto=format&fit=crop&w=1400&q=80',
//       rating: 4.8,
//       pricePerHour: 450,
//       turf: 'natural',
//       lat: 30.0131,
//       lng: 31.2089,
//       distanceKm: 0,
//       travelMins: 0,
//       live: { type: 'ok', label: 'Available' },
//     },
//     {
//       id: 's2',
//       index: 1,
//       name: 'Dokki Stadium',
//       area: 'Dokki, Giza',
//       address: 'Dokki, Giza',
//       image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZJLpODOmxEWr8Bg7C8LOur8vj4DjHiDs7kg&s',
//       rating: 4.7,
//       pricePerHour: 500,
//       turf: 'artificial',
//       lat: 30.0384,
//       lng: 31.2101,
//       distanceKm: 0,
//       travelMins: 0,
//       live: { type: 'warn', label: 'Few slots left' },
//     },
//     {
//       id: 's3',
//       index: 2,
//       name: 'Mohandessin Club',
//       area: 'Mohandessin, Giza',
//       address: 'Mohandessin, Giza',
//       image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDXoT7DLUYxz8741nD4KQdNgWqhbT9UFy6xA&s',
//       rating: 4.6,
//       pricePerHour: 550,
//       turf: 'natural',
//       lat: 30.0500,
//       lng: 31.2000,
//       distanceKm: 0,
//       travelMins: 0,
//       live: { type: 'bad', label: 'Last slot today' },
//     },
//     {
//       id: 's4',
//       index: 3,
//       name: 'Zayed Sports Arena',
//       area: 'Sheikh Zayed, Giza',
//       address: 'Sheikh Zayed',
//       image: 'https://cdn.pixabay.com/photo/2016/11/29/07/06/bleachers-1867992_1280.jpg',
//       rating: 4.7,
//       pricePerHour: 600,
//       turf: 'artificial',
//       lat: 30.0055,
//       lng: 30.9715,
//       distanceKm: 0,
//       travelMins: 0,
//       live: { type: 'ok', label: 'Available' },
//     },
//     {
//       id: 's5',
//       index: 4,
//       name: 'Maadi Elite Stadium',
//       area: 'Maadi, Cairo',
//       address: 'Maadi, Cairo',
//       image: 'https://cdn.pixabay.com/photo/2024/10/09/23/52/ai-generated-9109556_640.jpg',
//       rating: 4.5,
//       pricePerHour: 500,
//       turf: 'natural',
//       lat: 29.9633,
//       lng: 31.2565,
//       distanceKm: 0,
//       travelMins: 0,
//       live: { type: 'ok', label: 'Available' },
//     },
//     {
//       id: 's6',
//       index: 5,
//       name: 'New Cairo Pro Field',
//       area: 'New Cairo',
//       address: 'New Cairo',
//       image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1400&q=80',
//       rating: 4.9,
//       pricePerHour: 750,
//       turf: 'artificial',
//       lat: 30.0186,
//       lng: 31.4997,
//       distanceKm: 0,
//       travelMins: 0,
//       live: { type: 'warn', label: '3 slots left' },
//     },
//   ];
//   get sortLabel(): string {
//     return this.sortMode === 'priceAsc' ? 'Price (Low to High)' : 'Price (High to Low)';
//   }
//   allowAccess(): void {
//     if (navigator?.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         async (pos) => {
//           this.userLat = pos.coords.latitude;
//           this.userLng = pos.coords.longitude;
//           this.currentLocationLabel = await this.getLocationName(
//             this.userLat,
//             this.userLng
//           );

//           this.locationState = 'granted';
//           this.view = 'nearby';

//           this.recomputeNearby();
//         },
//         (err) => {
//           console.log(err);
//           this.locationState = 'denied';
//           this.view = 'all';
//         },
//         {
//           enableHighAccuracy: true,
//           timeout: 15000,
//           maximumAge: 0
//         }
//       );
//     }
//   }
//   async getLocationName(lat: number, lng: number): Promise<string> {
//     try {
//       const res = await fetch(
//         `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
//       );
//       const data = await res.json();

//       return (
//         data.address.city ||
//         data.address.town ||
//         data.address.village ||
//         data.address.state ||
//         'Your Location'
//       );
//     } catch {
//       return 'Your Location';
//     }
//   }
//   maybeLater(): void {
//     this.locationState = 'denied';
//     this.view = 'all';
//   }

//   changeLocation(): void {
//     // simple demo action: just re-request access
//     this.view = 'permission';
//     this.locationState = 'unknown';
//   }

//   setNearbyView(v: NearbyView): void {
//     this.nearbyView = v;
//   }
//   recomputeNearby(): void {
//     if (!this.userLat || !this.userLng) return;

//     this.stadiums = this.stadiums.map((s) => {
//       const d = this.distanceKm(this.userLat!, this.userLng!, s.lat, s.lng);
//       const travelMins = Math.max(6, Math.round(d * 3.5));
//       return { ...s, distanceKm: d, travelMins };
//     }).sort((a, b) => a.distanceKm - b.distanceKm);
//   }

//   nearbyStadiums(): Stadium[] {
//     const within = this.stadiums.filter((s) => s.distanceKm <= this.radiusKm);
//     return within;
//   }

//   setFilter(f: TurfFilter): void {
//     this.filter = f;
//   }

//   cycleSort(): void {
//     this.sortMode = this.sortMode === 'priceAsc' ? 'priceDesc' : 'priceAsc';
//   }

//   toggleFilters(): void {
//     // placeholder hook for future filters drawer
//     console.log('filters');
//   }

//   visibleStadiums(): Stadium[] {
//     let list = [...this.stadiums];

//     if (this.filter !== 'all') list = list.filter((s) => s.turf === this.filter);

//     list.sort((a, b) =>
//       this.sortMode === 'priceAsc'
//         ? a.pricePerHour - b.pricePerHour
//         : b.pricePerHour - a.pricePerHour
//     );

//     return list;
//   }

//   openStadium(s: Stadium): void {
//     console.log('Open stadium', s.id);
//   }

//   book(s: Stadium): void {
//     console.log('Book field', s.id);
//   }

//   private distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
//     const R = 6371;
//     const dLat = this.deg2rad(lat2 - lat1);
//     const dLon = this.deg2rad(lon2 - lon1);
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
//       Math.sin(dLon / 2) * Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
//   }

//   private deg2rad(deg: number): number {
//     return deg * (Math.PI / 180);
//   }
// }
import { Inearstcourt } from './../../../interfaces/inearstcourt';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';
import { RouterLink } from "@angular/router";
import { VenuesService } from '../../../../core/services/venues/venues.service';
import { IAllcourts } from '../../../interfaces/iallcourts';

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
  // pricePerHour: number;
  turf: 'natural' | 'artificial';
  lat: number;
  lng: number;
  distanceKm: number;
  travelMins: number;
  live: LiveStatus;
};

@Component({
  selector: 'app-venues',
  imports: [FormsModule, PlayernavComponent, RouterLink],
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
  radiusKm = 10;

  currentLocationLabel = 'Your Location';

  userLat: number | null = null;
  userLng: number | null = null;

  loading = false;

  stadiums: Stadium[] = [];

  ngOnInit(): void {
    this.GetAllCourts();
  }

  GetAllCourts(): void {
    this.loading = true;

    this.venuesService.GetAllCourts().subscribe({
      next: (res) => {
        const data = res.data || [];

        this.stadiums = data.map((court: any, index: number): Stadium => ({
          id: court.id.toString(),
          index,
          name: court.name,
          area: court.address,
          address: court.address,
          image: court.primary_image.url || '',
          rating: 4.5,
          turf: index % 2 === 0 ? 'natural' : 'artificial', // fallback
          lat: parseFloat(court.latitude),
          lng: parseFloat(court.longitude),
          distanceKm: 0,
          travelMins: 0,
          live: { type: 'ok', label: 'Available' }
        }));
        console.log(res.data);

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  GetNearestCourts(lat: number, lng: number): void {
    this.loading = true;

    this.venuesService.GetNearestCourts(lat, lng).subscribe({
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
          // pricePerHour: 300,
          turf: index % 2 === 0 ? 'natural' : 'artificial',
          lat: parseFloat(court.latitude),
          lng: parseFloat(court.longitude),
          distanceKm: court.distance || 0,
          travelMins: Math.max(6, Math.round((court.distance || 1) * 3.5)),
          live: { type: 'ok', label: 'Available' }
        }));

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get sortLabel(): string {
    return this.sortMode === 'priceAsc' ? 'Price (Low to High)' : 'Price (High to Low)';
  }

  allowAccess(): void {
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          this.userLat = pos.coords.latitude;
          this.userLng = pos.coords.longitude;

          this.currentLocationLabel = await this.getLocationName(
            this.userLat,
            this.userLng
          );

          this.locationState = 'granted';
          this.view = 'nearby';

          this.GetNearestCourts(this.userLat, this.userLng);
        },
        () => {
          this.locationState = 'denied';
          this.view = 'all';
        }
      );
    }
  }

  async getLocationName(lat: number, lng: number): Promise<string> {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();

      return (
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.state ||
        'Your Location'
      );
    } catch {
      return 'Your Location';
    }
  }

  maybeLater(): void {
    this.locationState = 'denied';
    this.view = 'all';
  }

  changeLocation(): void {
    this.view = 'permission';
    this.locationState = 'unknown';
  }

  setNearbyView(v: NearbyView): void {
    this.nearbyView = v;
  }

  nearbyStadiums(): Stadium[] {
    return this.stadiums.filter((s) => s.distanceKm <= this.radiusKm);
  }

  setFilter(f: TurfFilter): void {
    this.filter = f;
  }

  cycleSort(): void {
    this.sortMode = this.sortMode === 'priceAsc' ? 'priceDesc' : 'priceAsc';
  }

  toggleFilters(): void {
    console.log('filters');
  }

  visibleStadiums(): Stadium[] {
    let list = [...this.stadiums];

    if (this.filter !== 'all') {
      list = list.filter((s) => s.turf === this.filter);
    }

    // list.sort((a, b) =>
    //   this.sortMode === 'priceAsc'
    //     ? a.pricePerHour - b.pricePerHour
    //     : b.pricePerHour - a.pricePerHour
    // );

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

    this.stadiums = this.stadiums.map((s) => {
      const d = this.distanceKm(this.userLat!, this.userLng!, s.lat, s.lng);
      const travelMins = Math.max(6, Math.round(d * 3.5));

      return {
        ...s,
        distanceKm: d,
        travelMins
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);
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