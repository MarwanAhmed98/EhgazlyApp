import { Component, signal, computed, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

type TxStatus = 'Completed' | 'Processing' | 'Refunded' | 'Available';
type TxMethod = 'Wallet' | 'InstaPay' | 'Visa';

type Transaction = {
  id: string;
  venue: string;
  pitch: string;
  location: string;
  venueColor: string;
  player: string;
  initials: string;
  date: string;
  time: string;
  amount: string;
  method: TxMethod;
  status: TxStatus;
};

type FilterAll<T extends string> = T | 'ALL';

@Component({
  selector: 'app-admin-revenues',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-revenues.component.html',
  styleUrl: './admin-revenues.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminRevenuesComponent {
  private readonly originalTransactions = signal<Transaction[]>([
    {
      id: 'TXN-8842',
      venue: 'Al Thumama Pitch',
      pitch: 'Pitch A',
      location: 'Doha',
      venueColor: 'linear-gradient(45deg, #0ea5e9, #3b82f6)',
      player: 'Ahmed M.',
      initials: 'AM',
      date: 'Oct 24, 2023',
      time: '20:00 - 21:00',
      amount: '120.00',
      method: 'Wallet',
      status: 'Completed',
    },
    {
      id: 'TXN-7731',
      venue: 'Legacy Stadium',
      pitch: 'Center Court',
      location: 'Cairo',
      venueColor: 'linear-gradient(45deg, #1e293b, #475569)',
      player: 'Mustafa K.',
      initials: 'MK',
      date: 'Oct 23, 2023',
      time: '18:30 - 20:30',
      amount: '450.00',
      method: 'InstaPay',
      status: 'Processing',
    },
    {
      id: 'TXN-4420',
      venue: 'Unity Field A',
      pitch: 'West Sector',
      location: 'Alexandria',
      venueColor: 'linear-gradient(45deg, #0f172a, #334155)',
      player: 'Sara J.',
      initials: 'SJ',
      date: 'Oct 23, 2023',
      time: '22:00 - 23:00',
      amount: '85.00',
      method: 'Visa',
      status: 'Refunded',
    },
    {
      id: 'TXN-9921',
      venue: 'Dream Turf',
      pitch: 'Main Field',
      location: 'Giza',
      venueColor: 'linear-gradient(45deg, #86efac, #22c55e)',
      player: 'Ziad O.',
      initials: 'ZO',
      date: 'Oct 22, 2023',
      time: '17:00 - 18:00',
      amount: '150.00',
      method: 'Wallet',
      status: 'Available',
    },
  ]);

  private readonly filteredData = signal<Transaction[]>(this.cloneList(this.originalTransactions()));
  filteredTransactions = computed(() => this.filteredData());

  searchQuery = signal<string>('');
  statusFilter = signal<FilterAll<TxStatus>>('ALL');
  methodFilter = signal<FilterAll<TxMethod>>('ALL');

  availableStatuses = computed(() => Array.from(new Set(this.originalTransactions().map(t => t.status))));
  availableMethods = computed(() => Array.from(new Set(this.originalTransactions().map(t => t.method))));

  private readonly weekDays = [
    { label: 'MON', idx: 1 },
    { label: 'TUE', idx: 2 },
    { label: 'WED', idx: 3 },
    { label: 'THU', idx: 4 },
    { label: 'FRI', idx: 5 },
    { label: 'SAT', idx: 6 },
    { label: 'SUN', idx: 0 },
  ] as const;

  constructor() {
    effect(() => {
      this.recompute();
    });
  }

  onSearchInput(v: string): void { this.searchQuery.set(v ?? ''); }
  setStatusFilter(v: string): void { this.statusFilter.set((v as any) ?? 'ALL'); }
  setMethodFilter(v: string): void { this.methodFilter.set((v as any) ?? 'ALL'); }

  private recompute(): void {
    const q = this.normalize(this.searchQuery());
    const status = this.statusFilter();
    const method = this.methodFilter();
    let out = this.cloneList(this.originalTransactions());

    if (status !== 'ALL') out = out.filter(t => t.status === status);
    if (method !== 'ALL') out = out.filter(t => t.method === method);
    if (q) {
      out = out.filter(t => Object.values(t).join(' ').toLowerCase().includes(q));
    }
    this.filteredData.set(out);
  }

  trendData = computed(() => {
    const rows = this.filteredData();
    const map = new Map<number, number>();
    [0, 1, 2, 3, 4, 5, 6].forEach(d => map.set(d, 0));

    for (const r of rows) {
      const d = this.parseUiDate(r.date);
      map.set(d.getDay(), (map.get(d.getDay()) ?? 0) + this.parseAmount(r.amount));
    }

    const values = this.weekDays.map(d => map.get(d.idx) ?? 0);
    const maxValue = Math.max(...values, 100);
    const maxValIdx = values.indexOf(Math.max(...values));

    return this.weekDays.map((d, i) => ({
      dayKey: d.label,
      value: values[i],
      heightPct: Math.max(8, Math.round((values[i] / maxValue) * 100)),
      isMax: i === maxValIdx && values[i] > 0
    }));
  });

  getStatusClass(status: TxStatus): string {
    const classes: Record<TxStatus, string> = {
      'Completed': 'bg-green-50 border-green-200 text-green-700',
      'Processing': 'bg-blue-50 border-blue-200 text-blue-700',
      'Refunded': 'bg-red-50 border-red-200 text-red-700',
      'Available': 'bg-orange-50 border-orange-200 text-orange-700'
    };
    return classes[status] || 'bg-slate-50 border-slate-200 text-slate-700';
  }

  exportCsv(): void {
    const header = ['ID', 'Venue', 'Player', 'Date', 'Amount', 'Status'];
    const lines = this.filteredData().map(r => [r.id, r.venue, r.player, r.date, r.amount, r.status]);
    const csv = [header, ...lines].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenues-${new Date().getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private cloneList<T>(list: T[]): T[] { return list.map(x => ({ ...x })); }
  private normalize(s: string): string { return (s ?? '').trim().toLowerCase(); }
  private parseAmount(s: string): number { return Number(String(s).replace(/,/g, '')) || 0; }
  private parseUiDate(label: string): Date {
    const d = new Date(label);
    if (!isNaN(d.getTime())) return d;
    const parts = label.replace(/,/g, '').split(' ');
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    return new Date(Number(parts[2]), months.indexOf(parts[0].toLowerCase().slice(0, 3)), Number(parts[1]));
  }
}