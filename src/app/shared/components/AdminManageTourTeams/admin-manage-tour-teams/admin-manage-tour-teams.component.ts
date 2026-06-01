import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTournamentsService } from '../../../../core/services/AdminTournaments/admin-tournaments.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { ActivatedRoute } from '@angular/router';
import { ITeamTournament } from '../../../../core/services/iteam-tournament';

@Component({
  selector: 'app-admin-manage-tour-teams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-manage-tour-teams.component.html',
  styleUrl: './admin-manage-tour-teams.component.scss'
})
export class AdminManageTourTeamsComponent implements OnInit {
  private adminTournamentsService = inject(AdminTournamentsService);
  private toastService = inject(ToastService);
  private activatedRoute = inject(ActivatedRoute);

  teams = signal<ITeamTournament[]>([]);
  productid: string | null = null;

  // UI state
  openDropdownId = signal<number | null>(null);
  // isLoadingAction = signal<boolean>(false);
  receiptModalUrl = signal<string | null>(null);
  isRejectModalOpen = signal<boolean>(false);
  selectedTeamForReject: ITeamTournament | null = null;
  rejectionReason = '';
  rejectError = signal<string>('');
  isSubmittingReject = signal<boolean>(false);

  teamsList = this.teams.asReadonly();

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.productid = params.get('id');
      if (this.productid) {
        this.loadTeams();
      }
    });
  }

  loadTeams(): void {
    if (!this.productid) return;
    this.adminTournamentsService.GetTeams(this.productid).subscribe({
      next: (res) => {
        this.teams.set(res.data || []);
      }
    });
  }

  // Dropdown
  toggleDropdown(teamId: number, event: Event): void {
    event.stopPropagation();
    this.openDropdownId.set(this.openDropdownId() === teamId ? null : teamId);
  }

  // Approve
  approveTeam(teamId: number): void {
    if (!this.productid) return;
    // this.isLoadingAction.set(true);
    this.openDropdownId.set(null);
    this.adminTournamentsService.ApproveTeam(this.productid, teamId).subscribe({
      next: () => {
        this.toastService.success('Team approved successfully');
        this.loadTeams();
        // this.isLoadingAction.set(false);
      }
    });
  }

  // Reject modal flow
  openRejectModal(team: ITeamTournament): void {
    this.selectedTeamForReject = team;
    this.rejectionReason = '';
    this.rejectError.set('');
    this.isRejectModalOpen.set(true);
    this.openDropdownId.set(null);
  }

  closeRejectModal(): void {
    this.isRejectModalOpen.set(false);
    this.selectedTeamForReject = null;
    this.rejectionReason = '';
    this.rejectError.set('');
    this.isSubmittingReject.set(false);
  }

  confirmReject(): void {
    if (!this.rejectionReason.trim()) {
      this.rejectError.set('Rejection reason is required');
      return;
    }
    if (!this.productid || !this.selectedTeamForReject) return;
    this.isSubmittingReject.set(true);
    this.adminTournamentsService.RejectTeam(this.productid, this.selectedTeamForReject.id, this.rejectionReason).subscribe({
      next: () => {
        this.toastService.success('Team rejected');
        this.closeRejectModal();
        this.loadTeams();
        this.isSubmittingReject.set(false);
      }
    });
  }

  // Receipt modal
  openReceiptModal(url: string): void {
    this.receiptModalUrl.set(url);
  }
  closeReceiptModal(): void {
    this.receiptModalUrl.set(null);
  }
}