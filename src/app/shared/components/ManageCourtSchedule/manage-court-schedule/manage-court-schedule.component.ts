// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-manage-court-schedule',
//   imports: [],
//   templateUrl: './manage-court-schedule.component.html',
//   styleUrl: './manage-court-schedule.component.scss'
// })
// export class ManageCourtScheduleComponent {

// }
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-court-schedule',
  imports: [CommonModule],
  templateUrl: './manage-court-schedule.component.html',
  styleUrl: './manage-court-schedule.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageCourtScheduleComponent {
  activePitch = signal('Anfield');
  isFacilityOpen = signal(true);
  currentTime = signal('09:42 AM');

  quickActions = [
    {
      label: 'Add Slot',
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
    },
    {
      label: 'Block Court',
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>`
    },
    {
      label: 'Promo Blast',
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>`
    },
    {
      label: 'Reports',
      icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`
    }
  ];

  schedule = [
    { time: '08:00', period: 'AM', label: 'Available for booking', status: 'available' },
    { time: '09:00', period: 'AM', label: 'Booked: Captain Ahmed (Private Match)', status: 'booked' },
    { time: '10:00', period: 'AM', label: 'Booked: Youth Academy Training', status: 'booked' },
    { time: '11:00', period: 'AM', label: 'Maintenance: Turf Brushing', status: 'blocked' },
    { time: '12:00', period: 'PM', label: 'Available for booking', status: 'available' },
    { time: '01:00', period: 'PM', label: 'Available for booking', status: 'available' },
    { time: '08:00', period: 'PM', label: 'Prime Time Slot (Available)', status: 'available', prime: true },
  ];

  activities: any[] = [
    { id: 1, type: 'payment', title: 'New Payment Received', subtitle: 'Anfield Pro Pitch - Slot 9:00 PM', value: '+$45.00', time: '' },
    { id: 2, type: 'cancel', title: 'Booking Cancelled', subtitle: 'Bernabeu Main - Slot 6:00 PM', value: '3M AGO', time: '3M AGO' }
  ];

  getSlotClasses(slot: any) {
    if (slot.status === 'booked') {
      return "bg-[#D1F2D1] border-[#064420]";
    }
    if (slot.status === 'blocked') {
      return "bg-[#E0E0E0] border-gray-400 opacity-60";
    }
    if (slot.prime) {
      return "bg-[#F9D8D8]/30 border-[#B04A26] border-solid";
    }
    return "bg-transparent border-[#064420]/20 border-dashed";
  }
}