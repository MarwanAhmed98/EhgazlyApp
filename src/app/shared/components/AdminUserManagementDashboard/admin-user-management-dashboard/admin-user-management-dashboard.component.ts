import { Component, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'PLAYER' | 'FIELD OWNER';
  status: 'Active' | 'Suspended' | 'Banned';
  joinDate: string;
  avatarUrl?: string;
  initials?: string;
}

@Component({
  selector: 'app-admin-user-management-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-user-management-dashboard.component.html',
  styleUrl: './admin-user-management-dashboard.component.scss',
})
export class AdminUserManagementDashboardComponent {
  // Global / initial user list using state-driven signals
  users = signal<User[]>([
    { id: '1', name: 'Karim Ahmed', email: 'k.ahmed@example.com', role: 'PLAYER', status: 'Active', joinDate: 'Oct 12, 2023', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
    { id: '2', name: 'Sarah Mahmoud', email: 'sarah.m@greenarena.com', role: 'FIELD OWNER', status: 'Active', joinDate: 'Jan 05, 2024', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
    { id: '3', name: 'Omar Mansour', email: 'omar.m99@gmail.com', role: 'PLAYER', status: 'Suspended', joinDate: 'Nov 22, 2023', initials: 'OM' },
    { id: '4', name: 'Youssef Tarek', email: 'y.tarek@example.com', role: 'PLAYER', status: 'Active', joinDate: 'Feb 14, 2024', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
    { id: '5', name: 'Laila Aly', email: 'laila.aly@outlook.com', role: 'PLAYER', status: 'Banned', joinDate: 'Dec 01, 2023', initials: 'LA' },
    // Extra mock data to populate table nicely for perfect real-world experience & pagination
    { id: '6', name: 'Mostafa Hassan', email: 'm.hassan@example.com', role: 'PLAYER', status: 'Active', joinDate: 'Mar 15, 2024', initials: 'MH' },
    { id: '7', name: 'Nour El-Din', email: 'nour.din@fieldmaster.net', role: 'FIELD OWNER', status: 'Active', joinDate: 'Dec 20, 2023', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' },
    { id: '8', name: 'Yasmin Kamal', email: 'y.kamal@stadiums.eg', role: 'FIELD OWNER', status: 'Suspended', joinDate: 'Jan 18, 2024', initials: 'YK' },
    { id: '9', name: 'Amr Wafik', email: 'amr.wafik@gmail.com', role: 'PLAYER', status: 'Active', joinDate: 'Feb 28, 2024', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200' },
    { id: '10', name: 'Hana Selim', email: 'hana.s@example.com', role: 'PLAYER', status: 'Active', joinDate: 'Mar 01, 2024', initials: 'HS' },
    { id: '11', name: 'Ziad Sherif', email: 'ziad.sherif@outlook.com', role: 'PLAYER', status: 'Active', joinDate: 'Dec 15, 2023', initials: 'ZS' },
    { id: '12', name: 'Fatma Ali', email: 'fatma.ali@greenfield.com', role: 'FIELD OWNER', status: 'Active', joinDate: 'Feb 10, 2024', initials: 'FA' }
  ]);

  // Filter signals
  selectedRole = signal<'All' | 'PLAYER' | 'FIELD OWNER'>('All');
  selectedStatus = signal<'All' | 'Active' | 'Suspended' | 'Banned'>('All');
  selectedTimeframe = signal<'All' | '30' | '90'>('All');

  // Pagination states
  currentPage = signal<number>(1);
  itemsPerPage = 5;

  // Modal display states
  showAddUserModal = signal<boolean>(false);
  selectedUserForManagement = signal<User | null>(null);

  // Keeps temporary/cloned modifications before committing to users signal
  tempUserForManagement = signal<User | null>(null);

  // Helper method to get the first two letters of any name uppercase as a dynamic fallback
  getFallbackAvatar(name: string): string {
    if (!name) return 'US';
    return name.trim().substring(0, 2).toUpperCase();
  }

  // Derived Ecosystem metrics using Computed Signals
  totalUsersCount = computed(() => {
    return 12842 - 12 + this.users().length;
  });

  activePlayersCount = computed(() => {
    const playersInDb = 9420;
    const addedPlayers = this.users().filter(u => u.role === 'PLAYER' && u.status === 'Active').length - 5;
    return playersInDb + addedPlayers;
  });

  fieldOwnersCount = computed(() => {
    const ownersInDb = 3422;
    const addedOwners = this.users().filter(u => u.role === 'FIELD OWNER').length - 2;
    return ownersInDb + addedOwners;
  });

  // Filtered list of local directory
  filteredUsers = computed(() => {
    let list = this.users();

    // 1. Filter by role
    if (this.selectedRole() !== 'All') {
      list = list.filter(u => u.role === this.selectedRole());
    }

    // 2. Filter by status
    if (this.selectedStatus() !== 'All') {
      list = list.filter(u => u.status === this.selectedStatus());
    }

    // 3. Filter by timeframe
    if (this.selectedTimeframe() !== 'All') {
      const days = parseInt(this.selectedTimeframe(), 10);
      const now = new Date();
      list = list.filter(u => {
        const dateObj = new Date(u.joinDate + ' ' + now.getFullYear());
        const diffTime = Math.abs(now.getTime() - dateObj.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= days;
      });
    }

    return list;
  });

  // Paginated user computation
  paginatedUsers = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredUsers().slice(startIndex, startIndex + this.itemsPerPage);
  });

  // Dynamic values helper functions
  totalCount = computed(() => this.filteredUsers().length);
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.itemsPerPage)));

  startItemIndex = computed(() => {
    if (this.totalCount() === 0) return 0;
    return (this.currentPage() - 1) * this.itemsPerPage + 1;
  });

  endItemIndex = computed(() => {
    return Math.min(this.currentPage() * this.itemsPerPage, this.totalCount());
  });

  totalPagesArray = computed(() => {
    const pages = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      pages.push(i);
    }
    return pages;
  });

