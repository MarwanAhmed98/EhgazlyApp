import { Component, ChangeDetectionStrategy, signal, computed, effect, HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Transaction {
  date: string;
  time: string;
  description: string;
  subDescription: string;
  refId: string;
  amount: string;
  status: 'OVERDUE' | 'PAID';
  type: 'fee' | 'payment';
}

type StatusFilter = 'ALL' | Transaction['status'];
type MonthKey = string; // "YYYY-MM"

@Component({
  selector: 'app-court-owner-billing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './court-owner-billing.component.html',
  styleUrl: './court-owner-billing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourtOwnerBillingComponent {
  private elementRef = inject(ElementRef);
  private router = inject(Router);
  readonly transactions = signal<Transaction[]>([
    {
      date: 'MAY 24, 2026',
      time: '14:30 PM',
      description: 'Weekly Platform Fee',
      subDescription: '15% commission on 42 bookings',
      refId: 'TXN-88219',
      amount: '1,240.00 EGP',
      status: 'OVERDUE',
      type: 'fee',
    },
    {
      date: 'Oct 17, 2026',
      time: '09:15 AM',
      description: 'Payment Sent',
      subDescription: 'Manual InstaPay Transfer',
      refId: 'TXN-88154',
      amount: '-2,100.00 EGP',
      status: 'PAID',
      type: 'payment',
    },
    {
      date: 'Oct 10, 2025',
      time: '18:00 PM',
      description: 'Weekly Platform Fee',
      subDescription: '15% commission on 38 bookings',
      refId: 'TXN-88012',
      amount: '1,080.00 EGP',
      status: 'PAID',
      type: 'fee',
    },
  ]);

  statusFilter = signal<StatusFilter>('ALL');
  selectedMonth = signal<MonthKey>(this.toMonthKey(new Date()));
  isMonthPickerOpen = signal(false);
  monthPickerYear = signal<number>(new Date().getFullYear());
  isStatusMenuOpen = signal(false);

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isMonthPickerOpen.set(false);
      this.isStatusMenuOpen.set(false);
    }
  }
  filteredTransactions = computed(() => {
    const s = this.statusFilter();
    const month = this.selectedMonth();
    return this.transactions().filter((tx) => {
      if (s !== 'ALL' && tx.status !== s) return false;
      return this.toMonthKey(this.parseTxDate(tx.date)) === month;
    });
  });

  outstandingBalance = computed(() => {
    const month = this.selectedMonth();
    const overdue = this.transactions().filter((tx) =>
      tx.status === 'OVERDUE' && this.toMonthKey(this.parseTxDate(tx.date)) === month
    );
    return this.round2(overdue.reduce((sum, tx) => sum + Math.abs(this.parseAmount(tx.amount)), 0));
  });

  outstandingBalanceDisplay = computed(() => this.formatNumberNoCurrency(this.outstandingBalance()));
  monthPickerLabel = computed(() => `${this.monthPickerYear()}`);

  monthGrid = computed(() => {
    const y = this.monthPickerYear();
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return labels.map((label, idx) => ({ key: `${y}-${String(idx + 1).padStart(2, '0')}`, label }));
  });

  statusFilterLabel = computed(() => (this.statusFilter() === 'ALL' ? 'All Statuses' : this.statusFilter()));

  constructor() {
    effect(() => {
      const [yStr] = this.selectedMonth().split('-');
      const y = Number(yStr);
      if (!Number.isNaN(y)) {
        this.monthPickerYear.set(y);
      }
    }, { allowSignalWrites: true });
  }

  payOutstandingDues(): void {
    const month = this.selectedMonth();
    const due = this.outstandingBalance();
    if (due <= 0) return;

    const overdueIds = new Set(
      this.transactions()
        .filter((tx) => tx.status === 'OVERDUE' && this.toMonthKey(this.parseTxDate(tx.date)) === month)
        .map((tx) => tx.refId),
    );

    if (overdueIds.size === 0) return;
    const now = new Date();

    this.transactions.update((items) => {
      const updated = items.map((tx) => (overdueIds.has(tx.refId) ? { ...tx, status: 'PAID' as const } : tx));
      const paymentTx: Transaction = {
        date: this.formatTxDate(now),
        time: this.formatTxTime(now),
        description: 'Payment Sent',
        subDescription: 'Paid Outstanding Dues',
        refId: `PAY-${now.getTime()}`,
        amount: `-${this.formatNumber2(due)} EGP`,
        status: 'PAID',
        type: 'payment',
      };
      return [paymentTx, ...updated];
    });
    setTimeout(() => {
      this.router.navigate(['/CourtOwner/PaymentInstructions']);
    }, 2000);
    this.isStatusMenuOpen.set(false);
    this.isMonthPickerOpen.set(false);
  }

  toggleStatusMenu(): void {
    this.isStatusMenuOpen.update(v => !v);
    if (this.isStatusMenuOpen()) this.isMonthPickerOpen.set(false);
  }

  setStatusFilter(filter: StatusFilter): void {
    this.statusFilter.set(filter);
    this.isStatusMenuOpen.set(false);
  }

  toggleMonthPicker(): void {
    this.isMonthPickerOpen.update(v => !v);
    if (this.isMonthPickerOpen()) this.isStatusMenuOpen.set(false);
  }

  shiftMonthPickerYear(delta: number): void {
    this.monthPickerYear.update(v => v + delta);
  }

  setMonthFilter(month: MonthKey): void {
    this.selectedMonth.set(month);
    this.isMonthPickerOpen.set(false);
  }

  private parseTxDate(dateLabel: string): Date {
    const d = new Date(dateLabel);
    if (!Number.isNaN(d.getTime())) return d;
    const parts = dateLabel.replace(',', '').split(' ');
    const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(parts[0]);
    return new Date(Number(parts[2]), Math.max(0, monthIndex), Number(parts[1]));
  }

  private toMonthKey(d: Date): MonthKey {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  private parseAmount(amount: string): number {
    const n = Number(amount.replace(/EGP/i, '').replace(/,/g, '').trim());
    return Number.isFinite(n) ? n : 0;
  }

  private round2(n: number): number { return Math.round(n * 100) / 100; }
  private formatNumber2(n: number): string { return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  private formatNumberNoCurrency(n: number): string { return n.toLocaleString('en-US', { maximumFractionDigits: 0 }); }
  private formatTxDate(d: Date): string { return `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}, ${d.getFullYear()}`; }
  private formatTxTime(d: Date): string {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

}