import {
  Component, ChangeDetectionStrategy, signal,
  computed, inject, OnInit, OnDestroy, effect, untracked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Subject, switchMap, takeUntil, of } from 'rxjs';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { CourtOwnerManageScheduleService } from '../../../../core/services/CourtOwnerManageSchedule/court-owner-manage-schedule.service';
import { CourtOwnerMainCourtsService } from '../../../../core/services/CourtOwnerMainCourts/court-owner-main-courts.service';

interface MainCourt {
  id: string;
  name: string;
  courts: Court[];
}

interface Court {
  id: string;
  name: string;
}

interface ApiSlot {
  id: string | number;
  date: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'blocked' | 'booked' | 'pending_match' | 'tournament';
  can_block: boolean;
  can_unblock: boolean;
}

interface UISlot extends ApiSlot {
  timeDisplay: string;
  period: string;
  label: string;
  prime?: boolean;
}

@Component({
  selector: 'app-manage-court-schedule',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-court-schedule.component.html',
  styleUrl: './manage-court-schedule.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageCourtScheduleComponent implements OnInit, OnDestroy {
  private readonly toastService = inject(ToastService);
  private readonly scheduleService = inject(CourtOwnerManageScheduleService);
  private readonly mainCourtsService = inject(CourtOwnerMainCourtsService);

  mainCourts = signal<MainCourt[]>([]);
  selectedMainCourtId = signal<string>('');
  courts = signal<Court[]>([]);
  selectedCourtId = signal<string>('');
  selectedDate = signal<string>(this.getTodayLocalDateString());
  slots = signal<UISlot[]>([]);
  isLoadingSlots = signal(false);

  currentTime = signal(this.getFormattedTime());
  isModalOpen = signal(false);
  isConfirmModalOpen = signal(false);
  selectedSlot = signal<UISlot | null>(null);

  private timeInterval: any;
  private readonly slotsRequest$ = new Subject<{ courtId: string; date: string } | null>();
  private readonly destroy$ = new Subject<void>();

  private pitchOpenStatus = signal<Record<string, boolean>>({});

  isFacilityOpen = computed(() => {
    const courtId = this.selectedCourtId();
    return courtId ? this.pitchOpenStatus()[courtId] !== false : true;
  });

  selectedCourt = computed(() => {
    const courtId = this.selectedCourtId();
    return this.courts().find(c => c.id === courtId);
  });

  constructor() {
    effect(() => {
      this.selectedCourtId();
      this.selectedDate();
      untracked(() => this.closeModal());
    });
  }

  ngOnInit(): void {
    this.loadMainCourts();

    this.slotsRequest$
      .pipe(
        switchMap(params => {
          if (!params) {
            return of(null);
          }
          this.isLoadingSlots.set(true);
          this.slots.set([]);
          return this.scheduleService.GetSlots(params.courtId, params.date);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          if (response === null) {
            this.slots.set([]);
            this.isLoadingSlots.set(false);
            return;
          }
          const apiSlots: ApiSlot[] =
            Array.isArray(response)
              ? response
              : Array.isArray(response?.slots)
                ? response.slots
                : Array.isArray(response?.data)
                  ? response.data
                  : [];

          this.slots.set(this.mapApiSlotsToUI(apiSlots));
          this.isLoadingSlots.set(false);
        },
        error: () => {
          this.toastService.error('Failed to load slots');
          this.slots.set([]);
          this.isLoadingSlots.set(false);
        }
      });

    this.timeInterval = setInterval(() => {
      this.currentTime.set(this.getFormattedTime());
      const today = this.getTodayLocalDateString();
      if (this.selectedDate() !== today && !this.selectedCourtId()) {
        this.selectedDate.set(today);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timeInterval) clearInterval(this.timeInterval);
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getTodayLocalDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getFormattedTime(): string {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  loadMainCourts(): void {
    this.mainCourtsService.GetMainCourt().subscribe({
      next: (res) => {
        const data: MainCourt[] = Array.isArray(res) ? res : res?.data || res?.mainCourts || [];
        this.mainCourts.set(data);
      },
      error: () => this.toastService.error('Failed to load main courts')
    });
  }

  onMainCourtChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const mainCourtId = select.value;

    this.selectedCourtId.set('');
    this.courts.set([]);
    this.slotsRequest$.next(null);
    this.selectedMainCourtId.set(mainCourtId);

    if (!mainCourtId) return;

    const mainCourt = this.mainCourts().find(m => String(m.id) === String(mainCourtId));

    if (mainCourt?.courts?.length) {
      this.courts.set([...mainCourt.courts]);
    } else {
      this.mainCourtsService.GetMainCourt().subscribe({
        next: (res) => {
          const data: MainCourt[] = Array.isArray(res) ? res : res?.data || res?.mainCourts || [];
          const found = data.find(m => String(m.id) === String(mainCourtId));
          if (found?.courts?.length) {
            this.courts.set([...found.courts]);
          } else {
            this.toastService.error('No courts found for this main court');
          }
        },
        error: () => this.toastService.error('Failed to load courts')
      });
    }
  }

  onCourtChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const courtId = select.value;
    this.selectedCourtId.set(courtId);

    if (courtId && this.pitchOpenStatus()[courtId] === undefined) {
      this.pitchOpenStatus.update(prev => ({ ...prev, [courtId]: true }));
    }

    if (courtId && this.selectedDate()) {
      this.slotsRequest$.next({ courtId, date: this.selectedDate() });
    } else {
      this.slotsRequest$.next(null);
    }
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const date = input.value;
    this.selectedDate.set(date);
    const courtId = this.selectedCourtId();

    if (courtId && date) {
      this.slotsRequest$.next({ courtId, date });
    } else {
      this.slotsRequest$.next(null);
    }
  }

  private refreshSlots(): void {
    const courtId = this.selectedCourtId();
    const date = this.selectedDate();
    if (courtId && date) {
      this.slotsRequest$.next({ courtId, date });
    }
  }

  private mapApiSlotsToUI(apiSlots: ApiSlot[]): UISlot[] {
    return apiSlots.map(slot => {
      const startTime = slot.start_time.substring(0, 5);
      const endTime = slot.end_time.substring(0, 5);
      const timeDisplay = `${startTime} - ${endTime}`;
      const hour = parseInt(startTime.split(':')[0], 10);
      const period = hour >= 12 ? 'PM' : 'AM';

      let label = '';
      if (slot.status === 'available') label = 'Available for booking';
      else if (slot.status === 'blocked') label = 'Maintenance: Blocked';
      else if (slot.status === 'booked') label = 'Booked';
      else if (slot.status === 'pending_match') label = 'Pending Match';
      else if (slot.status === 'tournament') label = 'Tournament';

      const prime = hour >= 19 && hour <= 21;
      return { ...slot, timeDisplay, period, label, prime };
    });
  }

  getSlotClasses(slot: UISlot): string {
    if (slot.status === 'booked') return 'bg-[#D1F2D1] border-[#064420]';
    if (slot.status === 'blocked') return 'bg-[#E0E0E0] border-gray-400 opacity-60';
    if (slot.status === 'pending_match') return 'bg-[#FFF8E1] border-[#F59E0B] border-solid';
    if (slot.status === 'tournament') return 'bg-[#EDE9FE] border-[#7C3AED] border-solid';
    if (slot.prime) return 'bg-[#F9D8D8]/30 border-[#B04A26] border-solid';
    return 'bg-transparent border-[#064420]/20 border-dashed';
  }

  openSlotManagement(slot: UISlot): void {
    if (!this.isFacilityOpen()) return;
    if (slot.status !== 'available' && slot.status !== 'blocked') return;
    this.selectedSlot.set({ ...slot });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedSlot.set(null);
  }

  blockSingleSlot(slotId: string | number): void {
    if (!this.isFacilityOpen()) return;
    this.scheduleService.BlockSlot(slotId).subscribe({
      next: () => {
        this.toastService.success('Slot blocked successfully');
        this.refreshSlots();
        this.closeModal();
      },
      error: () => this.toastService.error('Failed to block slot')
    });
  }

  unblockSingleSlot(slotId: string | number): void {
    if (!this.isFacilityOpen()) return;
    this.scheduleService.UnblockSlot(slotId).subscribe({
      next: () => {
        this.toastService.success('Slot unblocked successfully');
        this.refreshSlots();
        this.closeModal();
      },
      error: () => this.toastService.error('Failed to unblock slot')
    });
  }

  blockFullDay(): void {
    const courtId = this.selectedCourtId();
    const date = this.selectedDate();
    if (!courtId || !date) return;
    const availableSlotIds = this.slots()
      .filter(slot => slot.status === 'available')
      .map(slot => slot.id);
    if (availableSlotIds.length === 0) {
      this.toastService.info('No available slots to block');
      return;
    }
    this.scheduleService.BlockBult(availableSlotIds as number[]).subscribe({
      next: () => {
        this.toastService.success('All available slots blocked');
        this.refreshSlots();
      },
      error: () => this.toastService.error('Bulk block failed')
    });
  }

  unblockFullDay(): void {
    const courtId = this.selectedCourtId();
    const date = this.selectedDate();
    if (!courtId || !date) return;
    const blockedSlotIds = this.slots()
      .filter(slot => slot.status === 'blocked')
      .map(slot => slot.id);
    if (blockedSlotIds.length === 0) {
      this.toastService.info('No blocked slots to unblock');
      return;
    }
    this.scheduleService.UnblockBult(blockedSlotIds as number[]).subscribe({
      next: () => {
        this.toastService.success('All blocked slots unblocked');
        this.refreshSlots();
      },
      error: () => this.toastService.error('Bulk unblock failed')
    });
  }

  toggleFacilityStatus(): void {
    const courtId = this.selectedCourtId();
    if (!courtId) return;
    if (this.isFacilityOpen()) {
      this.openConfirmModal();
    } else {
      this.reopenFacility();
    }
  }

  openConfirmModal(): void { this.isConfirmModalOpen.set(true); }
  closeConfirmModal(): void { this.isConfirmModalOpen.set(false); }

  confirmFacilityToggle(): void {
    const courtId = this.selectedCourtId();
    if (courtId) {
      this.pitchOpenStatus.update(prev => ({ ...prev, [courtId]: false }));
    }
    this.closeConfirmModal();
  }

  reopenFacility(): void {
    const courtId = this.selectedCourtId();
    if (courtId) {
      this.pitchOpenStatus.update(prev => ({ ...prev, [courtId]: true }));
    }
  }

  openEmergencyModal(): void {
    if (this.isFacilityOpen()) {
      this.openConfirmModal();
    }
  }
}