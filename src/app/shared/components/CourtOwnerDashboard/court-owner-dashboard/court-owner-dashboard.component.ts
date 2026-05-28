import { OnwerDashboardService } from './../../../../core/services/OwnerDashboard/onwer-dashboard.service';
import { Component, ChangeDetectionStrategy, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICourtOwnerDashboard } from '../../../interfaces/icourt-owner-dashboard';

type DashboardResponse = {
  success: boolean;
  message: string;
  data: ICourtOwnerDashboard;
};

@Component({
  selector: 'app-court-owner-dashboard',
  imports: [CommonModule],
  templateUrl: './court-owner-dashboard.component.html',
  styleUrl: './court-owner-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourtOwnerDashboardComponent implements OnInit {
  private readonly onwerDashboardService = inject(OnwerDashboardService);
  private readonly cdr = inject(ChangeDetectorRef);

  DashboardDetails: ICourtOwnerDashboard | null = null;

  ngOnInit(): void {
    this.GetOwnerDashboard();
  }

  GetOwnerDashboard(): void {
    this.onwerDashboardService.GetOwnerDashboard().subscribe({
      next: (res: DashboardResponse) => {
        this.DashboardDetails = res?.data ?? null;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.log('DASHBOARD ERROR:', err);
      },
    });
  }

  formatStatus(status: string | null | undefined): string {
    const s = String(status ?? '').trim();
    if (!s) return 'info';
    return s.replace(/_/g, ' ').toLowerCase();
  }

  statusBadgeClass(status: string | null | undefined): string {
    const s = String(status ?? '').toLowerCase();

    if (['completed', 'success', 'approved', 'confirmed', 'paid', 'done'].includes(s)) return 'badge--success';
    if (['pending', 'waiting', 'processing', 'in_progress'].includes(s)) return 'badge--pending';
    if (['rejected', 'cancelled', 'canceled', 'failed', 'declined'].includes(s)) return 'badge--danger';
    if (['info', 'new', 'created'].includes(s)) return 'badge--info';

    return 'badge--neutral';
  }

  formatTimeAgo(iso: string | null | undefined): string {
    if (!iso) return '';

    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHr = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
    if (diffDay === 1) return 'Yesterday';

    return d.toLocaleString(undefined, {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}