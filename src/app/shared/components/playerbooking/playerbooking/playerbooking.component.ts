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
  allBookings = signal<IBookings[]>([]);
  tab = signal<Tab>('upcoming');
  filteredBookings = computed(() => {
    const data = this.allBookings();
    const currentTab = this.tab();
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
        this.allBookings.set(res.data || []);
      },
      error: (err) => console.error('Error fetching bookings:', err)
    });
  }

  findVenue(): void {

  }
}