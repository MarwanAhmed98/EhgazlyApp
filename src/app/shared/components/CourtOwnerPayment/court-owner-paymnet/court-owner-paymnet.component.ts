import { Component, inject, OnInit, Pipe, PipeTransform, signal, WritableSignal } from '@angular/core';
import { CourtOwnerMainCourtsService } from '../../../../core/services/CourtOwnerMainCourts/court-owner-main-courts.service';
import { ICourtOwnerMainCourt } from '../../../interfaces/icourt-owner-main-court';
import { CourtOwnerPaymentMethodService } from '../../../../core/services/CourtOwnerPaymentMethod/court-owner-payment-method.service';
import { ICourtOwnerPaymentMethod } from '../../../interfaces/icourt-owner-payment-method';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Pipe({ name: 'replaceUnderscore', standalone: true })
export class ReplaceUnderscorePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}
@Component({
  selector: 'app-court-owner-paymnet',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ReplaceUnderscorePipe],
  templateUrl: './court-owner-paymnet.component.html',
  styleUrl: './court-owner-paymnet.component.scss'
})
export class CourtOwnerPaymnetComponent implements OnInit {
  private mainCourtsService = inject(CourtOwnerMainCourtsService);
  private paymentService = inject(CourtOwnerPaymentMethodService);
  private fb = inject(FormBuilder);
  mainCourts: WritableSignal<ICourtOwnerMainCourt[]> = signal([]);
  selectedMainCourtId: WritableSignal<number | null> = signal(null);
  paymentMethods: WritableSignal<ICourtOwnerPaymentMethod[]> = signal([]);
  isFormModalOpen = signal(false);
  isEditMode = signal(false);
  isDeleteModalOpen = signal(false);
  isSubmitting = signal(false);

  currentPaymentId: number | null = null;
  paymentToDelete: ICourtOwnerPaymentMethod | null = null;

  paymentForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadMainCourts();
  }

  initForm(): void {
    this.paymentForm = this.fb.group({
      type: ['', Validators.required],
      identifier: ['', Validators.required],
      is_active: [true]
    });
  }

  loadMainCourts(): void {
    this.mainCourtsService.GetMainCourt().subscribe({
      next: (res) => {
        const data = res?.data || [];
        this.mainCourts.set(data);
        if (data.length > 0) {
          this.selectedMainCourtId.set(data[0].id);
          this.loadPaymentMethods();
        } else {
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onMainCourtChange(courtId: number): void {
    this.selectedMainCourtId.set(courtId);
    this.loadPaymentMethods();
  }

  loadPaymentMethods(): void {
    const mainId = this.selectedMainCourtId();
    if (!mainId) return;
    this.paymentService.ShowPaymentMethod(mainId).subscribe({
      next: (res) => {
        this.paymentMethods.set(res?.data || []);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  openAddModal(): void {
    this.isEditMode.set(false);
    this.currentPaymentId = null;
    this.paymentForm.reset({ type: '', identifier: '', is_active: true });
    this.isFormModalOpen.set(true);
  }

  openEditModal(method: ICourtOwnerPaymentMethod): void {
    this.isEditMode.set(true);
    this.currentPaymentId = method.id;
    this.paymentForm.patchValue({
      type: method.type,
      identifier: method.identifier,
      is_active: method.is_active
    });
    this.isFormModalOpen.set(true);
  }

  submitForm(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const formValue = this.paymentForm.value;
    const payload = {
      type: formValue.type,
      identifier: formValue.identifier,
      is_active: formValue.is_active
    };

    this.isSubmitting.set(true);

    if (this.isEditMode() && this.currentPaymentId) {
      this.paymentService.EditPaymentMethod(this.currentPaymentId, payload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeFormModal();
          this.loadPaymentMethods();
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting.set(false);
        }
      });
    } else {
      const mainId = this.selectedMainCourtId();
      if (!mainId) return;
      this.paymentService.AddPaymentMethod(mainId, payload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeFormModal();
          this.loadPaymentMethods();
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting.set(false);
        }
      });
    }
  }

  openDeleteConfirm(method: ICourtOwnerPaymentMethod): void {
    this.paymentToDelete = method;
    this.isDeleteModalOpen.set(true);
  }

  confirmDelete(): void {
    if (!this.paymentToDelete) return;
    this.isSubmitting.set(true);
    this.paymentService.DeletePaymentMethod(this.paymentToDelete.id).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeDeleteModal();
        this.loadPaymentMethods();
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting.set(false);

      }
    });
  }

  closeFormModal(): void {
    this.isFormModalOpen.set(false);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.paymentToDelete = null;
  }

}
