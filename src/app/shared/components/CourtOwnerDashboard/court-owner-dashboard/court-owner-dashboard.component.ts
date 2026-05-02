// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-court-owner-dashboard',
//   imports: [],
//   templateUrl: './court-owner-dashboard.component.html',
//   styleUrl: './court-owner-dashboard.component.scss'
// })
// export class CourtOwnerDashboardComponent {

// }
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
interface ChartBar {
  label: string;
  totalHeight: number;
  revenueRatio: number;
  value: string;
}
@Component({
  selector: 'app-court-owner-dashboard',
  imports: [CommonModule],
  templateUrl: './court-owner-dashboard.component.html',
  styleUrl: './court-owner-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class CourtOwnerDashboardComponent {
  viewType = signal<'weekly' | 'monthly'>('weekly');
  hoveredBar = signal<ChartBar | null>(null);

  weekRangeLabel = computed(() => {
    const now = new Date();
    const day = now.getDay() || 7;
    const mon = new Date(now);
    mon.setDate(now.getDate() - day + 1);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    return `${mon.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sun.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  });

  activeData = computed(() => {
    return this.viewType() === 'weekly' ? this.getWeeklyData() : this.getMonthlyData();
  });

  totalRevenue = computed(() => {
    const isWeekly = this.viewType() === 'weekly';
    return isWeekly ? '$14,280' : '$248,420';
  });

  avgUtilization = computed(() => {
    return this.viewType() === 'weekly' ? '74' : '82';
  });

  setView(type: 'weekly' | 'monthly') {
    this.viewType.set(type);
    this.hoveredBar.set(null);
  }

  isCurrent(label: string): boolean {
    const now = new Date();
    if (this.viewType() === 'weekly') {
      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      return label === days[now.getDay()];
    } else {
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      return label === months[now.getMonth()];
    }
  }

  private getWeeklyData(): ChartBar[] {
    return [
      { label: 'MON', totalHeight: 110, revenueRatio: 30, value: '$1.2k' },
      { label: 'TUE', totalHeight: 140, revenueRatio: 40, value: '$1.8k' },
      { label: 'WED', totalHeight: 90, revenueRatio: 20, value: '$0.9k' },
      { label: 'THU', totalHeight: 160, revenueRatio: 50, value: '$2.1k' },
      { label: 'FRI', totalHeight: 180, revenueRatio: 60, value: '$3.5k' },
      { label: 'SAT', totalHeight: 220, revenueRatio: 75, value: '$4.2k' },
      { label: 'SUN', totalHeight: 190, revenueRatio: 65, value: '$3.8k' },
    ];
  }

  private getMonthlyData(): ChartBar[] {
    return [
      { label: 'JAN', totalHeight: 120, revenueRatio: 30, value: '$10.2k' },
      { label: 'FEB', totalHeight: 150, revenueRatio: 40, value: '$12.5k' },
      { label: 'MAR', totalHeight: 100, revenueRatio: 25, value: '$9.1k' },
      { label: 'APR', totalHeight: 180, revenueRatio: 35, value: '$15.2k' },
      { label: 'MAY', totalHeight: 140, revenueRatio: 30, value: '$11.8k' },
      { label: 'JUN', totalHeight: 220, revenueRatio: 45, value: '$14.2k' },
      { label: 'JUL', totalHeight: 160, revenueRatio: 30, value: '$13.0k' },
    ];
  }
}
