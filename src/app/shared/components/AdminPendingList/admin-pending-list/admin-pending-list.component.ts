import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Transaction {
  id: string;
  ownerName: string;
  ownerAvatar: string;
  venue: string;
  dateSubmitted: string;
  dateObj: Date;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isSuspicious?: boolean;
  suspicionReason?: string;
}

@Component({
  selector: 'app-admin-pending-list',
  imports: [CommonModule],
  templateUrl: './admin-pending-list.component.html',
  styleUrl: './admin-pending-list.component.scss'
})
export class AdminPendingListComponent {
  transactions = signal<Transaction[]>([
    {
      id: '#TXN-9921-A',
      ownerName: 'Ahmed Mansour',
      ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      venue: 'Maadi Sports Hub',
      dateSubmitted: 'Oct 24, 2023 • 14:20',
      dateObj: new Date('2023-10-24T14:20:00'),
      amount: 1250.00,
      status: 'PENDING'
    },
    {
      id: '#TXN-8842-B',
      ownerName: 'Sara El-Din',
      ownerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      venue: 'The Arena Giza',
      dateSubmitted: 'Oct 24, 2023 • 11:05',
      dateObj: new Date('2023-10-24T11:05:00'),
      amount: 8400.00,
      status: 'PENDING',
      isSuspicious: true,
      suspicionReason: 'Location mismatch with standard user IP'
    },
    {
      id: '#TXN-7731-C',
      ownerName: 'Khaled Ibrahim',
      ownerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      venue: 'Champions Court',
      dateSubmitted: 'Oct 23, 2023 • 18:45',
      dateObj: new Date('2023-10-23T18:45:00'),
      amount: 450.00,
      status: 'PENDING'
    },
    {
      id: '#TXN-1102-D',
      ownerName: 'Layla Zaki',
      ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      venue: 'Heliopolis Padel Center',
      dateSubmitted: 'Oct 23, 2023 • 15:10',
      dateObj: new Date('2023-10-23T15:10:00'),
      amount: 2100.00,
      status: 'PENDING',
      isSuspicious: true,
      suspicionReason: 'Mismatched receipt metadata, suspicious timestamp difference'
    },
    {
      id: '#TXN-4059-E',
      ownerName: 'Sherif Fayed',
      ownerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      venue: 'Katameya Club',
      dateSubmitted: 'Oct 22, 2023 • 09:30',
      dateObj: new Date('2023-10-22T09:30:00'),
      amount: 6700.00,
      status: 'PENDING'
    },
    {
      id: '#TXN-3829-F',
      ownerName: 'Mariam Aly',
      ownerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      venue: 'Smouha Club',
      dateSubmitted: 'Oct 21, 2023 • 16:45',
      dateObj: new Date('2023-10-21T16:45:00'),
      amount: 3200.00,
      status: 'PENDING'
    },
    {
      id: '#TXN-2940-G',
      ownerName: 'Youssef Soliman',
      ownerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      venue: 'Palm Hills Club',
      dateSubmitted: 'Oct 20, 2023 • 12:15',
      dateObj: new Date('2023-10-20T12:15:00'),
      amount: 9500.00,
      status: 'PENDING'
    },
    {
      id: '#TXN-1849-H',
      ownerName: 'Nour El-Sherbini',
      ownerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      venue: 'Black Ball Sporting',
      dateSubmitted: 'Oct 19, 2023 • 11:22',
      dateObj: new Date('2023-10-19T11:22:00'),
      amount: 4500.00,
      status: 'PENDING'
    },
    {
      id: '#TXN-5928-I',
      ownerName: 'Tarek Momen',
      ownerAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
      venue: 'Zayed Sports City',
      dateSubmitted: 'Oct 18, 2023 • 08:15',
      dateObj: new Date('2023-10-18T08:15:00'),
      amount: 5100.00,
      status: 'PENDING'
    },
    {
      id: '#TXN-6612-J',
      ownerName: 'Hania El-Hammamy',
      ownerAvatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150',
      venue: 'Gezira Club',
      dateSubmitted: 'Oct 17, 2023 • 13:40',
      dateObj: new Date('2023-10-17T13:40:00'),
      amount: 1150.00,
      status: 'PENDING'
    }
  ]);

