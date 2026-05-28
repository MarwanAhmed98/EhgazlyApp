import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CourtOwnerBokkingService } from '../../../../core/services/CourtOwnerBooking/court-owner-bokking.service';
import { ICourtOwnerBookings } from '../../../interfaces/icourt-owner-bookings';
import { ICourtOwnerFinancialData } from '../../../interfaces/icourt-owner-financial-data';
import { CourtOwnerPaymentService } from '../../../../core/services/CourtOwnerPayment/court-owner-payment.service';
import { LucideAngularModule } from 'lucide-angular';


type TabKey = 'upcoming' | 'past';
type BookingStatus = 'pending' | 'confirmed' | 'rejected';

interface Booking {
  id: string;
  status: BookingStatus;
  player: {
    name: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatarUrl: string;
  };
  schedule: {
    timeLabel: string;
    dateLabel: string;
  };
  paymentMethodType: string;
  totalPrice?: number;
}

interface StatusOption {
  key: 'all' | BookingStatus;
  label: string;
}

@Component({
  selector: 'app-court-owner-booking',
  imports: [CommonModule, FormsModule, RouterLink, DecimalPipe, LucideAngularModule],
  templateUrl: './court-owner-booking.component.html',
  styleUrls: ['./court-owner-booking.component.scss'],
})
export class CourtOwnerBookingComponent implements OnInit {
  private readonly courtOwnerBookingService = inject(CourtOwnerBokkingService);
  private readonly courtOwnerPaymentService = inject(CourtOwnerPaymentService);
  FinancialDetails: ICourtOwnerFinancialData | null = null;

  activeTab: TabKey = 'upcoming';
  isStatusMenuOpen = false;
  statusFilter: 'all' | BookingStatus = 'all';

  upcomingBookings: Booking[] = [];
  pastBookings: Booking[] = [];

  stats = {
    totalToday: 0,
    pendingReview: 0,
    dailyRevenue: 0,
  };

  liveMatchNumber = 42;

  isRejectModalOpen = false;
  rejectReason = '';
  rejectingState: 'idle' | 'loading' = 'idle';
  private rejectBookingId: string | null = null;

  loadingBookingIds = new Set<string>();

  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  statusOptions: StatusOption[] = [
    { key: 'all', label: 'All' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'rejected', label: 'Rejected' },
  ];

  ngOnInit(): void {
    this.loadUpcomingBookings();
    this.loadPastBookings();
    this.loadFinancialData();
  }

  loadUpcomingBookings(): void {
    this.courtOwnerBookingService.GetPendingBookings().subscribe({
      next: (res) => {
        const data: ICourtOwnerBookings[] = res.data;
        this.upcomingBookings = data.map(api => this.mapApiToLocal(api));
        this.updateStats();
      },
      error: (err) => {
        console.error('Failed to load pending bookings', err);
        this.showToast('Failed to load pending bookings', 'error');
      },
    });
  }
  loadFinancialData(): void {
    this.courtOwnerPaymentService.GetOwnerFinancialData().subscribe({
      next: (res) => {
        this.FinancialDetails = res.data;
      },
      error: (err) => {
        console.error('Failed to load financial data', err);
      }
    });
  }
  loadPastBookings(): void {
    this.courtOwnerBookingService.GetAllBookings().subscribe({
      next: (res) => {
        const data: ICourtOwnerBookings[] = res.data;
        const filtered = data.filter(
          api => api.status === 'confirmed' || api.status === 'rejected'
        );
        this.pastBookings = filtered.map(api => this.mapApiToLocal(api));
        this.updateStats();
      },
      error: (err) => {
        console.error('Failed to load past bookings', err);
        this.showToast('Failed to load past bookings', 'error');
      },
    });
  }

