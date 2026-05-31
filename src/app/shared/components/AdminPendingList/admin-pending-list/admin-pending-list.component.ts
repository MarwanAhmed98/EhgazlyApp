import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Add for ngModel
import { ToastService } from '../../../../core/services/toast/toast.service';
import { AdminManageOwnerPaymentsService } from '../../../../core/services/AdminManageOwnerPayments/admin-manage-owner-payments.service';
import { IAdminManageOwnerPayments } from '../../../interfaces/iadmin-manage-owner-payments';
import { HttpClient } from '@angular/common/http'; // For direct API call if needed
import { environments } from '../../../../shared/environment';
import { AdminDashboardService } from '../../../../core/services/AdminDashboard/admin-dashboard.service';
import { IAdminDashboard } from '../../../interfaces/iadmin-dashboard';

interface Transaction {
  id: number | string;
  ownerName: string;
  ownerAvatar: string;
  venue: string;
  dateSubmitted: string;
  dateObj: Date;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isSuspicious?: boolean;
  suspicionReason?: string;
  receiptImageUrl?: string;
  notes?: string;
}

@Component({
  selector: 'app-admin-pending-list',
  imports: [CommonModule, FormsModule], // add FormsModule
  templateUrl: './admin-pending-list.component.html',
  styleUrl: './admin-pending-list.component.scss'
})
export class AdminPendingListComponent implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly adminManageOwnerPaymentsService = inject(AdminManageOwnerPaymentsService);
  private readonly adminDashboardService = inject(AdminDashboardService);
  DashboardDetails: IAdminDashboard = {} as IAdminDashboard;
  private readonly http = inject(HttpClient);

  transactions = signal<Transaction[]>([]);

  currentFilter = signal<'all' | '24h' | '7d' | 'high'>('all');
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(4);

  selectedReceipt = signal<Transaction | null>(null);
  showAuditTool = signal<boolean>(false);
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error' | 'info'>('success');

  // Rejection modal state
  showRejectModal = signal<boolean>(false);
  rejectionReason = signal<string>('');
  rejectionValidationError = signal<string | null>(null);
  pendingRejectTxId = signal<number | string | null>(null);

  ngOnInit(): void {
    this.getAllPayments();
    this.GetAllDshboard();
  }

  getAllPayments(): void {
    this.adminManageOwnerPaymentsService.ShowAllPayments().subscribe({
      next: (res) => {
        const payments: IAdminManageOwnerPayments[] = res.data || [];
        const mapped = payments.map(payment => this.mapPaymentToTransaction(payment));
        this.transactions.set(mapped);
      }
    });
  }

  private mapPaymentToTransaction(payment: IAdminManageOwnerPayments): Transaction {
    const createdDate = new Date(payment.created_at);
    const formattedDate = this.formatDate(createdDate, 'MMM d, y • HH:mm');
    const ownerName = payment.owner?.name || 'Unknown Owner';
    const ownerAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(ownerName)}&backgroundColor=135824&textColor=ffffff`;
    const statusUpper = (payment.status || 'pending').toUpperCase() as 'PENDING' | 'APPROVED' | 'REJECTED';
    const amountNum = parseFloat(payment.amount) || 0;
    const venue = payment.payment_type ? `Payment via ${payment.payment_type.replace('_', ' ').toUpperCase()}` : 'Online Transfer';

    return {
      id: payment.id,
      ownerName: ownerName,
      ownerAvatar: ownerAvatar,
      venue: venue,
      dateSubmitted: formattedDate,
      dateObj: createdDate,
      amount: amountNum,
      status: statusUpper,
      isSuspicious: false,
      suspicionReason: '',
      receiptImageUrl: payment.receipt_image_url || undefined,
      notes: payment.notes
    };
  }

  private formatDate(date: Date, format: string): string {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    };
    return new Intl.DateTimeFormat('en-US', options).format(date).replace(',', ' •');
  }

  filteredTransactions = computed(() => {
    let list = this.transactions();

    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(tx =>
        tx.id.toString().toLowerCase().includes(q) ||
        tx.ownerName.toLowerCase().includes(q) ||
        tx.venue.toLowerCase().includes(q)
      );
    }

    const now = new Date();
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

  approveTransaction(txId: number | string) {
    this.adminManageOwnerPaymentsService.ApprovePayments(txId).subscribe({
      next: (res) => {
        this.transactions.update(prev =>
          prev.map(tx => tx.id === txId ? { ...tx, status: 'APPROVED' } : tx)
        );
        this.toastService.success(res.message || `Transaction ${txId} approved successfully`);
        this.closeReceipt();
        this.triggerToast(`Transaction ${txId} has been successfully verified & approved.`, 'success');
      }
    });
  }

  // New method to open reject modal
  openRejectModal(txId: number | string) {
    this.pendingRejectTxId.set(txId);
    this.rejectionReason.set('');
    this.rejectionValidationError.set(null);
    this.showRejectModal.set(true);
  }

  closeRejectModal() {
    this.showRejectModal.set(false);
    this.pendingRejectTxId.set(null);
    this.rejectionReason.set('');
    this.rejectionValidationError.set(null);
  }

  confirmReject() {
    const reason = this.rejectionReason().trim();
    if (!reason) {
      this.rejectionValidationError.set('Rejection reason is required.');
      return;
    }

    const txId = this.pendingRejectTxId();
    if (!txId) return;

    // Call reject API with body containing rejection_reason
    const url = `${environments.baseUrl}/admin/owner-payments/${txId}/reject`;
    this.http.put(url, { rejection_reason: reason }).subscribe({
      next: () => {
        // Update UI
        this.transactions.update(prev =>
          prev.map(tx => tx.id === txId ? { ...tx, status: 'REJECTED' } : tx)
        );
        this.closeRejectModal();
        this.closeReceipt();
        this.showAuditTool.set(false);
        this.triggerToast(`Transaction ${txId} has been rejected.`, 'error');
      }
    });
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
  GetAllDshboard(): void {
    this.adminDashboardService.DashboardOverview().subscribe({
      next: (res) => {
        console.log(res.data);
        this.DashboardDetails = res.data;

      }
    })
  }
}