  currentFilter = signal<'all' | '24h' | '7d' | 'high'>('all');
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(4);

  selectedReceipt = signal<Transaction | null>(null);
  showAuditTool = signal<boolean>(false);
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error' | 'info'>('success');

  filteredTransactions = computed(() => {
    let list = this.transactions();

    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(tx =>
        tx.id.toLowerCase().includes(q) ||
        tx.ownerName.toLowerCase().includes(q) ||
        tx.venue.toLowerCase().includes(q)
      );
    }

    const now = new Date('2023-10-25T12:00:00');
    const filter = this.currentFilter();

    if (filter === '24h') {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      list = list.filter(tx => tx.dateObj >= oneDayAgo);
    } else if (filter === '7d') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      list = list.filter(tx => tx.dateObj >= sevenDaysAgo);
    } else if (filter === 'high') {
      list = list.filter(tx => tx.amount > 5000);
    }

    return list;
  });

  totalPendingAmount = computed(() => {
    return this.transactions()
      .filter(tx => tx.status === 'PENDING')
      .reduce((sum, tx) => sum + tx.amount, 0);
  });

  paginatedTransactions = computed(() => {
    const pageIndex = this.currentPage() - 1;
    const start = pageIndex * this.pageSize();
    return this.filteredTransactions().slice(start, start + this.pageSize());
  });

  maxPage = computed(() => {
    return Math.max(1, Math.ceil(this.filteredTransactions().length / this.pageSize()));
  });

  totalPageNumbers = computed(() => {
    const pages = [];
    for (let i = 1; i <= this.maxPage(); i++) pages.push(i);
    return pages;
  });

  displayedRangeText = computed(() => {
    const totalCount = this.filteredTransactions().length;
    if (totalCount === 0) return '0';
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = Math.min(start + this.pageSize() - 1, totalCount);
    return `${start} - ${end}`;
  });

  suspiciousTransactions = computed(() => {
    return this.transactions().filter(tx => tx.isSuspicious);
  });

  setFilter(filter: 'all' | '24h' | '7d' | 'high') {
    this.currentFilter.set(filter);
    this.currentPage.set(1);
  }

  onSearchInput(event: Event) {
    const element = event.target as HTMLInputElement;
    this.searchQuery.set(element.value);
    this.currentPage.set(1);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.maxPage()) this.currentPage.set(page);
  }

  prevPage() {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }

  nextPage() {
    if (this.currentPage() < this.maxPage()) this.currentPage.update(p => p + 1);
  }

  viewReceipt(tx: Transaction) {
    this.selectedReceipt.set(tx);
  }

  closeReceipt() {
    this.selectedReceipt.set(null);
  }

  openAuditTool() {
    this.showAuditTool.set(true);
  }

  approveTransaction(txId: string) {
    this.transactions.update(prev =>
      prev.map(tx => tx.id === txId ? { ...tx, status: 'APPROVED' as const } : tx)
    );
    this.closeReceipt();
    this.triggerToast(`Transaction ${txId} has been successfully verified & approved.`, 'success');
  }

  rejectTransaction(txId: string) {
    this.transactions.update(prev =>
      prev.map(tx => tx.id === txId ? { ...tx, status: 'REJECTED' as const } : tx)
    );
    this.closeReceipt();
    this.showAuditTool.set(false);
    this.triggerToast(`Transaction ${txId} has been flagged & rejected.`, 'error');
  }

  triggerActionNotification(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    this.triggerToast(msg, type);
  }

  triggerToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toastType.set(type);
    this.toastMessage.set(message);
    setTimeout(() => this.toastMessage.set(null), 4500);
  }

  handleAvatarError(event: any, name: string) {
    event.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=135824&textColor=ffffff`;
  }

  exportToCSV() {
    const headers = ['Transaction ID', 'Owner Name', 'Venue', 'Date Submitted', 'Amount (EGP)', 'Status'];
    const rows = this.filteredTransactions().map(tx => [
      tx.id,
      tx.ownerName,
      tx.venue,
      tx.dateSubmitted.replace(' • ', ' '),
      tx.amount,
      tx.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Pending_Payments_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.triggerToast("CSV Download initiated successfully!", 'success');
  }
}