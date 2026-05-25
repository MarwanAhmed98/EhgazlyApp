import { Component, inject, OnInit } from '@angular/core';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';
import { PlayerFRiendlyMatchService } from '../../../../core/services/PlayerFriendlyMatch/player-friendly-match.service';
import { ActivatedRoute } from '@angular/router';
import { ISpecificMatch } from '../../../interfaces/ispecific-match';
import { DatePipe, SlicePipe } from '@angular/common';
import { ToastService } from '../../../../core/services/toast/toast.service';

type UIState = 'preJoin' | 'joined';
type JoinStatus = 'idle' | 'joining';

type BannerKind = 'joined' | 'waitlist' | 'cancelled';

@Component({
  selector: 'app-friendly-match-details',
  standalone: true,
  imports: [PlayernavComponent, DatePipe, SlicePipe],
  templateUrl: './friendly-match-details.component.html',
  styleUrl: './friendly-match-details.component.scss',
})
export class FriendlyMatchDetailsComponent implements OnInit {
  private readonly playerFRiendlyMatchService = inject(PlayerFRiendlyMatchService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);

  SpecificMatchesDetails: ISpecificMatch = {} as ISpecificMatch;

  isJoined = false;
  MatchId: any;

  // keep your existing objects
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

  bannerDismissed = false;
  bannerKind: BannerKind = 'joined';

  spotsLeft = 6;
  rosterCount = 8;

  isInWaitlist = false;
  waitlistPosition = 0;
  waitlistCount = 0;

  cancelModalOpen = false;

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe({
      next: (res) => {
        this.MatchId = res.get('id')!;
        this.GetSpecificMatch();
      },
    });
  }
  private syncJoinedStateFromAPI(): void {
    const d = this.SpecificMatchesDetails as any;
    if (!d) return;
    if (d.auth_status === 'joined') {
      this.isJoined = true;
      return;
    }
    const playersList = d.joined_players || [];
    const currentUserId = 9;

    if (Array.isArray(playersList)) {
      this.isJoined = playersList.some(p =>
        Number(p.customer_id) === Number(currentUserId) ||
        Number(p.id) === Number(currentUserId)
      );
    }
  }

  GetSpecificMatch(): void {
    this.playerFRiendlyMatchService.GetSpecificMatches(this.MatchId).subscribe({
      next: (res) => {
        console.log('بيانات الملعب من السيرفر:', res.data);
        this.SpecificMatchesDetails = res.data;
        this.syncJoinedStateFromAPI();
      },
    });
  }

  JoinMatch(): void {
    if (this.joinStatus !== 'idle') return;

    this.joinStatus = 'joining';
    this.playerFRiendlyMatchService.JoinMatches(this.MatchId).subscribe({
      next: (res) => {
        this.toastService.success(res.message, 'Ehgazly');
        this.isJoined = true;
        this.SpecificMatchesDetails = {
          ...(this.SpecificMatchesDetails as any),
          current_players: Number((this.SpecificMatchesDetails as any)?.current_players ?? 0) + 1,
          spots_left: Math.max(0, Number((this.SpecificMatchesDetails as any)?.spots_left ?? 0) - 1),
        } as ISpecificMatch;
        this.joinStatus = 'idle';
        this.GetSpecificMatch();
      },
      error: (err) => {
        this.joinStatus = 'idle';
        this.toastService.error(err?.error?.message ?? 'Failed to join match', 'Ehgazly');
      },
    });
  }

  LeaveMatch(): void {
    if (this.joinStatus !== 'idle') return;

    this.joinStatus = 'joining';

    this.playerFRiendlyMatchService.LeaveMatches(this.MatchId).subscribe({
      next: (res) => {
        this.toastService.success(res.message, 'Ehgazly');
        this.isJoined = false;
        const currentPlayers = Number((this.SpecificMatchesDetails as any)?.current_players ?? 0);
        const requiredPlayers = Number((this.SpecificMatchesDetails as any)?.required_players ?? 0);

        const nextCurrent = Math.max(0, currentPlayers - 1);
        const nextSpotsLeft = Math.max(0, requiredPlayers - nextCurrent);

        const currentUserId =
          (this.SpecificMatchesDetails as any)?.current_user_id ??
          (this.SpecificMatchesDetails as any)?.auth_user_id ??
          (this.SpecificMatchesDetails as any)?.user_id ??
          (this.SpecificMatchesDetails as any)?.me?.id ??
          (this.SpecificMatchesDetails as any)?.currentUser?.id;

        const joinedPlayers: any[] = (this.SpecificMatchesDetails as any)?.joined_players ?? [];
        const filteredPlayers = Array.isArray(joinedPlayers) && currentUserId != null
          ? joinedPlayers.filter((p) => Number(p?.id) !== Number(currentUserId))
          : joinedPlayers;

        this.SpecificMatchesDetails = {
          ...(this.SpecificMatchesDetails as any),
          current_players: nextCurrent,
          spots_left: nextSpotsLeft,
          joined_players: filteredPlayers,
        } as ISpecificMatch;

        this.joinStatus = 'idle';
        this.GetSpecificMatch();
      },
      error: (err) => {
        this.joinStatus = 'idle';
        this.syncJoinedStateFromAPI();

        this.toastService.error(err?.error?.message ?? 'Failed to leave match', 'Ehgazly');
      },
    });
  }
  get waitlistFillPct(): number {
    return Math.min(100, Math.max(0, (this.waitlistCount / 10) * 100));
  }

  get slotDots(): number[] {
    if (this.uiState === 'preJoin') return [9, 10, 11, 12, 13, 14];
    return [5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  }

  dismissBanner(): void {
    this.bannerDismissed = true;
  }

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
    this.isInWaitlist = false;
    this.waitlistCount = Math.max(0, this.waitlistCount - 1);
    this.waitlistPosition = 0;
    this.uiState = 'preJoin';
    this.spotsLeft = 6;
    this.rosterCount = 8;
    this.bannerDismissed = false;
    this.bannerKind = 'cancelled';
    this.closeCancelModal();
  }
}