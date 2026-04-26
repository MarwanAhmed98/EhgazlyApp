// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-court-owner-management',
//   imports: [],
//   templateUrl: './court-owner-management.component.html',
//   styleUrl: './court-owner-management.component.scss'
// })
// export class CourtOwnerManagementComponent {

// }
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from "@angular/router";

interface Court {
  id: string;
  name: string;
  image: string;
  status: 'ACTIVE' | 'MAINTENANCE';
  bookings: number;
  revenue: number;
}

@Component({
  selector: 'app-court-owner-management',
  imports: [CommonModule, NgOptimizedImage, RouterLink],
  templateUrl: './court-owner-management.component.html',
  styleUrl: './court-owner-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourtOwnerManagementComponent {
  // Placeholder image if specific URL fails
  readonly fallbackImg = 'https://images.unsplash.com/photo-1529900903110-d02f0acdf33d?q=80&w=800';

  courts = signal<Court[]>([
    {
      id: '1',
      name: 'Main Stadium',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000',
      status: 'ACTIVE',
      bookings: 14,
      revenue: 1240.00
    },
    {
      id: '2',
      name: 'Side Court B',
      image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3RhZGl1bXxlbnwwfHwwfHx8MA%3D%3D',
      status: 'ACTIVE',
      bookings: 8,
      revenue: 640.00
    },
    {
      id: '3',
      name: 'Training Grounds North',
      image: 'https://img.freepik.com/free-photo/soccer-players-action-professional-stadium_654080-1820.jpg?semt=ais_hybrid&w=740&q=80',
      status: 'MAINTENANCE',
      bookings: 0,
      revenue: 0.00
    }
  ]);
  isDeleteModalOpen = signal<boolean>(false);
  selectedCourtId = signal<string>('1');

  selectedCourt = computed(() =>
    this.courts().find(c => c.id === this.selectedCourtId()) || this.courts()[0]
  );

  selectCourt(id: string) {
    this.selectedCourtId.set(id);
  }

  handleImgError(event: any) {
    event.target.src = this.fallbackImg;
  }

  formatCurrency(value: number): string {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  toggleDeleteModal(isOpen: boolean) {
    this.isDeleteModalOpen.set(isOpen);
  }

  confirmDelete() {
    const currentId = this.selectedCourtId();
    this.courts.update(prev => prev.filter(c => c.id !== currentId));
    if (this.courts().length > 0) {
      this.selectedCourtId.set(this.courts()[0].id);
    }
    this.toggleDeleteModal(false);
  }

  registerFirstCourt() {
    // Resetting for demo purposes
    this.courts.set([
      {
        id: '1',
        name: 'New Century Arena',
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000',
        status: 'ACTIVE',
        bookings: 0,
        revenue: 0
      }
    ]);
    this.selectedCourtId.set('1');
  }
  downloadCsv() {
    const header = ["Property Name", "Status", "Bookings", "Revenue"];
    const rows = this.courts().map(c => [c.name, c.status, c.bookings, c.revenue]);
    const csvContent = [header, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'court_portfolio_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}