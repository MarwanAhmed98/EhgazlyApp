import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { TournamentsService } from '../../../../core/services/Tournaments/tournaments.service';
import { ICustomerTournaments } from '../../../interfaces/icustomer-tournaments';
import { LucideAngularModule } from 'lucide-angular';
import { AiComponent } from "../../Ai/ai/ai.component";

type FilterKey = 'all' | 'open' | 'ongoing' | 'finished' | 'cancelled';

@Component({
  selector: 'app-tournaments',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, PlayernavComponent, RouterLink, LucideAngularModule, AiComponent],
  templateUrl: './tournaments.component.html',
  styleUrls: ['./tournaments.component.scss']
})
export class TournamentsComponent implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly router = inject(Router);

  // Featured static section remains unchanged
  featured = {
    titleLine1: "CHAMPION'S",
    titleLine2: 'LEAGUE 2024',
    description: 'The biggest amateur football event in Egypt. Register your team and claim the cup.',
    image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?fm=jpg&q=60&w=3000&auto=format&fit=crop'
  };

  filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All Tournaments' },
    { key: 'open', label: 'Open' },
    { key: 'ongoing', label: 'Ongoing' },
    { key: 'finished', label: 'Finished' },
    { key: 'cancelled', label: 'Cancelled' }
  ];

  activeFilter: FilterKey = 'all';
  search = '';

  // Real tournaments from API
  allTournaments: ICustomerTournaments[] = [];

  ngOnInit(): void {
    this.getAllTournaments();
  }

  getAllTournaments(): void {
    this.tournamentsService.GetAllTournaments().subscribe({
      next: (response: any) => {
        // Adjust based on actual API response structure
        this.allTournaments = response?.data || response || [];
      },
      error: (err) => {
        console.error('Error loading tournaments', err);
        this.toastService.error('Failed to load tournaments');
        this.allTournaments = [];
      }
    });
  }

  get visibleTournaments(): ICustomerTournaments[] {
    let filtered = [...this.allTournaments];

    // Filter by exact status value (case-insensitive match to backend)
    if (this.activeFilter !== 'all') {
      filtered = filtered.filter(t => t.status?.toLowerCase() === this.activeFilter);
    }

    // Search by name, venue, or address
    if (this.search.trim()) {
      const term = this.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.name?.toLowerCase().includes(term) ||
        t.maincourt?.name?.toLowerCase().includes(term) ||
        t.maincourt?.address?.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  setFilter(key: FilterKey): void {
    this.activeFilter = key;
  }

  onSearch(value: string): void {
    this.search = value;
  }

  joinFeatured(): void {
    this.toastService.info('Join Tournament feature coming soon');
  }
}