import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourtOwnerMainCourtsService } from '../../../../core/services/CourtOwnerMainCourts/court-owner-main-courts.service';
import { ActivatedRoute } from '@angular/router';
import { ICourtOwnerSpecificCourt } from '../../../interfaces/icourt-owner-specific-court';

@Component({
  selector: 'app-court-owner-specific-court',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './court-owner-specific-court.component.html',
  styleUrls: ['./court-owner-specific-court.component.scss']
})
export class CourtOwnerSpecificCourtComponent implements OnInit {
  private readonly courtOwnerMainCourtsService = inject(CourtOwnerMainCourtsService);
  private readonly activatedRoute = inject(ActivatedRoute);

  SpecificDetails: ICourtOwnerSpecificCourt | null = null;
  isLoading = true;
  readonly fallbackImg = 'https://images.unsplash.com/photo-1529900903110-d02f0acdf33d?q=80&w=800';

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe({
      next: (params) => {
        const id = params.get('id');
        if (id) {
          this.fetchCourtDetails(id);
        }
      }
    });
  }

  private fetchCourtDetails(id: string): void {
    this.isLoading = true;
    this.courtOwnerMainCourtsService.GetSpecificCourt(id).subscribe({
      next: (res) => {
        this.SpecificDetails = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load court details', err);
        this.isLoading = false;
      }
    });
  }

  handleImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = this.fallbackImg;
    }
  }
}