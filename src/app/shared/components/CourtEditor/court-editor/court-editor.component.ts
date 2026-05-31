import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { CourtOwnerMainCourtsService } from '../../../../core/services/CourtOwnerMainCourts/court-owner-main-courts.service';
import { ICourtOwnerSpecMainCourt } from '../../../interfaces/icourt-owner-spec-main-court';

type GalleryUploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface PendingImage {
  id: number;
  file: File;
  preview: string;
}

interface ExistingImage {
  id: string;
  url: string;
  is_primary: boolean;
}

interface Amenity {
  id: number;
  name: string;
  icon?: string;
}

@Component({
  selector: 'app-court-editor',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, UpperCasePipe],
  templateUrl: './court-editor.component.html',
  styleUrl: './court-editor.component.scss'
})
export class CourtEditorComponent implements OnInit, OnDestroy {
  private readonly courtOwnerMainCourtsService = inject(CourtOwnerMainCourtsService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  SpecDetails: ICourtOwnerSpecMainCourt = {} as ICourtOwnerSpecMainCourt;
  MainCourtName: string = '';
  productid: string = '';

  // Gallery state
  galleryUploadStatus: GalleryUploadStatus = 'idle';
  galleryError: string = '';
  isLoadingImages: boolean = false;
  private pendingIdCounter = 0;
  private objectUrls: string[] = [];

  pendingImages = signal<PendingImage[]>([]);
  existingImages = signal<ExistingImage[]>([]);

  // Amenities state
  isLoadingAmenities: boolean = false;
  availableAmenities = signal<Amenity[]>([]);
  selectedAmenityIds = signal<Set<number>>(new Set());

  courtForm: FormGroup = new FormGroup({
    courtName: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    hourlyRate: new FormControl(null, [Validators.required, Validators.min(0)]),
    description: new FormControl(null, [Validators.required, Validators.minLength(20)])
  });

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productid = id;
        this.loadCourtDetails();
        this.loadCourtImages();
        this.loadAmenities();
      }
    });
  }

  ngOnDestroy(): void {
    this.objectUrls.forEach(url => URL.revokeObjectURL(url));
  }

  private loadCourtDetails(): void {
    this.courtOwnerMainCourtsService.GetSpecificCourt(this.productid).subscribe({
      next: (res) => {
        this.SpecDetails = res.data;
        this.MainCourtName = this.SpecDetails.name;
      }
    });
  }

  private loadCourtImages(): void {
    this.isLoadingImages = true;
    this.courtOwnerMainCourtsService.GetSpecificCourt(this.productid).subscribe({
      next: (res) => {
        const images: ExistingImage[] = (res.data?.images || []).map((img: any) => ({
          id: img.id,
          url: img.url || img.image_url || img.path,
          is_primary: !!img.is_primary
        }));
        this.existingImages.set(images);
        this.isLoadingImages = false;
      },
      error: () => {
        this.isLoadingImages = false;
      }
    });
  }

  private loadAmenities(): void {
    this.isLoadingAmenities = true;
    this.courtOwnerMainCourtsService.GetMainCourtAmenities().subscribe({
      next: (res) => {
        const amenities: Amenity[] = (res.data || res || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          icon: a.icon || null
        }));
        this.availableAmenities.set(amenities);

        // Pre-select amenities already associated with the court
        const courtAmenityIds: number[] = (this.SpecDetails?.amenities || []).map((a: any) => a.id);
        this.selectedAmenityIds.set(new Set(courtAmenityIds));

        this.isLoadingAmenities = false;
      },
      error: () => {
        this.isLoadingAmenities = false;
      }
    });
  }

  // ---- Gallery Methods ----

  onGalleryFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    input.value = '';

    if (!files.length) return;

    this.galleryError = '';
    const allowed = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];
    const newPending: PendingImage[] = [];

    for (const file of files) {
      if (!allowed.includes(file.type) || file.size > 10 * 1024 * 1024) {
        this.galleryError = 'Some files were skipped. Only JPG, JPEG, PNG, WEBP under 10MB are allowed.';
        continue;
      }
      const url = URL.createObjectURL(file);
      this.objectUrls.push(url);
      newPending.push({ id: ++this.pendingIdCounter, file, preview: url });
    }

    this.pendingImages.update(prev => [...prev, ...newPending]);
  }

  removePendingImage(id: number): void {
    const img = this.pendingImages().find(i => i.id === id);
    if (img) {
      URL.revokeObjectURL(img.preview);
      this.objectUrls = this.objectUrls.filter(u => u !== img.preview);
    }
    this.pendingImages.update(prev => prev.filter(i => i.id !== id));
  }

  uploadPendingImages(): void {
    const pending = this.pendingImages();
    if (!pending.length || this.galleryUploadStatus === 'uploading') return;

    this.galleryUploadStatus = 'uploading';
    this.galleryError = '';

    const formData = new FormData();
    formData.append('is_primary', '1');
    pending.forEach(img => formData.append('images[]', img.file));

    this.courtOwnerMainCourtsService.AddMainCourtImage(this.productid, formData).subscribe({
      next: () => {
        this.galleryUploadStatus = 'success';
        pending.forEach(img => {
          URL.revokeObjectURL(img.preview);
          this.objectUrls = this.objectUrls.filter(u => u !== img.preview);
        });
        this.pendingImages.set([]);
        this.loadCourtImages();
      },
      error: () => {
        this.galleryUploadStatus = 'error';
        this.galleryError = 'Upload failed. Please try again.';
      }
    });
  }

  deleteExistingImage(imageId: string): void {
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) return;

    this.courtOwnerMainCourtsService.DeleteMainCourtImage(imageId).subscribe({
      next: () => {
        this.existingImages.update(prev => prev.filter(i => i.id !== imageId));
      },
      error: () => {
        this.galleryError = 'Failed to delete image. Please try again.';
      }
    });
  }

  // ---- Amenities Methods ----

  isAmenitySelected(id: number): boolean {
    return this.selectedAmenityIds().has(id);
  }

  toggleAmenity(id: number): void {
    const current = new Set(this.selectedAmenityIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedAmenityIds.set(current);
  }

  // ---- Form Submit ----

  submitForm(): void {
    const amenityIds = Array.from(this.selectedAmenityIds());

    this.courtOwnerMainCourtsService.AddMainCourtAmenities(this.productid, amenityIds).subscribe();

    if (this.courtForm.valid) {
      const payload = {
        ...this.courtForm.value,
        amenity_ids: amenityIds
      };
      this.courtOwnerMainCourtsService.EditMainCourt(this.productid, payload).subscribe();
    } else {
      this.courtForm.markAllAsTouched();
    }
  }

  removeCourt(): void {
    if (confirm('Are you sure you want to remove this court? This action is permanent.')) {
      this.courtOwnerMainCourtsService.DeleteMainCourt(this.productid).subscribe({
        next: () => this.router.navigate(['/owner/courts'])
      });
    }
  }
}