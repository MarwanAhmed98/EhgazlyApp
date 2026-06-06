import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CourtOwnerMainCourtsService } from '../../../../core/services/CourtOwnerMainCourts/court-owner-main-courts.service';
import { CourtOwnerWorkingHoursService } from '../../../../core/services/CourtOwnerWorkingHours/court-owner-working-hours.service';
import { ICourtOwnerMainCourt } from '../../../interfaces/icourt-owner-main-court';

@Component({
  selector: 'app-court-owner-working-hours',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './court-owner-working-hours.component.html',
  styleUrls: ['./court-owner-working-hours.component.scss']
})
export class CourtOwnerWorkingHoursComponent implements OnInit {
  private mainCourtsService = inject(CourtOwnerMainCourtsService);
  private workingHoursService = inject(CourtOwnerWorkingHoursService);
  private fb = inject(FormBuilder);

  mainCourts: ICourtOwnerMainCourt[] = [];
  selectedMainCourtId: number | null = null;
  workingHoursList: any[] = [];
  isModalOpen = false;
  isSubmitting = false;

  daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  hoursForm!: FormGroup;

  ngOnInit(): void {
    this.loadMainCourts();
  }

  loadMainCourts(): void {
    this.mainCourtsService.GetMainCourt().subscribe({
      next: (res) => {
        this.mainCourts = res.data || [];
        if (this.mainCourts.length > 0) {
          this.selectedMainCourtId = this.mainCourts[0].id;
          this.loadWorkingHours();
        }
      },
      error: (err) => console.error(err)
    });
  }

  onMainCourtChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedMainCourtId = parseInt(target.value, 10);
    this.loadWorkingHours();
  }

  loadWorkingHours(): void {
    if (!this.selectedMainCourtId) return;
    this.workingHoursService.ShowWorkingHours(this.selectedMainCourtId.toString()).subscribe({
      next: (res) => { this.workingHoursList = res.data || []; },
      error: (err) => console.error(err)
    });
  }
  formatTime(time: string): string {
    if (!time) return '';
    const hhmm = time.substring(0, 5);
    if (hhmm === '00:00') return '24:00';
    return hhmm;
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  openHoursModal(): void {
    this.initForm();
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.isSubmitting = false;
  }

  initForm(): void {
    const group: any = {};
    this.daysOfWeek.forEach(day => {
      const existing = this.workingHoursList.find(h => h.day_of_week === day);
      const isOpen = existing ? existing.is_open : false;
      const openTime = existing?.open_time
        ? existing.open_time.substring(0, 5)
        : '09:00';
      const closeTime = existing?.close_time
        ? existing.close_time.substring(0, 5)
        : '18:00';

      group[day] = [isOpen];
      group[day + '_open'] = [{ value: openTime, disabled: !isOpen }];
      group[day + '_close'] = [{ value: closeTime, disabled: !isOpen }];
    });
    this.hoursForm = this.fb.group(group);
  }

  onOpenToggle(day: string): void {
    const isOpen = this.hoursForm.get(day)?.value;
    const openControl = this.hoursForm.get(day + '_open');
    const closeControl = this.hoursForm.get(day + '_close');
    if (isOpen) {
      openControl?.enable();
      closeControl?.enable();
    } else {
      openControl?.disable();
      closeControl?.disable();
    }
  }

  getDayControlValue(day: string): { is_open: boolean } {
    return { is_open: this.hoursForm.get(day)?.value || false };
  }
  private toBackendTime(hhmm: string): string {
    return hhmm;
  }

  submitHours(): void {
    if (!this.selectedMainCourtId) return;
    this.isSubmitting = true;
    const hoursPayload = [];

    for (const day of this.daysOfWeek) {
      const isOpen = this.hoursForm.get(day)?.value;
      if (isOpen) {
        const openTime = this.hoursForm.get(day + '_open')?.value;
        const closeTime = this.hoursForm.get(day + '_close')?.value;
        hoursPayload.push({
          day_of_week: day,
          open_time: this.toBackendTime(openTime),
          close_time: this.toBackendTime(closeTime),
          is_open: true
        });
      } else {
        hoursPayload.push({ day_of_week: day, is_open: false });
      }
    }

    this.workingHoursService.AddWorkHours(
      this.selectedMainCourtId.toString(),
      { hours: hoursPayload }
    ).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeModal();
        this.loadWorkingHours();
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
      }
    });
  }
}