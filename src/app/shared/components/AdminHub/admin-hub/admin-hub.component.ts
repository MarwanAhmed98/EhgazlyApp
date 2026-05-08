import { Component, ChangeDetectionStrategy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

type PayoutStatus = 'UNPROCESSED' | 'PENDING' | 'PAID' | 'COMPLETED';

type Tournament = {
  id: string;
  name: string;
  time: string;
  teams: string;
  status: string;
  img: string;
  statusClass: string;

  amountEgp: number;
  payoutStatus: PayoutStatus;
  payoutUpdatedAt?: string;
};

@Component({
  selector: 'app-admin-hub',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-hub.component.html',
  styleUrl: './admin-hub.component.scss',
})
export class AdminHubComponent {
  // source of truth
  private readonly originalTournaments = signal<Tournament[]>([
    {
      id: 'T-1001',
      name: 'Cairo Corporate League – Phase 1',
      time: 'Starts in 4 hours',
      teams: '24 Teams',
      status: 'Confirmed',
      img: 'https://images.unsplash.com/photo-1544919982-b61976f0ba43?q=80&w=200&auto=format&fit=crop',
      statusClass: 'bg-green-100 text-green-700',
      amountEgp: 128_000,
      payoutStatus: 'UNPROCESSED',
    },
    {
      id: 'T-1002',
      name: 'Heliopolis 3×3 Showdown',
      time: 'Starts tomorrow',
      teams: '12 Teams',
      status: 'Drafting',
      img: 'https://images.unsplash.com/photo-1544919982-b61976f0ba43?q=80&w=200&auto=format&fit=crop',
      statusClass: 'bg-orange-100 text-orange-700',
      amountEgp: 74_500,
      payoutStatus: 'PENDING',
    },
    {
      id: 'T-1003',
      name: 'Midnight Padel Invitational',
      time: '2 days away',
      teams: 'Registration Closing',
      status: 'Active',
      img: 'https://images.unsplash.com/photo-1544919982-b61976f0ba43?q=80&w=200&auto=format&fit=crop',
      statusClass: 'bg-blue-100 text-blue-700',
      amountEgp: 96_250,
      payoutStatus: 'UNPROCESSED',
    },
  ]);

  // displayed/filtered data (kept for CSV export requirement)
  private readonly displayed = signal<Tournament[]>(this.cloneList(this.originalTournaments()));

  // template binding
  displayedTournaments = computed(() => this.displayed());

  // optional future filters/search hooks (keeps architecture clean)
  private readonly searchTerm = signal<string>('');

  constructor() {
    effect(() => {
      this.originalTournaments();
      this.searchTerm();
      this.recomputeDisplayed();
    });
  }

  private recomputeDisplayed(): void {
    const src = this.cloneList(this.originalTournaments());
    const term = (this.searchTerm() ?? '').trim().toLowerCase();

    const out = term
      ? src.filter((t) => `${t.id} ${t.name} ${t.status} ${t.teams}`.toLowerCase().includes(term))
      : src;

    this.displayed.set(out);
  }

  // -------------------------
  // Export CSV (ONLY displayed)
  // -------------------------
  exportCsv(): void {
    const rows = this.displayed();

    const headers = [
      'Tournament ID',
      'Tournament Name',
      'Time',
      'Teams',
      'Status',
      'Amount (EGP)',
      'Payout Status',
      'Payout Updated At',
    ];

    const dataLines = rows.map((t) => [
      t.id,
      t.name,
      t.time,
      t.teams,
      t.status,
      t.amountEgp,
      t.payoutStatus,
      t.payoutUpdatedAt ?? '',
    ]);

    const csv = [
      headers.map(this.csvEscape).join(','),
      ...dataLines.map((cols) => cols.map(this.csvEscape).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-hub-tournaments-${this.fileSafeStamp(new Date())}.csv`;
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

  private fileSafeStamp(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;
  }

  // -------------------------
  // Payouts logic (real UI updates)
  // -------------------------
  processPayouts(): void {
    // Batch behavior:
    // - UNPROCESSED -> PENDING
    // - PENDING -> PAID
    // - PAID -> COMPLETED (optional progression)
    // - COMPLETED stays
    const now = new Date();
    const stamp = this.formatStamp(now);

    const next = this.originalTournaments().map((t) => {
      let nextStatus: PayoutStatus = t.payoutStatus;

      if (t.payoutStatus === 'UNPROCESSED') nextStatus = 'PENDING';
      else if (t.payoutStatus === 'PENDING') nextStatus = 'PAID';
      else if (t.payoutStatus === 'PAID') nextStatus = 'COMPLETED';

      if (nextStatus === t.payoutStatus) return { ...t };

      // Optional: reflect status fields if desired (without changing layout)
      // (keeps original design; only changes data behind existing labels)
      const nextDisplayStatus = nextStatus === 'PAID' || nextStatus === 'COMPLETED' ? 'Paid' : t.status;

      return {
        ...t,
        payoutStatus: nextStatus,
        payoutUpdatedAt: stamp,
        status: nextDisplayStatus,
      };
    });

    this.originalTournaments.set(next);
  }

  // -------------------------
  // Helpers
  // -------------------------
  private cloneList(list: Tournament[]): Tournament[] {
    return list.map((x) => ({ ...x }));
  }

  private formatStamp(d: Date): string {
    const mon = d.toLocaleString(undefined, { month: 'short' });
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${mon} ${day}, ${d.getFullYear()} ${hh}:${mm}`;
  }
}