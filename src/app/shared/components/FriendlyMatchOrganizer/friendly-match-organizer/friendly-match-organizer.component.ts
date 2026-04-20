import { Component, computed } from '@angular/core';
import { Router } from '@angular/router';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';

type Player = {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  isHost?: boolean;
};

type MatchVM = {
  id: string;
  title: string;
  format: string;
  modeLabel: string;

  dateLabel: string;
  timeLabel: string;

  venueName: string;
  venueAddress: string;
  venueHint: string;

  feeEGP: number;

  heroImage: string;
  venueImage: string;

  mapsUrl: string;
};

@Component({
  selector: 'app-friendly-match-organizer',
  imports: [PlayernavComponent],
  templateUrl: './friendly-match-organizer.component.html',
  styleUrl: './friendly-match-organizer.component.scss'
})
export class FriendlyMatchOrganizerComponent {
  constructor(private readonly router: Router) { }

  match: MatchVM = {
    id: 'm1',
    title: 'Friday Night Blitz',
    format: '7v7',
    modeLabel: '7V7 BLITZ',

    dateLabel: 'Friday, Oct 27',
    timeLabel: '20:00 - 21:30',

    venueName: 'Al-Nasr Arena',
    venueAddress: 'District 5, New Cairo, Egypt.',
    venueHint: 'Next to the main entrance of Al-Nasr Club.',

    feeEGP: 150,

    heroImage: 'https://images.unsplash.com/photo-1434648957308-5e6a859697e8?auto=format&fit=crop&w=1800&q=80',
    venueImage: 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg',

    mapsUrl: 'https://maps.google.com/?q=Al-Nasr%20Arena',
  };

  rules: string[] = [
    'Arrive 15 minutes before kickoff for warm-up.',
    'Bibs and water provided by the organizer.',
    'No metal cleats allowed on the turf.',
    'Fair play and respect are mandatory.',
  ];

  players: Player[] = [
    { id: 'p1', name: 'Ahmed S.', role: 'Midfielder', isHost: true },
    { id: 'p2', name: 'Omar K.', role: 'Forward' },
    { id: 'p3', name: 'Sara M.', role: 'Defender' },
    { id: 'p4', name: 'Youssef Z.', role: 'Goalkeeper' },
    { id: 'p5', name: 'Mina H.', role: 'Winger' },
    { id: 'p6', name: 'Karim A.', role: 'Defender' },
    { id: 'p7', name: 'Nour E.', role: 'Midfielder' },
    { id: 'p8', name: 'Hassan R.', role: 'Forward' },
  ];

  rosterTotal = 14;

  rosterJoined = computed(() => this.players.length);

  rosterPercent = computed(() => {
    const joined = this.rosterJoined();
    return Math.round((joined / this.rosterTotal) * 100);
  });

  emptySlots = computed(() => {
    const missing = Math.max(0, this.rosterTotal - this.rosterJoined());
    return Array.from({ length: missing }, (_, i) => i);
  });

  playersNeededText = computed(() => {
    const missing = Math.max(0, this.rosterTotal - this.rosterJoined());
    return missing === 0 ? 'Match is locked.' : `${missing} more players needed to lock the match`;
  });

  editMatch(): void {
    this.router.navigate(['/matches', this.match.id, 'edit']);
  }

  cancelMatch(): void {
    // eslint-disable-next-line no-alert
    const ok = confirm('Cancel this match?');
    if (!ok) return;
  }

  openInMaps(): void {
    window.open(this.match.mapsUrl, '_blank', 'noopener,noreferrer');
  }
}