import { Component, ChangeDetectionStrategy, signal, computed, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface User {
  id: string;
  name: string;
  email: string;
  userId: string;
  role: 'PLAYER' | 'FIELD OWNER' | 'STAFF';
  status: 'Active' | 'Pending' | 'Suspended';
  joinedDate: string;
  avatar?: string;
}

type RoleFilter = 'ALL' | User['role'];
type StatusFilter = 'ALL' | User['status'];

@Component({
  selector: 'app-user-directory-admin',
  imports: [CommonModule],
  templateUrl: './user-directory-admin.component.html',
  styleUrl: './user-directory-admin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDirectoryAdminComponent {
  // Source of truth
  private readonly originalUsers = signal<User[]>([
    { name: 'Marcus Sterling', id: 'KC-88291', userId: 'KC-88291', email: 'm.sterling@email.com', role: 'PLAYER', status: 'Active', joinedDate: 'Oct 12, 2023' },
    { name: 'Elena Rodriguez', id: 'KC-77102', userId: 'KC-77102', email: 'elena.r@arenahub.io', role: 'FIELD OWNER', status: 'Active', joinedDate: 'Sep 28, 2023' },
    { name: 'Jameson Doyle', id: 'KC-99301', userId: 'KC-99301', email: 'jdoyle@fastmail.com', role: 'PLAYER', status: 'Pending', joinedDate: 'Jan 05, 2024' },
    { name: 'Arthur Vance', id: 'KC-00129', userId: 'KC-00129', email: 'vance.a@spam.net', role: 'PLAYER', status: 'Suspended', joinedDate: 'Nov 14, 2023' },
    { name: 'Sarah Jenkins', id: 'STAFF-001', userId: 'STAFF-001', email: 's.jenkins@kineticcourt.com', role: 'STAFF', status: 'Active', joinedDate: 'Aug 01, 2022' }
  ]);

  private readonly filteredUsers = signal<User[]>(this.cloneUsers(this.originalUsers()));

  // Template bindings
  users = computed(() => this.filteredUsers());
  displayedUsers = computed(() => this.filteredUsers());

  // Filters + search
  searchTerm = signal<string>('');
  roleFilter = signal<RoleFilter>('ALL');
  statusFilter = signal<StatusFilter>('ALL');

  // Row actions menu
  openMenuUserId = signal<string | null>(null);

  // Report modal
  isReportOpen = signal(false);
  reportTitle = signal('');
  reportSubtitle = signal('');
  reportUserId = signal('');
  reportRole = signal('');
  reportStatus = signal('');
  reportJoined = signal('');
  reportSummary = signal('');

  // Add User modal
  isAddUserOpen = signal(false);
  newUserName = signal('');
  newUserEmail = signal('');
  newUserRole = signal<User['role']>('PLAYER');
  newUserStatus = signal<User['status']>('Active');
  addUserErrors = signal<{ name: string; email: string }>({ name: '', email: '' });

  // Edit User modal
  isEditUserOpen = signal(false);
  editUserTargetId = signal<string>('');
  editUserUserId = signal<string>('');
  editUserName = signal('');
  editUserEmail = signal('');
  editUserRole = signal<User['role']>('PLAYER');
  editUserStatus = signal<User['status']>('Active');
  editUserErrors = signal<{ name: string; email: string }>({ name: '', email: '' });

  // Stats
  totalUsers = computed(() => this.originalUsers().length);
  totalFieldOwners = computed(() => this.originalUsers().filter(u => u.role === 'FIELD OWNER').length);
  totalPlayers = computed(() => this.originalUsers().filter(u => u.role === 'PLAYER' && u.status === 'Active').length);
  totalPending = computed(() => this.originalUsers().filter(u => u.status === 'Pending').length);

  shownCountLabel = computed(() => {
    const c = this.filteredUsers().length;
    return c === 0 ? '0' : `1–${c}`;
  });

  constructor() {
    effect(() => {
      this.originalUsers();
      this.searchTerm();
      this.roleFilter();
      this.statusFilter();
      this.recomputeFiltered();
    });
  }

  // Close menu on outside click
  @HostListener('document:click')
  onDocClick(): void {
    if (this.openMenuUserId()) this.openMenuUserId.set(null);
  }

  toggleRowMenu(userId: string, ev: MouseEvent): void {
    ev.stopPropagation();
    this.openMenuUserId.set(this.openMenuUserId() === userId ? null : userId);
  }

  // -------------------------
  // Search + Filters
  // -------------------------
  setSearch(v: string): void {
    this.searchTerm.set(v ?? '');
  }

  setRoleFilter(v: string): void {
    this.roleFilter.set((v ?? 'ALL') as RoleFilter);
  }

  setStatusFilter(v: string): void {
    this.statusFilter.set((v ?? 'ALL') as StatusFilter);
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.roleFilter.set('ALL');
    this.statusFilter.set('ALL');
  }

  private recomputeFiltered(): void {
    const src = this.cloneUsers(this.originalUsers());

    const term = this.normalize(this.searchTerm());
    const rf = this.roleFilter();
    const sf = this.statusFilter();

    let out = src;

    if (rf !== 'ALL') out = out.filter(u => u.role === rf);
    if (sf !== 'ALL') out = out.filter(u => u.status === sf);

    if (term) {
      out = out.filter(u => {
        const hay = [u.name, u.email, u.userId, u.id, u.role, u.status, u.joinedDate].join(' ');
        return this.normalize(hay).includes(term);
      });
    }

    this.filteredUsers.set(out);
  }

  // -------------------------
  // Actions
  // -------------------------
  openUserReport(user: User): void {
    this.openMenuUserId.set(null);

    const u = { ...user };
    this.reportTitle.set(u.name);
    this.reportSubtitle.set(u.email);
    this.reportUserId.set(u.userId);
    this.reportRole.set(u.role);
    this.reportStatus.set(u.status);
    this.reportJoined.set(u.joinedDate);
    this.reportSummary.set(this.buildUserSummary(u));

    this.isReportOpen.set(true);
  }

  closeReport(): void {
    this.isReportOpen.set(false);
  }

  toggleActive(user: User): void {
    this.openMenuUserId.set(null);

    const nextStatus: User['status'] = user.status === 'Active' ? 'Suspended' : 'Active';

    this.originalUsers.set(
      this.originalUsers().map(u => (u.userId === user.userId ? { ...u, status: nextStatus } : { ...u })),
    );
  }

  deleteUser(user: User): void {
    this.openMenuUserId.set(null);

    this.originalUsers.set(this.originalUsers().filter(u => u.userId !== user.userId).map(u => ({ ...u })));

    // If deleting user currently in report/edit, close
    if (this.isReportOpen() && this.reportUserId() === user.userId) this.closeReport();
    if (this.isEditUserOpen() && this.editUserTargetId() === user.userId) this.closeEditUser();
  }

  // -------------------------
  // Edit
  // -------------------------
  openEditUser(user: User): void {
    this.openMenuUserId.set(null);

    this.editUserErrors.set({ name: '', email: '' });

    this.editUserTargetId.set(user.userId);
    this.editUserUserId.set(user.userId);
    this.editUserName.set(user.name);
    this.editUserEmail.set(user.email);
    this.editUserRole.set(user.role);
    this.editUserStatus.set(user.status);

    this.isEditUserOpen.set(true);
  }

  closeEditUser(): void {
    this.isEditUserOpen.set(false);
  }

  submitEditUser(): void {
    const name = (this.editUserName() ?? '').trim();
    const email = (this.editUserEmail() ?? '').trim();
    const role = this.editUserRole();
    const status = this.editUserStatus();

    const errors = { name: '', email: '' };
    if (!name) errors.name = 'Name is required.';
    if (!email) errors.email = 'Email is required.';
    else if (!this.isValidEmail(email)) errors.email = 'Enter a valid email.';
    this.editUserErrors.set(errors);

    if (errors.name || errors.email) return;

    const targetId = this.editUserTargetId();

    this.originalUsers.set(
      this.originalUsers().map(u =>
        u.userId === targetId
          ? { ...u, name, email, role, status }
          : { ...u }
      ),
    );

    this.isEditUserOpen.set(false);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
  }

  // -------------------------
  // Export CSV
  // -------------------------
  exportCsv(): void {
    const rows = this.filteredUsers();

    const headers = ['Name', 'Email', 'User ID', 'Role', 'Status', 'Joined Date'];
    const dataLines = rows.map(u => [u.name, u.email, u.userId, u.role, u.status, u.joinedDate]);

    const csv = [
      headers.map(this.csvEscape).join(','),
      ...dataLines.map(cols => cols.map(this.csvEscape).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `user-directory-${this.fileSafeDate(new Date())}.csv`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private csvEscape = (value: unknown): string => {
    const s = String(value ?? '');
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  private fileSafeDate(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;
  }

  // -------------------------
  // Add user (existing from earlier version)
  // -------------------------
  openAddUser(): void {
    this.addUserErrors.set({ name: '', email: '' });
    this.newUserName.set('');
    this.newUserEmail.set('');
    this.newUserRole.set('PLAYER');
    this.newUserStatus.set('Active');
    this.isAddUserOpen.set(true);
  }

  closeAddUser(): void {
    this.isAddUserOpen.set(false);
  }

  submitAddUser(): void {
    const name = (this.newUserName() ?? '').trim();
    const email = (this.newUserEmail() ?? '').trim();
    const role = this.newUserRole();
    const status = this.newUserStatus();

    const errors = { name: '', email: '' };
    if (!name) errors.name = 'Name is required.';
    if (!email) errors.email = 'Email is required.';
    else if (!this.isValidEmail(email)) errors.email = 'Enter a valid email.';
    this.addUserErrors.set(errors);

    if (errors.name || errors.email) return;

    const joinedDate = this.formatJoinedDate(new Date());
    const userId = this.generateUserId(role);

    const newUser: User = { id: userId, userId, name, email, role, status, joinedDate };

    this.originalUsers.set([newUser, ...this.originalUsers().map(u => ({ ...u }))]);
    this.isAddUserOpen.set(false);
  }
  openGrowthReport(): void {
    this.openMenuUserId.set(null);

    this.reportTitle.set('Growth Insight');
    this.reportSubtitle.set('Directory overview based on current filters.');

    this.reportUserId.set('—');
    this.reportRole.set(this.roleFilter() === 'ALL' ? 'All Roles' : this.roleFilter());
    this.reportStatus.set(this.statusFilter() === 'ALL' ? 'All Status' : this.statusFilter());
    this.reportJoined.set('—');

    const total = this.displayedUsers().length;
    const active = this.displayedUsers().filter((u) => u.status === 'Active').length;
    const pending = this.displayedUsers().filter((u) => u.status === 'Pending').length;
    const suspended = this.displayedUsers().filter((u) => u.status === 'Suspended').length;

    this.reportSummary.set(
      `Current view contains ${total} user(s). Active: ${active}. Pending: ${pending}. Suspended: ${suspended}.`,
    );

    this.isReportOpen.set(true);
  }
  private generateUserId(role: User['role']): string {
    const prefix = role === 'STAFF' ? 'STAFF' : 'KC';
    const existing = new Set(this.originalUsers().map(u => u.userId));

    let id = `${prefix}-${Math.floor(10000 + Math.random() * 89999)}`;
    while (existing.has(id)) id = `${prefix}-${Math.floor(10000 + Math.random() * 89999)}`;

    return id;
  }

  private formatJoinedDate(d: Date): string {
    const mon = d.toLocaleString(undefined, { month: 'short' });
    const day = String(d.getDate()).padStart(2, '0');
    return `${mon} ${day}, ${d.getFullYear()}`;
  }

  // -------------------------
  // UI helpers
  // -------------------------
  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map(p => p[0]).join('').toUpperCase();
  }

  getRoleClass(role: string) {
    switch (role) {
      case 'PLAYER': return 'bg-[#DCFCE7] text-[#166534]';
      case 'FIELD OWNER': return 'bg-[#DBEAFE] text-[#1E40AF]';
      case 'STAFF': return 'bg-[#F1F5F9] text-[#475569]';
      default: return 'bg-slate-100 text-slate-500';
    }
  }

  getStatusDotClass(status: string) {
    switch (status) {
      case 'Active': return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]';
      case 'Pending': return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]';
      case 'Suspended': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]';
      default: return 'bg-slate-300';
    }
  }

  private buildUserSummary(u: User): string {
    const statusLine =
      u.status === 'Active'
        ? 'User is currently active on the platform.'
        : u.status === 'Pending'
          ? 'User is pending verification and may require review.'
          : 'User access is suspended and requires admin action to restore.';

    const roleLine =
      u.role === 'PLAYER'
        ? 'Role: Player account used to book and manage reservations.'
        : u.role === 'FIELD OWNER'
          ? 'Role: Field Owner account managing venues and bookings.'
          : 'Role: Staff account with internal access permissions.';

    return `${roleLine} ${statusLine}`;
  }

  // -------------------------
  // Utilities
  // -------------------------
  private cloneUsers(list: User[]): User[] {
    return list.map(u => ({ ...u }));
  }

  private normalize(s: string): string {
    return (s ?? '').toLowerCase().trim();
  }
}