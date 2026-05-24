import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayernavComponent } from "../../../../layouts/playernav/playernav/playernav.component";
import { PlayerProfileService } from '../../../../core/services/PlayerProfile/player-profile.service';
import { Iplayerprofile } from '../../../interfaces/iplayerprofile';
import { FormControl, FormGroup } from '@angular/forms';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-customer-profile',
  imports: [CommonModule, PlayernavComponent],
  templateUrl: './customer-profile.component.html',
  styleUrl: './customer-profile.component.scss'
})
export class CustomerProfileComponent implements OnInit {
  private readonly playerProfileService = inject(PlayerProfileService);
  ProfileDetails: Iplayerprofile = {} as Iplayerprofile;
  PlayerRole: string = localStorage.getItem('role') ?? '';

  UpdateForm: FormGroup = new FormGroup({
    name: new FormControl(null),
    phone: new FormControl(null),
    profile_image: new FormControl<File | null>(null),
  });

  toastMessage = signal<string | null>(null);
  isModalOpen = signal(false);
  isUpdating = signal(false);

  tempName = signal('');
  tempPhone = signal('');
  tempAvatar = signal(''); // preview url/base64
  private selectedImageFile: File | null = null;

  ngOnInit(): void {
    this.GetProfileData();
  }

  showToast(message: string) {
    this.toastMessage.set(message);
    setTimeout(() => this.dismissToast(), 4000);
  }

  dismissToast() {
    this.toastMessage.set(null);
  }

  openEditModal() {
    this.tempName.set((this.ProfileDetails?.name ?? '').toString());
    this.tempPhone.set((this.ProfileDetails?.phone ?? '').toString());
    this.tempAvatar.set((this.ProfileDetails?.profile_image ?? '').toString());
    this.selectedImageFile = null;
    this.isModalOpen.set(true);
  }

  closeModal() {
    if (this.isUpdating()) return;
    this.isModalOpen.set(false);
  }

  onImageFileChange(event: Event) {
    const element = event.target as HTMLInputElement;
    const file = element.files?.[0];
    if (!file) return;

    const acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!acceptedTypes.includes(file.type)) {
      this.showToast('Upload Failed: Please select a valid JPG, JPEG, PNG, or WEBP image.');
      element.value = '';
      return;
    }

    this.selectedImageFile = file;
    this.UpdateForm.patchValue({ profile_image: file });

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        this.tempAvatar.set(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  }

  saveChanges() {
    if (this.isUpdating()) return;

    const cleanName = this.tempName().trim();
    const cleanPhone = this.tempPhone().trim();

    if (!cleanName || !cleanPhone) {
      this.showToast('Validation Error: Fields cannot be empty.');
      return;
    }

    this.isUpdating.set(true);

    const fd = new FormData();
    fd.append('name', cleanName);
    fd.append('phone', cleanPhone);
    if (this.selectedImageFile) fd.append('profile_image', this.selectedImageFile);

    this.playerProfileService
      .UpdateProfile(fd)
      .pipe(finalize(() => this.isUpdating.set(false)))
      .subscribe({
        next: (res) => {
          const updated = (res?.data ?? res?.customer ?? res) as Partial<Iplayerprofile>;

          this.ProfileDetails = {
            ...this.ProfileDetails,
            ...(updated as any),
            name: updated?.name ?? cleanName,
            phone: updated?.phone ?? cleanPhone,
            profile_image:
              (updated as any)?.profile_image ??
              this.ProfileDetails.profile_image,
          } as Iplayerprofile;

          // if backend doesn't return image url, keep current preview to avoid UI breaking
          if (this.selectedImageFile && !((updated as any)?.profile_image)) {
            this.ProfileDetails.profile_image = this.tempAvatar();
          }

          this.showToast('Your settings have been saved successfully!');
          this.closeModal();
        },
        error: (err) => {
          const msg =
            err?.error?.message ||
            err?.message ||
            'Update failed. Please try again.';
          this.showToast(msg);
        },
      });
  }

  shareProfile() {
    const dummyInput = document.createElement('input');
    document.body.appendChild(dummyInput);
    dummyInput.value = `Profile details for ${this.ProfileDetails?.name ?? ''}: ${this.ProfileDetails?.phone ?? ''}`;
    dummyInput.select();
    try {
      document.execCommand('copy');
      this.showToast('Profile info copied to clipboard!');
    } catch {
      this.showToast('Unable to copy profile link automatically.');
    }
    document.body.removeChild(dummyInput);
  }

  onAvatarError(event: any) {
    event.target.src =
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256';
  }

  GetProfileData(): void {
    this.playerProfileService.GetProfile().subscribe({
      next: (res) => {
        this.ProfileDetails = res.data;
      },
    });
  }
}