import { Component, inject, OnInit } from '@angular/core';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';
import { PlayerFRiendlyMatchService } from '../../../../core/services/PlayerFriendlyMatch/player-friendly-match.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ISpecificMatch } from '../../../interfaces/ispecific-match';
import { DatePipe, SlicePipe } from '@angular/common';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { LucideAngularModule } from 'lucide-angular';

type UIState = 'preJoin' | 'joined';
type JoinStatus = 'idle' | 'joining';
type DeleteStatus = 'idle' | 'deleting';

type ParticipationState = 'never_joined' | 'joined' | 'left';

@Component({
  selector: 'app-friendly-match-details',
  standalone: true,
  imports: [PlayernavComponent, DatePipe, SlicePipe, LucideAngularModule],
  templateUrl: './friendly-match-details.component.html',
  styleUrl: './friendly-match-details.component.scss',
})
export class FriendlyMatchDetailsComponent implements OnInit {
  private readonly playerFRiendlyMatchService = inject(PlayerFRiendlyMatchService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  SpecificMatchesDetails: ISpecificMatch = {} as ISpecificMatch;

  participationState: ParticipationState = 'never_joined';

  // compute once per session
  private currentUserId: string | number = 'guest';

  MatchId: any;

  uiState: UIState = 'preJoin';
  joinStatus: JoinStatus = 'idle';

  isDeleteModalOpen = false;
  deleteStatus: DeleteStatus = 'idle';

  ngOnInit(): void {
    this.currentUserId = this.getCurrentUserId();

    this.activatedRoute.paramMap.subscribe({
      next: (res) => {
        this.MatchId = res.get('id')!;
        this.GetSpecificMatch();
      },
    });
  }

  private getCurrentUserId(): string {
    return localStorage.getItem('userId') ?? 'guest';
  }

  private leftMatchStorageKey(): string {
    return `match_left_${this.MatchId}_user_${this.currentUserId}`;
  }

  private pendingJoinedStorageKey(): string {
    return `match_pending_join_${this.MatchId}_user_${this.currentUserId}`;
  }

  private computeParticipationStateFromMatch(match: any): ParticipationState {
    if (!match) return 'never_joined';

    const rawStatus =
      match.participation_state ??
      match.join_state ??
      match.join_status ??
      match.participation_status ??
      match.user_status ??
      match.auth_status;

    const s = String(rawStatus ?? '').toLowerCase();
    if (s === 'left' || s === 'leaved' || s === 'left_match' || s === 'cancelled') return 'left';
    if (s === 'joined') return 'joined';

    if (typeof match.is_joined === 'boolean') return match.is_joined ? 'joined' : 'never_joined';

    const ids = match.joined_player_ids ?? match.participant_ids ?? match.player_ids;
    if (Array.isArray(ids)) {
      return ids.some((id: any) => Number(id) === Number(this.currentUserId)) ? 'joined' : 'never_joined';
    }

    const playersList = match.joined_players ?? match.participants ?? match.players;
    if (Array.isArray(playersList)) {
      const isIn = playersList.some(
        (p: any) =>
          Number(p?.customer_id) === Number(this.currentUserId) ||
          Number(p?.id) === Number(this.currentUserId) ||
          Number(p?.user_id) === Number(this.currentUserId),
      );
      if (isIn) return 'joined';
    }

    // LEFT state for CURRENT USER ONLY
    const storedLeft =
      localStorage.getItem(this.leftMatchStorageKey()) === 'true';

    if (storedLeft) {
      return 'left';
    }

    const pending =
      localStorage.getItem(this.pendingJoinedStorageKey()) === 'true';

    return pending ? 'joined' : 'never_joined';
  }


  private syncUIStateFromBackend(): void {
    const d: any = this.SpecificMatchesDetails as any;

    // IMPORTANT
    const storedLeft =
      localStorage.getItem(this.leftMatchStorageKey()) === 'true';

    // IF USER LEFT BEFORE
    // DON'T LET BACKEND OVERRIDE IT
    if (storedLeft) {
      this.participationState = 'left';
    } else {
      this.participationState =
        this.computeParticipationStateFromMatch(d);
    }

    const required = Number(d?.required_players ?? 0);
    const current = Number(d?.current_players ?? 0);

    this.uiState =
      required > 0 && current >= required
        ? 'joined'
        : 'preJoin';
  }

  GetSpecificMatch(): void {
    this.currentUserId = this.getCurrentUserId(); // أضف السطر ده

    this.playerFRiendlyMatchService.GetSpecificMatches(this.MatchId).subscribe({
      next: (res) => {
        this.SpecificMatchesDetails = res?.data ?? ({} as ISpecificMatch);
        this.syncUIStateFromBackend();
        console.log(res);
      },
      error: () => {
        this.SpecificMatchesDetails = {} as ISpecificMatch;
        this.participationState = 'never_joined';
        this.uiState = 'preJoin';
      },
    });
  }

  JoinMatch(): void {
    if (this.joinStatus !== 'idle') return;
    if (this.participationState !== 'never_joined') return;

    this.joinStatus = 'joining';

    this.playerFRiendlyMatchService.JoinMatches(this.MatchId).subscribe({
      next: (res) => {
        this.toastService.success(res?.message ?? 'Joined match', 'Ehgazly');
        localStorage.removeItem(this.leftMatchStorageKey());
        this.joinStatus = 'idle';
        this.participationState = 'joined';
        this.GetSpecificMatch();

      },
      error: (err) => {
        this.joinStatus = 'idle';
        localStorage.removeItem(this.pendingJoinedStorageKey());
        this.toastService.error(err?.error?.message ?? 'Failed to join match', 'Ehgazly');
        this.GetSpecificMatch();
      },
    });
  }

  LeaveMatch(): void {
    this.playerFRiendlyMatchService.LeaveMatches(this.MatchId).subscribe({
      next: (res) => {
        this.toastService.success(
          res?.message ?? 'Left match',
          'Ehgazly'
        );
        localStorage.setItem(this.leftMatchStorageKey(), 'true');
        this.participationState = 'left';
        this.GetSpecificMatch();
        console.log(res);

      },

      error: (err) => {
        this.toastService.error(
          err?.error?.message ?? 'Failed to leave match',
          'Ehgazly'
        );
      },
    });
  }

  // ===== Delete match (unchanged) =====
  openDeleteModal(): void {
    if (this.deleteStatus === 'deleting') return;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    if (this.deleteStatus === 'deleting') return;
    this.isDeleteModalOpen = false;
  }

  confirmDeleteMatch(): void {
    const matchId = String(this.MatchId ?? '');
    if (!matchId) return;
    if (this.deleteStatus === 'deleting') return;

    this.deleteStatus = 'deleting';
    this.DeleteMatch(matchId);
  }

  DeleteMatch(matchId: string): void {
    this.playerFRiendlyMatchService.DeleteMatches(matchId).subscribe({
      next: (res) => {
        this.toastService.success(res?.message ?? 'Match deleted successfully', 'Ehgazly');
        this.deleteStatus = 'idle';
        this.isDeleteModalOpen = false;
        this.router.navigate(['/FriendlyMatches']);
      },
      error: (err) => {
        this.deleteStatus = 'idle';
        this.toastService.error(err?.error?.message ?? 'Failed to delete match', 'Ehgazly');
      },
    });
  }

  get slotDots(): number[] {
    if (this.uiState === 'preJoin') return [9, 10, 11, 12, 13, 14];
    return [5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  }
}