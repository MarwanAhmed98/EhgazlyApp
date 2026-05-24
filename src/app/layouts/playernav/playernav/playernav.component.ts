import { NgClass } from '@angular/common';
import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { PlayerProfileService } from '../../../core/services/PlayerProfile/player-profile.service';
import { Iplayerprofile } from '../../../shared/interfaces/iplayerprofile';
import { ToastService } from '../../../core/services/toast/toast.service';

export type PlayerNavActive = 'tournaments' | 'venues' | 'my-bookings' | 'friendly-matches';

@Component({
  selector: 'app-playernav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass, LucideAngularModule],
  templateUrl: './playernav.component.html',
  styleUrl: './playernav.component.scss',
})
export class PlayernavComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  private readonly playerProfileService = inject(PlayerProfileService);
  private readonly elRef = inject(ElementRef<HTMLElement>);

  private routerSub?: Subscription;

  ProfileDetails: Iplayerprofile = {} as Iplayerprofile;

  @Input() active: PlayerNavActive = 'my-bookings';
  @Input() tournamentsLink: string | any[] = '/Tournaments';
  @Input() FriendlyMatchesLink: string | any[] = '/FriendlyMatches';
  @Input() venuesLink: string | any[] = '/Venues';
  @Input() myBookingsLink: string | any[] = '/MyBookings';
  @Input() customerProfileLink: string | any[] = '/CustomerProfile';

  isMobileMenuOpen = false;
  currentTitle = 'My Bookings';

  // Dropdown state
  isProfileMenuOpen = false;
  isProfileRoute = false;

  ngOnInit(): void {
    this.GetProfile();
    this.updateTitleByRoute();
    this.updateProfileRouteFlag();

    this.routerSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.updateTitleByRoute();
        this.updateProfileRouteFlag();
        this.isMobileMenuOpen = false;
        this.closeProfileMenu();
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  toggleProfileMenu(ev: Event): void {
    ev.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  goToProfileFromMenu(): void {
    this.closeProfileMenu();
    const link = this.customerProfileLink;
    this.router.navigate(Array.isArray(link) ? link : [link]);
  }

  onLogoutClick(): void {
    this.closeProfileMenu();
    // UI only (you will implement logout later)
  }

  private updateProfileRouteFlag(): void {
    const norm = (s: string) => s.replace(/\/+$/, '').toLowerCase();
    const url = norm(this.router.url.split('?')[0]);

    const p = norm(
      typeof this.customerProfileLink === 'string'
        ? this.customerProfileLink
        : '/' + (this.customerProfileLink as any[]).join('/'),
    );

    this.isProfileRoute = !!p && url === p;
  }

  openMobileMenu(): void {
    this.isMobileMenuOpen = true;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  onNavClick(): void {
    this.closeMobileMenu();
  }

  private updateTitleByRoute(): void {
    const currentRoute = this.router.url.split('?')[0];
    const norm = (s: string) => s.replace(/\/+$/, '').toLowerCase();
    const url = norm(currentRoute);

    const f = norm(
      typeof this.FriendlyMatchesLink === 'string'
        ? this.FriendlyMatchesLink
        : '/' + (this.FriendlyMatchesLink as any[]).join('/'),
    );
    const t = norm(
      typeof this.tournamentsLink === 'string'
        ? this.tournamentsLink
        : '/' + (this.tournamentsLink as any[]).join('/'),
    );
    const v = norm(typeof this.venuesLink === 'string' ? this.venuesLink : '/' + (this.venuesLink as any[]).join('/'));
    const m = norm(
      typeof this.myBookingsLink === 'string'
        ? this.myBookingsLink
        : '/' + (this.myBookingsLink as any[]).join('/'),
    );
    const p = norm(
      typeof this.customerProfileLink === 'string'
        ? this.customerProfileLink
        : '/' + (this.customerProfileLink as any[]).join('/'),
    );

    if (url === f) {
      this.currentTitle = 'Friendly Matches';
      this.active = 'friendly-matches';
      return;
    }

    if (url === t) {
      this.currentTitle = 'Tournaments';
      this.active = 'tournaments';
      return;
    }

    if (url === v) {
      this.currentTitle = 'Venues';
      this.active = 'venues';
      return;
    }

    if (url === m) {
      this.currentTitle = 'My Bookings';
      this.active = 'my-bookings';
      return;
    }

    // profile route: clear top-dot active (only profile should look active)
    if (url === p) {
      this.currentTitle = 'My Profile';
      this.active = null as any;
      return;
    }

    this.active = null as any;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isProfileMenuOpen) return;
    const target = event.target as Node | null;
    if (!target) return;

    if (!this.elRef.nativeElement.contains(target)) {
      this.closeProfileMenu();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 768) this.isMobileMenuOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isMobileMenuOpen = false;
    this.closeProfileMenu();
  }

  GetProfile(): void {
    this.playerProfileService.GetProfile().subscribe({
      next: (res) => {
        this.ProfileDetails = res.data;
      },
    });
  }
  Logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/Login']);
    this.toastService.success('Logged out successfully', 'Ehgazly');

  }

}