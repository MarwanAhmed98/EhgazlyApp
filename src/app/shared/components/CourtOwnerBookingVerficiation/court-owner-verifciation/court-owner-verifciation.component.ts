import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './court-owner-verifciation.component.html',
  styleUrl: './court-owner-verifciation.component.scss'
})
export class CourtOwnerVerifciationComponent {
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

  confirmBooking(): void {
    if (this.verifyState === 'submitting') return;

    this.verifyState = 'submitting';

    window.setTimeout(() => {
      this.verifyState = 'done';
      this.closeConfirmModal();
    }, 700);
  }

  rejectBooking(): void {
    if (this.rejectReason.trim().length === 0) return;

    this.verifyState = 'submitting';

    window.setTimeout(() => {
      this.verifyState = 'done';
      this.closeRejectModal();
    }, 700);
  }
}