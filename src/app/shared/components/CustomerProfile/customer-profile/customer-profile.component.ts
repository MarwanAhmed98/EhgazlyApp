// import { Component } from '@angular/core';
// import { PlayernavComponent } from "../../../../layouts/playernav/playernav/playernav.component";

// @Component({
//   selector: 'app-customer-profile',
//   imports: [PlayernavComponent],
//   templateUrl: './customer-profile.component.html',
//   styleUrl: './customer-profile.component.scss'
// })
// export class CustomerProfileComponent {

// }
import { Component, signal, computed } from '@angular/core';
import { PlayernavComponent } from "../../../../layouts/playernav/playernav/playernav.component";
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-customer-profile',
  imports: [PlayernavComponent, UpperCasePipe],
  templateUrl: './customer-profile.component.html',
  styleUrl: './customer-profile.component.scss'
})
export class CustomerProfileComponent {
  // --- STATE SIGNALS (Angular 19 style) ---
  playerName = signal('Ahmed Mansour');
  playerPosition = signal('striker');
  playerLocation = signal('Cairo, Egypt');

  // Football Identity details
  matchesPlayed = signal(42);
  winRate = signal(68);
  goalsScored = signal(15);

  // Skill Metrics
  pace = signal(85);
  shooting = signal(78);
  passing = signal(62);

  // Teammates details (Image URL left absent representing placeholder to be filled from backend APIs)
  teammates = signal([
    { id: 1, name: 'Omar K.' },
    { id: 2, name: 'Tariq M.' },
    { id: 3, name: 'Ziad A.' }
  ]);

  // Modal / Toast display triggers
  showEditModal = signal(false);
  toastMessage = signal<string | null>(null);

  // --- COMPONENT LOGIC & ACTIONS ---

  openEditModal() {
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
  }

  savePlayerDetails(name: string, location: string, position: string) {
    if (name.trim()) this.playerName.set(name.trim());
    if (location.trim()) this.playerLocation.set(location.trim());
    if (position.trim()) this.playerPosition.set(position.trim());

    this.closeEditModal();
    this.showToast('Profile updated successfully!');
  }

  openContactModal() {
    this.showToast('Contact info loaded (Backend Integration Ready)');
  }

  toggleSettings() {
    this.showToast('Navigating to full profile parameters...');
  }

  shareProfile() {
    // Generate simulated deep link clipboard copy (No alert fallback)
    const shareLink = `https://sportsaas.com/player/${this.playerName().toLowerCase().replace(/\\s+/g, '-')}`;
    this.showToast(`Link copied: ${shareLink}`);
  }

  showAllTeammates() {
    this.showToast('Loading full roster list...');
  }

  // Live Skill update binding from range sliders
  updatePace(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.pace.set(parseInt(val, 10));
  }

  updateShooting(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.shooting.set(parseInt(val, 10));
  }

  updatePassing(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.passing.set(parseInt(val, 10));
  }

  // Simple auto-dismissing toast mechanism
  private toastTimeout: any;
  showToast(msg: string) {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastMessage.set(msg);
    this.toastTimeout = setTimeout(() => {
      this.toastMessage.set(null);
    }, 4000);
  }

  closeToast() {
    this.toastMessage.set(null);
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }
}