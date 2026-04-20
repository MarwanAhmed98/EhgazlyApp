import { Component } from '@angular/core';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';
import { RouterLink } from "@angular/router";
@Component({
  selector: 'app-tournaments-details',
  imports: [PlayernavComponent, RouterLink],
  templateUrl: './tournaments-details.component.html',
  styleUrl: './tournaments-details.component.scss'
})
export class TournamentsDetailsComponent {
  vm = {
    heroImage:
      'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1800&q=80',
    fillPercent: 75,

    slotsUsed: 12,
    slotsTotal: 16,

    totalPrize: 85000,

    stats: [
      { label: 'Team Size', value: '7 v 7' },
      { label: 'Duration', value: '40 Mins' },
      { label: 'Matches', value: '4 Min.' },
      { label: 'Pitch', value: 'Natural' },
    ],

    regulations: [
      {
        id: '01',
        title: 'Team Composition',
        body: 'Max 12 players per squad, 7 on field + 5 rolling substitutions. Professional or semi-pro cards are prohibited.',
      },
      {
        id: '02',
        title: 'Match Protocol',
        body: 'Two halves of 20 minutes each. 5-minute half-time break. FIFA-accredited referees will officiate all games.',
      },
      {
        id: '03',
        title: 'Disciplinary Action',
        body: 'Yellow card results in 2-min sin bin. Red card results in immediate match ban and potential tournament disqualification.',
      },
    ],

    mapImage: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3RhZGl1bXxlbnwwfHwwfHx8MA%3D%3D',

    keyDates: [
      { day: '15', month: 'JUL', title: 'Group Stage Draw', time: '9:00 PM | GrandCoureHouse Hall' },
      { day: '20', month: 'JUL', title: 'Opening Ceremony & Matchday 1', time: '7:00 PM | Cairo Football Stadium' },
      { day: '10', month: 'AUG', title: 'Quarter Finals', time: '2:00 PM | Football Stadium' },
    ],
  };

  onSignUp(): void {
    // eslint-disable-next-line no-alert
    alert('Sign Up clicked');
  }

  registerTeam(): void {
    // eslint-disable-next-line no-alert
    alert('Register Team clicked');
  }

  downloadRulebook(): void {
    // eslint-disable-next-line no-alert
    alert('Download Rulebook clicked');
  }
}