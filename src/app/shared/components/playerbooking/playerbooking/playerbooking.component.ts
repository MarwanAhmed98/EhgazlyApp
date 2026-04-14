import { Component, HostListener } from '@angular/core';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';
type BookingStatus = 'upcoming' | 'previous';
type Tab = 'upcoming' | 'previous';

type Booking = {
  id: string;
  index: number;
  status: BookingStatus;
  title: string;
  date: string;
  time: string;
  rating: number;
  image: string;
};
@Component({
  selector: 'app-playerbooking',
  imports: [PlayernavComponent],
  templateUrl: './playerbooking.component.html',
  styleUrl: './playerbooking.component.scss'
})
export class PlayerbookingComponent {
  tab: Tab = 'upcoming';

  mobileMenuOpen = false;

  readonly bookings: Booking[] = [
    {
      id: 'b1',
      index: 0,
      status: 'upcoming',
      title: 'Anfield Pro Pitch',
      date: 'Oct 28, 2024',
      time: '08:00 PM – 09:00 PM',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1434648957308-5e6a859697e8?auto=format&fit=crop&w=1400&q=80',
    },
    {
      id: 'b2',
      index: 1,
      status: 'upcoming',
      title: 'Bernabéu Elite Field',
      date: 'Oct 30, 2024',
      time: '06:00 PM – 07:30 PM',
      rating: 4.7,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGcnvb3_GijZtqt9T1SChQsjG7JAG3Yi08WQ&s',
    },
    {
      id: 'b3',
      index: 2,
      status: 'upcoming',
      title: 'Old Trafford Annex',
      date: 'Nov 02, 2024',
      time: '09:00 PM – 10:00 PM',
      rating: 5.0,
      image: 'https://cdn.pixabay.com/photo/2016/11/29/07/06/bleachers-1867992_1280.jpg',
    },
    {
      id: 'b4',
      index: 3,
      status: 'previous',
      title: 'Cairo City Pitch',
      date: 'Sep 12, 2024',
      time: '07:00 PM – 08:00 PM',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1400&q=80',
    },
  ];

  setTab(tab: Tab) {
    this.tab = tab;
  }

  filteredBookings(): Booking[] {
    return this.bookings.filter((b) => b.status === this.tab);
  }

  viewDetails(booking: Booking) {
    console.log('View details:', booking);
  }

  cancel(booking: Booking) {
    console.log('Cancel booking:', booking);
  }

  findVenue() {
    console.log('Find a venue');
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth >= 768) this.mobileMenuOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.mobileMenuOpen = false;
  }
}
