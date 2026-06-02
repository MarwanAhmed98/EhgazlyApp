import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { finalize, Subscription } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { PlayerNotiService } from '../../PlayerNoti/player-noti.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { INotifications, Notification as NotiItem } from '../../../interfaces/inotifications';
import { CourtOwnerNavService } from '../../../../core/services/CourtOwnerNav/court-owner-nav.service';

type NavItem = {
  key: string;
  label: string;
  route: string;
  exact: boolean;
  badgeText?: string;
  iconName: string;
};

@Component({
  selector: 'app-court-owner',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './court-owner.component.html',
  styleUrls: ['./court-owner.component.scss'],
})
export class CourtOwnerComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly playerNotiService = inject(PlayerNotiService);
  private readonly courtOwnerNavService = inject(CourtOwnerNavService);
  private readonly toastService = inject(ToastService);
  private readonly elRef = inject(ElementRef<HTMLElement>);

  UserNameeeee: string = localStorage.getItem('username')!;

  // Navigation state
  isSideNavOpen = true;
  isDarkMode: boolean = false;
  currentTitle = 'Dashboard';
  header = { breadcrumbRoot: 'Ehgazly' };
  brand = { name: 'Ehgezly', logoUrl: '/assets/images/logo.png' };
  userName: string =
    (typeof localStorage !== 'undefined' && localStorage.getItem('UserName')) || 'User';

  get avatarUrl(): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.UserNameeeee)}&background=146A1E&color=ffffff`;
  }

  navItems: NavItem[] = [
    { key: 'dashboard', label: 'Dashboard', route: '/CourtOwner/Dashboard', exact: true, iconName: 'layout-grid' },
    {
      key: 'my-bookings',
      label: 'Bookings Management',
      route: '/CourtOwner/CourtOwnerBookings',
      exact: false,
      iconName: 'calendar-days',
    },
    { key: 'earnings', label: 'Earnings', route: '/CourtOwner/CourtOwnerEarnings', exact: false, iconName: 'trending-up' },
    { key: 'courts', label: 'Main Courts', route: '/CourtOwner/CourtOwnerManagement', exact: false, iconName: 'map-pin-house' },
    { key: 'courts', label: 'Courts', route: '/CourtOwner/CourtOwnerCourts', exact: false, iconName: 'map-pin' },
    {
      key: 'manage-court-schedule',
      label: 'Manage Court Schedule',
      route: '/CourtOwner/ManageCourtSchedule',
      exact: false,
      iconName: 'calendar-clock',
    },
    {
      key: 'profile-working-hours',
      label: 'Working Hours',
      route: '/CourtOwner/ProfileWorkingHours',
      exact: false,
      iconName: 'clock',
    },
    {
      key: 'court-owner-payment',
      label: 'Payment',
      route: '/CourtOwner/CourtOwnerPaymnet',
      exact: false,
      iconName: 'credit-card',
    },
  ];

  // ==================== NOTIFICATION PROPERTIES ====================
  private notiSub?: Subscription;
  NotificationsDetails: INotifications = {
    notifications: [],
    unread_count: 0,
  };
  notiLoading = false;
  notiError = '';
  readonly markingReadIds = new Set<number>();
  markAllLoading = false;
  isNotificationsOpen = false;
  notifFilter: 'all' | 'booking_confirmed' | 'teams' | 'system' = 'all';
  notifPanelLeft = 8;
  notifPanelTop = 72;
  notifPanelOrigin = 'top right';

  @ViewChild('notifBtn', { read: ElementRef }) notifBtn?: ElementRef<HTMLElement>;
  @ViewChild('notifPanel', { read: ElementRef }) notifPanel?: ElementRef<HTMLElement>;

  get filteredNavbarNotifications(): NotiItem[] {
    const list = this.NotificationsDetails?.notifications ?? [];
    if (this.notifFilter === 'all') return list;
    return list.filter((n) => String(n.type || '').toLowerCase() === this.notifFilter);
  }

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === null) {
        this.isDarkMode = true;
        localStorage.setItem('theme', 'dark');
      } else {
        this.isDarkMode = savedTheme === 'dark';
      }
      this.applyTheme();
    }

    this.updateTitleByRoute(this.router.url);
    this.GetNoti();

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.updateTitleByRoute(e.urlAfterRedirects);
      });
  }

  ngOnDestroy(): void {
    this.notiSub?.unsubscribe();
  }

  // ==================== THEME ====================
  toggleDarkMode(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // ==================== NOTIFICATION METHODS ====================
  GetNoti(): void {
    this.notiSub?.unsubscribe();
    this.notiLoading = true;
    this.notiError = '';

    this.notiSub = this.courtOwnerNavService
      .GetNotifications()
      .pipe(finalize(() => (this.notiLoading = false)))
      .subscribe({
        next: (res) => {
          const data = res?.data ?? res;
          this.NotificationsDetails = {
            notifications: data?.notifications ?? [],
            unread_count: Number(data?.unread_count ?? 0),
          };
          if (this.isNotificationsOpen) queueMicrotask(() => this.positionNotificationsPanel());
        },
        error: (err) => {
          this.NotificationsDetails = { notifications: [], unread_count: 0 };
          this.notiError = err?.error?.message ?? 'Please try again.';
        },
      });
  }

  toggleNotifications(ev: Event): void {
    ev.stopPropagation();
    this.isNotificationsOpen = !this.isNotificationsOpen;
    if (this.isNotificationsOpen) {
      this.GetNoti();
      queueMicrotask(() => this.positionNotificationsPanel());
    }
  }

  closeNotifications(): void {
    this.isNotificationsOpen = false;
  }

  private positionNotificationsPanel(): void {
    const btn = this.notifBtn?.nativeElement;
    const panel = this.notifPanel?.nativeElement;
    if (!btn || !panel) return;

    const gap = 10;
    const safe = 8;
    const btnRect = btn.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const panelW = panelRect.width || 360;
    const panelH = panelRect.height || 420;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = btnRect.right - panelW;
    let top = btnRect.bottom + gap;
    let origin = 'top right';

    if (left < safe) {
      left = safe;
      origin = 'top left';
    }
    if (left + panelW > vw - safe) {
      left = Math.max(safe, vw - safe - panelW);
      origin = 'top right';
    }

    const spaceBelow = vh - (btnRect.bottom + gap) - safe;
    const spaceAbove = btnRect.top - gap - safe;
    if (panelH > spaceBelow && spaceAbove > spaceBelow) {
      top = Math.max(safe, btnRect.top - gap - panelH);
      origin = origin.includes('left') ? 'bottom left' : 'bottom right';
    } else {
      top = Math.min(vh - safe - panelH, top);
    }

    left = Math.min(Math.max(safe, left), vw - safe - panelW);
    top = Math.min(Math.max(safe, top), vh - safe - panelH);

    this.notifPanelLeft = Math.round(left);
    this.notifPanelTop = Math.round(top);
    this.notifPanelOrigin = origin;
  }

  setNotifFilter(filterValue: 'all' | 'booking_confirmed' | 'teams' | 'system'): void {
    this.notifFilter = filterValue;
    queueMicrotask(() => this.positionNotificationsPanel());
  }

  onNotificationClick(item: NotiItem): void {
    const id = Number(item?.id);
    if (!Number.isFinite(id)) return;
    if (item.is_read) return;
    this.MarkAsRead(id);
  }

  MarkAsRead(notificationId: number): void {
    if (!Number.isFinite(notificationId)) return;
    if (this.markingReadIds.has(notificationId)) return;

    const list = this.NotificationsDetails?.notifications ?? [];
    const target = list.find((n) => n.id === notificationId);
    if (!target || target.is_read) return;

    this.markingReadIds.add(notificationId);
    this.courtOwnerNavService
      .MarkAsRead(notificationId)
      .pipe(finalize(() => this.markingReadIds.delete(notificationId)))
      .subscribe({
        next: () => {
          const nextNotifications = (this.NotificationsDetails.notifications ?? []).map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          );
          const nextUnread = Math.max(0, Number(this.NotificationsDetails.unread_count ?? 0) - 1);
          this.NotificationsDetails = {
            ...this.NotificationsDetails,
            notifications: nextNotifications,
            unread_count: nextUnread,
          };
        },
        error: (err) => {
          this.toastService.error(err?.error?.message ?? 'Failed to mark as read.', 'Ehgazly');
        },
      });
  }

  MarkAllAsRead(): void {
    const unread = Number(this.NotificationsDetails?.unread_count ?? 0);
    if (unread === 0) return;
    if (this.markAllLoading) return;

    this.markAllLoading = true;
    this.courtOwnerNavService
      .MarkAllAsRead()
      .pipe(finalize(() => (this.markAllLoading = false)))
      .subscribe({
        next: () => {
          const nextNotifications = (this.NotificationsDetails?.notifications ?? []).map((n) => ({
            ...n,
            is_read: true,
          }));
          this.NotificationsDetails = {
            ...this.NotificationsDetails,
            notifications: nextNotifications,
            unread_count: 0,
          };
        },
        error: (err) => {
          this.toastService.error(err?.error?.message ?? 'Failed to mark all as read.', 'Ehgazly');
        },
      });
  }

  getNotifIcon(type: string): 'calendar-check' | 'match' | 'invite' | 'calendar-cancel' {
    const t = String(type || '').toLowerCase();
    if (t.includes('booking') || t.includes('reservation')) return 'calendar-check';
    if (t.includes('match')) return 'match';
    if (t.includes('team') || t.includes('invite')) return 'invite';
    if (t.includes('cancel')) return 'calendar-cancel';
    return 'match';
  }

  getNotifIconBg(type: string): string {
    const icon = this.getNotifIcon(type);
    switch (icon) {
      case 'calendar-check': return 'bg-[#E3F9E5]';
      case 'match': return 'bg-[#EAF4FF]';
      case 'invite': return 'bg-[#C6F1CD]/70';
      case 'calendar-cancel': return 'bg-[#FDF1E6]';
      default: return 'bg-slate-100';
    }
  }

  formatNotiTime(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // ==================== HOST LISTENERS ====================
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (!target) return;
    if (!this.elRef.nativeElement.contains(target)) {
      this.closeNotifications();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.isNotificationsOpen) queueMicrotask(() => this.positionNotificationsPanel());
    if (window.innerWidth >= 768) this.isSideNavOpen = true;
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.isNotificationsOpen) queueMicrotask(() => this.positionNotificationsPanel());
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeNotifications();
  }

  // ==================== UI & NAVIGATION METHODS ====================
  toggleSideNav(): void {
    this.isSideNavOpen = !this.isSideNavOpen;
  }

  closeSideNav(): void {
    this.isSideNavOpen = false;
  }

  onNavClick(item: NavItem): void {
    this.currentTitle = item.label;
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
      this.isSideNavOpen = false;
    }
  }

  private updateTitleByRoute(url: string): void {
    const item = this.navItems.find((n) => (n.exact ? url === n.route : url.startsWith(n.route)));
    if (item) this.currentTitle = item.label;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      this.toastService.success('Logged out successfully.', 'Ehgazly');
    }
    this.router.navigate(['/Login']);
  }
}