import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminFinancialsService } from '../../../../core/services/AdminFinancials/admin-financials.service';
import { IAdminFinancials, PaymentHistory } from '../../../interfaces/iadmin-financials';

@Component({
  selector: 'app-admin-join-req',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-join-req.component.html',
  styleUrl: './admin-join-req.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminJoinReqComponent implements OnInit {
  private readonly adminFinancialsService = inject(AdminFinancialsService);
  private readonly cdr = inject(ChangeDetectorRef);

  FinancialDetails: IAdminFinancials = {
    total_revenue: '0',
    app_due_amount: '0',
    remaining_balance: '0',
    total_paid: '0',
    pending_payments: 0,
    payment_history: [],
    commission_percentage: null
  };

  paymentHistorySorted: PaymentHistory[] = [];
  showModal = false;
  selectedPayment: PaymentHistory | null = null;

  ngOnInit(): void {
    this.GetAllFinancials();
  }

  GetAllFinancials(): void {
    this.adminFinancialsService.GetAdminFinancialData().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.FinancialDetails = res.data;
          const history = this.FinancialDetails.payment_history || [];
          this.paymentHistorySorted = [...history].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load financials', err);
        this.cdr.markForCheck();
      }
    });
  }

  openReceipt(payment: PaymentHistory): void {
    this.selectedPayment = payment;
    this.showModal = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedPayment = null;
    this.cdr.markForCheck();
  }
}