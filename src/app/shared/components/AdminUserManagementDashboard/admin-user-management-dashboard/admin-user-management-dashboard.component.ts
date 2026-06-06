import { Component, computed, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule],
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
  rejectModalOpen = signal<boolean>(false);
  rejectTargetId = signal<number | null>(null);
  rejectionReason = '';
  rejectionReasonTouched = signal<boolean>(false);
  rejectLoading = signal<boolean>(false);
  suspendModalOpen = signal<boolean>(false);
  suspendTargetId = signal<number | null>(null);
  suspensionReason = '';
  suspensionReasonTouched = signal<boolean>(false);
  suspendLoading = signal<boolean>(false);
  isCommissionModalOpen = signal<boolean>(false);
  commissionTargetId = signal<number | null>(null);
  commissionPercentage = signal<number>(0);
  commissionLoading = signal<boolean>(false);
  commissionError = signal<string>('');

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
    });
  }

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
    });
  }
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
  approveOwner(ownerId: number) {
    this.adminManageOwnersService.ApproveOwner(ownerId).subscribe({
      next: () => {
        this.toastService.success('Owner approved');
        this.getOwners();
        this.openDropdownId.set(null);
      },
    });
  }

  activateOwner(ownerId: number) {
    this.adminManageOwnersService.ActivateOwner(ownerId).subscribe({
      next: (res) => {
        this.toastService.success(res.message || 'Owner activated');
        this.getOwners();
        this.openDropdownId.set(null);
      },
    });
  }
  openRejectModal(ownerId: number) {
    this.openDropdownId.set(null);
    this.rejectTargetId.set(ownerId);
    this.rejectionReason = '';
    this.rejectionReasonTouched.set(false);
    this.rejectLoading.set(false);
    this.rejectModalOpen.set(true);
  }

  closeRejectModal() {
    if (this.rejectLoading()) return;
    this.rejectModalOpen.set(false);
    this.rejectTargetId.set(null);
    this.rejectionReason = '';
    this.rejectionReasonTouched.set(false);
  }

  confirmReject() {
    this.rejectionReasonTouched.set(true);
    if (this.rejectionReason.trim().length === 0) return;

    const id = this.rejectTargetId();
    if (id === null) return;

    this.rejectLoading.set(true);
    this.adminManageOwnersService.RejectOwner(id, { rejection_reason: this.rejectionReason.trim() }).subscribe({
      next: (res) => {
        this.toastService.success(res.message || 'Owner rejected');
        this.getOwners();
        this.getDashboard();
        this.rejectLoading.set(false);
        this.rejectModalOpen.set(false);
        this.rejectTargetId.set(null);
        this.rejectionReason = '';
        this.rejectionReasonTouched.set(false);
      },
      error: (err) => {
        const message = err?.error?.message || 'Could not reject owner. Please try again.';
        this.toastService.error(message);
        this.rejectLoading.set(false);
      },
    });
  }

  // Suspend modal
  openSuspendModal(ownerId: number) {
    this.openDropdownId.set(null);
    this.suspendTargetId.set(ownerId);
    this.suspensionReason = '';
    this.suspensionReasonTouched.set(false);
    this.suspendLoading.set(false);
    this.suspendModalOpen.set(true);
  }

  closeSuspendModal() {
    if (this.suspendLoading()) return;
    this.suspendModalOpen.set(false);
    this.suspendTargetId.set(null);
    this.suspensionReason = '';
    this.suspensionReasonTouched.set(false);
  }

  confirmSuspend() {
    this.suspensionReasonTouched.set(true);
    if (this.suspensionReason.trim().length === 0) return;

    const id = this.suspendTargetId();
    if (id === null) return;

    this.suspendLoading.set(true);
    this.adminManageOwnersService.SuspendOwner(id, { suspension_reason: this.suspensionReason.trim() }).subscribe({
      next: (res) => {
        this.toastService.success(res.message || 'Owner suspended');
        this.getOwners();
        this.getDashboard();
        this.suspendLoading.set(false);
        this.suspendModalOpen.set(false);
        this.suspendTargetId.set(null);
        this.suspensionReason = '';
        this.suspensionReasonTouched.set(false);
      },
      error: (err) => {
        const message = err?.error?.message || 'Could not suspend owner. Please try again.';
        this.toastService.error(message);
        this.suspendLoading.set(false);
      },
    });
  }
  openCommissionModal(ownerId: number, currentCommission: string) {
    this.openDropdownId.set(null);
    this.commissionTargetId.set(ownerId);
    this.commissionPercentage.set(currentCommission ? parseFloat(currentCommission) : 0);
    this.commissionError.set('');
    this.commissionLoading.set(false);
    this.isCommissionModalOpen.set(true);
  }

  closeCommissionModal() {
    if (this.commissionLoading()) return;
    this.isCommissionModalOpen.set(false);
    this.commissionTargetId.set(null);
    this.commissionPercentage.set(0);
    this.commissionError.set('');
  }

  confirmCommissionUpdate() {
    const percentage = this.commissionPercentage();
    if (percentage === null || percentage === undefined || isNaN(percentage)) {
      this.commissionError.set('Commission percentage is required');
      return;
    }
    if (percentage < 0) {
      this.commissionError.set('Commission cannot be negative');
      return;
    }
    if (percentage > 100) {
      this.commissionError.set('Commission cannot exceed 100%');
      return;
    }

    const id = this.commissionTargetId();
    if (id === null) return;

    this.commissionLoading.set(true);
    this.adminManageOwnersService.UpdateCommission(id, percentage).subscribe({
      next: (res) => {
        this.toastService.success(res.message || 'Commission updated successfully');
        this.getOwners();  // refresh list to show updated commission
        this.commissionLoading.set(false);
        this.isCommissionModalOpen.set(false);
        this.commissionTargetId.set(null);
        this.commissionPercentage.set(0);
      },
      error: (err) => {
        const message = err?.error?.message || 'Failed to update commission. Please try again.';
        this.toastService.error(message);
        this.commissionLoading.set(false);
        this.commissionError.set(message);
      },
    });
  }
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