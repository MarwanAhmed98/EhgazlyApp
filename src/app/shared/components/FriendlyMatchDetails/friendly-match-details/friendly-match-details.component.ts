import { Component } from '@angular/core';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';

type UIState = 'preJoin' | 'joined';
type JoinStatus = 'idle' | 'joining';

type BannerKind = 'joined' | 'waitlist' | 'cancelled';

type PlayerCard = {
  id: string;
  name: string;
  avatar?: string | null;
  badge: string;
  badgeClass: string;
};

@Component({
  selector: 'app-friendly-match-details',
  standalone: true,
  imports: [PlayernavComponent],
  templateUrl: './friendly-match-details.component.html',
  styleUrl: './friendly-match-details.component.scss',
})
export class FriendlyMatchDetailsComponent {
  // Data (mocked; replace with API later)
  match = {
    title: 'Friday Night Blitz 7v7',
    dateLabel: 'Friday, Oct 27',
    timeLabel: '20:00 – 21:30',
    venueLabel: 'Al-Nasr Arena, Pitch 4',
    address: 'Building 42, District 5, New Cairo',
    fee: 150,
    capacity: 14,
    heroImage: 'https://images.unsplash.com/photo-1434648957308-5e6a859697e8?auto=format&fit=crop&w=1800&q=80',
    mapImage: 'https://images.unsplash.com/photo-1548345680-f5475ea5df84?auto=format&fit=crop&w=1400&q=80',
  };

  organizer = {
    name: 'Ziad Ebrahim',
    rating: 4.9,
    matches: 124,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
  };

  uiState: UIState = 'preJoin';
  joinStatus: JoinStatus = 'idle';

  // Banner state
  bannerDismissed = false;
  bannerKind: BannerKind = 'joined';

  // Match numbers
  spotsLeft = 6;
  rosterCount = 8;

  // Waitlist state (new management)
  isInWaitlist = false;
  waitlistPosition = 0;
  waitlistCount = 0;

  // Cancel modal state
  cancelModalOpen = false;

  get waitlistFillPct(): number {
    return Math.min(100, Math.max(0, (this.waitlistCount / 10) * 100));
  }

  get rosterCards(): PlayerCard[] {
    if (this.uiState === 'preJoin') {
      return [
        {
          id: 'p1',
          name: 'Ahmed K.',
          avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=256&q=80',
          badge: 'CAPTAIN',
          badgeClass: 'bg-emerald-200/70 border border-emerald-200/60 text-emerald-950',
        },
        {
          id: 'p2',
          name: 'Omar S.',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
          badge: 'PLAYER',
          badgeClass: 'bg-emerald-200/40 border border-emerald-200/60 text-emerald-950/80',
        },
        {
          id: 'p3',
          name: 'Laila M.',
          avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80',
          badge: 'PLAYER',
          badgeClass: 'bg-emerald-200/40 border border-emerald-200/60 text-emerald-950/80',
        },
        {
          id: 'p4',
          name: 'You?',
          avatar: null,
          badge: 'OPEN SPOT',
          badgeClass: 'bg-[#FEF0C7] border border-[#FEC84B]/60 text-[#A34700]',
        },
      ];
    }

    // "joined" UI in your current design represents FULL / waitlist flow (image 2).
    return [
      {
        id: 'p1',
        name: 'Ahmed K.',
        avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=256&q=80',
        badge: 'CAPTAIN',
        badgeClass: 'bg-emerald-200/70 border border-emerald-200/60 text-emerald-950',
      },
      {
        id: 'p2',
        name: 'Omar S.',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
        badge: 'PLAYER',
        badgeClass: 'bg-emerald-200/40 border border-emerald-200/60 text-emerald-950/80',
      },
      {
        id: 'p3',
        name: 'Laila M.',
        avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80',
        badge: 'PLAYER',
        badgeClass: 'bg-emerald-200/40 border border-emerald-200/60 text-emerald-950/80',
      },
      {
        id: 'p4',
        name: 'Kareem G.',
        avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=256&q=80',
        badge: 'PLAYER',
        badgeClass: 'bg-emerald-200/40 border border-emerald-200/60 text-emerald-950/80',
      },
    ];
  }

  get slotDots(): number[] {
    if (this.uiState === 'preJoin') return [9, 10, 11, 12, 13, 14];
    return [5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  }

  dismissBanner(): void {
    this.bannerDismissed = true;
  }

  // Keep existing join logic, extend with waitlist flags only
  async onJoinClick(): Promise<void> {
    if (this.joinStatus === 'joining') return;

    this.joinStatus = 'joining';
    await new Promise((r) => setTimeout(r, 650));

    // Existing behavior: transition to FULL state (image 2)
    this.uiState = 'joined';
    this.spotsLeft = 0;
    this.rosterCount = this.match.capacity;

    // Set user as in waitlist (new feature)
    this.isInWaitlist = true;
    this.waitlistPosition = 3;
    this.waitlistCount = 2;

    this.bannerDismissed = false;
    this.bannerKind = 'waitlist';

    this.joinStatus = 'idle';
  }

  // ---------- Cancel Waitlist ----------
  openCancelModal(): void {
    if (!this.isInWaitlist) return;
    this.cancelModalOpen = true;
  }

  closeCancelModal(): void {
    this.cancelModalOpen = false;
  }

  confirmCancelWaitlist(): void {
    if (!this.isInWaitlist) {
      this.closeCancelModal();
      return;
    }

    // Remove user from waitlist
    this.isInWaitlist = false;

    // Update counts (safe bounds)
    this.waitlistCount = Math.max(0, this.waitlistCount - 1);
    this.waitlistPosition = 0;

    // Return UI to preJoin state (cancelled state)
    this.uiState = 'preJoin';
    this.spotsLeft = 6;
    this.rosterCount = 8;

    // Success banner/message
    this.bannerDismissed = false;
    this.bannerKind = 'cancelled';

    this.closeCancelModal();
  }
}