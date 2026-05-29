import { Component, computed, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { AdminDashboardService } from '../../../../core/services/AdminDashboard/admin-dashboard.service';
import { AdminManageOwnersService } from '../../../../core/services/AdminManageOwners/admin-manage-owners.service';
import { IAdminManageOwners } from '../../../interfaces/iadmin-manage-owners';
import { IAdminDashboard } from '../../../interfaces/iadmin-dashboard';

interface OwnerForDisplay {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  commission: string;
  totalRevenue: string;
  appDueAmount: string;
  remainingBalance: string;
  maincourtsCount: number;
  avatarUrl?: string;
}

@Component({
  selector: 'app-admin-user-management-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-user-management-dashboard.component.html',
  styleUrl: './admin-user-management-dashboard.component.scss',
})
export class AdminUserManagementDashboardComponent implements OnInit, OnDestroy {
  private readonly toastService = inject(ToastService);
  private readonly adminDashboardService = inject(AdminDashboardService);
  private readonly adminManageOwnersService = inject(AdminManageOwnersService);

  dashboardStats = signal<{ total_courtowners: number; pending_owners: number; total_maincourts: number }>({
    total_courtowners: 0,
    pending_owners: 0,
    total_maincourts: 0,
  });

  owners = signal<OwnerForDisplay[]>([]);
  currentPage = signal<number>(1);
  itemsPerPage = 5;
  openDropdownId = signal<number | null>(null);

  ngOnInit(): void {
    this.getDashboard();
    this.getOwners();
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  getFallbackAvatar(name: string): string {
    if (!name) return 'OW';
    return name.trim().substring(0, 2).toUpperCase();
  }

  // Dashboard
  getDashboard(): void {
    this.adminDashboardService.DashboardOverview().subscribe({
      next: (res) => {
        const data: IAdminDashboard = res.data;
        this.dashboardStats.set({
          total_courtowners: data.total_courtowners,
          pending_owners: data.pending_owners,
          total_maincourts: data.total_maincourts,
        });
      },
      error: () => this.toastService.error('Failed to load dashboard stats'),
    });
  }

  // Owners
  getOwners(): void {
    this.adminManageOwnersService.ShowAllOwners().subscribe({
      next: (res) => {
        const ownersList: IAdminManageOwners[] = res.data;
        const mapped = ownersList.map((owner) => ({
          id: owner.id,
          name: owner.user.name,
          email: owner.user.email,
          phone: owner.user.phone,
          status: owner.user.status.toLowerCase(),
          commission: owner.commission_percentage,
          totalRevenue: owner.total_revenue,
          appDueAmount: owner.app_due_amount,
          remainingBalance: owner.remaining_balance,
          maincourtsCount: owner.maincourts_count,
        }));
        this.owners.set(mapped);
      },
      error: () => this.toastService.error('Failed to load owners'),
    });
  }

  // Dropdown logic
  toggleDropdown(ownerId: number, event: Event) {
    event.stopPropagation();
    this.openDropdownId.set(this.openDropdownId() === ownerId ? null : ownerId);
  }

  private handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const isManageButton = target.closest('button')?.innerText === 'Manage';
    if (!isManageButton && this.openDropdownId() !== null) {
      this.openDropdownId.set(null);
    }
  }

  // Actions
  approveOwner(ownerId: number) {
    this.adminManageOwnersService.ApproveOwner(ownerId).subscribe({
      next: () => {
        this.toastService.success('Owner approved');
        this.getOwners();
        this.openDropdownId.set(null);
      },
      error: () => this.toastService.error('Failed to approve owner'),
    });
  }

  activateOwner(ownerId: number) {
    this.adminManageOwnersService.ActivateOwner(ownerId).subscribe({
      next: () => {
        this.toastService.success('Owner activated');
        this.getOwners();
        this.openDropdownId.set(null);
      },
      error: () => this.toastService.error('Failed to activate owner'),
    });
  }

  suspendOwner(ownerId: number) {
    this.adminManageOwnersService.SuspendOwner(ownerId).subscribe({
      next: () => {
        this.toastService.success('Owner suspended');
        this.getOwners();
        this.openDropdownId.set(null);
      },
      error: () => this.toastService.error('Failed to suspend owner'),
    });
  }

  rejectOwner(ownerId: number) {
    this.adminManageOwnersService.RejectOwner(ownerId).subscribe({
      next: () => {
        this.toastService.success('Owner rejected');
        this.getOwners();
        this.openDropdownId.set(null);
      },
      error: () => this.toastService.error('Failed to reject owner'),
    });
  }

  // Pagination
  paginatedOwners = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.owners().slice(start, start + this.itemsPerPage);
  });

  totalOwnersCount = computed(() => this.owners().length);
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalOwnersCount() / this.itemsPerPage)));

  startItemIndex = computed(() => {
    if (this.totalOwnersCount() === 0) return 0;
    return (this.currentPage() - 1) * this.itemsPerPage + 1;
  });

  endItemIndex = computed(() => {
    return Math.min(this.currentPage() * this.itemsPerPage, this.totalOwnersCount());
  });

  totalPagesArray = computed(() => {
    const pages = [];
    for (let i = 1; i <= this.totalPages(); i++) pages.push(i);
    return pages;
  });

  prevPage() {
    if (this.currentPage() > 1) this.currentPage.update((p) => p - 1);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) this.currentPage.update((p) => p + 1);
  }

  setPage(page: number) {
    this.currentPage.set(page);
  }
}