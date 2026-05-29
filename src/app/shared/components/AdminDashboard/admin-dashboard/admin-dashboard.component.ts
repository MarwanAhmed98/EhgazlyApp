import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { ToastService } from '../../../../core/services/toast/toast.service';
import { AdminDashboardService } from '../../../../core/services/AdminDashboard/admin-dashboard.service';

type RevenueView = 'weekly' | 'monthly';

type ChartPoint = {
  key: string;      // unique key
  label: string;    // tooltip label
  value: number;    // tooltip numeric value
  heightPct: number; // 6..100 for bar height
  className: string;
};

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly adminDashboardService = inject(AdminDashboardService);
  // Toggle
  revenueView = signal<RevenueView>('weekly');

  // Tooltip
  hoveredKey = signal<string | null>(null);
  tooltip = signal<{ label: string; value: number; x: number; y: number } | null>(null);

  // Seeded stable sample data (no refresh needed; deterministic)
  private readonly weeklyDailyValues: number[] = [120_000, 95_000, 150_000, 110_000, 175_000, 210_000, 160_000]; // Mon..Sun
  private readonly monthlyWeekValues: number[] = [260_000, 310_000, 285_000, 345_000, 295_000]; // Week 1..5 (current month)

  // Current week range (Mon..Sun)
  readonly currentWeekRangeLabel = computed(() => {
    const { start, end } = this.getCurrentWeekRange();
    return `${this.formatShortMonthDay(start)} - ${this.formatShortMonthDay(end)}`;
  });

  // Current month label
  readonly currentMonthLabel = computed(() => {
    const now = new Date();
    const mon = now.toLocaleString(undefined, { month: 'short' });
    return `${mon} ${now.getFullYear()}`;
  });

  // Header number (aggregated)
  readonly revenueTotalLabel = computed(() => {
    const total = this.revenueView() === 'weekly'
      ? this.weeklyDailyValues.reduce((a, b) => a + b, 0)
      : this.monthlyWeekValues.reduce((a, b) => a + b, 0);

    return `EGP ${this.formatCompact(total)}`;
  });

  readonly revenueDeltaLabel = computed(() => '+18.4%');

  // Chart points used by template
  readonly revenueChartPoints = computed<ChartPoint[]>(() => {
    const view = this.revenueView();

    const points = view === 'weekly'
      ? this.buildWeeklyPoints()
      : this.buildMonthlyPoints();

    return points;
  });
  ngOnInit(): void {
    this.GetDashboardOverview();
  }
  setRevenueView(view: RevenueView): void {
    this.revenueView.set(view);
    this.clearTooltip();
  }

  // Tooltip handlers (mouse + touch)
  onBarEnter(ev: MouseEvent, p: ChartPoint): void {
    this.hoveredKey.set(p.key);
    this.updateTooltipFromEvent(ev, p);
  }

  onBarMove(ev: MouseEvent, p: ChartPoint): void {
    if (this.hoveredKey() !== p.key) this.hoveredKey.set(p.key);
    this.updateTooltipFromEvent(ev, p);
  }

  onBarLeave(): void {
    this.clearTooltip();
  }

  onBarTouchStart(ev: TouchEvent, p: ChartPoint): void {
    this.hoveredKey.set(p.key);
    const t = ev.touches[0];
    if (!t) return;
    this.tooltip.set({
      label: p.label,
      value: p.value,
      x: t.clientX,
      y: t.clientY,
    });
  }

  onBarTouchMove(ev: TouchEvent, p: ChartPoint): void {
    const t = ev.touches[0];
    if (!t) return;
    this.tooltip.set({
      label: p.label,
      value: p.value,
      x: t.clientX,
      y: t.clientY,
    });
  }

  onBarTouchEnd(): void {
    this.clearTooltip();
  }

  private clearTooltip(): void {
    this.hoveredKey.set(null);
    this.tooltip.set(null);
  }

  private updateTooltipFromEvent(ev: MouseEvent, p: ChartPoint): void {
    this.tooltip.set({
      label: p.label,
      value: p.value,
      x: ev.clientX,
      y: ev.clientY,
    });
  }

  private buildWeeklyPoints(): ChartPoint[] {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return this.toChartPoints(
      this.weeklyDailyValues.map((v, i) => ({
        key: `w-${i}`,
        label: `${labels[i]} • ${this.currentWeekRangeLabel()}`,
        value: v,
      })),
    );
  }

  private buildMonthlyPoints(): ChartPoint[] {
    const now = new Date();
    const monthLabel = this.currentMonthLabel();
    return this.toChartPoints(
      this.monthlyWeekValues.map((v, i) => ({
        key: `m-${i}`,
        label: `Week ${i + 1} • ${monthLabel}`,
        value: v,
      })),
    );
  }

  private toChartPoints(raw: Array<{ key: string; label: string; value: number }>): ChartPoint[] {
    const values = raw.map((r) => r.value);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);

    return raw.map((r) => {
      const normalized = (r.value - min) / Math.max(1, (max - min)); // 0..1
      const heightPct = Math.round(12 + normalized * 88); // keep visible

      // Keep exact palette logic style (matches existing classes)
      const className =
        heightPct > 80 ? 'bg-[#1A3D24]' :
          heightPct > 62 ? 'bg-[#3E6348]' :
            heightPct > 50 ? 'bg-[#7C2D12]' :
              'bg-[#1A3D24]/20';

      return {
        key: r.key,
        label: r.label,
        value: r.value,
        heightPct,
        className,
      };
    });
  }

  // -----------------------
  // Date helpers
  // -----------------------
  private getCurrentWeekRange(): { start: Date; end: Date } {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const day = d.getDay(); // Sun=0..Sat=6
    const diffToMonday = (day + 6) % 7; // Mon=0 ... Sun=6
    const start = new Date(d);
    start.setDate(d.getDate() - diffToMonday);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  private formatShortMonthDay(d: Date): string {
    const mon = d.toLocaleString(undefined, { month: 'short' });
    return `${mon} ${d.getDate()}`;
  }

  private formatCompact(n: number): string {
    // 1.2M style
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
    return `${n}`;
  }
  GetDashboardOverview(): void {
    this.adminDashboardService.DashboardOverview().subscribe({
      next: (res) => {
        console.log(res);
      }
    })
  }
}