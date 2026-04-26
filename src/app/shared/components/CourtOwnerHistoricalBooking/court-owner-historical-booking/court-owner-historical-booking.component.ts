import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

interface Booking {
  id: string;
  date: string;
  time: string;
  player: string;
  court: string;
  amount: number;
  payment: string;
  status: 'ACCEPTED' | 'REJECTED';
  rawDate: Date;
}

@Component({
  selector: 'app-court-owner-historical-booking',
  imports: [CommonModule],
  templateUrl: './court-owner-historical-booking.component.html',
  styleUrl: './court-owner-historical-booking.component.scss',
  providers: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourtOwnerHistoricalBookingComponent {
  // Filters State
  activeCourtFilter = signal<'All' | 'Padel' | 'Football'>('All');
  searchQuery = signal('');
  dateFilter = signal<string | null>(null);

  // Mock Data
  allBookings = signal<Booking[]>([
    { id: '1', date: 'Oct 24, 2023', time: '08:00 PM - 09:30 PM', player: 'Ahmed Mansour', court: 'Padel Court 1', amount: 450.00, payment: 'Wallet', status: 'ACCEPTED', rawDate: new Date(2023, 9, 24) },
    { id: '2', date: 'Oct 23, 2023', time: '06:00 PM - 07:00 PM', player: 'Sara El-Din', court: 'Main Football 5x5', amount: 300.00, payment: 'Cash', status: 'ACCEPTED', rawDate: new Date(2023, 9, 23) },
    { id: '3', date: 'Oct 22, 2023', time: '04:00 PM - 05:30 PM', player: 'Omar Khaled', court: 'Padel Court 2', amount: 450.00, payment: 'Visa', status: 'REJECTED', rawDate: new Date(2023, 9, 22) },
    { id: '4', date: 'Oct 21, 2023', time: '09:00 PM - 10:00 PM', player: 'Heba Hassan', court: 'Training Zone', amount: 150.00, payment: 'Wallet', status: 'ACCEPTED', rawDate: new Date(2023, 9, 21) },
    { id: '5', date: 'Oct 20, 2023', time: '08:00 PM - 09:30 PM', player: 'Youssef Ali', court: 'Padel Court 1', amount: 450.00, payment: 'Visa', status: 'ACCEPTED', rawDate: new Date(2023, 9, 20) },
  ]);

  // Computed Values
  filteredBookings = computed(() => {
    let list = this.allBookings();

    const selectedDate = this.dateFilter();
    if (selectedDate) {
      list = list.filter(b => {
        const bookingDateStr = b.rawDate.toISOString().split('T')[0];
        return bookingDateStr === selectedDate;
      });
    }

    if (this.activeCourtFilter() !== 'All') {
      list = list.filter(b => b.court.includes(this.activeCourtFilter()));
    }

    if (this.searchQuery().trim()) {
      const q = this.searchQuery().toLowerCase();
      list = list.filter(b =>
        b.player.toLowerCase().includes(q) ||
        b.court.toLowerCase().includes(q)
      );
    }

    return list;
  });

  totalRevenue = computed(() => {
    return this.filteredBookings()
      .filter(b => b.status === 'ACCEPTED')
      .reduce((sum, b) => sum + b.amount, 0);
  });

  popularity = signal([
    { name: 'Padel Courts', value: 65, color: 'bg-emerald-600' },
    { name: 'Football Pitches', value: 25, color: 'bg-emerald-400' },
    { name: 'Training Areas', value: 10, color: 'bg-emerald-200' }
  ]);

  // Handlers
  updateSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  updateDateFilter(event: Event) {
    const target = event.target as HTMLInputElement;
    this.dateFilter.set(target.value || null);
  }

  resetFilters() {
    this.activeCourtFilter.set('All');
    this.searchQuery.set('');
    this.dateFilter.set(null);
  }

  exportToCSV() {
    const data = this.filteredBookings();
    if (!data.length) return;

    const headers = ['Date', 'Time', 'Player', 'Court', 'Amount', 'Payment', 'Status'];
    const csvRows = [
      headers.join(','),
      ...data.map(row => [
        row.date,
        `"${row.time}"`,
        row.player,
        row.court,
        row.amount,
        row.payment,
        row.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `bookings_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  generateReport() {
    const revenue = this.totalRevenue();
    const count = this.filteredBookings().length;
    const acceptedCount = this.filteredBookings().filter(b => b.status === 'ACCEPTED').length;
    const reportContent = `
BOOKINGS AUDIT REPORT
Generated: ${new Date().toLocaleString()}
----------------------------------------
FILTERS: ${this.dateFilter() || 'All Dates'} | ${this.activeCourtFilter()}
Total Revenue (Accepted): ${revenue.toFixed(2)} EGP
----------------------------------------
    `;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('download', 'Audit_Report.txt');
    a.href = url;
    a.click();
  }
}