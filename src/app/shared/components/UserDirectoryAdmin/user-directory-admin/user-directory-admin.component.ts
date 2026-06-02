import { Component, ChangeDetectionStrategy, signal, computed, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardService } from '../../../../core/services/AdminDashboard/admin-dashboard.service';
import { IAdminDashboard, RecentBooking } from '../../../interfaces/iadmin-dashboard';
import { AdminFinancialsService } from '../../../../core/services/AdminFinancials/admin-financials.service';

@Component({
  selector: 'app-user-directory-admin',
  imports: [CommonModule],
  templateUrl: './user-directory-admin.component.html',
  styleUrl: './user-directory-admin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDirectoryAdminComponent implements OnInit {
  private readonly adminDashboardService = inject(AdminDashboardService);
  private readonly adminFinancialsService = inject(AdminFinancialsService);
  dashboardData = signal<IAdminDashboard | null>(null);
  recentBookings = computed(() => this.dashboardData()?.recent_bookings ?? []);
  totalBookingsCount = computed(() => this.filteredBookings().length);
  searchTerm = signal<string>('');
  statusFilter = signal<string>('ALL');
  currentPage = signal<number>(1);
  pageSize = 10;
  private filteredBookings = computed(() => {
    const bookings = this.recentBookings();
    const term = this.normalize(this.searchTerm());
    const status = this.statusFilter();

    let filtered = bookings;

    if (status !== 'ALL') {
      filtered = filtered.filter(b => this.normalize(b.status) === this.normalize(status));
    }

    if (term) {
      filtered = filtered.filter(b => {
        const haystack = `${b.id} ${b.customer.name} ${b.customer.email} ${b.court.name} ${b.maincourt.name}`;
        return this.normalize(haystack).includes(term);
      });
    }

    return filtered;
  });

  totalPages = computed(() => Math.ceil(this.filteredBookings().length / this.pageSize) || 1);

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }
    if (current - delta > 2) range.unshift('...');
    if (current + delta < total - 1) range.push('...');
    range.unshift(1);
    if (total !== 1) range.push(total);
    return range.filter((v, i, a) => a.indexOf(v) === i);
  });

  displayedBookings = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredBookings().slice(start, end);
  });

  shownCountLabel = computed(() => {
    const total = this.filteredBookings().length;
    const start = (this.currentPage() - 1) * this.pageSize + 1;
    const end = Math.min(start + this.pageSize - 1, total);
    if (total === 0) return '0';
    return `${start}–${end}`;
  });

  constructor() {
    effect(() => {
      this.filteredBookings();
      this.currentPage.set(1);
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.adminDashboardService.DashboardOverview().subscribe({
      next: (res) => {
        this.dashboardData.set(res.data);
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
      }
    });
  }
  setSearch(value: string): void {
    this.searchTerm.set(value);
  }

  setStatusFilter(value: string): void {
    this.statusFilter.set(value);
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('ALL');
  }
  goToPage(page: number | string): void {
    if (typeof page === 'number') {
      this.currentPage.set(Math.min(Math.max(1, page), this.totalPages()));
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }
  getStatusClass(status: string): string {
    const s = status.toLowerCase();
    if (s === 'confirmed' || s === 'completed') {
      return 'bg-[#DCFCE7] text-[#166534]';
    } else if (s === 'pending') {
      return 'bg-[#FEF9C3] text-[#854D0E]';
    } else if (s === 'rejected' || s === 'cancelled') {
      return 'bg-[#FEE2E2] text-[#991B1B]';
    }
    return 'bg-slate-100 text-slate-500';
  }
  exportCsv(): void {
    const bookings = this.filteredBookings();
    const headers = [
      'Booking ID', 'Customer Name', 'Customer Email', 'Customer Phone',
      'Court Name', 'Court Type', 'Main Stadium', 'Total Price',
      'Status', 'Booking Date'
    ];
    const dataLines = bookings.map(b => [
      b.id,
      b.customer.name,
      b.customer.email,
      b.customer.phone,
      b.court.name,
      b.court.type,
      b.maincourt.name,
      b.total_price,
      b.status,
      b.created_at
    ]);

    const csv = [
      headers.map(this.csvEscape).join(','),
      ...dataLines.map(row => row.map(this.csvEscape).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${this.fileSafeDate(new Date())}.csv`;
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

  private normalize(s: string): string {
    return (s ?? '').toLowerCase().trim();
  }
}