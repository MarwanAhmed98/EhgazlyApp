import { ICourtOwnerFinancialData, PaymentHistory } from './../../../interfaces/icourt-owner-financial-data';
import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { CourtOwnerPaymentService } from '../../../../core/services/CourtOwnerPayment/court-owner-payment.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast/toast.service';

type DetailsRowType = 'text' | 'status' | 'image';

@Component({
  selector: 'app-court-owner-earnings',
  imports: [CommonModule, DatePipe, ReactiveFormsModule],
  templateUrl: './court-owner-earnings.component.html',
  styleUrl: './court-owner-earnings.component.scss',
  providers: [DecimalPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourtOwnerEarningsComponent implements OnInit {
  private readonly courtOwnerPaymentService = inject(CourtOwnerPaymentService);
  private readonly toastService = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly datePipe = inject(DatePipe);
  FinancialDetails: ICourtOwnerFinancialData | null = null;
  downloadLoading = false;
  withdrawModalOpen = false;
  withdrawLoading = false;

  receiptPreviewUrl: string | null = null;
  receiptError: string | null = null;

  WithdrawForm = new FormGroup({
    amount: new FormControl<number | null>(null, { validators: [Validators.required] }),
    payment_type: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    receipt_image: new FormControl<File | null>(null, { validators: [Validators.required] }),
    notes: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
  });
  detailsModalOpen = false;
  selectedPayment: PaymentHistory | null = null;

  detailsRows: Array<{ key: string; label: string; value: string; type: DetailsRowType }> = [];
  activeTab = signal('weekly');

  trendPath = computed(() => {
    return this.activeTab() === 'weekly'
      ? 'M0,150 Q100,140 200,80 T400,100 T600,40 T800,60'
      : 'M0,160 Q100,120 200,140 T400,60 T600,100 T800,40';
  });

  trendAreaPath = computed(() => {
    const base = this.trendPath();
    return `${base} V200 H0 Z`;
  });

  ngOnInit(): void {
    this.GetFinancialData();
  }

  GetFinancialData(): void {
    this.courtOwnerPaymentService.GetOwnerFinancialData().subscribe({
      next: (res: any) => {
        this.FinancialDetails = (res?.data ?? null) as ICourtOwnerFinancialData | null;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.log('FIN ERROR:', err);
        this.FinancialDetails = null;
        this.cdr.markForCheck();
      },
    });
  }
  downloadReportLocal(): void {
    if (this.downloadLoading) return;

    this.downloadLoading = true;
    this.cdr.markForCheck();

    try {
      const rows = (this.FinancialDetails?.payment_history ?? []) as PaymentHistory[];

      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');

      const filename = `report-${yyyy}-${mm}-${dd}.csv`;
      const headers = ['id', 'created_at', 'payment_type', 'amount', 'status', 'rejection_reason'];

      const escapeCsv = (v: any) => {
        const s = String(v ?? '');
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };

      const lines: string[] = [];
      lines.push(headers.join(','));

      for (const r of rows) {
        lines.push(
          [
            escapeCsv((r as any).id),
            escapeCsv((r as any).created_at),
            escapeCsv((r as any).payment_type),
            escapeCsv((r as any).amount),
            escapeCsv((r as any).status),
            escapeCsv((r as any).rejection_reason),
          ].join(','),
        );
      }

      const csv = lines.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      this.toastService.success(rows.length ? 'Report downloaded successfully.' : 'Downloaded empty report.', 'Ehgazly');
    } catch {
      this.toastService.error('Failed to generate report.', 'Ehgazly');
    } finally {
      this.downloadLoading = false;
      this.cdr.markForCheck();
    }
  }
  onWithdrawFunds(): void {
    this.withdrawModalOpen = true;
    this.receiptError = null;
    this.cdr.markForCheck();
  }

  closeWithdrawModal(): void {
    if (this.withdrawLoading) return;
    this.withdrawModalOpen = false;
    this.cdr.markForCheck();
  }

  onReceiptSelected(event: Event): void {
    this.receiptError = null;

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      this.WithdrawForm.controls.receipt_image.setValue(null);
      this.clearReceiptPreview();
      this.cdr.markForCheck();
      return;
    }

    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.receiptError = 'Only image files are allowed (png, jpg, jpeg, webp).';
      this.WithdrawForm.controls.receipt_image.setValue(null);
      this.WithdrawForm.controls.receipt_image.markAsTouched();
      this.clearReceiptPreview();
      input.value = '';
      this.cdr.markForCheck();
      return;
    }

    this.WithdrawForm.controls.receipt_image.setValue(file);
    this.WithdrawForm.controls.receipt_image.markAsDirty();
    this.WithdrawForm.controls.receipt_image.markAsTouched();
    this.WithdrawForm.controls.receipt_image.updateValueAndValidity({ emitEvent: false });

    this.setReceiptPreview(file);
    this.cdr.markForCheck();
  }

  private setReceiptPreview(file: File): void {
    this.clearReceiptPreview();
    this.receiptPreviewUrl = URL.createObjectURL(file);
  }

  private clearReceiptPreview(): void {
    if (this.receiptPreviewUrl) URL.revokeObjectURL(this.receiptPreviewUrl);
    this.receiptPreviewUrl = null;
  }

  submitWithdraw(): void {
    if (this.withdrawLoading) return;

    this.WithdrawForm.markAllAsTouched();
    if (this.WithdrawForm.invalid) {
      this.cdr.markForCheck();
      return;
    }

    this.withdrawLoading = true;
    this.cdr.markForCheck();

    const fd = new FormData();
    fd.append('amount', String(this.WithdrawForm.controls.amount.value));
    fd.append('payment_type', this.WithdrawForm.controls.payment_type.value);
    fd.append('notes', this.WithdrawForm.controls.notes.value);

    const file = this.WithdrawForm.controls.receipt_image.value;
    if (file) fd.append('receipt_image', file);

    this.courtOwnerPaymentService.OwnerPayment(fd).subscribe({
      next: (res: any) => {
        this.toastService.success(res?.message ?? 'Withdrawal request submitted', 'Ehgazly');

        this.withdrawLoading = false;
        this.withdrawModalOpen = false;

        this.WithdrawForm.reset({
          amount: null,
          payment_type: '',
          receipt_image: null,
          notes: '',
        });
        this.clearReceiptPreview();

        this.GetFinancialData();
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.withdrawLoading = false;
        this.toastService.error(err?.error?.message ?? 'Failed to submit withdrawal', 'Ehgazly');
        this.cdr.markForCheck();
      },
    });
  }

  /* ---------------- Eye/View (TABLE MODAL) ---------------- */
  private buildDetailsRows(item: PaymentHistory | null): void {
    if (!item) {
      this.detailsRows = [];
      return;
    }

    const rows: Array<{ key: string; label: string; value: string; type: DetailsRowType }> = [];

    rows.push({
      key: 'amount',
      label: 'Amount',
      value: `${(item as any).amount ?? ''} EGP`,
      type: 'text',
    });

    rows.push({
      key: 'status',
      label: 'Status',
      value: String((item as any).status ?? ''),
      type: 'status',
    });

    rows.push({
      key: 'payment_type',
      label: 'Payment Type',
      value: String((item as any).payment_type ?? ''),
      type: 'text',
    });

    rows.push({
      key: 'created_at',
      label: 'Created',
      value: (item as any).created_at
        ? this.datePipe.transform((item as any).created_at, 'MMM dd, yyyy - hh:mm a') ?? ''
        : '',
      type: 'text',
    });

    if ((item as any).notes) {
      rows.push({
        key: 'notes',
        label: 'Notes',
        value: String((item as any).notes),
        type: 'text',
      });
    }

    const receiptUrl =
      (item as any).receipt_image_url ??
      (item as any).receipt_image ??
      (item as any).image_url ??
      null;

    if (receiptUrl) {
      rows.push({
        key: 'receipt',
        label: 'Receipt Image',
        value: String(receiptUrl),
        type: 'image',
      });
    }

    if ((item as any).rejection_reason) {
      rows.push({
        key: 'rejection_reason',
        label: 'Rejection Reason',
        value: String((item as any).rejection_reason),
        type: 'text',
      });
    }

    this.detailsRows = rows;
  }

  viewItem(item: PaymentHistory): void {
    if (!item) return;
    this.selectedPayment = item;
    this.buildDetailsRows(item);
    this.detailsModalOpen = true;
    this.cdr.markForCheck();
  }

  closeDetailsModal(): void {
    this.detailsModalOpen = false;
    this.selectedPayment = null;
    this.detailsRows = [];
    this.cdr.markForCheck();
  }
  toLower(v: unknown): string {
    return `${v ?? ''}`.toLowerCase();
  }

  isPaidStatus(v: unknown): boolean {
    return this.toLower(v) === 'paid';
  }
}