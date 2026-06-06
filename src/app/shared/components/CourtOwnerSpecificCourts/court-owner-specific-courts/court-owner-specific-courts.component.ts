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
  fallbackImage = 'https://images.unsplash.com/photo-1529900903110-d02f0acdf33d?q=80&w=800';

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe({
      next: (params) => {
        const mainCourtId = params.get('mainCourtId');
        const courtId = params.get('id');
        if (mainCourtId && courtId) {
          this.loadSpecificCourt(mainCourtId, courtId);
        } else {
        }
      },
      error: () => {

      }
    });
  }

  private loadSpecificCourt(mainCourtId: string, courtId: string): void {

    this.courtOwnerCourtsService.ShowSpecificCourt(mainCourtId, courtId).subscribe({
      next: (res) => {
        this.courtData = res?.data || null;

        if (!this.courtData) {

        }
      },
      error: (err) => {
        console.error(err);

        if (err.status === 404) {

        } else {

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