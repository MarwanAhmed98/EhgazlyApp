import { NgClass } from '@angular/common';
import { Component, HostListener, Input, inject, OnInit } from '@angular/core';
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
export class PlayernavComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly playerProfileService = inject(PlayerProfileService);

  ProfileDetails: Iplayerprofile = {} as Iplayerprofile;

  @Input() active: PlayerNavActive = 'my-bookings';
  @Input() tournamentsLink: string | any[] = '/Tournaments';
  @Input() FriendlyMatchesLink: string | any[] = '/FriendlyMatches';
  @Input() venuesLink: string | any[] = '/Venues';
  @Input() myBookingsLink: string | any[] = '/MyBookings';
  @Input() customerProfileLink: string | any[] = '/CustomerProfile';

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

  // مش محتاجين نغير العنوان يدوي هنا، الـ router stream هيتكفل بكل حاجة
  onNavClick(): void {
    this.closeMobileMenu();
  }

  private updateTitleByRoute(): void {
    const currentRoute = this.router.url.split('?')[0];
    const norm = (s: string) => s.replace(/\/+$/, '').toLowerCase();
    const url = norm(currentRoute);

    // الروابط الأساسية
    const f = norm(typeof this.FriendlyMatchesLink === 'string' ? this.FriendlyMatchesLink : '/' + (this.FriendlyMatchesLink as any[]).join('/'));
    const t = norm(typeof this.tournamentsLink === 'string' ? this.tournamentsLink : '/' + (this.tournamentsLink as any[]).join('/'));
    const v = norm(typeof this.venuesLink === 'string' ? this.venuesLink : '/' + (this.venuesLink as any[]).join('/'));
    const m = norm(typeof this.myBookingsLink === 'string' ? this.myBookingsLink : '/' + (this.myBookingsLink as any[]).join('/'));
    const p = norm(typeof this.customerProfileLink === 'string' ? this.customerProfileLink : '/' + (this.customerProfileLink as any[]).join('/'));

    if (url === f) {
      this.currentTitle = 'Friendly Matches';
      this.active = 'friendly-matches';
    } else if (url === t) {
      this.currentTitle = 'Tournaments';
      this.active = 'tournaments';
    } else if (url === v) {
      this.currentTitle = 'Venues';
      this.active = 'venues';
    } else if (url === m) {
      this.currentTitle = 'My Bookings';
      this.active = 'my-bookings';
    } else if (url === p) {
      this.currentTitle = 'My Profile';
      this.active = null as any; // هنا بنلغي تفعيل أي زرار تاني
    } else {
      this.active = null as any;
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
      },
    });
  }
}