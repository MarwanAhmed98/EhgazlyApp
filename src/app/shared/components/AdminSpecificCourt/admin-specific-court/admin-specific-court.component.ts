import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminManageCourtsService } from '../../../../core/services/AdminManageCourts/admin-manage-courts.service';
import { ActivatedRoute } from '@angular/router';
import { IAdminSpecificCourt } from '../../../interfaces/iadmin-specific-court';

@Component({
  selector: 'app-admin-specific-court',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-specific-court.component.html',
  styleUrl: './admin-specific-court.component.scss'
})
export class AdminSpecificCourtComponent implements OnInit {
  private readonly adminManageCourtsService = inject(AdminManageCourtsService);
  private readonly activatedRoute = inject(ActivatedRoute);

  SpecificDetails: IAdminSpecificCourt = {} as IAdminSpecificCourt;
  selectedImage: string | null = null;

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadCourt(id);
      }
    });
  }

  loadCourt(id: string): void {
    this.adminManageCourtsService.ShowSpecificCourt(id).subscribe({
      next: (res) => {
        this.SpecificDetails = res.data;
      },
      error: (err) => {
        console.error('Failed to load court details', err);
      }
    });
  }

  openImageModal(img: string): void {
    this.selectedImage = img;
  }

  closeImageModal(): void {
    this.selectedImage = null;
  }
}