import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';

type ActiveBadgeKind = 'payment' | 'approved' | 'pending';

type ActiveFooterKind = 'pay' | 'details' | 'edit';

type ModalAction =
  | { type: 'pay'; tournamentId: string }
  | { type: 'details'; tournamentId: string }
  | { type: 'edit'; tournamentId: string }
  | { type: 'bracket'; tournamentId: string }
  | { type: 'contact'; tournamentId: string }
  | { type: 'quick'; key: 'ball' | 'team' }
  | { type: 'link'; key: 'terms' | 'regulations' | 'support' | 'privacy' };

interface ActiveRegistration {
  id: string;
  title: string;
  registrationLabel: string;
  coverUrl: string;
  badge: { kind: ActiveBadgeKind };

  footer:
  | { kind: 'pay'; priceLabel: string }
  | { kind: 'details'; leftChip: string; rightChip: string }
  | { kind: 'edit'; note: string };
}

interface PastTournament {
  id: string;
  title: string;
  dateRangeLabel: string;
  resultKind: 'quarter' | 'winner';
  logoUrl: string;
}
@Component({
  selector: 'app-tournaments-dashboard',
  imports: [PlayernavComponent],
  templateUrl: './tournaments-dashboard.component.html',
  styleUrl: './tournaments-dashboard.component.scss'
})
export class TournamentsDashboardComponent {
  private readonly router = inject(Router);

  // Active Registrations (matches image)
  readonly activeRegistrations: ActiveRegistration[] = [
    {
      id: 'champions-league-cairo',
      title: 'Champions League Cairo',
      registrationLabel: 'Oct 24, 2024',
      coverUrl:
        'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1200',
      badge: { kind: 'payment' },
      footer: { kind: 'pay', priceLabel: 'EGP 2,500' },
    },
    {
      id: 'elite-5aside-cup',
      title: 'Elite 5-a-Side Cup',
      registrationLabel: 'Oct 20, 2024',
      coverUrl:
        'https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=1200',
      badge: { kind: 'approved' },
      footer: { kind: 'details', leftChip: 'TM', rightChip: 'PL' },
    },
    {
      id: 'summer-pro-league',
      title: 'Summer Pro League',
      registrationLabel: 'Oct 22, 2024',
      coverUrl:
        'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?auto=compress&cs=tinysrgb&w=1200',
      badge: { kind: 'pending' },
      footer: { kind: 'edit', note: 'Reviewing Roster…' },
    },
  ];

  get upcomingCount(): number {
    return this.activeRegistrations.length;
  }

  // Past tournaments (matches image)
  readonly pastTournaments: PastTournament[] = [
    {
      id: 'winter-kickoff-2023',
      title: 'Winter Kickoff 2023',
      dateRangeLabel: 'Dec 12 - Dec 15, 2023',
      resultKind: 'quarter',
      logoUrl:
        'https://images.unsplash.com/photo-1629217855633-79a6925d6c47?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Zm9vdGJhbGwlMjBzdGFkaXVtfGVufDB8fDB8fHww',
    },
    {
      id: 'ramadan-nights-classic',
      title: 'Ramadan Nights Classic',
      dateRangeLabel: 'Mar 22 - Apr 20, 2024',
      resultKind: 'winner',
      logoUrl:
        'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
  ];

  // Modal state (used for all page actions)
  isModalOpen = false;
  modalTitle = '';
  modalMessage = '';
  modalPrimaryLabel = 'OK';
  private modalAction: ModalAction | null = null;

  // --- Active actions (wired to buttons) ---
  payNow(t: ActiveRegistration): void {
    this.openModal({
      title: 'Payment Required',
      message: `Proceed to payment for ${t.title}.`,
      primaryLabel: 'Go to Payment',
      action: { type: 'pay', tournamentId: t.id },
    });
  }

  viewDetails(t: ActiveRegistration): void {
    this.openModal({
      title: 'View Details',
      message: `Open registration details for ${t.title}.`,
      primaryLabel: 'Open',
      action: { type: 'details', tournamentId: t.id },
    });
  }

  editForm(t: ActiveRegistration): void {
    this.openModal({
      title: 'Edit Registration',
      message: `Edit your registration form for ${t.title}.`,
      primaryLabel: 'Edit',
      action: { type: 'edit', tournamentId: t.id },
    });
  }

  // --- Past actions ---
  viewBracket(p: PastTournament): void {
    this.openModal({
      title: 'View Bracket',
      message: `Open bracket for ${p.title}.`,
      primaryLabel: 'Open',
      action: { type: 'bracket', tournamentId: p.id },
    });
  }

  contactOrganizer(p: PastTournament): void {
    this.openModal({
      title: 'Contact Organizer',
      message: `Send a message to the organizer of ${p.title}.`,
      primaryLabel: 'Contact',
      action: { type: 'contact', tournamentId: p.id },
    });
  }

  // Footer links (preventDefault + open a modal, keeps page standalone)
  openLink(event: MouseEvent, key: 'terms' | 'regulations' | 'support' | 'privacy'): void {
    event.preventDefault();

    const titleMap: Record<typeof key, string> = {
      terms: 'Terms of Play',
      regulations: 'Pitch Regulations',
      support: 'Support',
      privacy: 'Privacy',
    };

    this.openModal({
      title: titleMap[key],
      message: 'This link is a placeholder in this UI mock. Wire it to your real route or external URL.',
      primaryLabel: 'OK',
      action: { type: 'link', key },
    });
  }

  // Bottom right quick actions
  quickAction(key: 'ball' | 'team'): void {
    this.openModal({
      title: key === 'ball' ? 'Quick Action' : 'Community',
      message: key === 'ball' ? 'Quick access shortcut tapped.' : 'Team/community shortcut tapped.',
      primaryLabel: 'OK',
      action: { type: 'quick', key },
    });
  }

  // --- Modal helpers ---
  private openModal(opts: {
    title: string;
    message: string;
    primaryLabel: string;
    action: ModalAction;
  }): void {
    this.modalTitle = opts.title;
    this.modalMessage = opts.message;
    this.modalPrimaryLabel = opts.primaryLabel;
    this.modalAction = opts.action;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.modalAction = null;
  }

  confirmModal(): void {
    const action = this.modalAction;

    this.closeModal();

    if (!action) return;

    // NOTE: routes are kept simple; adjust to match your project routes.
    switch (action.type) {
      case 'pay':
        // Example: navigate to payment page for tournament
        this.router.navigate(['/tournaments', action.tournamentId, 'payment']);
        return;

      case 'details':
        this.router.navigate(['/tournaments', action.tournamentId]);
        return;

      case 'edit':
        this.router.navigate(['/tournaments', action.tournamentId, 'edit']);
        return;

      case 'bracket':
        this.router.navigate(['/tournaments', action.tournamentId, 'bracket']);
        return;

      case 'contact':
        this.router.navigate(['/support', 'contact']);
        return;

      case 'quick':
      case 'link':
        // keep no-op after closing; modal already explained placeholder
        return;
    }
  }
}