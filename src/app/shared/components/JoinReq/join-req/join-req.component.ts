import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { AdminManageCourtsService } from '../../../../core/services/AdminManageCourts/admin-manage-courts.service';
import { AdminDashboardService } from '../../../../core/services/AdminDashboard/admin-dashboard.service';
import { IAdminDashboard } from '../../../interfaces/iadmin-dashboard';
import { IAdminMainCourts } from '../../../interfaces/iadmin-main-courts';
import { environments } from '../../../../shared/environment';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-join-req',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './join-req.component.html',
  styleUrl: './join-req.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinReqComponent implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly adminManageCourtsService = inject(AdminManageCourtsService);
  private readonly adminDashboardService = inject(AdminDashboardService);
  private readonly http = inject(HttpClient);
  dashboardData = signal<IAdminDashboard | null>(null);
  totalMainCourts = computed(() => this.dashboardData()?.total_maincourts ?? 0);
  verifiedMainCourts = computed(() => this.dashboardData()?.verified_maincourts ?? 0);
  pendingMainCourts = computed(() => this.dashboardData()?.pending_maincourts ?? 0);
  allCourts = signal<IAdminMainCourts[]>([]);
  searchTerm = signal('');
  locationFilter = signal('ALL');
  currentPage = signal(1);
  readonly pageSize = 10;
  filteredCourts = computed(() => {
    let courts = this.allCourts();
    const term = this.searchTerm().toLowerCase();
    const location = this.locationFilter();

    if (term) {
      courts = courts.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.owner.name.toLowerCase().includes(term) ||
        c.address.toLowerCase().includes(term)
      );
    }

    if (location && location !== 'ALL') {
      courts = courts.filter(c => c.address.toLowerCase().includes(location.toLowerCase()));
    }

    return courts;
  });
  totalPages = computed(() => {
    const total = this.filteredCourts().length;
    return total === 0 ? 1 : Math.ceil(total / this.pageSize);
  });
  pagedCourts = computed(() => {
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredCourts().slice(start, end);
  });
  showingFrom = computed(() => {
    if (this.filteredCourts().length === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize + 1;
  });

  showingTo = computed(() => {
    return Math.min(this.currentPage() * this.pageSize, this.filteredCourts().length);
  });
  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (current > 3) pages.push(-1);

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push(-1);

    pages.push(total);

    return pages;
  });


  activeManageMenuId = signal<number | null>(null);


  suspendModalOpen = signal(false);
  suspendReason = signal('');
  suspendReasonError = signal('');
  selectedCourtForSuspend = signal<IAdminMainCourts | null>(null);


  availableLocations = computed(() => {
    const locations = new Set<string>();
    this.allCourts().forEach(court => {
      if (court.address) locations.add(court.address.split(',')[0]?.trim() || court.address);
    });
    return Array.from(locations).sort();
  });

  ngOnInit(): void {
    this.loadDashboard();
    this.loadCourts();
  }

  loadDashboard(): void {
    this.adminDashboardService.DashboardOverview().subscribe({
      next: (res) => {
        this.dashboardData.set(res.data);
      }
    });
  }

  loadCourts(): void {
    this.adminManageCourtsService.ShowAllCourts().subscribe({
      next: (res) => {
        this.allCourts.set(res.data);
        this.currentPage.set(1);
      },
    });
  }

  setSearch(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  setLocationFilter(value: string): void {
    this.locationFilter.set(value);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    const total = this.totalPages();
    if (page < 1 || page > total) return;
    this.currentPage.set(page);
  }

  toggleManageMenu(courtId: number): void {
    if (this.activeManageMenuId() === courtId) {
      this.activeManageMenuId.set(null);
    } else {
      this.activeManageMenuId.set(courtId);
    }
  }

  verifyCourt(court: IAdminMainCourts): void {
    this.adminManageCourtsService.VerifyCourt(court.id).subscribe({
      next: () => {
        const updatedCourts = this.allCourts().map(c =>
          c.id === court.id ? { ...c, is_verified: true } : c
        );
        this.allCourts.set(updatedCourts);
        this.activeManageMenuId.set(null);
        this.toastService.success('Court verified successfully');
      },
    });
  }

  openSuspendModal(court: IAdminMainCourts): void {
    this.selectedCourtForSuspend.set(court);
    this.suspendReason.set('');
    this.suspendReasonError.set('');
    this.suspendModalOpen.set(true);
    this.activeManageMenuId.set(null);
  }

  closeSuspendModal(): void {
    this.suspendModalOpen.set(false);
    this.selectedCourtForSuspend.set(null);
    this.suspendReason.set('');
    this.suspendReasonError.set('');
  }

  confirmSuspend(): void {
    const reason = this.suspendReason().trim();
    if (!reason) {
      this.suspendReasonError.set('Suspension reason is required.');
      return;
    }

    const court = this.selectedCourtForSuspend();
    if (!court) return;

    this.http.put(`${environments.baseUrl}/admin/maincourts/${court.id}/suspend`, { suspension_reason: reason })
      .subscribe({
        next: () => {
          const updatedCourts = this.allCourts().map(c =>
            c.id === court.id ? { ...c, status: 'inactive' } : c
          );
          this.allCourts.set(updatedCourts);
          this.closeSuspendModal();
          this.toastService.success('Court suspended successfully');
        },
      });
  }
}