  // Change filters triggers
  setRole(role: 'All' | 'PLAYER' | 'FIELD OWNER') {
    this.selectedRole.set(role);
    this.currentPage.set(1);
  }

  setStatus(status: 'All' | 'Active' | 'Suspended' | 'Banned') {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
  }

  setTimeframe(days: 'All' | '30' | '90') {
    this.selectedTimeframe.set(days);
    this.currentPage.set(1);
  }

  clearAllFilters() {
    this.selectedRole.set('All');
    this.selectedStatus.set('All');
    this.selectedTimeframe.set('All');
    this.currentPage.set(1);
  }

  // Pagination triggers
  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  setPage(page: number) {
    this.currentPage.set(page);
  }

  // Manage trigger modals
  openManagement(user: User) {
    this.selectedUserForManagement.set(user);
    // Clone original user data to edit safely without saving instantly
    this.tempUserForManagement.set({ ...user });
  }

  closeManagement() {
    this.selectedUserForManagement.set(null);
    this.tempUserForManagement.set(null);
  }

  // Updates temporary role data inside modal
  updateTempUserRole(newRole: 'PLAYER' | 'FIELD OWNER') {
    const current = this.tempUserForManagement();
    if (current) {
      this.tempUserForManagement.set({ ...current, role: newRole });
    }
  }

  // Updates temporary status data inside modal
  updateTempUserStatus(newStatus: 'Active' | 'Suspended' | 'Banned') {
    const current = this.tempUserForManagement();
    if (current) {
      this.tempUserForManagement.set({ ...current, status: newStatus });
    }
  }

  // Commits safe modifications to the main signal state and updates the dynamic UI ecosystem
  saveManagementChanges() {
    const edited = this.tempUserForManagement();
    if (edited) {
      this.users.update(currentList =>
        currentList.map(u => u.id === edited.id ? { ...edited } : u)
      );
    }
    this.closeManagement();
  }

  deleteUser(userId: string) {
    this.users.update(currentList => currentList.filter(u => u.id !== userId));
    this.closeManagement();
    this.currentPage.set(1);
  }

  // Creation Triggers
  openAddModal() {
    this.showAddUserModal.set(true);
  }

  closeAddModal() {
    this.showAddUserModal.set(false);
  }

  handleAddUser(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as 'PLAYER' | 'FIELD OWNER';
    const status = formData.get('status') as 'Active' | 'Suspended' | 'Banned';

    if (!name || !email) return;

    const initials = this.getFallbackAvatar(name);

    const newUser: User = {
      id: String(Date.now()),
      name,
      email,
      role,
      status,
      joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      initials
    };

    this.users.update(prev => [newUser, ...prev]);
    this.closeAddModal();
    this.currentPage.set(1);
  }
}