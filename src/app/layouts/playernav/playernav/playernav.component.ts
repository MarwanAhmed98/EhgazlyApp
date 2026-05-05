import { NgClass } from '@angular/common';
import { Component, HostListener, Input, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { PlayerProfileService } from '../../../core/services/PlayerProfile/player-profile.service';
import { Iplayerprofile } from '../../../shared/interfaces/iplayerprofile';
export type PlayerNavActive = 'tournaments' | 'venues' | 'my-bookings' | 'friendly-matches';

@Component({
  selector: 'app-playernav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass, LucideAngularModule],
  templateUrl: './playernav.component.html',
  styleUrl: './playernav.component.scss',
})
export class PlayernavComponent {
  private readonly router = inject(Router);
  private readonly playerProfileService = inject(PlayerProfileService);
  ProfileDetails: Iplayerprofile = {} as Iplayerprofile
  @Input() active: PlayerNavActive = 'my-bookings';
  @Input() tournamentsLink: string | any[] = '/Tournaments';
  @Input() FriendlyMatchesLink: string | any[] = '/FriendlyMatches';
  @Input() venuesLink: string | any[] = '/Venues';
  @Input() myBookingsLink: string | any[] = '/MyBookings';

  isMobileMenuOpen = false;
  currentTitle = 'My Bookings';

  ngOnInit(): void {
    this.GetProfile();
    this.updateTitleByRoute();
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.updateTitleByRoute();
      this.isMobileMenuOpen = false;
    });
  }

  openMobileMenu(): void {
    this.isMobileMenuOpen = true;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  onNavClick(label: string): void {
    this.currentTitle = label;
    this.closeMobileMenu();
  }

  private updateTitleByRoute(): void {
    const currentRoute = this.router.url.split('?')[0];

    const t =
      typeof this.tournamentsLink === 'string'
        ? this.tournamentsLink
        : '/' + (this.tournamentsLink as any[]).join('/');

    const v =
      typeof this.venuesLink === 'string'
        ? this.venuesLink
        : '/' + (this.venuesLink as any[]).join('/');

    const m =
      typeof this.myBookingsLink === 'string'
        ? this.myBookingsLink
        : '/' + (this.myBookingsLink as any[]).join('/');

    const norm = (s: string) => s.replace(/\/+$/, '').toLowerCase();
    const url = norm(currentRoute);

    const tNorm = norm(t);
    const vNorm = norm(v);
    const mNorm = norm(m);

    if (tNorm && url === tNorm) {
      this.currentTitle = 'Tournaments';
      this.active = 'tournaments';
      return;
    }

    if (vNorm && url === vNorm) {
      this.currentTitle = 'Venues';
      this.active = 'venues';
      return;
    }

    if (mNorm && url === mNorm) {
      this.currentTitle = 'My Bookings';
      this.active = 'my-bookings';
      return;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 768) this.isMobileMenuOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isMobileMenuOpen = false;
  }
  GetProfile(): void {
    this.playerProfileService.GetProfile().subscribe({
      next: (res) => {
        this.ProfileDetails = res.data;
      }
    })
  }
}