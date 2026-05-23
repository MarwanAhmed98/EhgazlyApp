import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Tournament {
  id: string;
  name: string;
  type: 'Professional' | 'Amateur';
  startDate: string;
  endDate: string;
  season: string;
  currentTeams: number;
  maxTeams: number;
  status: 'Active' | 'Upcoming' | 'Completed';
  image: string;
}

@Component({
  selector: 'app-admin-manage-tournaments',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-manage-tournaments.component.html',
  styleUrl: './admin-manage-tournaments.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminManageTournamentsComponent {
  // Original Seed Data matches your layout image beautifully!
  private initialTournaments: Tournament[] = [
    {
      id: '#GPL-2024-01',
      name: 'Giza Premier League',
      type: 'Professional',
      startDate: 'Oct 12',
      endDate: 'Nov 30',
      season: '2024 SEASON',
      currentTeams: 16,
      maxTeams: 16,
      status: 'Active',
      image: '' // Empty falls back to procedural graphic logo
    },
    {
      id: '#CAC-2024-05',
      name: 'Cairo Amateur Cup',
      type: 'Amateur',
      startDate: 'Dec 05',
      endDate: 'Dec 28',
      season: 'WINTER SERIES',
      currentTeams: 12,
      maxTeams: 16,
      status: 'Upcoming',
      image: ''
    },
    {
      id: '#SYC-2024-00',
      name: 'Summer Youth Clash',
      type: 'Amateur',
      startDate: 'Aug 01',
      endDate: 'Aug 15',
      season: 'COMPLETED',
      currentTeams: 32,
      maxTeams: 32,
      status: 'Completed',
      image: ''
    },
    {
      id: '#APM-2024-09',
      name: 'Alexandria Pro Masters',
      type: 'Professional',
      startDate: 'Oct 20',
      endDate: 'Dec 15',
      season: 'COASTAL LEAGUE',
      currentTeams: 24,
      maxTeams: 24,
      status: 'Active',
      image: ''
    }
  ];

  // Modern Signal State
  tournaments = signal<Tournament[]>(this.initialTournaments);
  searchTerm = signal<string>('');
  currentTab = signal<'all' | 'active' | 'upcoming' | 'completed'>('all');

  // Advanced Filter Settings
  showAdvancedFilters = signal<boolean>(false);
  typeFilter = signal<string>('all');
  slotsFilter = signal<string>('any');

  // Separate Read-only View and Editable Manage Modals
  viewTournament = signal<Tournament | null>(null);
  manageTournament = signal<Tournament | null>(null);

  // Edit fields holding state inside the edit form
  editFormValues: Tournament = {
    id: '',
    name: '',
    type: 'Professional',
    startDate: '',
    endDate: '',
    season: '',
    currentTeams: 0,
    maxTeams: 16,
    status: 'Upcoming',
    image: ''
  };

  showCreateModal = signal<boolean>(false);
  toastMessage = signal<string>('');
  toastType = signal<'success' | 'danger'>('success');

  // Top metric counters via Computed Signals
  liveCount = computed(() => {
    return this.tournaments().filter(t => t.status === 'Active').length;
  });

  registrationCount = computed(() => {
    return this.tournaments().filter(t => t.status === 'Upcoming').length;
  });

  totalTeamsSum = computed(() => {
    return this.tournaments().reduce((sum, t) => sum + t.currentTeams, 0);
  });

  // Filter & Search computation engine
  filteredTournaments = computed(() => {
    let list = this.tournaments();

    // 1. Text Search Filter (Matches ID, Name, or Season)
    const query = this.searchTerm().toLowerCase().trim();
    if (query) {
      list = list.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.season.toLowerCase().includes(query)
      );
    }

    // 2. Tab Filter
    const tab = this.currentTab();
    if (tab !== 'all') {
      list = list.filter(item => item.status.toLowerCase() === tab);
    }

    // 3. Advanced Type Filter
    const type = this.typeFilter();
    if (type !== 'all') {
      list = list.filter(item => item.type === type);
    }

    // 4. Advanced Capacity Slots Filter
    const slots = this.slotsFilter();
    if (slots !== 'any') {
      if (slots === 'not-full') {
        list = list.filter(item => item.currentTeams < item.maxTeams);
      } else if (slots === 'full') {
        list = list.filter(item => item.currentTeams === item.maxTeams);
      }
    }

    return list;
  });

  // Input event handler avoiding template-driven ngModel
  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  setTab(tab: 'all' | 'active' | 'upcoming' | 'completed') {
    this.currentTab.set(tab);
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters.update(v => !v);
  }

  onTypeFilterChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.typeFilter.set(val);
  }

  onSlotsFilterChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.slotsFilter.set(val);
  }

  resetFilters() {
    this.typeFilter.set('all');
    this.slotsFilter.set('any');
    this.searchTerm.set('');
  }

  // Separate Behavior: Read-Only View Modal Open/Close
  openViewModal(tournament: Tournament) {
    this.viewTournament.set(tournament);
  }

  closeViewModal() {
    this.viewTournament.set(null);
  }

  // Separate Behavior: Editable Manage Modal Open/Close
  openManageModal(tournament: Tournament) {
    this.manageTournament.set(tournament);
    // Copy the fields to form binding model to facilitate cancellation if needed
    this.editFormValues = { ...tournament };
  }

  closeManageModal() {
    this.manageTournament.set(null);
  }

  // Persists edited changes to current State dynamically
  saveTournamentChanges() {
    const currentId = this.editFormValues.id;
    if (!currentId) return;

    this.tournaments.update(currentList =>
      currentList.map(t => t.id === currentId ? { ...this.editFormValues } : t)
    );

    this.closeManageModal();
    this.triggerToast(`Successfully modified details for "${this.editFormValues.name}"`, 'success');
  }

  // Deletes item dynamically from State and throws a red (danger) Toastr alert
  deleteTournament(tournament: Tournament) {
    const confirmName = tournament.name;
    this.tournaments.update(currentList =>
      currentList.filter(t => t.id !== tournament.id)
    );
    this.closeManageModal();
    this.triggerToast(`"${confirmName}" has been successfully deleted.`, 'danger');
  }

  // Generates and downloads a real .txt archive report dynamically in the browser
  downloadArchiveReport(tournament: Tournament) {
    const reportContent = `==================================================
        ACCREDITED TOURNAMENT ARCHIVE REPORT
==================================================
Tournament ID:   ${tournament.id}
Official Name:   ${tournament.name}
League Category: ${tournament.type}
Season/Series:   ${tournament.season}
Duration:        ${tournament.startDate} - ${tournament.endDate}
Status:          ${tournament.status}
Final Teams:     ${tournament.currentTeams} / ${tournament.maxTeams}

--------------------------------------------------
Certified by the Tournament Management Association.
All bracket results and historical logs are archived.
==================================================`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Report_${tournament.name.replace(/\s+/g, '_')}_${tournament.id.replace('#', '')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    this.closeViewModal();
    this.triggerToast(`Accredited Report for "${tournament.name}" downloaded to system successfully.`, 'success');
  }

  // openCreateModal() {
  //   this.showCreateModal.set(true);
  // }

  // closeCreateModal() {
  //   this.showCreateModal.set(false);
  // }

  // Submission handler for new tournaments
  handleCreateSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const name = formData.get('newName') as string;
    const type = formData.get('newType') as 'Professional' | 'Amateur';
    const maxTeams = parseInt(formData.get('newMax') as string) || 16;
    const startStr = formData.get('newStart') as string;
    const endStr = formData.get('newEnd') as string;
    const season = (formData.get('newSeason') as string).toUpperCase();

    // Formatting date helper
    const formatDate = (dateString: string) => {
      if (!dateString) return 'TBD';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    };

    const newTournament: Tournament = {
      id: `#NEW-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name,
      type: type,
      startDate: formatDate(startStr),
      endDate: formatDate(endStr),
      season: season,
      currentTeams: 0,
      maxTeams: maxTeams,
      status: 'Upcoming',
      image: ''
    };

    // Append to list using signal update
    this.tournaments.update(current => [newTournament, ...current]);
    // this.closeCreateModal();
    this.triggerToast(`Successfully created ${name}!`, 'success');
  }

  // Download export helper
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
    this.triggerToast('Tournament configuration exported successfully.', 'success');
  }

  private triggerToast(message: string, type: 'success' | 'danger' = 'success') {
    this.toastType.set(type);
    this.toastMessage.set(message);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 3500);
  }
}