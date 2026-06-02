import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerFRiendlyMatchService } from '../../../../core/services/PlayerFriendlyMatch/player-friendly-match.service';
import { IPayOpenMatch } from '../../../interfaces/ipay-open-match';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { AiComponent } from "../../Ai/ai/ai.component";

@Component({
  selector: 'app-open-match-payment',
  standalone: true,
  imports: [CommonModule, PlayernavComponent, AiComponent],
  templateUrl: './open-match-payment.component.html',
  styleUrl: './open-match-payment.component.scss'
})
export class OpenMatchPaymentComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly playerFriendlyMatchService = inject(PlayerFRiendlyMatchService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  OpenMatchDetails: IPayOpenMatch = {} as IPayOpenMatch;
  productid: any;

  selectedPaymentMethodId: number | null = null;
  selectedPaymentIdentifier: string = '';
  receiptFile: File | null = null;
  receiptPreviewUrl: string | null = null;
  receiptError: string | null = null;

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe({
      next: (res) => {
        this.productid = res.get('id');
        if (this.productid) {
          this.loadPaymentInfo();
        }
      }
    });
  }

  loadPaymentInfo(): void {
    this.playerFriendlyMatchService.PaymentInfo(this.productid).subscribe({
      next: (res) => {
        this.OpenMatchDetails = res.data;
      }
    });
  }

  getPaymentLabel(type: string): string {
    const labels: Record<string, string> = {
      'instapay': 'Instapay',
      'vodafone_cash': 'Vodafone Cash',
      'etisalat_cash': 'Etisalat Cash',
      'orange_cash': 'Orange Cash',
      'we_pay': 'We Pay'
    };
    return labels[type] || type.replace('_', ' ').toUpperCase();
  }

  onPaymentMethodSelect(methodId: number, identifier: string): void {
    this.selectedPaymentMethodId = methodId;
    this.selectedPaymentIdentifier = identifier;
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('receiptInput') as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  onReceiptSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      this.receiptError = 'Only JPG, PNG, WEBP images are allowed.';
      this.receiptFile = null;
      this.receiptPreviewUrl = null;
      return;
    }

    this.receiptError = null;
    this.receiptFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.receiptPreviewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeReceipt(): void {
    this.receiptFile = null;
    this.receiptPreviewUrl = null;
    this.receiptError = null;
    const fileInput = document.getElementById('receiptInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  isFormValid(): boolean {
    return this.selectedPaymentMethodId !== null && this.receiptFile !== null;
  }

  submitPayment(): void {
    if (!this.isFormValid()) return;

    const formData = new FormData();
    formData.append('payment_method_id', this.selectedPaymentMethodId!.toString());
    formData.append('receipt_image', this.receiptFile!);

    this.playerFriendlyMatchService.PayMatches(this.productid, formData).subscribe({
      next: (res) => {
        this.toastService.success(res.message || 'Payment successful!');
        this.router.navigate(['FriendlyMatches']);
      }
    });
  }
}