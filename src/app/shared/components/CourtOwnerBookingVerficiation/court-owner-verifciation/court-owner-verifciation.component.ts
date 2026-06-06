import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CourtOwnerBokkingService } from '../../../../core/services/CourtOwnerBooking/court-owner-bokking.service';
import { ActivatedRoute } from '@angular/router';
import { IcourtOwnerSpecific } from '../../../interfaces/icourt-owner-specific';
import { LucideAngularModule } from 'lucide-angular';

type Summary = {
  playerName: string;
  pitchLocation: string;
  dateLabel: string;
  timeSlotLabel: string;
  totalAmountEgp: number;
};

type Profile = {
  name: string;
  phone: string;
};

type VerifyState = 'idle' | 'submitting' | 'done';

@Component({
  selector: 'app-court-owner-verifciation',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './court-owner-verifciation.component.html',
  styleUrl: './court-owner-verifciation.component.scss'
})
export class CourtOwnerVerifciationComponent implements OnInit {
  private readonly courtOwnerBookingService = inject(CourtOwnerBokkingService);
  private readonly activatedRoute = inject(ActivatedRoute);
  SpecificDetails: IcourtOwnerSpecific = {} as IcourtOwnerSpecific;

  MyId: any;

  summary: Summary = {
    playerName: 'Ahmed Hassan',
    pitchLocation: 'Bernabeu Main',
    dateLabel: 'Oct 24, 2023',
    timeSlotLabel: '08:00 PM – 09:30 PM',
    totalAmountEgp: 450,
  };

  profile: Profile = {
    name: 'Ahmed Hassan',
    phone: '+20 10 2345 6789',
  };

  guidelines: string[] = [
    'Verify Transaction ID uniqueness.',
    'Cross-reference amount with pitch rates.',
    'Check date stamp on external receipt.',
  ];

  isConfirmModalOpen = false;
  isRejectModalOpen = false;

  rejectReason = '';

  verifyState: VerifyState = 'idle';
  isImageModalOpen = false;
  currentImageUrl = '';

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe({
      next: (res) => {
        console.log(res);
        this.MyId = res.get('id');
        console.log(this.MyId);
        this.courtOwnerBookingService.GetSpecificBookings(this.MyId).subscribe({
          next: (res) => {
            this.SpecificDetails = res.data;
          }
        })
      }
    })
  }

  openConfirmModal(): void {
    this.isConfirmModalOpen = true;
  }

  closeConfirmModal(): void {
    this.isConfirmModalOpen = false;
  }

  openRejectModal(): void {
    this.isRejectModalOpen = true;
    this.rejectReason = '';
  }

  closeRejectModal(): void {
    this.isRejectModalOpen = false;
    this.rejectReason = '';
  }

  contactPlayer(): void {
    const phoneDigits = this.profile.phone.replace(/[^\d+]/g, '');
    window.location.href = `tel:${phoneDigits}`;
  }
  openImagePreview(imageUrl: string): void {
    if (imageUrl && imageUrl.trim()) {
      this.currentImageUrl = imageUrl;
      this.isImageModalOpen = true;
      document.body.style.overflow = 'hidden';
    }
  }

  closeImagePreview(): void {
    this.isImageModalOpen = false;
    this.currentImageUrl = '';
    document.body.style.overflow = '';
  }
}