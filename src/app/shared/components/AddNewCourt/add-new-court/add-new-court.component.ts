import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, finalize, of, catchError } from 'rxjs';
import { CourtOwnerMainCourtsService } from '../../../../core/services/CourtOwnerMainCourts/court-owner-main-courts.service';
import { GeocodingService } from '../../../../core/services/GeocodingService/geocoding-service.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
// import { GeocodingService } from '../../../../core/services/geocoding/geocoding.service';

type GalleryUploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface GalleryImage {
  id: number;
  file: File;
  preview: string;
}

@Component({
  selector: 'app-add-new-court',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-new-court.component.html',
  styleUrl: './add-new-court.component.scss'
})
export class AddNewCourtComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly courtOwnerMainCourtsService = inject(CourtOwnerMainCourtsService);
  private readonly toastService = inject(ToastService);
  private readonly geocodingService = inject(GeocodingService);

  private destroy$ = new Subject<void>();
  geocodingLoading = false;

  // ================= UI STATE =================
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  // ================= FORM =================
  CourtForm: FormGroup = new FormGroup({
    courtSize: new FormControl('5A', [Validators.required]),
    courtName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    description: new FormControl('', [Validators.required, Validators.minLength(20)]),
    mapsLink: new FormControl('', [Validators.required, Validators.pattern('https?://.*')]),
    amenities: new FormGroup({
      floodlights: new FormControl(false),
      parking: new FormControl(false),
      lockerRooms: new FormControl(false),
      cafe: new FormControl(false),
      showers: new FormControl(false),
      wifi: new FormControl(false)
    }),
    address: new FormControl('', [Validators.required]),
    latitude: new FormControl<number | null>(null, [Validators.required]),
    longitude: new FormControl<number | null>(null, [Validators.required]),
    status: new FormControl<'active' | 'inactive'>('active', [Validators.required]),
    is_verified: new FormControl<boolean>(true, [Validators.required])
  });

  constructor() {
    this.setupGeocoding();
  }

  private setupGeocoding(): void {
    this.CourtForm.get('address')?.valueChanges.pipe(
      debounceTime(800),
      distinctUntilChanged(),
      switchMap(address => {
        const trimmed = (address || '').toString().trim();
        if (!trimmed) {
          this.clearLatLng();
          return of(null);
        }
        this.geocodingLoading = true;
        this.errorMessage = '';
        return this.geocodingService.getCoordinates(trimmed).pipe(
          catchError(err => {
            console.error('Geocoding error:', err);
            this.errorMessage = 'Could not detect coordinates from address. Please check the address or enter manually.';
            this.clearLatLng();
            return of(null);
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(result => {
      this.geocodingLoading = false;
      if (result) {
        this.CourtForm.patchValue({
          latitude: result.lat,
          longitude: result.lon
        }, { emitEvent: false });
        if (this.errorMessage?.includes('Could not detect')) {
          this.errorMessage = '';
        }
      }
    });
  }

  private clearLatLng(): void {
    this.CourtForm.patchValue({
      latitude: null,
      longitude: null
    }, { emitEvent: false });
  }

  // ================= SIZE =================
  selectedSize: string = '5A';

  selectSize(size: string): void {
    this.selectedSize = size;
    this.CourtForm.get('courtSize')?.setValue(size);
  }

  // ================= GALLERY LOGIC =================
  galleryImages = signal<GalleryImage[]>([]);
  galleryUploadStatus: GalleryUploadStatus = 'idle';
  galleryError = '';

  private galleryIdCounter = 0;
  private galleryTimer: number | null = null;

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

  // ================= HELPERS =================
  previewMap(): void {
    const link = (this.CourtForm.get('mapsLink')?.value || '').toString().trim();
    if (!link) return;
    window.open(link, '_blank', 'noopener,noreferrer');
  }

  private toNumber(value: unknown): number {
    if (typeof value === 'number') return value;
    const parsed = Number(value);
    return parsed;
  }

  private extractErrorMessage(err: any): string {
    return (
      err?.error?.message ||
      err?.error?.error ||
      err?.message ||
      'Something went wrong. Please try again.'
    );
  }

  // ================= ADD NEW COURT =================
  submitForm(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.CourtForm.invalid) {
      this.CourtForm.markAllAsTouched();
      return;
    }

    const raw = this.CourtForm.getRawValue();

    const payload = {
      name: (raw.courtName ?? '').toString().trim(),
      description: (raw.description ?? '').toString().trim(),
      address: (raw.address ?? '').toString().trim(),
      map_link: (raw.mapsLink ?? '').toString().trim(),
      latitude: this.toNumber(raw.latitude),
      longitude: this.toNumber(raw.longitude),
      status: (raw.status ?? 'active') as 'active' | 'inactive',
      is_verified: !!raw.is_verified
    };

    this.isSubmitting = true;

    this.courtOwnerMainCourtsService
      .AddMainCourt(payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (res) => {
          this.toastService.success(res.message || 'Court added successfully.');
          this.router.navigate(['/CourtOwner/CourtOwnerManagement']);
          this.successMessage = 'Court added successfully.';
          this.CourtForm.reset({
            courtSize: '5A',
            status: 'active',
            is_verified: true
          });
          this.selectedSize = '5A';
          this.galleryImages().forEach(img => URL.revokeObjectURL(img.preview));
          this.galleryImages.set([]);
          this.galleryUploadStatus = 'idle';
          this.galleryError = '';
        },
        error: (err) => {
          this.errorMessage = this.extractErrorMessage(err);
        }
      });
  }

  discardChanges(): void {
    this.CourtForm.reset({
      courtSize: '5A',
      status: 'active',
      is_verified: true
    });
    this.selectedSize = '5A';
    this.galleryImages().forEach(img => URL.revokeObjectURL(img.preview));
    this.galleryImages.set([]);
    this.galleryUploadStatus = 'idle';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.galleryImages().forEach(img => URL.revokeObjectURL(img.preview));
  }
}