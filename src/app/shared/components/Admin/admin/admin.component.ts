import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, finalize, Subscription } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { AdminNotiService } from '../../../../core/services/AdminNoti/admin-noti.service';
import { INotifications, Notification as NotiItem } from '../../../../shared/interfaces/inotifications';
import { TranslateService } from '../../../../core/services/translate/translate.service';

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
export class AdminComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly toastService = inject(ToastService);
  private readonly adminNotiService = inject(AdminNotiService);
  private readonly elRef = inject(ElementRef<HTMLElement>);
  private readonly pageTranslator = inject(TranslateService);
  UserNameeeee: string = localStorage.getItem('username')!;
  isDarkMode: boolean = false;
  isSideNavOpen = true;
  currentTitle = 'Dashboard';
  header = { breadcrumbRoot: 'Ehgezly' };
  brand = { name: 'Ehgezly' };
  userName: string = (typeof localStorage !== 'undefined' && localStorage.getItem('UserName')) || 'User';
  isArabic = false;
  isTranslating = false;
  navItems: NavItem[] = [
    { key: 'user-directory', label: 'Admin Dashboard', route: '/Admin/UserDirectory', exact: false, iconName: 'layout-grid' },
    { key: 'manage-all-users', label: 'Manage Owners', route: '/Admin/AdminUserManagement', exact: false, iconName: 'user' },
    { key: 'manage-owners-payment', label: 'Manage Owners Payment', route: '/Admin/AdminPendingList', exact: false, iconName: 'credit-card' },
    { key: 'manage-courts', label: 'Manage Courts', route: '/Admin/ManageCourts', exact: false, iconName: 'map-pin' },
    { key: 'manage-tournaments', label: 'Tournaments Management', route: '/Admin/AdminManageTournaments', exact: false, iconName: 'trophy' },
    { key: 'financials', label: 'Financials', route: '/Admin/AdminJoinReq', exact: false, iconName: 'dollar-sign' },
  ];

  get avatarUrl(): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.UserNameeeee)}&background=146A1E&color=ffffff`;
  }
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

  @ViewChild('notifBtn', { read: ElementRef }) notifBtn?: ElementRef<HTMLElement>;
  @ViewChild('notifPanel', { read: ElementRef }) notifPanel?: ElementRef<HTMLElement>;
  private notiSub?: Subscription;

  get filteredNavbarNotifications(): NotiItem[] {
    const list = this.NotificationsDetails?.notifications ?? [];
    if (this.notifFilter === 'all') return list;
    return list.filter(n => String(n.type || '').toLowerCase() === this.notifFilter);
  }

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
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.updateTitleByRoute(e.urlAfterRedirects));
    this.GetNoti();
    this.isArabic = localStorage.getItem('lang') === 'ar';
    if (this.isArabic) {
      document.dir = 'rtl';
      this.autoTranslatePage();
    }
  }

  ngOnDestroy(): void {
    this.notiSub?.unsubscribe();
  }

  GetNoti(): void {
    this.notiSub?.unsubscribe();
    this.notiLoading = true;
    this.notiError = '';
    this.notiSub = this.adminNotiService.GetNotifications()
      .pipe(finalize(() => (this.notiLoading = false)))
      .subscribe({
        next: (res) => {
          const data = res?.data ?? res;
          this.NotificationsDetails = {
            notifications: data?.notifications ?? [],
            unread_count: Number(data?.unread_count ?? 0),
          };
        },
        error: (err) => {
          this.NotificationsDetails = { notifications: [], unread_count: 0 };
          this.notiError = err?.error?.message ?? 'Please try again.';
        },
      });
  }
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

  toggleNotifications(ev: Event): void {
    ev.stopPropagation();
    this.isNotificationsOpen = !this.isNotificationsOpen;
    if (this.isNotificationsOpen) {
      this.GetNoti();
    }
  }

  closeNotifications(): void {
    this.isNotificationsOpen = false;
  }
  setNotifFilter(filterValue: 'all' | 'booking_confirmed' | 'teams' | 'system'): void {
    this.notifFilter = filterValue;
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
    const target = list.find(n => n.id === notificationId);
    if (!target || target.is_read) return;

    this.markingReadIds.add(notificationId);
    this.adminNotiService.MarkAsRead(notificationId)
      .pipe(finalize(() => this.markingReadIds.delete(notificationId)))
      .subscribe({
        next: () => {
          const nextNotifications = this.NotificationsDetails.notifications.map(n =>
            n.id === notificationId ? { ...n, is_read: true } : n
          );
          const nextUnread = Math.max(0, this.NotificationsDetails.unread_count - 1);
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
    this.adminNotiService.MarkAllAsRead()
      .pipe(finalize(() => (this.markAllLoading = false)))
      .subscribe({
        next: () => {
          const nextNotifications = this.NotificationsDetails.notifications.map(n => ({ ...n, is_read: true }));
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
  // private applyTheme(): void {
  //   if (!isPlatformBrowser(this.platformId)) return;
  //   const isDark = localStorage.getItem('theme') === 'dark';
  //   if (isDark) document.documentElement.classList.add('dark');
  //   else document.documentElement.classList.remove('dark');
  // }
  private updateTitleByRoute(url: string): void {
    const item = this.navItems.find(n => n.exact ? url === n.route : url.startsWith(n.route));
    if (item) this.currentTitle = item.label;
  }
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
    }
    this.router.navigate(['/Login']);
    this.toastService.success('Logged out successfully', 'Ehgazly');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (!target) return;
    if (!this.elRef.nativeElement.contains(target)) {
      this.closeNotifications();
    }
  }
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeNotifications();
  }
  async toggleTranslation() {
    if (this.isArabic) {
      localStorage.setItem('lang', 'en');
      document.dir = 'ltr';
      window.location.reload();
      return;
    }

    this.isTranslating = true;
    await this.pageTranslator.translatePage();
    document.dir = 'rtl';
    localStorage.setItem('lang', 'ar');
    this.isArabic = true;
    this.isTranslating = false;
  }
  private async autoTranslatePage() {
    this.isTranslating = true;
    await new Promise(resolve => setTimeout(resolve, 800));
    await this.pageTranslator.translatePage();
    this.isTranslating = false;
  }
}