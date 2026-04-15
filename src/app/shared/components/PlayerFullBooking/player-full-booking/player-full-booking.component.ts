import { Component } from '@angular/core';
import { PlayernavComponent } from "../../../../layouts/playernav/playernav/playernav.component";
type BookingDetails = {
  id: string;
  code: string;
  title: string;
  status: 'paid' | 'pending' | 'cancelled';
  dateLabel: string;
  timeLabel: string;
  amount: number;
  location: string;
  receiptImage: string;
};

@Component({
  selector: 'app-player-full-booking',
  imports: [PlayernavComponent],
  templateUrl: './player-full-booking.component.html',
  styleUrl: './player-full-booking.component.scss'
})
export class PlayerFullBookingComponent {
  booking: BookingDetails = {
    id: 'EHG-88291',
    code: 'EHG-88291',
    title: 'Anfield Pro Pitch',
    status: 'paid',
    dateLabel: 'Saturday, 28 Oct 2024',
    timeLabel: '08:00 PM – 09:00 PM',
    amount: 350,
    location: 'New Cairo, District 5 Sports Hub',
    receiptImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1400&q=80',
  };

  downloadReceipt() {
    console.log('Download receipt', this.booking.id);
  }

  contactVenue() {
    console.log('Contact venue', this.booking.id);
  }

  cancelBooking() {
    console.log('Cancel booking', this.booking.id);
  }

  share() {
    console.log('Share booking', this.booking.id);
  }

  more() {
    console.log('More actions', this.booking.id);
  }
}
