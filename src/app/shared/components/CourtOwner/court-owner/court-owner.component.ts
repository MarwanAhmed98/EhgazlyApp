import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

type NavItem = {
  key: string;
  label: string;
  route: string;
  exact: boolean;
  badgeText?: string;
  iconSvg: string;
  iconSvgSafe: SafeHtml;
};

@Component({
  selector: 'app-court-owner',
  imports: [CommonModule, RouterModule],
  templateUrl: './court-owner.component.html',
  styleUrl: './court-owner.component.scss',
})
export class CourtOwnerComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sanitizer = inject(DomSanitizer);

  isSideNavOpen = true;

  isDarkMode = (typeof localStorage !== 'undefined' && localStorage.getItem('theme') === 'dark') ?? false;

  currentTitle = 'Dashboard';
  header = { breadcrumbRoot: 'Ehgazly' };

  brand = {
    name: 'Ehgazly',
    logoUrl: '/assets/images/logo.png',
  };

  userName: string = (typeof localStorage !== 'undefined' && localStorage.getItem('UserName')) || 'JD';
  get avatarUrl(): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.userName)}&background=146A1E&color=ffffff`;
  }

  navItems: NavItem[] = [];

  ngOnInit(): void {
    this.applyTheme();

    // FIX: child routes must be relative to /CourtOwner because this component hosts the children outlet
    const rawItems = [
      { key: 'dashboard', label: 'Dashboard', route: '/CourtOwner/Dashboard', exact: true, iconSvg: this.iconGrid() },
      {
        key: 'my-bookings',
        label: 'Bookings Management',
        route: '/CourtOwner/CourtOwnerBookings',
        exact: false,
        iconSvg: this.iconCalendar(),
      },
      { key: 'earnings', label: 'Earnings', route: '/CourtOwner/CourtOwnerEarnings', exact: false, iconSvg: this.iconDollarSign() },
      { key: 'historicalbooking', label: 'Historical Bookings', route: '/CourtOwner/CourtOwnerHistoricalBookings', exact: false, iconSvg: this.iconHistory() },
      { key: 'courts', label: 'Courts', route: '/CourtOwner/CourtOwnerManagement', exact: false, iconSvg: this.iconCourt() },
      { key: 'manage-court-schedule', label: 'Manage Court Schedule', route: '/CourtOwner/ManageCourtSchedule', exact: false, iconSvg: this.iconCourtCalendar() },
      { key: 'tournaments', label: 'Tournaments', route: '/Tournaments', exact: false, iconSvg: this.iconTrophy() },
    ] as const;

    this.navItems = rawItems.map((i) => ({
      ...i,
      iconSvgSafe: this.sanitizer.bypassSecurityTrustHtml(i.iconSvg),
    }));

    this.updateTitleByRoute(this.router.url);

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.updateTitleByRoute(e.urlAfterRedirects);
      });
  }

  toggleSideNav(): void {
    this.isSideNavOpen = !this.isSideNavOpen;
  }

  closeSideNav(): void {
    this.isSideNavOpen = false;
  }

  onNavClick(item: NavItem): void {
    this.currentTitle = item.label;

    // Optional: close after navigation on small screens only (keeps desktop behavior)
    // But do not change toggle behavior; just avoid leaving it open on mobile after click.
    if (window.matchMedia && window.matchMedia('(max-width: 1023px)').matches) {
      this.isSideNavOpen = false;
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    }
    this.applyTheme();
  }

  private applyTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }

  private updateTitleByRoute(url: string): void {
    const item =
      this.navItems.find((n) => (n.exact ? url === n.route : url.startsWith(n.route))) ??
      this.navItems.find((n) => url.includes(n.route));
    if (item) this.currentTitle = item.label;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('CourtOwnerToken');
      localStorage.removeItem('UserName');
    }
    this.router.navigate(['/login']);
  }

  private iconGrid(): string {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="8" height="8" rx="2"></rect>
        <rect x="13" y="3" width="8" height="8" rx="2"></rect>
        <rect x="3" y="13" width="8" height="8" rx="2"></rect>
        <rect x="13" y="13" width="8" height="8" rx="2"></rect>
      </svg>
    `;
  }

  private iconTrophy(): string {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 21h8"></path>
        <path d="M12 17v4"></path>
        <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z"></path>
        <path d="M17 6h2a2 2 0 0 1 0 4h-2"></path>
        <path d="M7 6H5a2 2 0 0 0 0 4h2"></path>
      </svg>
    `;
  }

  private iconDollarSign(): string {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 1v22"></path>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    `;
  }

  private iconCalendar(): string {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 2v4"></path>
        <path d="M16 2v4"></path>
        <rect x="3" y="4" width="18" height="18" rx="3"></rect>
        <path d="M3 10h18"></path>
      </svg>
    `;
  }
  private iconHistory(): string {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12,6 12,12 16,14"></polyline>
      </svg>
    `;
  }
  private iconCourt(): string {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="2" width="20" height="10" rx="2"></rect>
        <rect x="2" y="12" width="20" height="10" rx="2"></rect>
        <line x1="12" y1="2" x2="12" y2="22"></line>
        <line x1="2" y1="7" x2="22" y2="7"></line>
        <line x1="2" y1="17" x2="22" y2="17"></line>
      </svg>
    `;
  }
  private iconCourtCalendar(): string {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="2" width="20" height="10" rx="2"></rect>
        <rect x="2" y="12" width="20" height="10" rx="2"></rect>
        <line x1="12" y1="2" x2="12" y2="22"></line>
        <line x1="2" y1="7" x2="22" y2="7"></line>
        <line x1="2" y1="17" x2="22" y2="17"></line>
        <line x1="8" y1="12" x2="8" y2="22"></line>
        <line x1="16" y1="12" x2="16" y2="22"></line>
      </svg>
    `;
  }

}