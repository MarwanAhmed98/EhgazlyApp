import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CourtOwnerCourtsService } from '../../../../core/services/CourtOwnerCourts/court-owner-courts.service';
import { IcourtownerCourts } from '../../../interfaces/icourtowner-courts';

@Component({
  selector: 'app-court-owner-specific-courts',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './court-owner-specific-courts.component.html',
  styleUrls: ['./court-owner-specific-courts.component.scss']
})
export class CourtOwnerSpecificCourtsComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private courtOwnerCourtsService = inject(CourtOwnerCourtsService);

  courtData: IcourtownerCourts | null = null;
  // isLoading = true;
  // errorMessage = '';
  fallbackImage = 'https://images.unsplash.com/photo-1529900903110-d02f0acdf33d?q=80&w=800';

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe({
      next: (params) => {
        const mainCourtId = params.get('mainCourtId');
        const courtId = params.get('id');
        if (mainCourtId && courtId) {
          this.loadSpecificCourt(mainCourtId, courtId);
        } else {
          // this.errorMessage = 'Missing court identifier in URL. Please navigate from the Courts Management page.';
          // this.isLoading = false;
        }
      },
      error: () => {
        // this.errorMessage = 'Failed to parse route parameters.';
        // this.isLoading = false;
      }
    });
  }

  private loadSpecificCourt(mainCourtId: string, courtId: string): void {
    // this.isLoading = true;
    // this.errorMessage = '';
    this.courtOwnerCourtsService.ShowSpecificCourt(mainCourtId, courtId).subscribe({
      next: (res) => {
        this.courtData = res?.data || null;
        // this.isLoading = false;
        if (!this.courtData) {
          // this.errorMessage = 'Court not found.';
        }
      },
      error: (err) => {
        console.error(err);
        // this.isLoading = false;
        if (err.status === 404) {
          // this.errorMessage = 'Court not found. It may have been deleted.';
        } else {
          // this.errorMessage = 'Unable to load court details. Please try again later.';
        }
      }
    });
  }

  goBackToCourts(): void {
    this.router.navigate(['/CourtOwner/Courts']);
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = this.fallbackImage;
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  openImage(url: string): void {
    window.open(url, '_blank');
  }
}