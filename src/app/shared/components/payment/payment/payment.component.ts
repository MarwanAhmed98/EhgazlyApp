import { Icustomertimeslot } from './../../../interfaces/icustomertimeslot';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';
import { FormControl, FormGroup } from '@angular/forms';
import { MyBookingsService } from '../../../../core/services/MyBookings/my-bookings.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { ActivatedRoute } from '@angular/router';
import { CustomerTimeslotService } from '../../../../core/services/CustomerTimeslot/customer-timeslot.service';
import { VenuesService } from '../../../../core/services/venues/venues.service';
import { LucideAngularModule } from 'lucide-angular';


type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';
type ConfirmStatus = 'idle' | 'loading' | 'success' | 'error';
type ModalKind = 'none' | 'uploadSuccess' | 'uploadError' | 'confirmSuccess' | 'confirmError';

interface PaymentMethod {
  id: number;
  type: string;
  identifier: string;
}

@Component({
  selector: 'app-payment',
  imports: [PlayernavComponent, LucideAngularModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
})
export class PaymentComponent implements OnInit, OnDestroy {
  private readonly myBookingsService = inject(MyBookingsService);
  private readonly customerTimeslotService = inject(CustomerTimeslotService);
  private readonly toastService = inject(ToastService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly venuesService = inject(VenuesService);

  fieldName: string = '—';
  totalPrice: number = 0;
  courtLabel: string = '—';
  dateLabel: string = '—';
  timeLabel: string = '—';
  SummaryDetails: Icustomertimeslot[] = [];
  SelectedDate: string | null = null;
  courtId: number | null = null;
  MaincourtId: number | null = null;
  timeslotId: number | null = null;

  // Dynamic payment properties
  paymentMethods: PaymentMethod[] = [];
  selectedPaymentMethod: PaymentMethod | null = null;
  transferAddress: string = '';

  CreateBookingForm: FormGroup = new FormGroup({
    court_id: new FormControl<number | null>(null),
    timeslot_id: new FormControl<number | null>(null),
    payment_method_id: new FormControl<number | null>(null),
    receipt_image: new FormControl<File | null>(null),
  });

  booking = {
    field: '—',
    pitch: '—',
    dateLabel: '—',
    timeLabel: '—',
    total: 0,
  };

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

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe({
      next: (res) => {
        console.log(res);
        this.fieldName = res.get('courtName')!;
        this.totalPrice = Number(res.get('grandTotal')!);
        console.log(this.fieldName, this.totalPrice);
      }
    });
    this.activatedRoute.paramMap.subscribe((pm) => {
      const court = Number(pm.get('selectedCourtId'));
      const slot = Number(pm.get('selectedSlotsId'));
      this.MaincourtId = Number(pm.get('MainCourtId'));
      this.courtId = Number.isFinite(court) ? court : null;
      this.timeslotId = Number.isFinite(slot) ? slot : null;
      this.SelectedDate = pm.get('selectedDateISO');
      this.courtLabel = this.courtId ? `Court ${this.courtId}` : '—';
      this.dateLabel = this.formatDateLabel(this.SelectedDate);
      this.timeLabel = this.timeslotId ? `Timeslot ${this.timeslotId}` : '—';
      this.booking.field = this.fieldName;
      this.booking.total = this.totalPrice;
      this.booking.pitch = this.courtLabel;
      this.booking.dateLabel = this.dateLabel;
      this.booking.timeLabel = this.timeLabel;
      this.CreateBookingForm.patchValue({
        court_id: this.courtId,
        timeslot_id: this.timeslotId,
      });
      this.GetBookingSummary();
    });
    this.GetSpecificCourt();
  }

  ngOnDestroy(): void {
    this.clearUploadTimer();
    this.clearConfirmTimer();
    this.clearCloseAnimTimer();
    if (this.uploadedPreviewUrl) URL.revokeObjectURL(this.uploadedPreviewUrl);
  }

  // Dynamic payment method label mapping
  getPaymentLabel(type: string): string {
    if (type === 'instapay') return 'Instapay';
    if (['vodafone_cash', 'etisalat_cash', 'orange_cash', 'we_pay'].includes(type)) {
      return 'Digital Wallet';
    }
    return type;
  }

  // Selection handler
  onPaymentMethodSelect(method: PaymentMethod): void {
    this.selectedPaymentMethod = method;
    this.transferAddress = method.identifier;
    this.CreateBookingForm.patchValue({ payment_method_id: method.id });
  }

  // Updated copy method using dynamic transferAddress
  async copyPayAddress(): Promise<void> {
    if (!this.transferAddress) return;
    try {
      await navigator.clipboard.writeText(this.transferAddress);
      console.log('Copied:', this.transferAddress);
      this.toastService.success('Address copied');
    } catch (e) {
      console.error('Copy failed', e);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) return;

    this.lastSelectedFile = file;
    this.receiptFile = file;
    this.receiptFileName = file.name;
    this.CreateBookingForm.patchValue({ receipt_image: file });

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

    this.CreateBookingForm.patchValue({ receipt_image: null });

    if (this.uploadedPreviewUrl) URL.revokeObjectURL(this.uploadedPreviewUrl);
    this.uploadedPreviewUrl = null;
  }

  confirmReservation(): void {
    if (this.confirmStatus === 'loading') return;
    if (!this.courtId || !this.timeslotId) return;
    if (!this.receiptFile || this.uploadStatus !== 'success') return;
    this.CreateBookingForm.patchValue({
      court_id: this.courtId,
      timeslot_id: this.timeslotId,
    });

    const court_id = this.CreateBookingForm.get('court_id')?.value;
    const timeslot_id = this.CreateBookingForm.get('timeslot_id')?.value;
    const payment_method_id = this.CreateBookingForm.get('payment_method_id')?.value;
    const receipt_image = this.CreateBookingForm.get('receipt_image')?.value;

    if (!court_id || !timeslot_id || !payment_method_id || !receipt_image) {
      this.toastService.error('Missing required data');
      return;
    }
    const fd = new FormData();
    fd.append('court_id', String(court_id));
    fd.append('timeslot_id', String(timeslot_id));
    fd.append('payment_method_id', String(payment_method_id));
    fd.append('receipt_image', receipt_image);

    this.clearConfirmTimer();
    this.closeStatusModal(true);

    this.confirmStatus = 'loading';
    this.confirmErrorMessage = '';

    this.myBookingsService.CreateBooking(fd).subscribe({
      next: (res) => {
        this.confirmStatus = 'success';
        this.openStatusModal('confirmSuccess');
        this.toastService.success('Reservation submitted successfully');
        console.log(res);
      },
      error: (err) => {
        this.confirmStatus = 'error';
        this.confirmErrorMessage = 'Reservation failed. Please try again.';
        this.openStatusModal('confirmError');
        this.toastService.error('Reservation failed. Please try again.');
        console.error(err);
      },
    });
  }

  retryConfirm(): void {
    this.closeStatusModal();
    this.confirmReservation();
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

  private formatDateLabel(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  }

  private to12h(hhmm: string): string {
    const [hh, mm] = hhmm.split(':').map(Number);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return hhmm;
    const h = hh % 12 || 12;
    const ap = hh >= 12 ? 'PM' : 'AM';
    return `${h}:${String(mm).padStart(2, '0')} ${ap}`;
  }

  GetBookingSummary(): void {
    this.dateLabel = this.formatDateLabel(this.SelectedDate);
    this.booking.dateLabel = this.dateLabel;
    if (!this.courtId || !this.timeslotId || !this.SelectedDate) {
      this.timeLabel = this.timeslotId ? `Timeslot ${this.timeslotId}` : '—';
      this.booking.timeLabel = this.timeLabel;
      return;
    }

    this.customerTimeslotService.GetCustomerTimeSlot(this.courtId, this.SelectedDate).subscribe({
      next: (res) => {
        const list = (res?.data ?? []) as Icustomertimeslot[];
        this.SummaryDetails = Array.isArray(list) ? list : [];

        const slot = this.SummaryDetails.find((x) => Number(x.id) === Number(this.timeslotId));
        if (slot?.start_time && slot?.end_time) {
          const start = slot.start_time.slice(0, 5);
          const end = slot.end_time.slice(0, 5);
          this.timeLabel = `${this.to12h(start)} – ${this.to12h(end)}`;
        } else {
          this.timeLabel = `Timeslot ${this.timeslotId}`;
        }

        this.booking.timeLabel = this.timeLabel;
      },
      error: () => {
        this.timeLabel = `Timeslot ${this.timeslotId}`;
        this.booking.timeLabel = this.timeLabel;
      },
    });
  }

  GetSpecificCourt(): void {
    this.venuesService.GetSpecCourts(this.MaincourtId!, this.courtId!).subscribe({
      next: (res) => {
        console.log(res.data);
        const methods = res.data.maincourt.payment_methods;
        // Map API response to PaymentMethod array
        this.paymentMethods = methods.map((m: any) => ({
          id: m.id,               // ensure API provides 'id'
          type: m.type,
          identifier: m.identifier
        }));
        // Optionally select the first method by default
        if (this.paymentMethods.length > 0) {
          this.onPaymentMethodSelect(this.paymentMethods[0]);
        }
      },
      error: (err) => {
        console.error('Failed to load payment methods', err);
      }
    });
  }
}