import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminTournamentsService } from '../../../../core/services/AdminTournaments/admin-tournaments.service';
import { IAdminTournaments } from '../../../interfaces/iadmin-tournaments';
import { ToastService } from '../../../../core/services/toast/toast.service';

@Component({
  selector: 'app-admin-manage-tournaments',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-manage-tournaments.component.html',
  styleUrl: './admin-manage-tournaments.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminManageTournamentsComponent implements OnInit {
  private adminTournamentsService = inject(AdminTournamentsService);
  private toastService = inject(ToastService);

  tournaments = signal<IAdminTournaments[]>([]);
  searchTerm = signal<string>('');
  currentTab = signal<'all' | 'open' | 'ongoing' | 'finished' | 'cancelled'>('all');
  showAdvancedFilters = signal<boolean>(false);
  teamSizeFilter = signal<string>('all');
  slotsFilter = signal<string>('any');
  viewTournament = signal<IAdminTournaments | null>(null);
  manageTournament = signal<IAdminTournaments | null>(null);

  editFormValues: any = {
    id: null,
    name: '',
    description: '',
    team_size: '5v5',
    max_teams: 0,
    entry_fee: '',
    important_note: ''
  };

  toastMessage = signal<string>('');
  toastType = signal<'success' | 'danger'>('success');

  ngOnInit(): void {
    this.loadTournaments();
  }

  loadTournaments(): void {
    this.adminTournamentsService.ShowTournaments().subscribe({
      next: (res) => {
        this.tournaments.set(res.data || []);
      }
    });
  }

  liveCount = computed(() => this.tournaments().filter(t => t.status === 'ongoing').length);
  registrationCount = computed(() => this.tournaments().filter(t => t.status === 'open').length);
  totalTeamsSum = computed(() => this.tournaments().reduce((sum, t) => sum + (t.current_teams || 0), 0));
  totalPrizeSum = computed(() => this.tournaments().reduce((sum, t) => sum + (t.total_prize_pool || 0), 0).toLocaleString());

  filteredTournaments = computed(() => {
    let list = this.tournaments();
    const query = this.searchTerm().toLowerCase().trim();
    if (query) list = list.filter(item => item.name.toLowerCase().includes(query) || item.id.toString().includes(query));
    const tab = this.currentTab();
    if (tab !== 'all') list = list.filter(item => item.status === tab);
    const teamSize = this.teamSizeFilter();
    if (teamSize !== 'all') list = list.filter(item => item.team_size === teamSize);
    const slots = this.slotsFilter();
    if (slots !== 'any') {
      if (slots === 'not-full') list = list.filter(item => (item.current_teams || 0) < (item.max_teams || 0));
      else if (slots === 'full') list = list.filter(item => (item.current_teams || 0) === (item.max_teams || 0));
    }
    return list;
  });

  onSearchInput(event: Event) { this.searchTerm.set((event.target as HTMLInputElement).value); }
  setTab(tab: 'all' | 'open' | 'ongoing' | 'finished' | 'cancelled') { this.currentTab.set(tab); }
  toggleAdvancedFilters() { this.showAdvancedFilters.update(v => !v); }
  onTeamSizeFilterChange(event: Event) { this.teamSizeFilter.set((event.target as HTMLSelectElement).value); }
  onSlotsFilterChange(event: Event) { this.slotsFilter.set((event.target as HTMLSelectElement).value); }
  resetFilters() { this.teamSizeFilter.set('all'); this.slotsFilter.set('any'); this.searchTerm.set(''); }

  openViewModal(tournament: IAdminTournaments) { this.viewTournament.set(tournament); }
  closeViewModal() { this.viewTournament.set(null); }

  openManageModal(tournament: IAdminTournaments) {
    this.manageTournament.set(tournament);
    this.editFormValues = {
      id: tournament.id,
      name: tournament.name,
      description: tournament.description,
      team_size: tournament.team_size,
      max_teams: tournament.max_teams,
      entry_fee: tournament.entry_fee,
      important_note: tournament.important_note || ''
    };
  }

  closeManageModal() { this.manageTournament.set(null); }

  saveTournamentChanges() {
    const payload = {
      name: this.editFormValues.name,
      description: this.editFormValues.description,
      team_size: this.editFormValues.team_size,
      max_teams: this.editFormValues.max_teams,
      entry_fee: this.editFormValues.entry_fee,
      important_note: this.editFormValues.important_note
    };
    this.adminTournamentsService.UpdateTournament(this.editFormValues.id, payload).subscribe({
      next: (res) => {
        this.loadTournaments();
        this.closeManageModal();
        this.toastService.success(res.message || `Tournament "${this.editFormValues.name}" updated successfully`);
        this.triggerToast(`Tournament "${this.editFormValues.name}" updated successfully`, 'success');
      },
    });
  }

  updateTournamentStatus(id: number, newStatus: string) {
    this.adminTournamentsService.UpdateTournamentStatus(id, newStatus).subscribe({
      next: (res) => {
        this.loadTournaments();
        this.closeManageModal();
        this.toastService.success(res.message || `Tournament status updated to ${newStatus}`);
        this.triggerToast(`Status changed to ${newStatus}`, 'success');
      },
    });
  }

  confirmDelete(tournament: IAdminTournaments) {
    if (window.confirm(`Are you sure you want to delete "${tournament.name}"? This action cannot be undone.`)) {
      this.deleteTournament(tournament.id);
    }
  }

  deleteTournament(id: number) {
    this.adminTournamentsService.DeleteTournament(id).subscribe({
      next: (res) => {
        this.loadTournaments();
        this.closeManageModal();
        this.toastService.success(res.message || 'Tournament deleted successfully');
        this.triggerToast('Tournament deleted successfully', 'danger');
      },
    });
  }

  downloadArchiveReport(tournament: IAdminTournaments) {
    const reportContent = `==================================================\nACCREDITED TOURNAMENT ARCHIVE REPORT\n==================================================\nTournament ID:   ${tournament.id}\nOfficial Name:   ${tournament.name}\nTeam Size:       ${tournament.team_size}\nMax Teams:       ${tournament.max_teams}\nEntry Fee:       $${tournament.entry_fee}\nStatus:          ${tournament.status}\nDuration:        ${tournament.start_date} - ${tournament.end_date}\nMain Court:      ${tournament.maincourt?.name || 'N/A'}\nCourt:           ${tournament.court?.name || 'N/A'}\nPrize Pool:      $${tournament.total_prize_pool}\n--------------------------------------------------\nCertified by the Tournament Management Association.\n==================================================`;
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Report_${tournament.name.replace(/\s+/g, '_')}_${tournament.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    this.closeViewModal();
    this.triggerToast(`Report for "${tournament.name}" downloaded`, 'success');
  }

  exportData() {
    const data = this.filteredTournaments();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tournaments_Export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    this.triggerToast('Tournament data exported successfully', 'success');
  }

  private triggerToast(message: string, type: 'success' | 'danger' = 'success') {
    this.toastType.set(type);
    this.toastMessage.set(message);
    setTimeout(() => this.toastMessage.set(''), 3500);
  }
}