import { Component, signal, computed, ChangeDetectionStrategy, OnDestroy, effect } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';
type ModalKind = 'none' | 'uploadSuccess' | 'uploadError' | 'confirmSuccess' | 'confirmError';

@Component({
  selector: 'app-profof-payment',
  imports: [CommonModule, ReactiveFormsModule, NgOptimizedImage],
  templateUrl: './profof-payment.component.html',
  styleUrl: './profof-payment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfofPaymentComponent implements OnDestroy {
  private fb = new FormBuilder();

  // UI signals
  isDragging = signal(false);

  // Upload state (full logic from reference)
  uploadStatus = signal<UploadStatus>('idle');
  uploadedFile = signal<File | null>(null);
  fileName = computed(() => this.uploadedFile()?.name || '');
  uploadErrorMessage = signal('');
  previewUrl = signal<string | null>(null);

  // Modal state
  isStatusModalOpen = signal(false);
  modalKind = signal<ModalKind>('none');

  // Timers for simulation
  private uploadTimer: number | null = null;
  private closeAnimTimer: number | null = null;

  // Form
  paymentForm = this.fb.group({
    transactionId: ['', [Validators.required, Validators.minLength(4)]]
  });

  // Cleanup on destroy
  ngOnDestroy(): void {
    this.clearUploadTimer();
    this.clearCloseAnimTimer();
    const preview = this.previewUrl();
    if (preview) URL.revokeObjectURL(preview);
  }

  // File validation (type & size)
  private validateFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPG, PNG, or PDF files are allowed.' };
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be under 5MB.' };
    }
    return { valid: true };
  }

  // Process file after selection/drop
  private processFile(file: File): void {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      this.uploadStatus.set('error');
      this.uploadErrorMessage.set(validation.error!);
      this.openStatusModal('uploadError');
      return;
    }

    // Clear previous preview
    const oldPreview = this.previewUrl();
    if (oldPreview) URL.revokeObjectURL(oldPreview);

    // Set new file and preview (only for images)
    this.uploadedFile.set(file);
    if (file.type.startsWith('image/')) {
      this.previewUrl.set(URL.createObjectURL(file));
    } else {
      this.previewUrl.set(null);
    }

    // Start upload simulation
    this.startUpload(file);
  }

  // Simulated upload (matching reference behavior)
  private startUpload(file: File): void {
    this.clearUploadTimer();
    this.closeStatusModal(true);
    this.uploadStatus.set('uploading');
    this.uploadErrorMessage.set('');

    // Simulate API call
    this.uploadTimer = window.setTimeout(() => {
      // Random failure conditions (size > 5MB already blocked, but keep similar logic)
      const shouldFail = (!file.type.startsWith('image/') && Math.random() < 0.6) || Math.random() < 0.15;

      if (shouldFail) {
        this.uploadStatus.set('error');
        this.uploadErrorMessage.set(
          "We encountered a technical glitch while uploading your payment proof. Don't worry, your progress is saved locally."
        );
        this.openStatusModal('uploadError');
        return;
      }

      this.uploadStatus.set('success');
      this.openStatusModal('uploadSuccess');
    }, 900);
  }

  // Retry upload after error
  retryUpload(): void {
    this.closeStatusModal();
    const file = this.uploadedFile();
    if (!file) {
      this.uploadStatus.set('idle');
      return;
    }
    this.startUpload(file);
  }

  // Cancel upload (clear file, reset state)
  cancelUpload(): void {
    this.closeStatusModal();
    this.clearUploadTimer();
    this.resetUploadState();
  }

  // Remove uploaded file
  removeUpload(): void {
    this.closeStatusModal();
    this.clearUploadTimer();
    this.resetUploadState();
  }

  private resetUploadState(): void {
    this.uploadStatus.set('idle');
    this.uploadErrorMessage.set('');
    this.uploadedFile.set(null);
    const preview = this.previewUrl();
    if (preview) URL.revokeObjectURL(preview);
    this.previewUrl.set(null);
  }

  // Handle file input change
  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
    input.value = ''; // allow re-selecting same file
  }

  // Handle drag & drop
  handleDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  // Submit payment (form + uploaded file)
  submitPayment(): void {
    if (this.paymentForm.invalid || this.uploadStatus() !== 'success') {
      return;
    }

    const formValue = this.paymentForm.value;
    const file = this.uploadedFile();

    console.log('Submitting payment:', {
      transactionId: formValue.transactionId,
      file: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    });

    // Simulate confirm success (like reference)
    this.openStatusModal('confirmSuccess');
    // In real implementation you would call API here
  }

  // Modal helpers
  private openStatusModal(kind: ModalKind): void {
    if (kind === 'none') return;
    this.modalKind.set(kind);
    this.clearCloseAnimTimer();
    this.isStatusModalOpen.set(true);
  }

  closeStatusModal(forceImmediate = false): void {
    this.isStatusModalOpen.set(false);
    this.clearCloseAnimTimer();

    if (forceImmediate) {
      this.modalKind.set('none');
      return;
    }

    this.closeAnimTimer = window.setTimeout(() => {
      if (!this.isStatusModalOpen()) {
        this.modalKind.set('none');
      }
      this.closeAnimTimer = null;
    }, 260);
  }

  // Timers cleanup
  private clearUploadTimer(): void {
    if (this.uploadTimer) {
      window.clearTimeout(this.uploadTimer);
      this.uploadTimer = null;
    }
  }

  private clearCloseAnimTimer(): void {
    if (this.closeAnimTimer) {
      window.clearTimeout(this.closeAnimTimer);
      this.closeAnimTimer = null;
    }
  }
}