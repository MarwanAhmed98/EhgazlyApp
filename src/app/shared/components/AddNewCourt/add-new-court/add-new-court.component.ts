// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-add-new-court',
//   imports: [],
//   templateUrl: './add-new-court.component.html',
//   styleUrl: './add-new-court.component.scss'
// })
// export class AddNewCourtComponent {

// }
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

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
export class AddNewCourtComponent {
  private readonly router = inject(Router);

  // ================= FORM =================
  CourtForm: FormGroup = new FormGroup({
    courtSize: new FormControl('5A', [Validators.required]),
    courtName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    hourlyRate: new FormControl(null, [Validators.required, Validators.min(0)]),
    description: new FormControl('', [Validators.required, Validators.minLength(20)]),
    mapsLink: new FormControl('', [Validators.required, Validators.pattern('https?://.*')]),
    amenities: new FormGroup({
      floodlights: new FormControl(false),
      parking: new FormControl(false),
      lockerRooms: new FormControl(false),
      cafe: new FormControl(false),
      showers: new FormControl(false),
      wifi: new FormControl(false)
    })
  });

  // ================= SIZE =================
  selectedSize: string = '5A';

  selectSize(size: string): void {
    this.selectedSize = size;
    this.CourtForm.get('courtSize')?.setValue(size);
  }

  // ================= GALLERY LOGIC (FROM OLD CODE) =================
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
        const isInvalid =
          file.size > 10 * 1024 * 1024 ||
          !file.type.startsWith('image/');

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

  // ================= FORM ACTIONS =================
  submitForm(): void {
    if (this.CourtForm.valid) {
      const payload = {
        ...this.CourtForm.value,
        gallery: this.galleryImages().map(img => img.file)
      };

      console.log('Form Submitted:', payload);
    } else {
      this.CourtForm.markAllAsTouched();
    }
  }

  discardChanges(): void {
    this.CourtForm.reset({ courtSize: '5A' });
    this.selectedSize = '5A';

    // Reset gallery
    this.galleryImages().forEach(img => URL.revokeObjectURL(img.preview));
    this.galleryImages.set([]);
    this.galleryUploadStatus = 'idle';
  }
}