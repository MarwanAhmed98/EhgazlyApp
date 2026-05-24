import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayernavComponent } from '../../../../layouts/playernav/playernav/playernav.component';
interface NotificationItem {
  id: string;
  type: 'bookings' | 'teams' | 'system';
  title: string;
  description: string;
  time: string;
  unread: boolean;
  accentColor?: string; // e.g. 'green', 'blue', or none
  iconType: 'calendar-check' | 'match' | 'invite' | 'calendar-cancel';
  bgColorClass: string;
  actionButtons: Array<{
    text: string;
    style: 'primary' | 'secondary' | 'accent' | 'outline';
    action: string;
  }>;
}

@Component({
  selector: 'app-player-notification',
  imports: [PlayernavComponent, CommonModule],
  templateUrl: './player-notification.component.html',
  styleUrl: './player-notification.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerNotificationComponent {
  // Configurable dynamic notifications list matching screen specification exactly
  notifications = signal<NotificationItem[]>([
    {
      id: '1',
      type: 'bookings',
      title: 'Booking Confirmed: King Fahd Stadium',
      description: 'Your 5v5 pitch is secured for tomorrow at 8:00 PM. Don\'t forget to invite your squad.',
      time: '2m ago',
      unread: true,
      accentColor: 'green',
      iconType: 'calendar-check',
      bgColorClass: 'bg-white',
      actionButtons: [
        { text: 'View Details', style: 'primary', action: 'view_details' },
        { text: 'Share Invite', style: 'secondary', action: 'share_invite' }
      ]
    },
    {
      id: '2',
      type: 'bookings',
      title: 'Match Starts in 2 Hours',
      description: 'Derby Clash vs. Falcons FC. Ensure you have your shin guards ready. Pitch 3.',
      time: '1h ago',
      unread: true,
      accentColor: 'blue',
      iconType: 'match',
      bgColorClass: 'bg-white',
      actionButtons: [
        { text: 'Match Dashboard', style: 'secondary', action: 'match_dashboard' }
      ]
    },
    {
      id: '3',
      type: 'teams',
      title: "Invitation: Join 'Desert Foxes'",
      description: 'Ahmed K. has invited you to join their roster for the upcoming Summer League.',
      time: 'Yesterday',
      unread: true,
      iconType: 'invite',
      bgColorClass: 'bg-[#C6F1CD]', // Full tinted background for the invitation card
      actionButtons: [
        { text: 'Accept', style: 'accent', action: 'accept_invite' },
        { text: 'Decline', style: 'outline', action: 'decline_invite' }
      ]
    },
    {
      id: '4',
      type: 'bookings',
      title: 'Booking Cancelled',
      description: 'Your reservation for Al-Riyadh Arena has been successfully cancelled. Refund processed.',
      time: 'Oct 12',
      unread: false,
      iconType: 'calendar-cancel',
      bgColorClass: 'bg-[#C6F1CD]/30', // Semi-transparent or faded
      actionButtons: []
    }
  ]);

  activeFilter = signal<'all' | 'bookings' | 'teams' | 'system'>('all');
  toastMessage = signal<string>('');

  // Computed state for active filters
  filteredNotifications = computed(() => {
    const filter = this.activeFilter();
    const list = this.notifications();
    if (filter === 'all') {
      return list;
    }
    return list.filter(item => item.type === filter);
  });

  // Calculate unread items for filters
  unreadCount = computed(() => {
    return this.notifications().filter(item => item.unread).length;
  });

  teamsUnreadCount = computed(() => {
    return this.notifications().filter(item => item.unread && item.type === 'teams').length;
  });

  // Set selected active tab filter
  setFilter(filter: 'all' | 'bookings' | 'teams' | 'system') {
    this.activeFilter.set(filter);
  }

  // Set all notifications to read state
  markAllAsRead() {
    this.notifications.update(items =>
      items.map(item => ({ ...item, unread: false }))
    );
    this.toastMessage.set('All notifications marked as read.');
  }

  // Handler for action buttons inside the notification item list
  handleAction(action: string, item: NotificationItem) {
    switch (action) {
      case 'view_details':
        this.toastMessage.set(`Opening booking details for: ${item.title}`);
        break;
      case 'share_invite':
        this.toastMessage.set('Invitation link copied to clipboard!');
        break;
      case 'match_dashboard':
        this.toastMessage.set('Navigating to Match Dashboard...');
        break;
      case 'accept_invite':
        this.toastMessage.set('You joined the Desert Foxes roster!');
        // Mark as read after accepting
        this.notifications.update(items =>
          items.map(n => n.id === item.id ? { ...n, unread: false, actionButtons: [] } : n)
        );
        break;
      case 'decline_invite':
        this.toastMessage.set('Invitation declined.');
        // Remove or alter invitation
        this.notifications.update(items =>
          items.filter(n => n.id !== item.id)
        );
        break;
      default:
        this.toastMessage.set('Action initiated.');
    }
  }

  // Get responsive styling for specific buttons based on UI theme
  getButtonClass(style: 'primary' | 'secondary' | 'accent' | 'outline'): string {
    switch (style) {
      case 'primary':
        return 'bg-[#0B3A1C] hover:bg-black text-white shadow-sm';
      case 'secondary':
        return 'bg-[#A2EAB4] hover:bg-[#8CE0A1] text-[#0B3A1C] shadow-sm';
      case 'accent':
        return 'bg-[#A44B15] hover:bg-[#8B3D10] text-white shadow-sm';
      case 'outline':
        return 'bg-transparent border border-[#0B3A1C]/20 text-[#0B3A1C] hover:bg-[#0B3A1C]/10';
      default:
        return 'bg-gray-200 hover:bg-gray-300 text-gray-700';
    }
  }

  // Custom filter pill active status class compiler
  getFilterClass(isActive: boolean): string {
    return isActive
      ? 'bg-[#87E19A] text-[#0D3B1D] font-bold'
      : 'bg-[#B3EDBF] text-[#0D3B1D]/80 font-medium hover:bg-[#A3E5AF] hover:text-[#0D3B1D]';
  }

  // Card background state compiler
  getCardClasses(item: NotificationItem): string {
    let classes = 'card-item-container ';

    // Exact backgrounds matching the mock screen
    if (item.id === '3') {
      classes += 'bg-[#C6F1CD] border-transparent';
    } else if (item.id === '4') {
      classes += 'bg-white/40 opacity-60 border-transparent';
    } else {
      classes += 'bg-white shadow-sm';
    }

    // Add extra padding-left if left border accent is present
    if (item.accentColor) {
      classes += ' pl-6 md:pl-7';
    }

    return classes;
  }

  // Icon background colors matching design precisely
  getIconBackgroundClass(type: 'calendar-check' | 'match' | 'invite' | 'calendar-cancel'): string {
    switch (type) {
      case 'calendar-check':
        return 'bg-[#E3F9E5]';
      case 'match':
        return 'bg-[#EAF4FF]';
      case 'invite':
        return 'bg-transparent'; // Inner logo takes care of style
      case 'calendar-cancel':
        return 'bg-[#FDF1E6]';
      default:
        return 'bg-gray-100';
    }
  }
}