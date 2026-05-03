import { ActivatedRoute, Router } from '@angular/router';
// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-court-owner-finance',
//   imports: [],
//   templateUrl: './court-owner-finance.component.html',
//   styleUrl: './court-owner-finance.component.scss'
// })
// export class CourtOwnerFinanceComponent {

// }
import { Component, ChangeDetectionStrategy, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";

interface Transaction {
  id: string;
  date: string; // "Oct 24, 2023"
  time: string;
  method: 'InstaPay' | 'Wallet';
  amount: number;
  status: 'Verified' | 'Pending';
}

type StatusFilter = 'All' | 'Verified' | 'Pending';
type MonthKey = string; // "YYYY-MM"

@Component({
  selector: 'app-court-owner-finance',
  imports: [CommonModule, RouterLink],
  templateUrl: './court-owner-finance.component.html',
  styleUrl: './court-owner-finance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourtOwnerFinanceComponent {
  private readonly router = inject(Router)
  filterStatus = signal<StatusFilter>('All');

  // Search
  searchQuery = signal<string>('');

  // Date filter (defaults to current month)
  selectedMonth = signal<MonthKey>(this.toMonthKey(new Date()));

  // Month picker popover
  isMonthPickerOpen = signal<boolean>(false);
  monthPickerYear = signal<number>(new Date().getFullYear());

  // Row action menu
  openTxMenuId = signal<string | null>(null);

  // Outstanding dues
  outstandingDues = signal<number>(3120);

  // Simple demand proxy for Optimize Pricing (0..1)
  demandIndex = signal<number>(0.65);

  transactions = signal<Transaction[]>([
    { id: '#TXN-99821834', date: 'MAY 24, 2026', time: '14:20 PM', method: 'InstaPay', amount: 1250.0, status: 'Verified' },
    { id: '#TXN-99818821', date: 'JUN 22, 2026', time: '09:15 AM', method: 'Wallet', amount: 450.0, status: 'Pending' },
    { id: '#TXN-99817550', date: 'Jan 21, 2024', time: '18:45 PM', method: 'InstaPay', amount: 3000.0, status: 'Verified' },
    { id: '#TXN-99812402', date: 'Oct 19, 2025', time: '11:30 AM', method: 'InstaPay', amount: 850.0, status: 'Verified' },
  ]);

  dateRangeLabel = computed(() => {
    const [yStr, mStr] = this.selectedMonth().split('-');
    const y = Number(yStr);
    const m = Number(mStr); // 1-12
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0);
    const startLabel = this.formatShortDate(start);
    const endLabel = this.formatShortDate(end);
    return `${startLabel} - ${endLabel}`;
  });

  monthPickerLabel = computed(() => `${this.monthPickerYear()}`);

  monthGrid = computed(() => {
    const y = this.monthPickerYear();
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return labels.map((label, idx) => {
      const m = String(idx + 1).padStart(2, '0');
      return { key: `${y}-${m}`, label };
    });
  });

  // Derived list with ALL filters (status + search + month)
  filteredTransactions = computed(() => {
    const status = this.filterStatus();
    const q = this.searchQuery().trim().toLowerCase();
    const month = this.selectedMonth();

    return this.transactions().filter((tx) => {
      if (status !== 'All' && tx.status !== status) return false;

      const txMonth = this.toMonthKey(this.parseTxDate(tx.date));
      if (txMonth !== month) return false;

      if (!q) return true;

      const hay = [tx.id, tx.date, tx.time, tx.method, tx.status, String(tx.amount)].join(' ').toLowerCase();
      return hay.includes(q);
    });
  });

  totalPaid = computed(() => {
    const month = this.selectedMonth();
    return this.transactions()
      .filter((t) => this.toMonthKey(this.parseTxDate(t.date)) === month)
      .filter((t) => t.status === 'Verified')
      .reduce((sum, t) => sum + t.amount, 0);
  });

  constructor() {
    effect(() => {
      this.filterStatus();
      this.searchQuery();
      this.selectedMonth();
      this.openTxMenuId.set(null);
    });

    effect(() => {
      const [yStr] = this.selectedMonth().split('-');
      const y = Number(yStr);
      if (!Number.isNaN(y)) this.monthPickerYear.set(y);
    });
  }

  // 1) Settle Dues Now
  settleDuesNow(): void {
    const due = this.outstandingDues();
    if (due <= 0) return;

    const now = new Date();
    const id = `#DUE-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getTime()).slice(-5)}`;

    const tx: Transaction = {
      id,
      date: this.formatTxDate(now),
      time: this.formatTxTime(now),
      method: 'Wallet',
      amount: due,
      status: 'Verified',
    };

    this.transactions.update((items) => [tx, ...items]);
    this.outstandingDues.set(0);
    setTimeout(() => {
      this.router.navigate(['//CourtOwner/Billing&Payments']);
    }, 3000);
  }

  // 2) Download Button (CSV of CURRENT filtered view)
  downloadTransactionsCsv(): void {
    const rows = this.filteredTransactions();

    const header = ['Date', 'Time', 'Transaction ID', 'Method', 'Amount (EGP)', 'Status'].join(',');
    const lines = rows.map((t) =>
      [t.date, t.time, t.id, t.method, t.amount.toFixed(2), t.status]
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(','),
    );

    const csv = [header, ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-history-${this.selectedMonth()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }

  // 3) Action Button (row menu actions)
  toggleTxMenu(id: string): void {
    this.openTxMenuId.set(this.openTxMenuId() === id ? null : id);
  }

  setTxStatus(id: string, status: Transaction['status']): void {
    this.transactions.update((items) => items.map((t) => (t.id === id ? { ...t, status } : t)));
    this.openTxMenuId.set(null);
  }

  removeTransaction(id: string): void {
    this.transactions.update((items) => items.filter((t) => t.id !== id));
    this.openTxMenuId.set(null);
  }

  // 4) Optimize Pricing Logic (IMPORTANT)
  optimizePricing(): void {
    const month = this.selectedMonth();

    const inMonth = this.transactions().filter((t) => this.toMonthKey(this.parseTxDate(t.date)) === month);
    const total = inMonth.length || 1;
    const pending = inMonth.filter((t) => t.status === 'Pending').length;

    // Availability proxy: more pending = higher availability (less demand)
    const availabilityRatio = pending / total; // 0..1
    const demandRatio = 1 - availabilityRatio; // 0..1

    // Dynamic multiplier based on demandRatio
    // high demand -> increase up to +12%
    // low demand  -> decrease down to -8%
    const multiplier =
      demandRatio >= 0.7 ? 1.12 :
        demandRatio >= 0.45 ? 1.06 :
          demandRatio >= 0.25 ? 1.0 :
            0.92;

    this.demandIndex.set(demandRatio);

    this.transactions.update((items) =>
      items.map((t) => {
        const sameMonth = this.toMonthKey(this.parseTxDate(t.date)) === month;
        if (!sameMonth) return t;

        // Apply only to Pending as "recommended price"
        if (t.status !== 'Pending') return t;

        const nextAmount = this.round2(t.amount * multiplier);
        return { ...t, amount: nextAmount };
      }),
    );
  }

  // 5) Search Function
  onSearchInput(value: string): void {
    this.searchQuery.set(value ?? '');
  }

  // 6) Date Filter Enhancement: ANY month via month picker
  toggleMonthPicker(): void {
    this.isMonthPickerOpen.set(!this.isMonthPickerOpen());
  }

  shiftMonth(deltaYears: number): void {
    this.monthPickerYear.set(this.monthPickerYear() + deltaYears);
  }

  setMonthFilter(monthKey: MonthKey): void {
    this.selectedMonth.set(monthKey);
    this.isMonthPickerOpen.set(false);
  }

  // --------------------------
  // Helpers
  // --------------------------
  private round2(n: number): number {
    return Math.round(n * 100) / 100;
  }

  private parseTxDate(dateLabel: string): Date {
    const d = new Date(dateLabel);
    if (!Number.isNaN(d.getTime())) return d;

    const parts = dateLabel.replace(',', '').split(' ');
    const mon = parts[0];
    const day = Number(parts[1]);
    const year = Number(parts[2]);
    const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(mon);
    return new Date(year, Math.max(0, monthIndex), day);
  }

  private toMonthKey(d: Date): MonthKey {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  private formatShortDate(d: Date): string {
    const mon = d.toLocaleString(undefined, { month: 'short' });
    return `${mon} ${d.getDate()}`;
  }

  private formatTxDate(d: Date): string {
    const mon = d.toLocaleString(undefined, { month: 'short' });
    return `${mon} ${d.getDate()}, ${d.getFullYear()}`;
  }

  private formatTxTime(d: Date): string {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const suffix = d.getHours() >= 12 ? 'PM' : 'AM';
    return `${hh}:${mm} ${suffix}`;
  }
}