  private mapApiToLocal(api: ICourtOwnerBookings): Booking {
    const fullName = api.customer.name || '';
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const start = api.timeslot.start_time.slice(0, 5);
    const end = api.timeslot.end_time.slice(0, 5);
    const timeLabel = `${start} - ${end}`;
    const dateObj = new Date(api.timeslot.date);
    const dateLabel = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });

    return {
      id: api.id.toString(),
      status: api.status as BookingStatus,
      player: {
        name: fullName,
        firstName,
        lastName,
        phone: api.customer.phone,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          firstName + ' ' + lastName
        )}&background=146A1E&color=fff`,
      },
      schedule: { timeLabel, dateLabel },
      paymentMethodType: api.payment_method?.type || 'Unknown',
      totalPrice: parseFloat(api.total_price) || 0,
    };
  }

  private updateStats(): void {
    this.stats.pendingReview = this.upcomingBookings.length;
    this.stats.totalToday = this.upcomingBookings.length;
    this.stats.dailyRevenue = this.pastBookings.reduce(
      (sum, b) => sum + (b.totalPrice || 0), 0
    );
  }

  get filteredBookings(): Booking[] {
    if (this.activeTab === 'upcoming') {
      return this.upcomingBookings;
    }
    if (this.statusFilter === 'all') return this.pastBookings;
    return this.pastBookings.filter(b => b.status === this.statusFilter);
  }

  setTab(tab: TabKey): void {
    this.activeTab = tab;
    this.closeStatusMenu();
  }

  toggleStatusMenu(): void {
    this.isStatusMenuOpen = !this.isStatusMenuOpen;
  }

  closeStatusMenu(): void {
    this.isStatusMenuOpen = false;
  }

  setStatusFilter(filter: 'all' | BookingStatus): void {
    this.statusFilter = filter;
    this.closeStatusMenu();
  }

  approveBooking(id: string): void {
    if (this.loadingBookingIds.has(id)) return;
    this.loadingBookingIds.add(id);

    this.courtOwnerBookingService.ConfirmBookings(id).subscribe({
      next: () => {
        const booking = this.upcomingBookings.find(b => b.id === id);
        if (booking) {
          const updatedBooking = { ...booking, status: 'confirmed' as BookingStatus };
          this.upcomingBookings = this.upcomingBookings.filter(b => b.id !== id);
          this.pastBookings = [updatedBooking, ...this.pastBookings];
          this.updateStats();
          this.showToast('Booking confirmed successfully', 'success');
        }
        this.loadingBookingIds.delete(id);
      },
      error: (err) => {
        console.error('Confirm failed', err);
        this.showToast('Failed to confirm booking', 'error');
        this.loadingBookingIds.delete(id);
      },
    });
  }

  openRejectModal(id: string): void {
    this.rejectBookingId = id;
    this.rejectReason = '';
    this.rejectingState = 'idle';
    this.isRejectModalOpen = true;
  }

  closeRejectModal(): void {
    this.isRejectModalOpen = false;
    this.rejectBookingId = null;
    this.rejectReason = '';
  }

  confirmReject(): void {
    if (!this.rejectBookingId || !this.rejectReason.trim()) return;
    if (this.rejectingState === 'loading') return;
    this.rejectingState = 'loading';
    this.loadingBookingIds.add(this.rejectBookingId);

    this.courtOwnerBookingService
      .RejectBookings(this.rejectBookingId, this.rejectReason)
      .subscribe({
        next: () => {
          this.upcomingBookings = this.upcomingBookings.filter(
            b => b.id !== this.rejectBookingId
          );
          this.updateStats();
          this.showToast('Booking rejected', 'success');
          this.loadingBookingIds.delete(this.rejectBookingId!);
          this.closeRejectModal();
        },
        error: (err) => {
          console.error('Reject failed', err);
          this.showToast('Failed to reject booking', 'error');
          this.rejectingState = 'idle';
          this.loadingBookingIds.delete(this.rejectBookingId!);
        },
      });
  }

  viewFullReport(): void {
    this.setTab('past');
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = null;
    }, 3000);
  }
}