import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from "@angular/router";
import { CourtOwnerMainCourtsService } from '../../../../core/services/CourtOwnerMainCourts/court-owner-main-courts.service';
import { ICourtOwnerMainCourt } from '../../../interfaces/icourt-owner-main-court';

@Component({
  selector: 'app-court-owner-management',
  imports: [CommonModule, NgOptimizedImage, RouterLink],
  templateUrl: './court-owner-management.component.html',
  styleUrl: './court-owner-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourtOwnerManagementComponent implements OnInit {
  private readonly courtOwnerMainCourtsService = inject(CourtOwnerMainCourtsService);

  // State Signals
  mainCourts = signal<ICourtOwnerMainCourt[]>([]);
  isDeleteModalOpen = signal<boolean>(false);
  selectedCourtId = signal<number | null>(null);

  readonly fallbackImg = 'https://images.unsplash.com/photo-1529900903110-d02f0acdf33d?q=80&w=800';

  ngOnInit(): void {
    this.GetCourt();
  }

  selectedCourt = computed(() =>
    this.mainCourts().find(c => c.id === this.selectedCourtId()) || this.mainCourts()[0] || null
  );

  selectCourt(id: number | undefined) {
    if (id !== undefined) {
      this.selectedCourtId.set(id);
    }
  }

  handleImgError(event: any) {
    event.target.src = this.fallbackImg;
  }

  formatCurrency(value: number | undefined): string {
    const val = value ?? 0;
    return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Modal methods
  openDeleteModal(): void {
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
  }

  confirmDeleteCourt(): void {
    // Execute the actual DeleteCourt service call
    this.DeleteCourt();
    // Close modal after deletion (modal will close on service success)
  }

  downloadCsv() {
    const header = ["Property Name", "Status", "Sub Courts", "Verified"];
    const rows = this.mainCourts().map(c => [
      c?.name || 'N/A',
      c?.status || 'N/A',
      c?.courts?.length || 0,
      c?.is_verified ? 'Yes' : 'No'
    ]);
    const csvContent = [header, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'court_portfolio_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  GetCourt(): void {
    this.courtOwnerMainCourtsService.GetMainCourt().subscribe({
      next: (res: any) => {
        const data = res?.data || [];
        this.mainCourts.set(data);
        if (data.length > 0) {
          this.selectedCourtId.set(data[0].id);
        }
      }
    });
  }

  DeleteCourt(): void {
    this.courtOwnerMainCourtsService.DeleteMainCourt(this.selectedCourtId()?.toString() || '').subscribe({
      next: (res) => {
        console.log(res);
        // Update local state after successful deletion
        const currentId = this.selectedCourtId();
        this.mainCourts.update(prev => prev.filter(c => c.id !== currentId));
        if (this.mainCourts().length > 0) {
          this.selectedCourtId.set(this.mainCourts()[0].id);
        } else {
          this.selectedCourtId.set(null);
        }
        // Close modal
        this.closeDeleteModal();
      },
      error: (err) => {
        console.error('Delete failed', err);
        // Optionally keep modal open or show error toast
        this.closeDeleteModal(); // Close anyway for UX
      }
    });
  }
}