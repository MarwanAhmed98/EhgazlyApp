import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';
import { RouterLink } from "@angular/router";
import { MyBookingsService } from '../../../../core/services/MyBookings/my-bookings.service';
import { IBookings } from '../../../interfaces/i-bookings';
import { ToastService } from '../../../../core/services/toast/toast.service';

type Tab = 'upcoming' | 'previous';

@Component({
  selector: 'app-playerbooking',
  standalone: true,
  imports: [CommonModule, PlayernavComponent, RouterLink, DatePipe],
  templateUrl: './playerbooking.component.html',
  styleUrl: './playerbooking.component.scss'
})
export class PlayerbookingComponent {
  // private readonly myBookingsService = inject(MyBookingsService);
  // private readonly toastService = inject(ToastService);
  // allBookings = signal<IBookings[]>([]);
  // tab = signal<Tab>('upcoming');
  // filteredBookings = computed(() => {
  //   const data = this.allBookings();
  //   const currentTab = this.tab();
  //   if (!Array.isArray(data)) {
  //     return [];
  //   }
  //   if (currentTab === 'upcoming') {
  //     return data.filter(b => b.status === 'pending' || b.status === 'confirmed');
  //   } else {
  //     return data.filter(b => b.status === 'completed' || b.status === 'rejected' || b.status === 'cancelled');
  //   }
  // });
  // ngOnInit(): void {
  //   this.getAllBookings();
  // }
  // setTab(selectedTab: Tab): void {
  //   this.tab.set(selectedTab);
  // }
  // getAllBookings(): void {
  //   this.myBookingsService.GetShowBooking().subscribe({
  //     next: (res) => {
  //       if (res && res.data && Array.isArray(res.data.bookings)) {
  //         this.allBookings.set(res.data.bookings);
  //         console.log(res.data.bookings);
  //       } else {
  //         console.warn('API response structure is different than expected:', res);
  //         this.allBookings.set([]);
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error fetching bookings:', err);
  //       this.allBookings.set([]);
  //     }
  //   });
  // }
  // CancelBooking(id: any): void {
  //   this.myBookingsService.CancelBooking(id).subscribe({
  //     next: (res) => {
  //       console.log(res);
  //       this.toastService.success(res.message || 'Booking cancelled successfully');
  //       this.getAllBookings();
  //     }
  //   })
  // }
}