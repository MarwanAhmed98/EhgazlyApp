// import { Component, inject, OnInit, computed, signal } from '@angular/core';
// import { CommonModule, DatePipe } from '@angular/common';
// import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';
// import { RouterLink } from "@angular/router";
// import { MyBookingsService } from '../../../../core/services/MyBookings/my-bookings.service';
// import { IBookings } from '../../../interfaces/i-bookings';

// type Tab = 'upcoming' | 'previous';

// @Component({
//   selector: 'app-playerbooking',
//   standalone: true,
//   imports: [CommonModule, PlayernavComponent, RouterLink, DatePipe],
//   templateUrl: './playerbooking.component.html',
//   styleUrl: './playerbooking.component.scss'
// })
// export class PlayerbookingComponent implements OnInit {
//   private readonly myBookingsService = inject(MyBookingsService);
//   allBookings = signal<IBookings[]>([]);
//   tab = signal<Tab>('upcoming');
//   filteredBookings = computed(() => {
//     const data = this.allBookings();
//     const currentTab = this.tab();
//     if (currentTab === 'upcoming') {
//       return data.filter(b => b.status === 'pending' || b.status === 'confirmed');
//     } else {
//       return data.filter(b => b.status === 'completed' || b.status === 'rejected' || b.status === 'cancelled');
//     }
//   });

//   ngOnInit(): void {
//     this.getAllBookings();
//   }
//   setTab(selectedTab: Tab): void {
//     this.tab.set(selectedTab);
//   }
//   getAllBookings(): void {
//     this.myBookingsService.GetShowBooking().subscribe({
//       next: (res) => {
//         this.allBookings.set(res.data || []);
//       },
//       error: (err) => console.error('Error fetching bookings:', err)
//     });
//   }

//   findVenue(): void {

//   }
// }
import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';
import { RouterLink } from "@angular/router";
import { MyBookingsService } from '../../../../core/services/MyBookings/my-bookings.service';
import { IBookings } from '../../../interfaces/i-bookings';

type Tab = 'upcoming' | 'previous';

@Component({
  selector: 'app-playerbooking',
  standalone: true,
  imports: [CommonModule, PlayernavComponent, RouterLink, DatePipe],
  templateUrl: './playerbooking.component.html',
  styleUrl: './playerbooking.component.scss'
})
export class PlayerbookingComponent implements OnInit {
  private readonly myBookingsService = inject(MyBookingsService);

  // Initialize with an empty array to satisfy the type
  allBookings = signal<IBookings[]>([]);
  tab = signal<Tab>('upcoming');

  // Computed signal with a safety check
  filteredBookings = computed(() => {
    const data = this.allBookings();
    const currentTab = this.tab();

    // Safety check: ensure data is an array before filtering
    if (!Array.isArray(data)) {
      return [];
    }

    if (currentTab === 'upcoming') {
      return data.filter(b => b.status === 'pending' || b.status === 'confirmed');
    } else {
      return data.filter(b => b.status === 'completed' || b.status === 'rejected' || b.status === 'cancelled');
    }
  });

  ngOnInit(): void {
    this.getAllBookings();
  }

  setTab(selectedTab: Tab): void {
    this.tab.set(selectedTab);
  }

  getAllBookings(): void {
    this.myBookingsService.GetShowBooking().subscribe({
      next: (res) => {
        if (res && res.data && Array.isArray(res.data.bookings)) {
          this.allBookings.set(res.data.bookings);
          console.log(res.data.bookings);
        } else {
          console.warn('API response structure is different than expected:', res);
          this.allBookings.set([]);
        }
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
        this.allBookings.set([]);
      }
    });
  }

  findVenue(): void {
    // Logic for finding venue
  }
}