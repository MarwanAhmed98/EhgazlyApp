import { Component, ChangeDetectionStrategy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";

interface JoinRequest {
  id: string;
  ownerName: string;
  initials: string;
  phoneNumber: string;
  location: string;
  proofStatus: 'Uploaded' | 'Pending';
  date: string; // e.g. "Oct 24, 2023"
  avatarColor: string;
  status?: 'PENDING' | 'REVIEWED';
}

type TicketStatus = 'OPEN' | 'CLOSED';

type LegalTicket = {
  ticketId: string;
  title: string;
  body: string;
  createdAt: string;
  status: TicketStatus;
};

type InstantAccessStatus = 'NEW' | 'IN_REVIEW' | 'APPROVED';

// MonthKey = "YYYY-MM"
type MonthKey = string;

@Component({
  selector: 'app-join-req',
  imports: [CommonModule, RouterLink],
  templateUrl: './join-req.component.html',
  styleUrl: './join-req.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinReqComponent {
  // -----------------------
  // ORIGINAL DATA (source of truth)
  // -----------------------
  private readonly originalRequests = signal<JoinRequest[]>([
    {
      id: '1',
      ownerName: 'Ahmed Kamel',
      initials: 'AK',
      phoneNumber: '+20 123 4567890',
      location: 'Cairo, Maadi',
      proofStatus: 'Uploaded',
      date: 'Oct 24, 2023',
      avatarColor: 'bg-[#d1f2d9] text-[#1a4d2e]',
      status: 'PENDING',
    },
    {
      id: '2',
      ownerName: 'Mahmoud Saeed',
      initials: 'MS',
      phoneNumber: '+20 111 222 3333',
      location: 'Alexandria, Smouha',
      proofStatus: 'Pending',
      date: 'Oct 25, 2023',
      avatarColor: 'bg-[#ffdbc2] text-[#8a421a]',
      status: 'PENDING',
    },
    {
      id: '3',
      ownerName: 'Ramy Emad',
      initials: 'RE',
      phoneNumber: '+20 155 777 8888',
      location: 'Giza, Sheikh Zayed',
      proofStatus: 'Uploaded',
      date: 'Oct 26, 2023',
      avatarColor: 'bg-blue-100 text-blue-700',
      status: 'PENDING',
    },
    {
      id: '4',
      ownerName: 'Sara Hassan',
      initials: 'SH',
      phoneNumber: '+20 100 999 0000',
      location: 'Cairo, New Cairo',
      proofStatus: 'Uploaded',
      date: 'Oct 26, 2023',
      avatarColor: 'bg-emerald-100 text-emerald-700',
      status: 'PENDING',
    },
  ]);

  // FILTERED DATA (display)
  private readonly filteredData = signal<JoinRequest[]>(this.cloneList(this.originalRequests()));

  // Keep compatibility if template still references requests()
  requests = computed(() => this.filteredData());
  filteredRequests = computed(() => this.filteredData());
  originalCount = computed(() => this.originalRequests().length);

  // -----------------------
  // Search + Filters
  // -----------------------
  searchTerm = signal<string>('');
  locationFilter = signal<string>('ALL'); // exact location string or ALL

  // Date filter: NO preselected month by default
  selectedMonth = signal<MonthKey>(''); // "" means "All data"
  isMonthPickerOpen = signal<boolean>(false);
  monthPickerYear = signal<number>(new Date().getFullYear());

  availableLocations = computed(() => {
    const uniq = new Set(this.originalRequests().map((r) => r.location));
    return Array.from(uniq).sort((a, b) => a.localeCompare(b));
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

  // Keep same UI text; when no month selected show a neutral label
  monthRangeLabel = computed(() => {
    const key = (this.selectedMonth() ?? '').trim();
    if (!key) return 'App Date';

    const [yStr, mStr] = key.split('-');
    const y = Number(yStr);
    const m = Number(mStr); // 1..12
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0);
    return `${this.formatShortDate(start)} - ${this.formatShortDate(end)}`;
  });

  constructor() {
    effect(() => {
      this.originalRequests();
      this.searchTerm();
      this.locationFilter();
      this.selectedMonth();
      this.recomputeFilteredData();
    });

    // Keep year sync only AFTER a month is selected
    effect(() => {
      const key = (this.selectedMonth() ?? '').trim();
      if (!key) return;

      const [yStr] = key.split('-');
      const y = Number(yStr);
      if (!Number.isNaN(y)) this.monthPickerYear.set(y);
    });
  }

  setSearch(v: string): void {
    this.searchTerm.set(v ?? '');
  }

  setLocationFilter(v: string): void {
    this.locationFilter.set(v ?? 'ALL');
  }

  // Date filter UI actions
  toggleMonthPicker(): void {
    this.isMonthPickerOpen.set(!this.isMonthPickerOpen());
  }

  shiftMonthPickerYear(deltaYears: number): void {
    this.monthPickerYear.set(this.monthPickerYear() + deltaYears);
  }

  setMonthFilter(monthKey: MonthKey): void {
    this.selectedMonth.set(monthKey);
    this.isMonthPickerOpen.set(false);
  }

  // Optional reset hook (if you add a reset button later)
  clearMonthFilter(): void {
    this.selectedMonth.set('');
    this.isMonthPickerOpen.set(false);
  }

  private recomputeFilteredData(): void {
    const src = this.cloneList(this.originalRequests());
    const term = this.normalize(this.searchTerm());
    const loc = this.locationFilter();
    const month = (this.selectedMonth() ?? '').trim(); // "" => no date filter

    let out = src;

    // Location filter
    if (loc && loc !== 'ALL') out = out.filter((r) => r.location === loc);

    // Month filter (only after user selects)
    if (month) {
      out = out.filter((r) => this.toMonthKey(this.parseUiDate(r.date)) === month);
    }

    // Search across relevant fields
    if (term) {
      out = out.filter((r) => {
        const hay = `${r.ownerName} ${r.phoneNumber} ${r.location} ${r.proofStatus} ${r.date} ${r.id}`.toLowerCase();
        return hay.includes(term);
      });
    }

    this.filteredData.set(out);
  }

  // -----------------------
  // Stats
  // -----------------------
  totalPending = computed(() => this.originalRequests().filter((r) => (r.status ?? 'PENDING') === 'PENDING').length);

  reviewedToday = computed(() => {
    const todayKey = this.toDateKey(new Date());
    return this.originalRequests().filter(
      (r) => (r.status ?? 'PENDING') === 'REVIEWED' && this.toDateKey(this.parseUiDate(r.date)) === todayKey,
    ).length;
  });

  // -----------------------
  // Review Application Modal
  // -----------------------
  isReviewOpen = signal(false);
  activeRequestId = signal<string | null>(null);

  activeRequest = computed(() => {
    const id = this.activeRequestId();
    if (!id) return null;
    return this.originalRequests().find((r) => r.id === id) ?? null;
  });

  activeRequestOwner = computed(() => this.activeRequest()?.ownerName ?? '');
  activeRequestLocation = computed(() => this.activeRequest()?.location ?? '');
  activeRequestPhone = computed(() => this.activeRequest()?.phoneNumber ?? '');
  activeRequestProof = computed(() => this.activeRequest()?.proofStatus ?? '');
  activeRequestDate = computed(() => this.activeRequest()?.date ?? '');
  activeRequestStatus = computed(() => this.activeRequest()?.status ?? 'PENDING');

  reviewApplication(req: JoinRequest): void {
    this.activeRequestId.set(req.id);
    this.isReviewOpen.set(true);
  }

  toggleRequestStatus(): void {
    const id = this.activeRequestId();
    if (!id) return;

    this.originalRequests.set(
      this.originalRequests().map((r) => {
        if (r.id !== id) return { ...r };
        const next: JoinRequest['status'] = (r.status ?? 'PENDING') === 'PENDING' ? 'REVIEWED' : 'PENDING';
        return { ...r, status: next };
      }),
    );
  }

  markReviewed(): void {
    const id = this.activeRequestId();
    if (!id) return;

    this.originalRequests.set(this.originalRequests().map((r) => (r.id === id ? { ...r, status: 'REVIEWED' } : { ...r })));

    this.isReviewOpen.set(false);
    this.activeRequestId.set(null);
  }

  // -----------------------
  // Instant Access Request
  // -----------------------
  isInstantAccessOpen = signal(false);

  instantAccessTitle = signal('Elite Sports Hub');
  instantAccessSubtitle = signal('Priority applicant • Fast-track verification');
  instantAccessStatus = signal<InstantAccessStatus>('NEW');

  openInstantAccessRequest(): void {
    this.isInstantAccessOpen.set(true);
  }

  advanceInstantAccessStatus(): void {
    const s = this.instantAccessStatus();
    const next: InstantAccessStatus = s === 'NEW' ? 'IN_REVIEW' : s === 'IN_REVIEW' ? 'APPROVED' : 'APPROVED';
    this.instantAccessStatus.set(next);
  }

  // -----------------------
  // Legal tickets
  // -----------------------
  private readonly originalTickets = signal<LegalTicket[]>([
    {
      ticketId: 'LT-1021',
      title: 'Ownership deed unclear (Maadi)',
      body: 'The submitted ownership document is partially obscured. Please request a clearer scan and a secondary proof (utility bill or tax card).',
      createdAt: 'Today, 10:20',
      status: 'OPEN',
    },
    {
      ticketId: 'LT-1014',
      title: 'Verification dispute (Smouha)',
      body: 'Applicant claims prior approval but record is missing. Cross-check national ID and venue registry entry.',
      createdAt: 'Yesterday, 16:05',
      status: 'OPEN',
    },
    {
      ticketId: 'LT-0998',
      title: 'Legal follow-up needed (New Cairo)',
      body: 'Complex ownership is under a company name. Confirm authorized signatory and attach commercial register extract.',
      createdAt: 'Oct 22, 2023',
      status: 'CLOSED',
    },
  ]);

  tickets = computed(() => this.cloneList(this.originalTickets()));

  isLegalTicketsOpen = signal(false);
  isTicketOpen = signal(false);

  activeTicketId = signal<string>('');
  activeTicket = computed(() => {
    const id = this.activeTicketId();
    if (!id) return null;
    return this.originalTickets().find((t) => t.ticketId === id) ?? null;
  });

  activeTicketTitle = computed(() => this.activeTicket()?.title ?? '');
  activeTicketBody = computed(() => this.activeTicket()?.body ?? '');
  activeTicketCreated = computed(() => this.activeTicket()?.createdAt ?? '');
  activeTicketStatus = computed(() => this.activeTicket()?.status ?? 'OPEN');

  openLegalTickets(): void {
    this.isLegalTicketsOpen.set(true);
  }

  openTicket(t: LegalTicket): void {
    this.activeTicketId.set(t.ticketId);
    this.isTicketOpen.set(true);
  }

  closeTicket(): void {
    this.isTicketOpen.set(false);
    this.activeTicketId.set('');
  }

  toggleTicketStatus(): void {
    const id = this.activeTicketId();
    if (!id) return;

    this.originalTickets.set(
      this.originalTickets().map((t) => {
        if (t.ticketId !== id) return { ...t };
        const next: TicketStatus = t.status === 'OPEN' ? 'CLOSED' : 'OPEN';
        return { ...t, status: next };
      }),
    );
  }

  // -----------------------
  // Close modals
  // -----------------------
  closeAllModals(): void {
    this.isReviewOpen.set(false);
    this.isInstantAccessOpen.set(false);
    this.isLegalTicketsOpen.set(false);
    this.isTicketOpen.set(false);
    this.activeRequestId.set(null);
    this.activeTicketId.set('');
  }

  // -----------------------
  // Utilities
  // -----------------------
  private cloneList<T>(list: T[]): T[] {
    return list.map((x) => ({ ...(x as any) }));
  }

  private normalize(s: string): string {
    return (s ?? '').trim().toLowerCase();
  }

  private parseUiDate(label: string): Date {
    const d = new Date(label);
    if (!Number.isNaN(d.getTime())) return d;

    const normalized = label.trim().replace(/,/g, '').replace(/\s+/g, ' ').toLowerCase();
    const parts = normalized.split(' ');
    const mon = (parts[0] ?? '').slice(0, 3);
    const day = Number(parts[1]);
    const year = Number(parts[2]);
    const monthIndex = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(mon);
    return new Date(year, Math.max(0, monthIndex), day);
  }

  private toMonthKey(d: Date): MonthKey {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  private toDateKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  private formatShortDate(d: Date): string {
    const mon = d.toLocaleString(undefined, { month: 'short' });
    return `${mon} ${d.getDate()}`;
  }
}