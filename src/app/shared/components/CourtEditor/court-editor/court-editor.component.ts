import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourtOwnerMainCourtsService } from '../../../../core/services/CourtOwnerMainCourts/court-owner-main-courts.service';
import { ICourtOwnerSpecMainCourt } from '../../../interfaces/icourt-owner-spec-main-court';
type GalleryUploadStatus = 'idle' | 'uploading' | 'success' | 'error';
interface GalleryImage {
  id: number;
  file: File;
  preview: string;
}

@Component({
  selector: 'app-court-editor',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './court-editor.component.html',
  styleUrl: './court-editor.component.scss'
})
export class CourtEditorComponent implements OnInit {
  private readonly courtOwnerMainCourtsService = inject(CourtOwnerMainCourtsService);
  private readonly activatedRoute = inject(ActivatedRoute);
  SpecDetails: ICourtOwnerSpecMainCourt = {} as ICourtOwnerSpecMainCourt;
  MainCourtName: string = '';
  productid: any;
  private readonly router = inject(Router);
  galleryImages = signal<GalleryImage[]>([]);
  galleryUploadStatus: GalleryUploadStatus = 'idle';
  galleryError = '';
  private galleryIdCounter = 0;
  private galleryTimer: number | null = null;
  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe({
      next: (res) => {
        this.productid = res.get('id');
        if (this.productid) {
          this.courtOwnerMainCourtsService.GetSpecificCourt(this.productid).subscribe({
            next: (res) => {
              this.SpecDetails = res.data;
              this.MainCourtName = this.SpecDetails.name;
            }
          });
        }
      }
    });
  }
  amenities = signal([
    { id: 'floodlights', label: 'FLOODLIGHTS', icon: 'lightbulb', selected: true },
    { id: 'natural_grass', label: 'NATURAL GRASS', icon: 'grass', selected: false },
    { id: 'vip_lounge', label: 'VIP LOUNGE', icon: 'diamond', selected: true },
    { id: 'parking', label: 'PARKING', icon: 'local_parking', selected: true },
    { id: 'showers', label: 'SHOWERS', icon: 'shower', selected: true },
    { id: 'wifi', label: 'WI-FI', icon: 'wifi', selected: false },
  ]);
  courtForm: FormGroup = new FormGroup({
    courtName: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    hourlyRate: new FormControl(null, [Validators.required, Validators.min(0)]),
    description: new FormControl(null, [Validators.required, Validators.minLength(20)])
  });

  toggleAmenity(index: number) {
    const updated = [...this.amenities()];
    updated[index].selected = !updated[index].selected;
    this.amenities.set(updated);
  }

  submitForm(): void {
    if (this.courtForm.valid) {
      const payload = {
        ...this.courtForm.value,
        amenities: this.amenities().filter(a => a.selected).map(a => a.id)
      };
      console.log('Saving Court Data:', payload);
      console.log(this.courtForm.value);
    } else {
      this.courtForm.markAllAsTouched();
    }
  }

  removeCourt(): void {
    if (confirm('Are you sure you want to remove this court? This action is permanent.')) {
      console.log('Court Removed');
    }
  }
  onGalleryFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    if (!files.length) return;

    this.startGalleryUpload(files);

    input.value = '';
  }

  private startGalleryUpload(files: File[]): void {
    this.clearGalleryTimer();

    this.galleryUploadStatus = 'uploading';
    this.galleryError = '';

    this.galleryTimer = window.setTimeout(() => {
      const newImages: GalleryImage[] = [];

      for (const file of files) {
        const isInvalid = file.size > 10 * 1024 * 1024 || !file.type.startsWith('image/');

        if (isInvalid) {
          this.galleryUploadStatus = 'error';
          this.galleryError = 'Invalid file detected.';
          return;
        }

        newImages.push({
          id: ++this.galleryIdCounter,
          file,
          preview: URL.createObjectURL(file)
        });
      }

      this.galleryImages.update(prev => [...prev, ...newImages]);
      this.galleryUploadStatus = 'success';
    }, 800);
  }

  removeImage(id: number): void {
    const img = this.galleryImages().find(i => i.id === id);
    if (img) URL.revokeObjectURL(img.preview);

    this.galleryImages.update(prev => prev.filter(i => i.id !== id));
  }

  private clearGalleryTimer(): void {
    if (this.galleryTimer) {
      window.clearTimeout(this.galleryTimer);
      this.galleryTimer = null;
    }
  }
}