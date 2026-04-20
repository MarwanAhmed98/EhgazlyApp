import { Component, inject, OnDestroy } from '@angular/core';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';
import { Router } from '@angular/router';

type PaymentMethod = 'instapay' | 'wallets';
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

type ConfirmStatus = 'idle' | 'loading' | 'success' | 'error';
type ModalKind = 'none' | 'uploadSuccess' | 'uploadError' | 'confirmSuccess' | 'confirmError';

type WaitlistStatus = 'idle' | 'joining' | 'joined';

@Component({
  selector: 'app-tournaments-payment',
  imports: [PlayernavComponent],
  templateUrl: './tournaments-payment.component.html',
  styleUrl: './tournaments-payment.component.scss'
})
export class TournamentsPaymentComponent implements OnDestroy {
  // IMPORTANT RULE: decide between WAITLIST or PAYMENT
  private readonly router = inject(Router);
  isFull = false; // set based on availability

  // WAITLIST VM (image)
  waitlist = {
    tournamentTitle: 'Summer Clash 2024',
    dateRange: 'July 15th - Aug 1st',
    registered: 32,
    capacity: 32,
  };

  waitlistStatus: WaitlistStatus = 'idle';
  waitlistAhead = 4;

  tournamentTitle = 'Cairo Champions Cup';
  tournamentDateRange = 'May 15 - June 01, 2024';

  // PAYMENT LOGIC (COPIED FROM PROVIDED CODE)
  booking = {
    field: 'Camp Nou Academy',
    pitch: 'Pitch 3',
    dateLabel: 'Oct 24, 2023',
    timeLabel: '20:00 – 21:00',
    total: 500.0,
  };

  selectedMethod: PaymentMethod = 'instapay';
  payAddress = '01099887766';

  receiptFile: File | null = null;
  receiptFileName = '';

  uploadStatus: UploadStatus = 'idle';
  uploadErrorMessage = '';
  uploadedPreviewUrl: string | null = null;

  confirmStatus: ConfirmStatus = 'idle';
  confirmErrorMessage = '';

  isStatusModalOpen = false;
  modalKind: ModalKind = 'none';

  private lastSelectedFile: File | null = null;

  private uploadTimer: number | null = null;
  private confirmTimer: number | null = null;
  private closeAnimTimer: number | null = null;

  ngOnDestroy(): void {
    this.clearUploadTimer();
    this.clearConfirmTimer();
    this.clearCloseAnimTimer();
    if (this.uploadedPreviewUrl) URL.revokeObjectURL(this.uploadedPreviewUrl);
  }

  // WAITLIST ACTION
  joinWaitlist(): void {
    if (this.waitlistStatus !== 'idle') return;

    this.waitlistStatus = 'joining';

    window.setTimeout(() => {
      this.waitlistStatus = 'joined';
      // simulate that user is now in queue
      this.waitlistAhead = Math.max(0, this.waitlistAhead);
    }, 650);
  }

  goBack(): void {
    history.back();
  }

  // PAYMENT METHODS (copied)
  selectMethod(method: PaymentMethod): void {
    this.selectedMethod = method;
    this.payAddress = method === 'instapay' ? '01099887766' : 'Ehgazly Wallet';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) return;

    this.lastSelectedFile = file;
    this.receiptFile = file;
    this.receiptFileName = file.name;

    this.startUpload(file);

    input.value = '';
  }

  private startUpload(file: File): void {
    this.clearUploadTimer();

    this.closeStatusModal(true);

    this.uploadStatus = 'uploading';
    this.uploadErrorMessage = '';

    if (this.uploadedPreviewUrl) URL.revokeObjectURL(this.uploadedPreviewUrl);
    this.uploadedPreviewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;

    this.uploadTimer = window.setTimeout(() => {
      const shouldFail =
        file.size > 5 * 1024 * 1024 ||
        (!file.type.startsWith('image/') && Math.random() < 0.6) ||
        Math.random() < 0.15;

      if (shouldFail) {
        this.uploadStatus = 'error';
        this.uploadErrorMessage =
          "We encountered a technical glitch while uploading your booking proof. Don't worry, your progress is saved locally.";
        this.openStatusModal('uploadError');
        return;
      }

      this.uploadStatus = 'success';
      this.openStatusModal('uploadSuccess');
    }, 900);
  }

  retryUpload(): void {
    this.closeStatusModal();
    if (!this.lastSelectedFile) {
      this.uploadStatus = 'idle';
      return;
    }
    this.startUpload(this.lastSelectedFile);
  }

  cancelUpload(): void {
    this.closeStatusModal();
    this.clearUploadTimer();
    this.uploadStatus = 'idle';
    this.uploadErrorMessage = '';
  }

  removeUpload(): void {
    this.closeStatusModal();
    this.clearUploadTimer();

    this.uploadStatus = 'idle';
    this.uploadErrorMessage = '';

    this.receiptFile = null;
    this.receiptFileName = '';
    this.lastSelectedFile = null;

    if (this.uploadedPreviewUrl) URL.revokeObjectURL(this.uploadedPreviewUrl);
    this.uploadedPreviewUrl = null;
  }

  confirmReservation(): void {
    if (this.confirmStatus === 'loading') return;
    if (!this.receiptFile || this.uploadStatus !== 'success') return;

    this.clearConfirmTimer();
    this.closeStatusModal(true);

    this.confirmStatus = 'loading';
    this.confirmErrorMessage = '';

    this.confirmTimer = window.setTimeout(() => {
      const shouldFail = Math.random() < 0.2;

      if (shouldFail) {
        this.confirmStatus = 'error';
        this.confirmErrorMessage = "We couldn’t confirm your reservation right now. Please try again.";
        this.openStatusModal('confirmError');
        return;
      }

      this.confirmStatus = 'success';
      this.openStatusModal('confirmSuccess');
    }, 900);
  }

  retryConfirm(): void {
    this.closeStatusModal();
    this.confirmReservation();
  }
  goToTournaments(): void {
    this.router.navigate(['/TournamentsDashboard']);
  }
  private openStatusModal(kind: ModalKind): void {
    if (kind === 'none') return;
    this.modalKind = kind;
    this.clearCloseAnimTimer();
    this.isStatusModalOpen = true;
  }

  closeStatusModal(forceImmediate = false): void {
    this.isStatusModalOpen = false;

    this.clearCloseAnimTimer();

    if (forceImmediate) {
      this.modalKind = 'none';
      return;
    }

    this.closeAnimTimer = window.setTimeout(() => {
      if (!this.isStatusModalOpen) this.modalKind = 'none';
      this.closeAnimTimer = null;
    }, 260);
  }

  private clearUploadTimer(): void {
    if (this.uploadTimer) {
      window.clearTimeout(this.uploadTimer);
      this.uploadTimer = null;
    }
  }

  private clearConfirmTimer(): void {
    if (this.confirmTimer) {
      window.clearTimeout(this.confirmTimer);
      this.confirmTimer = null;
    }
  }

  private clearCloseAnimTimer(): void {
    if (this.closeAnimTimer) {
      window.clearTimeout(this.closeAnimTimer);
      this.closeAnimTimer = null;
    }
  }

  async copyPayAddress(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.payAddress);
      console.log('Copied:', this.payAddress);
    } catch (e) {
      console.error('Copy failed', e);
    }
  }
}