import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PlayernavComponent } from "../../../../layouts/playernav/playernav/playernav.component";
import { PlayerProfileService } from '../../../../core/services/PlayerProfile/player-profile.service';
import { Iplayerprofile } from '../../../interfaces/iplayerprofile';
import { FormControl, FormGroup } from '@angular/forms';
import { finalize } from 'rxjs';
import { MyBookingsService } from '../../../../core/services/MyBookings/my-bookings.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { IBookings } from '../../../interfaces/i-bookings';
import { RouterLink } from '@angular/router';
import { AiComponent } from "../../Ai/ai/ai.component";

type Tab = 'upcoming' | 'previous';

@Component({
  selector: 'app-customer-profile',
  imports: [CommonModule, PlayernavComponent, RouterLink, DatePipe, AiComponent],
  templateUrl: './customer-profile.component.html',
  styleUrl: './customer-profile.component.scss'
})
export class CustomerProfileComponent implements OnInit {
  private readonly playerProfileService = inject(PlayerProfileService);
  ProfileDetails: Iplayerprofile = {} as Iplayerprofile;
  private readonly myBookingsService = inject(MyBookingsService);
  private readonly toastService = inject(ToastService);
  allBookings = signal<IBookings[]>([]);
  tab = signal<Tab>('upcoming');
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
  tempAvatar = signal('');
  private selectedImageFile: File | null = null;

  ngOnInit(): void {
    this.GetProfileData();
    this.getAllBookings();
  }

  // ─── Helper methods for status colors ───────────────────────────────────
  getStatusBadgeClass(status: string): string {
    const lowerStatus = status?.toLowerCase();
    if (lowerStatus === 'confirmed' || lowerStatus === 'completed') {
      return 'bg-green-100 text-green-800 border border-green-200';
    }
    if (lowerStatus === 'pending') {
      return 'bg-amber-100 text-amber-800 border border-amber-200';
    }
    if (lowerStatus === 'cancelled' || lowerStatus === 'canceled' || lowerStatus === 'rejected') {
      return 'bg-red-100 text-red-800 border border-red-200';
    }
    return 'bg-gray-100 text-gray-800 border border-gray-200';
  }

  getStatusDotColor(status: string): string {
    const lowerStatus = status?.toLowerCase();
    if (lowerStatus === 'confirmed' || lowerStatus === 'completed') {
      return 'bg-green-500';
    }
    if (lowerStatus === 'pending') {
      return 'bg-amber-500';
    }
    if (lowerStatus === 'cancelled' || lowerStatus === 'canceled' || lowerStatus === 'rejected') {
      return 'bg-red-500';
    }
    return 'bg-gray-400';
  }

  // ─── Existing methods (unchanged business logic) ────────────────────────
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

  filteredBookings = computed(() => {
    const data = this.allBookings();
    const currentTab = this.tab();
    if (!Array.isArray(data)) {
      return [];
    }
    if (currentTab === 'upcoming') {
      return data.filter(b => b.status === 'pending' || b.status === 'confirmed');
    } else {
      return data.filter(b => b.status === 'completed' || b.status === 'rejected' || b.status === 'cancelled');
    }
  });

  setTab(selectedTab: Tab): void {
    this.tab.set(selectedTab);
  }

  getAllBookings(): void {
    this.myBookingsService.GetShowBooking().subscribe({
      next: (res) => {
        if (res && res.data && Array.isArray(res.data.bookings)) {
          this.allBookings.set(res.data.bookings);
          console.log(res.data.bookings);
        } else {
          console.warn('API response structure is different than expected:', res);
          this.allBookings.set([]);
        }
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
        this.allBookings.set([]);
      }
    });
  }

  CancelBooking(id: any): void {
    this.myBookingsService.CancelBooking(id).subscribe({
      next: (res) => {
        console.log(res);
        this.toastService.success(res.message || 'Booking cancelled successfully');
        this.getAllBookings();
      }
    });
  }
}