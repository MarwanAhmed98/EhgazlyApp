import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

type TabKey = 'upcoming' | 'past';
type BookingStatus = 'pending' | 'confirmed' | 'rejected';
type PaymentKind = 'wallet' | 'cash' | 'card';

type Booking = {
  id: string;
  tab: TabKey;
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

  paymentKind: PaymentKind;
};

type RejectingState = 'idle' | 'loading';
type CreateState = 'idle' | 'loading';

@Component({
  selector: 'app-court-owner-booking',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './court-owner-booking.component.html',
  styleUrl: './court-owner-booking.component.scss',
})
export class CourtOwnerBookingComponent {
  constructor(private readonly router: Router) { }

  // Tabs
  activeTab: TabKey = 'upcoming';

  // Filter
  isStatusMenuOpen = false;
  statusFilter: 'all' | BookingStatus = 'all';

  // Stats (matches UI)
  stats = {
    totalToday: 24,
    pendingReview: 8,
    dailyRevenue: 4250,
  };

  // Live card
  liveMatchNumber = 42;

  // Data
  bookings: Booking[] = [
    {
      id: 'b1',
      tab: 'upcoming',
      status: 'pending',
      player: {
        name: 'Ahmed Hassan',
        firstName: 'Ahmed',
        lastName: 'Hassan',
        phone: '+20 102 345 6789',
        avatarUrl: 'https://i.pravatar.cc/160?img=12',
      },
      schedule: {
        timeLabel: '08:00 PM - 09:00 PM',
        dateLabel: 'Friday, Oct 24',
      },
      paymentKind: 'wallet',
    },
    {
      id: 'b2',
      tab: 'upcoming',
      status: 'confirmed',
      player: {
        name: 'Sara Mahmoud',
        firstName: 'Sara',
        lastName: 'Mahmoud',
        phone: '+20 114 556 7812',
        avatarUrl: 'https://i.pravatar.cc/160?img=47',
      },
      schedule: {
        timeLabel: '09:30 PM - 10:30 PM',
        dateLabel: 'Friday, Oct 24',
      },
      paymentKind: 'cash',
    },
    {
      id: 'b3',
      tab: 'upcoming',
      status: 'rejected',
      player: {
        name: 'Karima Adel',
        firstName: 'Karima',
        lastName: 'Adel',
        phone: '+20 155 009 1234',
        avatarUrl: 'https://i.pravatar.cc/160?img=5',
      },
      schedule: {
        timeLabel: '11:00 PM - 12:00 AM',
        dateLabel: 'Friday, Oct 24',
      },
      paymentKind: 'card',
    },
    {
      id: 'b4',
      tab: 'past',
      status: 'confirmed',
      player: {
        name: 'Mona Ali',
        firstName: 'Mona',
        lastName: 'Ali',
        phone: '+20 111 222 3333',
        avatarUrl: 'https://i.pravatar.cc/160?img=32',
      },
      schedule: {
        timeLabel: '07:00 PM - 08:00 PM',
        dateLabel: 'Sunday, Oct 20',
      },
      paymentKind: 'cash',
    },
  ];

  // Reject modal
  isRejectModalOpen = false;
  rejectReason = '';
  rejectingState: RejectingState = 'idle';
  private rejectBookingId: string | null = null;

  // Create modal
  isCreateModalOpen = false;
  createState: CreateState = 'idle';
  createForm: {
    firstName: string;
    lastName: string;
    phone: string;
    timeLabel: string;
    dateLabel: string;
    paymentKind: PaymentKind;
  } = {
      firstName: '',
      lastName: '',
      phone: '',
      timeLabel: '',
      dateLabel: '',
      paymentKind: 'wallet',
    };

  // Row menu (confirmed)
  openMenuBookingId: string | null = null;

  // NEW: 3-dots menu per card
  openCardMenuId: string | null = null;

  // --- Derived ---
  get filteredBookings(): Booking[] {
    const byTab = this.bookings.filter((b) => b.tab === this.activeTab);
    if (this.statusFilter === 'all') return byTab;
    return byTab.filter((b) => b.status === this.statusFilter);
  }

  get isCreateFormValid(): boolean {
    const f = this.createForm;
    return (
      f.firstName.trim().length > 0 &&
      f.lastName.trim().length > 0 &&
      f.phone.trim().length > 0 &&
      f.timeLabel.trim().length > 0 &&
      f.dateLabel.trim().length > 0
    );
  }

  get paymentLabelMap(): Record<PaymentKind, string> {
    return {
      wallet: 'Digital Wallet',
      cash: 'Cash on Pitch',
      card: 'Online Card',
    };
  }

  // --- UI helpers ---
  getBookingById(id: string): Booking | undefined {
    return this.bookings.find((b) => b.id === id);
  }

  get paymentLabel(): (b: Booking) => string {
    return (b: Booking) => this.paymentLabelMap[b.paymentKind];
  }

  // --- Header tab actions ---
  setTab(tab: TabKey): void {
    this.activeTab = tab;
    this.closeStatusMenu();
    this.closeRowMenu();
    this.closeCardMenu();
  }

