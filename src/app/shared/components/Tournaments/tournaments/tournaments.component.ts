
import { Component } from '@angular/core';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';
import { Router, RouterLink } from '@angular/router';

type FilterKey = 'all' | 'upcoming' | 'professional' | 'amateur';

type TournamentCard = {
  id: string;
  title: string;
  location: string;
  dateRange: string;
  timeLabel: string;
  feeEGP: number;
  image: string;

  tag?: string; // e.g. LIMITED SLOTS, CORPORATE
  tagStyle?: 'warning' | 'success';

  category: FilterKey; // quick categorization for demo
  showPlus?: boolean;  // for the 3rd card vibe
};
@Component({
  selector: 'app-tournaments',
  imports: [PlayernavComponent, RouterLink],
  templateUrl: './tournaments.component.html',
  styleUrl: './tournaments.component.scss'
})
export class TournamentsComponent {
  constructor(private readonly router: Router) { }

  featured = {
    titleLine1: "CHAMPION'S",
    titleLine2: 'LEAGUE 2024',
    description: 'The biggest amateur football event in Egypt. Register your team and claim the cup.',
    image:
      'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3RhZGl1bXxlbnwwfHwwfHx8MA%3D%3D',
  };

  filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All Tournaments' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'professional', label: 'Professional' },
    { key: 'amateur', label: 'Amateur' },
  ];

  activeFilter: FilterKey = 'all';
  search = '';

  tournaments: TournamentCard[] = [
    {
      id: 't1',
      title: 'Ehgazly Summer Cup',
      location: 'Cairo Stadium, Heliopolis',
      dateRange: 'Oct 15 - Oct 20',
      timeLabel: '06:00 PM onwards',
      feeEGP: 500,
      image:
        'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1400&q=80',
      tag: 'LIMITED SLOTS',
      tagStyle: 'warning',
      category: 'amateur',
    },
    {
      id: 't2',
      title: 'Alexandria Pro League',
      location: 'Sporting Club, Alexandria',
      dateRange: 'Nov 02 - Nov 12',
      timeLabel: '04:00 PM onwards',
      feeEGP: 850,
      image:
        'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1400&q=80',
      category: 'professional',
    },
    {
      id: 't3',
      title: 'Corporate Kickoff 5x5',
      location: 'New Cairo Sports Hub',
      dateRange: 'Dec 01 - Dec 03',
      timeLabel: '07:00 PM onwards',
      feeEGP: 1200,
      image:
        'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1400&q=80',
      tag: 'CORPORATE',
      tagStyle: 'success',
      category: 'upcoming',
      showPlus: true,
    },
  ];

  get visibleTournaments(): TournamentCard[] {
    const q = this.search.trim().toLowerCase();

    return this.tournaments.filter((t) => {
      const matchesFilter = this.activeFilter === 'all' ? true : t.category === this.activeFilter;
      const matchesSearch = !q
        ? true
        : `${t.title} ${t.location}`.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }

  setFilter(key: FilterKey): void {
    this.activeFilter = key;
  }

  onSearch(value: string): void {
    this.search = value;
  }

  joinFeatured(): void {
    // wire to your real flow later
    // eslint-disable-next-line no-alert
    alert('Join Tournament flow goes here.');
  }

  viewDetails(id: string): void {
    // keep consistent routing style in your project
    this.router.navigate(['/tournaments', id]);
  }

  quickAdd(id: string): void {
    // quick action from plus button
    this.viewDetails(id);
  }
}