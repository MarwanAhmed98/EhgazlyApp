import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';
import { RouterLink } from "@angular/router";

type BookingStatus = 'upcoming' | 'previous';
type Tab = 'upcoming' | 'previous';

interface Booking {
  id: string;
  index: number;
  status: BookingStatus;
  title: string;
  date: string;
  time: string;
  rating: number;
  image: string;
}

@Component({
  selector: 'app-playerbooking',
  standalone: true,
  imports: [CommonModule, PlayernavComponent, RouterLink],
  templateUrl: './playerbooking.component.html',
  styleUrl: './playerbooking.component.scss'
})
export class PlayerbookingComponent {
  tab: Tab = 'upcoming';

  // ملاحظة: لجعل الـ Empty State تظهر، اجعل المصفوفة فارغة []
  bookings: Booking[] = [
    {
      id: 'u1',
      index: 0,
      status: 'upcoming',
      title: 'Anfield Pro Pitch',
      date: 'Oct 28, 2024',
      time: '08:00 PM – 09:00 PM',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1434648957308-5e6a859697e8?auto=format&fit=crop&w=1400&q=80',
    },
    {
      id: 'u2',
      index: 2,
      status: 'upcoming',
      title: 'Camp Nou Arena',
      date: 'Sep 24, 2024',
      time: '06:00 PM – 07:30 PM',
      rating: 4.7,
      image: 'https://images.pexels.com/photos/28649105/pexels-photo-28649105/free-photo-of-panoramic-view-of-maracana-stadium.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
    },
    {
      id: 'p1',
      index: 1,
      status: 'previous',
      title: 'Camp Nou Arena',
      date: 'Sep 24, 2024',
      time: '06:00 PM – 07:30 PM',
      rating: 4.7,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBORAKw8TQFQA8vfkVUaqMWuqBg_rvERLUfQ&s',
    },
    {
      id: 'p2',
      index: 2,
      status: 'previous',
      title: 'Elite Turf Center',
      date: 'Sep 15, 2024',
      time: '09:00 PM – 10:30 PM',
      rating: 5.0,
      image: 'https://cdn.pixabay.com/photo/2016/11/29/07/06/bleachers-1867992_1280.jpg',
    }
  ];

  setTab(selectedTab: Tab): void {
    this.tab = selectedTab;
  }

  filteredBookings(): Booking[] {
    return this.bookings.filter((b) => b.status === this.tab);
  }

  viewDetails(booking: Booking): void {
    console.log('Action: Opening Match Report/Details for', booking.title);
  }

  cancel(booking: Booking): void {
    console.log('Action: Cancelling booking ID', booking.id);
  }

  findVenue(): void {
    console.log('Navigation: Redirecting to Venue Discovery page...');
  }
}