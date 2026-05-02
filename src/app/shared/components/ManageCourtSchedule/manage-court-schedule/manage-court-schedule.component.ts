// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-manage-court-schedule',
//   imports: [],
//   templateUrl: './manage-court-schedule.component.html',
//   styleUrl: './manage-court-schedule.component.scss'
// })
// export class ManageCourtScheduleComponent {

// }
import { Component, ChangeDetectionStrategy, signal, computed, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

type SlotStatus = 'available' | 'blocked' | 'booked';

type Slot = {
  time: string;
  period: string;
  label: string;
  status: SlotStatus;
  prime?: boolean;
};

type Activity = {
  id: number;
  type: 'payment' | 'cancel';
  title: string;
  subtitle: string;
  value: string;
  time: string;
};

type Stats = { bookings: number; revenue: string; occupancy: number };
type PitchKey = 'Anfield' | 'Bernabeu';

type PitchData = {
  schedule: Slot[];
  activities: Activity[];
  stats: Stats;
};

@Component({
  selector: 'app-manage-court-schedule',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-court-schedule.component.html',
  styleUrl: './manage-court-schedule.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageCourtScheduleComponent {
  activePitch = signal<PitchKey>('Anfield');
  currentTime = signal('09:42 AM');

  // Modal State Signals
  isModalOpen = signal(false);
  isConfirmModalOpen = signal(false);
  selectedSlot = signal<Slot | null>(null);

  // Per-court open/closed state
  private pitchOpenStatus = signal<Record<PitchKey, boolean>>({
    Anfield: true,
    Bernabeu: true,
  });

  // Immutable baseline for each pitch
  private readonly originalPitchData: Record<PitchKey, PitchData> = {
    Anfield: {
      schedule: [
        { time: '08:00', period: 'AM', label: 'Available for booking', status: 'available' },
        { time: '09:00', period: 'AM', label: 'Booked: Captain Ahmed (Private Match)', status: 'booked' },
        { time: '10:00', period: 'AM', label: 'Booked: Youth Academy Training', status: 'booked' },
        { time: '11:00', period: 'AM', label: 'Maintenance: Turf Brushing', status: 'blocked' },
        { time: '12:00', period: 'PM', label: 'Available for booking', status: 'available' },
        { time: '01:00', period: 'PM', label: 'Available for booking', status: 'available' },
        { time: '08:00', period: 'PM', label: 'Prime Time Slot (Available)', status: 'available', prime: true },
      ],
      activities: [
        { id: 1, type: 'payment', title: 'New Payment Received', subtitle: 'Anfield Pro Pitch - Slot 9:00 AM', value: '+$45.00', time: '' },
        { id: 2, type: 'cancel', title: 'Booking Cancelled', subtitle: 'Anfield Pro Pitch - Slot 11:00 PM', value: '10M AGO', time: '10M AGO' },
      ],
      stats: { bookings: 14, revenue: '$2,840', occupancy: 82 },
    },
    Bernabeu: {
      schedule: [
        { time: '08:00', period: 'AM', label: 'Booked: Real Madrid Fan Club', status: 'booked' },
        { time: '09:00', period: 'AM', label: 'Available for booking', status: 'available' },
        { time: '10:00', period: 'AM', label: 'Available for booking', status: 'available' },
        { time: '11:00', period: 'AM', label: 'Booked: Corporate Cup', status: 'booked' },
        { time: '12:00', period: 'PM', label: 'Maintenance: Irrigation', status: 'blocked' },
        { time: '07:00', period: 'PM', label: 'Prime Time Slot (Available)', status: 'available', prime: true },
        { time: '08:00', period: 'PM', label: 'Booked: Night League', status: 'booked' },
      ],
      activities: [
        { id: 1, type: 'payment', title: 'Large Event Payment', subtitle: 'Bernabeu Main - Corporate Cup', value: '+$450.00', time: '1H AGO' },
        { id: 2, type: 'cancel', title: 'Booking Cancelled', subtitle: 'Bernabeu Main - Slot 6:00 PM', value: '3M AGO', time: '3M AGO' },
      ],
      stats: { bookings: 9, revenue: '$1,920', occupancy: 50 },
    },
  };

  // Canonical per-court state (source of truth)
  private readonly pitchState = signal<Record<PitchKey, { schedule: Slot[]; stats: Stats }>>({
    Anfield: {
      schedule: this.cloneSchedule(this.originalPitchData.Anfield.schedule),
      stats: this.computeStats(this.cloneSchedule(this.originalPitchData.Anfield.schedule), this.originalPitchData.Anfield.stats),
    },
    Bernabeu: {
      schedule: this.cloneSchedule(this.originalPitchData.Bernabeu.schedule),
      stats: this.computeStats(this.cloneSchedule(this.originalPitchData.Bernabeu.schedule), this.originalPitchData.Bernabeu.stats),
    },
  });

  // Public computed to keep existing template variable name unchanged
  isFacilityOpen = computed(() => this.pitchOpenStatus()[this.activePitch()]);

  // Derived UI data ALWAYS re-evaluated from canonical state + open/closed flag
  currentSchedule = computed(() => {
    const pitch = this.activePitch();
    const open = this.pitchOpenStatus()[pitch];
    const baseSchedule = this.pitchState()[pitch].schedule;

    if (!open) {
      return baseSchedule.map((s) => ({
        ...s,
        status: 'blocked' as const,
        label: 'Facility Closed: Unavailable',
      }));
    }

    return baseSchedule.map((s) => ({ ...s }));
  });

  currentActivities = computed(() => this.originalPitchData[this.activePitch()].activities);

  venueStats = computed(() => {
    const pitch = this.activePitch();
    const stats = this.pitchState()[pitch].stats;
    return { ...stats };
  });

  constructor() {
    effect(() => {
      this.activePitch();
      untracked(() => this.closeModal());
    });
  }

  // ------------------------------------------------------------------
  // Per-Court Facility Logic
  // ------------------------------------------------------------------
  toggleFacilityStatus(): void {
    if (this.isFacilityOpen()) {
      this.openConfirmModal();
    } else {
      this.reopenFacility();
    }
  }

  openConfirmModal(): void {
    this.isConfirmModalOpen.set(true);
  }

  closeConfirmModal(): void {
    this.isConfirmModalOpen.set(false);
  }

  confirmFacilityToggle(): void {
    const currentPitch = this.activePitch();

    this.pitchOpenStatus.update((status) => ({
      ...status,
      [currentPitch]: false,
    }));

    this.closeConfirmModal();
  }

  reopenFacility(): void {
    const currentPitch = this.activePitch();

    this.pitchOpenStatus.update((status) => ({
      ...status,
      [currentPitch]: true,
    }));
  }

  openEmergencyModal(): void {
    if (this.isFacilityOpen()) {
      this.openConfirmModal();
    }
  }

  // ------------------------------------------------------------------
  // Slot Management
  // ------------------------------------------------------------------
  getSlotClasses(slot: Slot): string {
    if (slot.status === 'booked') return 'bg-[#D1F2D1] border-[#064420]';
    if (slot.status === 'blocked') return 'bg-[#E0E0E0] border-gray-400 opacity-60';
    if (slot.prime) return 'bg-[#F9D8D8]/30 border-[#B04A26] border-solid';
    return 'bg-transparent border-[#064420]/20 border-dashed';
  }

  openSlotManagement(slot: Slot): void {
    if (!this.isFacilityOpen()) return;
    this.selectedSlot.set({ ...slot });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedSlot.set(null);
  }

  updateStatus(newStatus: SlotStatus, isOffline: boolean = false): void {
    const active = this.activePitch();
    if (!this.pitchOpenStatus()[active]) return;

    const selected = this.selectedSlot();
    if (!selected) return;

    const timeToFind = selected.time;

    const current = this.pitchState()[active];
    const idx = current.schedule.findIndex((s) => s.time === timeToFind);
    if (idx === -1) return;

    // Work on a fresh cloned schedule every time (no shared mutation)
    const schedule = this.cloneSchedule(current.schedule);

    const updatedSlot = { ...schedule[idx] };
    updatedSlot.status = newStatus;

    if (newStatus === 'blocked') {
      updatedSlot.label = 'Maintenance: Temporarily Blocked';
    } else if (newStatus === 'booked') {
      updatedSlot.label = isOffline ? 'Offline Booking: Walk-in Client' : 'Booked: Online Customer';
    } else {
      updatedSlot.label = updatedSlot.prime ? 'Prime Time Slot (Available)' : 'Available for booking';
    }

    schedule[idx] = updatedSlot;

    // Always recompute stats from schedule (fresh source of truth)
    const nextStats = this.computeStats(schedule, this.pitchState()[active].stats);

    this.pitchState.update((state) => ({
      ...state,
      [active]: {
        schedule,
        stats: nextStats,
      },
    }));

    this.closeModal();
  }

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------
  private cloneSchedule(schedule: Slot[]): Slot[] {
    return schedule.map((s) => ({ ...s }));
  }

  private computeStats(schedule: Slot[], prev: Stats): Stats {
    const bookedCount = schedule.filter((s) => s.status === 'booked').length;
    const occupancy = Math.round((bookedCount / schedule.length) * 100);

    // Keep revenue as-is (UI demo), but always derive bookings/occupancy from schedule
    // IMPORTANT: do not do "10 + bookedCount" because it accumulates incorrectly across operations.
    return {
      ...prev,
      bookings: bookedCount,
      occupancy,
    };
  }
}