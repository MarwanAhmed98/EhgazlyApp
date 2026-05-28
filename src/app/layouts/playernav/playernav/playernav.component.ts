import { NgClass } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, Subscription, finalize } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { PlayerProfileService } from '../../../core/services/PlayerProfile/player-profile.service';
import { Iplayerprofile } from '../../../shared/interfaces/iplayerprofile';
import { ToastService } from '../../../core/services/toast/toast.service';
import { PlayerNotiService } from '../../../shared/components/PlayerNoti/player-noti.service';
import { INotifications, Notification as NotiItem } from '../../../shared/interfaces/inotifications';

export type PlayerNavActive = 'tournaments' | 'venues' | 'my-bookings' | 'friendly-matches';

type NavbarNotifType = 'booking_confirmed' | 'teams' | 'system';

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
  private readonly playerNotiService = inject(PlayerNotiService);
  private readonly elRef = inject(ElementRef<HTMLElement>);

  private routerSub?: Subscription;
  private notiSub?: Subscription;

  ProfileDetails: Iplayerprofile = {} as Iplayerprofile;

  NotificationsDetails: INotifications = {
    notifications: [],
    unread_count: 0,
  };

  // loading/error state for dropdown
  notiLoading = false;
  notiError = '';

  // mark-as-read loading set (prevents double clicks)
  readonly markingReadIds = new Set<number>();

  // mark-all loading
  markAllLoading = false;

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

  // Notifications dropdown state
  isNotificationsOpen = false;
  notifFilter: 'all' | NavbarNotifType = 'all';

  // viewport-safe positioning values (px)
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

  ngOnInit(): void {
    this.GetProfile();
    this.updateTitleByRoute();
    this.updateProfileRouteFlag();
    this.GetNoti();

    this.routerSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.updateTitleByRoute();
        this.updateProfileRouteFlag();
        this.isMobileMenuOpen = false;

        this.closeProfileMenu();
        this.closeNotifications();
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.notiSub?.unsubscribe();
  }

  // ===== Notifications API =====
  GetNoti(): void {
    this.notiSub?.unsubscribe();
    this.notiLoading = true;
    this.notiError = '';

    this.notiSub = this.playerNotiService
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

  // ===== Notifications dropdown =====
  toggleNotifications(ev: Event): void {
    ev.stopPropagation();

    this.closeProfileMenu();
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

  setNotifFilter(filterValue: 'all' | NavbarNotifType): void {
    this.notifFilter = filterValue;
    queueMicrotask(() => this.positionNotificationsPanel());
  }

  // ===== REAL Mark as Read =====
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

    this.playerNotiService
      .MarkAsRead(notificationId)
      .pipe(finalize(() => this.markingReadIds.delete(notificationId)))
      .subscribe({
        next: () => {
          const nextNotifications = (this.NotificationsDetails.notifications ?? []).map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n,
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

  // ===== REAL Mark ALL as Read =====
  MarkAllAsRead(): void {
    const unread = Number(this.NotificationsDetails?.unread_count ?? 0);
    if (unread === 0) return;
    if (this.markAllLoading) return;

    this.markAllLoading = true;

    this.playerNotiService
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

  // ===== NEW: Handle Pay button click =====
  onPayNotification(item: NotiItem): void {
    // You can implement the actual payment logic here.
    // For now, we show a toast and close the dropdown.
    console.log('Pay clicked for notification:', item);
    this.toastService.info('Payment gateway will open soon.', 'Ehgazly');
    this.closeNotifications(); // optional: close dropdown after action
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
      case 'calendar-check':
        return 'bg-[#E3F9E5]';
      case 'match':
        return 'bg-[#EAF4FF]';
      case 'invite':
        return 'bg-[#C6F1CD]/70';
      case 'calendar-cancel':
        return 'bg-[#FDF1E6]';
      default:
        return 'bg-slate-100';
    }
  }

  formatNotiTime(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';

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

  // ===== Profile dropdown (Desktop only) =====
  toggleProfileMenu(ev: Event): void {
    if (window.innerWidth < 768) return;

    ev.stopPropagation();
    this.closeNotifications();
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

  goToProfileFromMobile(): void {
    this.closeMobileMenu();
    const link = this.customerProfileLink;
    this.router.navigate(Array.isArray(link) ? link : [link]);
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
    this.closeProfileMenu();
    this.closeNotifications();
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
    if (url === p) {
      this.currentTitle = 'My Profile';
      this.active = null as any;
      return;
    }

    this.active = null as any;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (!target) return;

    if (!this.elRef.nativeElement.contains(target)) {
      this.closeProfileMenu();
      this.closeNotifications();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 768) this.isMobileMenuOpen = false;
    if (window.innerWidth < 768) this.closeProfileMenu();
    if (this.isNotificationsOpen) queueMicrotask(() => this.positionNotificationsPanel());
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.isNotificationsOpen) queueMicrotask(() => this.positionNotificationsPanel());
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isMobileMenuOpen = false;
    this.closeProfileMenu();
    this.closeNotifications();
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
    localStorage.removeItem('userId');
    this.router.navigate(['/Login']);
    this.toastService.success('Logged out successfully', 'Ehgazly');
  }
}