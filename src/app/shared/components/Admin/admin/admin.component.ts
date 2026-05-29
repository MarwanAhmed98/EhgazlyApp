import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from '../../../../core/services/toast/toast.service';

type NavItem = {
  key: string;
  label: string;
  route: string;
  exact: boolean;
  badgeText?: string;
  iconName: string;
};

@Component({
  selector: 'app-admin',
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly toastService = inject(ToastService);
  isSideNavOpen = true;
  isDarkMode = (typeof localStorage !== 'undefined' && localStorage.getItem('theme') === 'dark') ?? false;
  currentTitle = 'Dashboard';
  header = { breadcrumbRoot: 'Ehgazly' };
  brand = { name: 'Ehgazly', logoUrl: '/assets/images/logo.png' };
  userName: string = (typeof localStorage !== 'undefined' && localStorage.getItem('UserName')) || 'User';

  get avatarUrl(): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.userName)}&background=146A1E&color=ffffff`;
  }
  navItems: NavItem[] = [
    // { key: 'dashboard', label: 'Operations', route: '/Admin/AdminDashboard', exact: true, iconName: 'layout-grid' },
    { key: 'user-directory', label: 'Admin Dashboard', route: '/Admin/UserDirectory', exact: false, iconName: 'layout-grid' },
    { key: 'analytics', label: 'Analytics', route: '/Admin/AdminJoinReq', exact: false, iconName: 'bar-chart' },
    { key: 'revenues', label: 'Revenues', route: '/Admin/AdminRevenues', exact: false, iconName: 'dollar-sign' },
    { key: 'manage-all-users', label: 'Manage Owners', route: '/Admin/AdminUserManagement', exact: false, iconName: 'user' },
    { key: 'manage-tournaments', label: 'Tournaments Management', route: '/Admin/AdminManageTournaments', exact: false, iconName: 'trophy' },
    // { key: 'manage-court-schedule', label: 'Manage Court Schedule', route: '/CourtOwner/ManageCourtSchedule', exact: false, iconName: 'calendar-clock' },
    // { key: 'Financial', label: 'Financial', route: '/CourtOwner/Financials', exact: false, iconName: 'banknote' },
  ];

  ngOnInit(): void {
    this.applyTheme();
    this.updateTitleByRoute(this.router.url);

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.updateTitleByRoute(e.urlAfterRedirects);
      });
  }

  toggleSideNav(): void { this.isSideNavOpen = !this.isSideNavOpen; }
  closeSideNav(): void { this.isSideNavOpen = false; }

  onNavClick(item: NavItem): void {
    this.currentTitle = item.label;
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
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
    const item = this.navItems.find((n) => (n.exact ? url === n.route : url.startsWith(n.route)));
    if (item) this.currentTitle = item.label;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      // localStorage.clear();
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
    }
    this.router.navigate(['/Login']);
    this.toastService.success('Logged out successfully', 'Ehgazly');
  }
}