  // --- Filter menu ---
  toggleStatusMenu(): void {
    this.isStatusMenuOpen = !this.isStatusMenuOpen;
    if (this.isStatusMenuOpen) this.closeCardMenu();
  }

  closeStatusMenu(): void {
    this.isStatusMenuOpen = false;
  }

  setStatusFilter(filter: 'all' | BookingStatus): void {
    this.statusFilter = filter;
    this.closeStatusMenu();
    this.closeRowMenu();
    this.closeCardMenu();
  }

  // --- Booking actions ---
  approveBooking(id: string): void {
    const b = this.getBookingById(id);
    if (!b) return;
    if (b.status !== 'pending') return;

    b.status = 'confirmed';
    this.stats.pendingReview = Math.max(0, this.stats.pendingReview - 1);
  }

  openRejectModal(id: string): void {
    const b = this.getBookingById(id);
    if (!b) return;
    if (b.status !== 'pending') return;

    this.rejectBookingId = id;
    this.rejectReason = '';
    this.rejectingState = 'idle';
    this.isRejectModalOpen = true;
  }

  closeRejectModal(): void {
    this.isRejectModalOpen = false;
    this.rejectBookingId = null;
    this.rejectReason = '';
    this.rejectingState = 'idle';
  }

  confirmReject(): void {
    if (!this.rejectBookingId) return;
    if (this.rejectReason.trim().length === 0) return;

    const b = this.getBookingById(this.rejectBookingId);
    if (!b) return;

    this.rejectingState = 'loading';

    window.setTimeout(() => {
      b.status = 'rejected';
      this.stats.pendingReview = Math.max(0, this.stats.pendingReview - 1);

      this.rejectingState = 'idle';
      this.closeRejectModal();
    }, 600);
  }

  reopenBooking(id: string): void {
    const b = this.getBookingById(id);
    if (!b) return;
    if (b.status !== 'rejected') return;

    b.status = 'pending';
    this.stats.pendingReview += 1;
  }

  // --- Confirmed row menu ---
  openRowMenu(id: string): void {
    this.openMenuBookingId = this.openMenuBookingId === id ? null : id;
    if (this.openMenuBookingId !== null) this.closeCardMenu();
  }

  closeRowMenu(): void {
    this.openMenuBookingId = null;
  }

  markAsCompleted(id: string): void {
    const b = this.getBookingById(id);
    if (!b) return;
    b.tab = 'past';
    this.closeRowMenu();
  }

  duplicateBooking(id: string): void {
    const b = this.getBookingById(id);
    if (!b) return;

    const copy: Booking = {
      ...structuredClone(b),
      id: `copy_${Date.now()}`,
      tab: 'upcoming',
      status: 'pending',
    };

    this.bookings.unshift(copy);
    this.stats.pendingReview += 1;
    this.closeRowMenu();
  }

  // --- Create booking ---
  openCreateModal(): void {
    this.isCreateModalOpen = true;
    this.createState = 'idle';
    this.createForm = {
      firstName: '',
      lastName: '',
      phone: '',
      timeLabel: '',
      dateLabel: '',
      paymentKind: 'wallet',
    };
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
    this.createState = 'idle';
  }

  submitCreate(): void {
    if (!this.isCreateFormValid) return;
    if (this.createState === 'loading') return;

    this.createState = 'loading';

    window.setTimeout(() => {
      const firstName = this.createForm.firstName.trim();
      const lastName = this.createForm.lastName.trim();

      const newBooking: Booking = {
        id: `b_${Date.now()}`,
        tab: 'upcoming',
        status: 'pending',
        player: {
          name: `${firstName} ${lastName}`,
          firstName,
          lastName,
          phone: this.createForm.phone.trim(),
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            firstName + ' ' + lastName,
          )}&background=146A1E&color=ffffff`,
        },
        schedule: {
          timeLabel: this.createForm.timeLabel.trim(),
          dateLabel: this.createForm.dateLabel.trim(),
        },
        paymentKind: this.createForm.paymentKind,
      };

      this.bookings.unshift(newBooking);
      this.stats.pendingReview += 1;
      this.createState = 'idle';
      this.closeCreateModal();
    }, 700);
  }

  // --- Insights card ---
  viewFullReport(): void {
    this.setTab('past');
  }

  // --- Labels for UI ---
  getPaymentLabel(kind: PaymentKind): string {
    const map: Record<PaymentKind, string> = {
      wallet: 'Digital Wallet',
      cash: 'Cash on Pitch',
      card: 'Online Card',
    };
    return map[kind];
  }

  getPaymentLabelForBooking(b: Booking): string {
    return this.getPaymentLabel(b.paymentKind);
  }

  // --- NEW: action menu + verify ---
  toggleCardMenu(id: string): void {
    this.openCardMenuId = this.openCardMenuId === id ? null : id;
    if (this.openCardMenuId !== null) this.closeStatusMenu();
  }

  closeCardMenu(): void {
    this.openCardMenuId = null;
  }

  verifyBooking(id: string): void {
    this.closeCardMenu();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (target.closest('[data-card-menu]')) return;
    this.closeCardMenu();
  }

}
