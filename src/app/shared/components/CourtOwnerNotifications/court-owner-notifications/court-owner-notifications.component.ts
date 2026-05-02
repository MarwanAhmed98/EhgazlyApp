// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-court-owner-notifications',
//   imports: [],
//   templateUrl: './court-owner-notifications.component.html',
//   styleUrl: './court-owner-notifications.component.scss'
// })
// export class CourtOwnerNotificationsComponent {

// }
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface BookingNotification {
  id: string;
  title: string;
  type: 'booking' | 'tournament';
  details: string;
  time: string;
  read: boolean;
}

interface CancellationNotification {
  id: string;
  title: string;
  subtitle: string;
  reason: string;
  time: string;
  type: 'match-cancelled' | 'booking-expired';
  dismissed: boolean;
  slotStatus: 'blocked' | 'available';
}

type DetailsKind = 'booking' | 'cancellation' | 'payout';

type DetailsState =
  | { open: false }
  | { open: true; kind: DetailsKind; id: string };

@Component({
  selector: 'app-court-owner-notifications',
  imports: [CommonModule],
  templateUrl: './court-owner-notifications.component.html',
  styleUrl: './court-owner-notifications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourtOwnerNotificationsComponent {
  bookings = signal<BookingNotification[]>([
    {
      id: '1',
      title: 'Ahmed Mansour reserved Pitch 1',
      type: 'booking',
      details: '5v5 Match scheduled for Tomorrow, 18:00 - 19:30. Full payment of 450 EGP expected at arrival.',
      time: '2 mins ago',
      read: false,
    },
    {
      id: '2',
      title: 'New Tournament Entry: Falcons FC',
      type: 'tournament',
      details: 'Team captain Karim Zaid has registered for the Weekend Cup. Verification of player IDs pending.',
      time: '45 mins ago',
      read: false,
    },
  ]);

  cancellations = signal<CancellationNotification[]>([
    {
      id: 'match-cancelled',
      title: 'Match Cancelled',
      subtitle: 'The Pitch Kings vs Blue Jets',
      reason: 'Cancelled by Organizer: Omar S. Reason: Weather.',
      time: '1h ago',
      type: 'match-cancelled',
      dismissed: false,
      slotStatus: 'blocked',
    },
    {
      id: 'booking-expired',
      title: 'Booking Expired',
      subtitle: 'Pitch 3 Reservation (Unpaid)',
      reason: "The reservation held for 'Zayed Tigers' expired due to lack of deposit.",
      time: '5h ago',
      type: 'booking-expired',
      dismissed: false,
      slotStatus: 'blocked',
    },
  ]);

  payout = signal({
    id: 'payout-001',
    title: 'Pending Monthly Payout',
    amountEgp: 12400,
    fieldName: 'Field 4',
    processed: false,
    processedAt: '',
  });

  unreadCount = computed(() => this.bookings().filter((b) => !b.read).length);
  cancellationsVisible = computed(() => this.cancellations().filter((c) => !c.dismissed));

  details = signal<DetailsState>({ open: false });
  isDetailsOpen = computed(() => this.details().open);

  private isDetailsOpenWithIdKind(
    state: DetailsState,
  ): state is { open: true; kind: DetailsKind; id: string } {
    return state.open === true;
  }

  private getDetailsData():
    | { kind: 'booking'; title: string; heading: string; body: string }
    | { kind: 'cancellation'; title: string; heading: string; body: string }
    | { kind: 'payout'; title: string; heading: string; body: string }
    | null {
    const d = this.details();
    if (!this.isDetailsOpenWithIdKind(d)) return null;

    if (d.kind === 'booking') {
      const item = this.bookings().find((b) => b.id === d.id);
      if (!item) return null;
      return {
        kind: 'booking',
        title: item.type === 'booking' ? 'Booking' : 'Tournament',
        heading: item.title,
        body: `${item.details}\n\nTime: ${item.time}\nStatus: ${item.read ? 'Read' : 'Unread'}`,
      };
    }

    if (d.kind === 'cancellation') {
      const item = this.cancellations().find((c) => c.id === d.id);
      if (!item) return null;
      return {
        kind: 'cancellation',
        title: item.type === 'match-cancelled' ? 'Match Cancelled' : 'Booking Expired',
        heading: item.subtitle,
        body: `${item.reason}\n\nTime: ${item.time}\nSlot: ${item.slotStatus === 'available' ? 'Open' : 'Blocked'}`,
      };
    }

    const p = this.payout();
    return {
      kind: 'payout',
      title: 'Payout',
      heading: p.title,
      body: `Field: ${p.fieldName}\nAmount: ${p.amountEgp.toLocaleString()} EGP\nStatus: ${p.processed ? `Processed (${p.processedAt})` : 'Pending'
        }`,
    };
  }

  detailsTitle = computed(() => this.getDetailsData()?.title ?? '');
  detailsHeading = computed(() => this.getDetailsData()?.heading ?? '');
  detailsBody = computed(() => this.getDetailsData()?.body ?? '');

  // 1) View Details (REAL UI)
  openDetailsModal(kind: DetailsKind, id: string): void {
    this.details.set({ open: true, kind, id });
  }

  closeDetailsModal(): void {
    this.details.set({ open: false });
  }

  // 2) Mark as Read (UPDATED: remove item immediately)
  markAsRead(id: string): void {
    const d = this.details();
    const wasOpenForThis =
      this.isDetailsOpenWithIdKind(d) && d.kind === 'booking' && d.id === id;

    this.bookings.update((items) => items.filter((item) => item.id !== id));

    if (wasOpenForThis) this.closeDetailsModal();
  }

  // 3) Reopen Slot (REAL UI)
  reopenSlot(cancellationId: string): void {
    this.cancellations.update((items) =>
      items.map((c) => (c.id === cancellationId ? { ...c, slotStatus: 'available' } : c)),
    );
  }

  // 4) Dismiss (REAL UI)
  dismissCancellation(cancellationId: string): void {
    const d = this.details();
    const wasOpen =
      this.isDetailsOpenWithIdKind(d) &&
      d.kind === 'cancellation' &&
      d.id === cancellationId;

    this.cancellations.update((items) =>
      items.map((c) => (c.id === cancellationId ? { ...c, dismissed: true } : c)),
    );

    if (wasOpen) this.closeDetailsModal();
  }

  // 5) Process Payout (REAL UI)
  processPayout(): void {
    const p = this.payout();
    if (p.processed) return;
    this.payout.set({ ...p, processed: true, processedAt: new Date().toLocaleString() });
  }
}