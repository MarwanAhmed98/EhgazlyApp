import { Component, ElementRef, ViewChild } from '@angular/core';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';
type VenueSpec = { label: string; value: string; icon: string };
type Amenity = { label: string; icon: string };
@Component({
  selector: 'app-court-details',
  imports: [PlayernavComponent],
  templateUrl: './court-details.component.html',
  styleUrl: './court-details.component.scss'
})
export class CourtDetailsComponent {
  @ViewChild('bookingCard', { read: ElementRef }) bookingCard?: ElementRef<HTMLElement>;

  venue = {
    name: 'Stadium One Elite',
    location: 'New Cairo, District 5',
    fullAddress: 'Plot 12, South 90th Street, New Cairo',
    rating: 4.9,
    reviews: 128,
    heroImage: 'https://images.unsplash.com/photo-1434648957308-5e6a859697e8?auto=format&fit=crop&w=2200&q=80',
    specs: [
      { label: 'Type', value: '11 x 11 Pro', icon: 'M4 18h16M6 16l2-8h8l2 8' },
      { label: 'Surface', value: 'Natural Grass', icon: 'M12 22c4-2 7-6 7-10 0-3-2-6-7-8-5 2-7 5-7 8 0 4 3 8 7 10z' },
      { label: 'Lighting', value: 'LED Pro 40k', icon: 'M9 18h6M10 22h4M12 2v10m4-6-4 4-4-4' },
      { label: 'Condition', value: 'FIFA Elite', icon: 'M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z' },
    ] as VenueSpec[],
    gallery: [
      'https://img.freepik.com/free-photo/soccer-players-action-professional-stadium_654080-1820.jpg',
      'https://img.freepik.com/premium-photo/soccer-stadium-defocus-background-evening-arena-with-crowd-fans-d-illustration_336913-361.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtQmBt5UXMU3GtdHQ5ySKLDoj0ZOhcjLszFA&s',
      'https://images.pexels.com/photos/16731731/pexels-photo-16731731/free-photo-of-field-and-seats-of-a-football-stadium.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
      'https://images.unsplash.com/photo-1629217855633-79a6925d6c47?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Zm9vdGJhbGwlMjBzdGFkaXVtfGVufDB8fDB8fHww',
    ],
    amenities: [
      { label: 'Luxury Showers', icon: '🚿' },
      { label: 'Secure Valet Parking', icon: '🅿️' },
      { label: 'High-Speed Player Wi‑Fi', icon: '📶' },
      { label: 'VIP Player Lounge', icon: '🛋️' },
    ] as Amenity[],
  };

  price = 850;

  readonly dates = ['Oct 24, 2023', 'Oct 25, 2023', 'Oct 26, 2023'];
  readonly times = ['20:00 – 21:00', '21:00 – 22:00', '22:00 – 23:00'];

  dateIndex = 0;
  timeIndex = 0;

  get selectedDate(): string {
    return this.dates[this.dateIndex];
  }

  get selectedTime(): string {
    return this.times[this.timeIndex];
  }

  cycleDate(): void {
    this.dateIndex = (this.dateIndex + 1) % this.dates.length;
  }

  cycleTime(): void {
    this.timeIndex = (this.timeIndex + 1) % this.times.length;
  }

  confirmBooking(): void {
    console.log('Confirm booking', { date: this.selectedDate, time: this.selectedTime, price: this.price });
  }

  viewAllPhotos(): void {
    console.log('View all photos');
  }

  openPhoto(i: number): void {
    console.log('Open photo', i);
  }

  scrollToBooking(): void {
    this.bookingCard?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
