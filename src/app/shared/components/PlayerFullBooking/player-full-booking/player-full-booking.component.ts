import { Component, inject, OnInit } from '@angular/core';
import { PlayernavComponent } from "../../../../layouts/playernav/playernav/playernav.component";
import { MyBookingsService } from '../../../../core/services/MyBookings/my-bookings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IspecificBookings } from '../../../interfaces/ispecific-bookings';
import { DatePipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from '../../../../core/services/toast/toast.service';

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
  imports: [PlayernavComponent, DatePipe, LucideAngularModule],
  templateUrl: './player-full-booking.component.html',
  styleUrl: './player-full-booking.component.scss'
})
export class PlayerFullBookingComponent implements OnInit {
  private readonly myBookingsService = inject(MyBookingsService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  productId: any;
  bookingDetails: IspecificBookings = {} as IspecificBookings;
  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe({
      next: (res) => {
        console.log(res);
        this.productId = res.get('id');
        console.log(this.productId);
        this.myBookingsService.GetSpecificBooking(this.productId).subscribe({
          next: (res) => {
            console.log(res);
            this.bookingDetails = res.data
            console.log(this.bookingDetails);

          }
        })

      }
    })
  }
  CancelBooking(): void {
    this.myBookingsService.CancelBooking(this.productId).subscribe({
      next: (res) => {
        console.log(res);
        this.toastService.success(res.message || 'Booking cancelled successfully');
        this.router.navigate(['/MyBookings']);
      }
    })
  }
}
