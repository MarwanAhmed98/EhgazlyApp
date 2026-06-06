import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CourtOwnerCourtsService } from '../../../../core/services/CourtOwnerCourts/court-owner-courts.service';
import { CourtOwnerMainCourtsService } from '../../../../core/services/CourtOwnerMainCourts/court-owner-main-courts.service';
import { ICourtOwnerMainCourt } from '../../../interfaces/icourt-owner-main-court';
import { IcourtownerCourts } from '../../../interfaces/icourtowner-courts';
import { LucideAngularModule } from 'lucide-angular';
import { RouterLink } from "@angular/router";


@Component({
  selector: 'app-court-owner-courts',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CurrencyPipe, LucideAngularModule, RouterLink],
  templateUrl: './court-owner-courts.component.html',
  styleUrls: ['./court-owner-courts.component.scss']
})
export class CourtOwnerCourtsComponent implements OnInit {
  private courtOwnerCourtsService = inject(CourtOwnerCourtsService);
  private courtOwnerMainCourtsService = inject(CourtOwnerMainCourtsService);
  private fb = inject(FormBuilder);
  mainCourts: WritableSignal<ICourtOwnerMainCourt[]> = signal([]);
  selectedMainCourtId: WritableSignal<number | null> = signal(null);
  courts: WritableSignal<IcourtownerCourts[]> = signal([]);
  isFormModalOpen = signal(false);
  isEditMode = signal(false);
  isDeleteModalOpen = signal(false);
  isViewModalOpen = signal(false);
  isSubmitting = signal(false);

  currentCourtId: number | null = null;
  courtToDelete: IcourtownerCourts | null = null;
  selectedCourt = signal<IcourtownerCourts | null>(null);
  courtForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadMainCourts();
  }

  initForm(): void {
    this.courtForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      type: ['', Validators.required],
      surface_type: ['', Validators.required],
      price_per_hour: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      status: ['', Validators.required]
    });
  }

  loadMainCourts(): void {
    this.courtOwnerMainCourtsService.GetMainCourt().subscribe({
      next: (res) => {
        const data = res?.data || [];
        this.mainCourts.set(data);
        if (data.length > 0) {
          this.selectedMainCourtId.set(data[0].id);
          this.loadCourts();
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
    this.loadCourts();
  }

  loadCourts(): void {
    const mainId = this.selectedMainCourtId();
    if (!mainId) return;

    this.courtOwnerCourtsService.ShowAllCourt(mainId).subscribe({
      next: (res) => {
        this.courts.set(res?.data || []);

      },
      error: (err) => {
        console.error(err);

      }
    });
  }
  openAddModal(): void {
    this.isEditMode.set(false);
    this.currentCourtId = null;
    this.courtForm.reset({
      name: '',
      description: '',
      type: '',
      surface_type: '',
      price_per_hour: '',
      status: ''
    });
    this.isFormModalOpen.set(true);
  }
  openEditModal(court: IcourtownerCourts): void {
    this.isEditMode.set(true);
    this.currentCourtId = court.id;
    this.courtForm.patchValue({
      name: court.name,
      description: court.description,
      type: court.type,
      surface_type: court.surface_type,
      price_per_hour: court.price_per_hour,
      status: court.status
    });
    this.isFormModalOpen.set(true);
  }

  submitCourtForm(): void {
    if (this.courtForm.invalid) {
      this.courtForm.markAllAsTouched();
      return;
    }

    const formValue = this.courtForm.value;
    const payload = {
      name: formValue.name,
      description: formValue.description,
      type: formValue.type,
      surface_type: formValue.surface_type,
      price_per_hour: formValue.price_per_hour,
      status: formValue.status
    };

    const mainId = this.selectedMainCourtId();
    if (!mainId) return;

    this.isSubmitting.set(true);
    if (this.isEditMode() && this.currentCourtId) {
      this.courtOwnerCourtsService.UpdateCourt(mainId.toString(), this.currentCourtId.toString(), payload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeFormModal();
          this.loadCourts();
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting.set(false);

        }
      });
    } else {
      this.courtOwnerCourtsService.AddCourt(mainId.toString(), payload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeFormModal();
          this.loadCourts();
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting.set(false);

        }
      });
    }
  }

  openDeleteConfirm(court: IcourtownerCourts): void {
    this.courtToDelete = court;
    this.isDeleteModalOpen.set(true);
  }

  confirmDelete(): void {
    if (!this.courtToDelete) return;
    const mainId = this.selectedMainCourtId();
    if (!mainId) return;
    this.isSubmitting.set(true);
    this.courtOwnerCourtsService.DeleteCourt(mainId.toString(), this.courtToDelete.id.toString()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeDeleteModal();
        this.loadCourts();
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting.set(false);

      }
    });
  }
  openViewModal(court: IcourtownerCourts): void {
    this.selectedCourt.set(court);
    this.isViewModalOpen.set(true);
  }
  closeFormModal(): void {
    this.isFormModalOpen.set(false);
  }
  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.courtToDelete = null;
  }
  closeViewModal(): void {
    this.isViewModalOpen.set(false);
    this.selectedCourt.set(null);
  }
}