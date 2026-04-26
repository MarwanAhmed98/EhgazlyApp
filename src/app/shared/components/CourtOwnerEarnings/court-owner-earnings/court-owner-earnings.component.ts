import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-court-owner-earnings',
  imports: [CommonModule],
  templateUrl: './court-owner-earnings.component.html',
  styleUrl: './court-owner-earnings.component.scss',
  providers: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourtOwnerEarningsComponent {
  activeTab = signal('weekly');
  activeModal = signal(false);
  modalTitle = signal('');
  modalMessage = signal('');

  payouts = signal([
    { id: 'EH-90234', date: 'Oct 24, 2023', acc: '4210', amount: 7250.00, status: 'Paid' },
    { id: 'EH-89912', date: 'Oct 17, 2023', acc: '4210', amount: 5400.00, status: 'Paid' },
    { id: 'EH-89445', date: 'Oct 10, 2023', acc: '4210', amount: 8175.00, status: 'Processing' }
  ]);

  // Dynamic SVG Path generation for Chart
  trendPath = computed(() => {
    return this.activeTab() === 'weekly'
      ? "M0,150 Q100,140 200,80 T400,100 T600,40 T800,60"
      : "M0,160 Q100,120 200,140 T400,60 T600,100 T800,40";
  });

  trendAreaPath = computed(() => {
    const base = this.trendPath();
    return `${base} V200 H0 Z`;
  });

  getCellColor(row: number, col: number): string {
    const weights = [
      ['bg-[#72B68B]', 'bg-[#8CD1A5]', 'bg-[#6CA980]', 'bg-[#8CD1A5]', 'bg-[#72B68B]', 'bg-[#AF4D13]', 'bg-[#AF4D13]'],
      ['bg-[#8CD1A5]', 'bg-[#A8E5C1]', 'bg-[#8CD1A5]', 'bg-[#A8E5C1]', 'bg-[#8CD1A5]', 'bg-[#AF4D13]', 'bg-[#AF4D13]'],
      ['bg-[#3B7B54]', 'bg-[#A8E5C1]', 'bg-[#3B7B54]', 'bg-[#8CD1A5]', 'bg-[#3B7B54]', 'bg-[#934110]', 'bg-[#AF4D13]']
    ];
    return weights[row][col] || 'bg-emerald-200';
  }

  onWithdrawFunds() {
    this.modalTitle.set('Withdrawal Initiated');
    this.modalMessage.set('Your payout request for 20,825 EGP is being processed and will reflect in your bank account shortly.');
    this.activeModal.set(true);
  }

  onAddItem() {
    this.modalTitle.set('Quick Add');
    this.modalMessage.set('The Quick Add feature allows you to manually record extra slots or custom bookings. Form coming soon!');
    this.activeModal.set(true);
  }

  onViewDetails(item: any) {
    this.modalTitle.set(`Transaction Details`);
    this.modalMessage.set(`Viewing Payout #${item.id}. Status: ${item.status}. Method: Bank Transfer ending in ${item.acc}.`);
    this.activeModal.set(true);
  }
}