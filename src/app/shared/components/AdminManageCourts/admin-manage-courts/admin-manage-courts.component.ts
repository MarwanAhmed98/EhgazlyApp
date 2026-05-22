import { Component, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BookingActivity {
  user: string;
  avatar: string;
  dateTime: string;
  duration: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  payment: string;
}

interface Stadium {
  id: string;
  name: string;
  owner: string;
  location: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'UNDER REVIEW';
  capacity: string; // Used for "Pitch Size" e.g., "11x11 Official"
  image: string;
  utilization: number; // e.g., 88
  upcomingBookings: number; // e.g., 14
  surfaceType: string; // e.g., "Professional Turf"
  lighting: string; // e.g., "LED Floodlights"
  isFeatured: boolean;
  featureStartDate?: string;
  featureEndDate?: string;
  recentActivity: BookingActivity[];
}

@Component({
  selector: 'app-admin-manage-courts',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-manage-courts.component.html',
  styleUrl: './admin-manage-courts.component.scss'
})
export class AdminManageCourtsComponent {
  // Mock Data upgraded to match specifications of both Directory & Details Reference layouts
  private initialStadiums: Stadium[] = [
    {
      id: '#ST-90210',
      name: 'Anfield Pro Pitch', // Matches the details layout reference directly
      owner: 'Ahmed Mansour',
      location: 'Maadi, Cairo - Sector 4',
      status: 'ACTIVE',
      capacity: '11x11',
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
      utilization: 88,
      upcomingBookings: 14,
      surfaceType: 'Professional Turf',
      lighting: 'LED Floodlights',
      isFeatured: true,
      featureStartDate: '2023-10-24',
      featureEndDate: '2023-10-31',
      recentActivity: [
        {
          user: 'Ahmed Hassan',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
          dateTime: 'Tomorrow, 18:00',
          duration: '90 Mins',
          status: 'CONFIRMED',
          payment: '450 EGP'
        },
        {
          user: 'M. Ibrahim',
          avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=80',
          dateTime: 'Oct 24, 20:30',
          duration: '60 Mins',
          status: 'PENDING',
          payment: '300 EGP'
        }
      ]
    },
    {
      id: '#ST-44219',
      name: 'Al-Khalifa Arena',
      owner: 'Sara El-Din',
      location: 'New Cairo, Sector 1',
      status: 'ACTIVE',
      capacity: '5x5',
      image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80',
      utilization: 74,
      upcomingBookings: 8,
      surfaceType: 'Semi-Pro Grass',
      lighting: 'Standard Floodlights',
      isFeatured: false,
      recentActivity: [
        {
          user: 'Amr Diab',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
          dateTime: 'Today, 21:00',
          duration: '120 Mins',
          status: 'CONFIRMED',
          payment: '600 EGP'
        }
      ]
    },
    {
      id: '#ST-11200',
      name: 'The Blue Pitch',
      owner: 'Mohamed Zaki',
      location: 'Sheikh Zayed, Gate 3',
      status: 'MAINTENANCE',
      capacity: '7x7',
      image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80',
      utilization: 12,
      upcomingBookings: 2,
      surfaceType: 'Hybrid Turf Grid',
      lighting: 'Eco Halogen Rig',
      isFeatured: false,
      recentActivity: []
    },
    {
      id: '#ST-88542',
      name: 'Skyline Fields',
      owner: 'Hassan Ibrahim',
      location: 'Heliopolis, Square 4',
      status: 'UNDER REVIEW',
      capacity: '5x5',
      image: 'https://images.unsplash.com/photo-1518605333140-552e4b2d03a5?w=800&auto=format&fit=crop&q=80',
      utilization: 45,
      upcomingBookings: 5,
      surfaceType: 'High Density Fiber',
      lighting: 'LED Beam Array',
      isFeatured: false,
      recentActivity: [
        {
          user: 'Karim Eid',
          avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=80',
          dateTime: 'Oct 28, 19:00',
          duration: '90 Mins',
          status: 'CONFIRMED',
          payment: '500 EGP'
        }
      ]
    }
  ];

  // Router-free state signals
  currentView = signal<'list' | 'details'>('list');
  selectedStadiumId = signal<string | null>(null);

  // Directory listing state signals
  stadiums = signal<Stadium[]>(this.initialStadiums);
  searchQuery = signal<string>('');
  activeTab = signal<string>('All');
  currentPage = signal<number>(1);
  pageSize = 4;

  tabs = ['All', 'Active', 'Maintenance', 'Under Review'];
  showCreateModal = signal<boolean>(false);
  toastMessage = signal<string>('');

  // Promote Court Modal States
  showFeatureModal = signal<boolean>(false);
  featureStartDate: string = '2023-10-24';
  featureEndDate: string = '2023-10-31';

  // Form input model for creating stadium listings
  newStadium = {
    name: '',
    owner: '',
    area: '',
    sector: '',
    status: 'ACTIVE' as 'ACTIVE' | 'MAINTENANCE' | 'UNDER REVIEW',
    capacity: '11x11',
    utilization: 80,
    surfaceType: 'Professional Turf',
    lighting: 'LED Floodlights'
  };

  // Derive selected stadium metadata dynamically
  selectedStadium = computed(() => {
    const id = this.selectedStadiumId();
    if (!id) return null;
    return this.stadiums().find(item => item.id === id) || null;
  });

  // Filter list results
  filteredStadiums = computed(() => {
    let list = this.stadiums();
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      list = list.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.owner.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
      );
    }
    const statusFilter = this.activeTab();
    if (statusFilter !== 'All') {
      list = list.filter(item => item.status === statusFilter.toUpperCase());
    }
    return list;
  });

  // Pagination bounds
  paginatedStadiums = computed(() => {
    const list = this.filteredStadiums();
    const startIndex = (this.currentPage() - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return list.slice(startIndex, endIndex);
  });

  totalPages = computed(() => {
    const listLength = this.filteredStadiums().length;
    return Math.max(1, Math.ceil(listLength / this.pageSize));
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const pages = [];
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  });

  startItemIndex = computed(() => {
    if (this.filteredStadiums().length === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize + 1;
  });

  endItemIndex = computed(() => {
    const val = this.currentPage() * this.pageSize;
    const count = this.filteredStadiums().length;
    return val > count ? count : val;
  });

  constructor() {
    effect(() => {
      this.activeTab();
      this.searchQuery();
      this.currentPage.set(1);
    });
  }

  onSearchChange() {
    this.currentPage.set(1);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  getStatusClasses(status: string): string {
    const base = 'inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black tracking-wide uppercase ';
    if (status === 'ACTIVE') {
      return base + 'bg-[#CBFAD5] text-[#0E5C24]';
    } else if (status === 'MAINTENANCE') {
      return base + 'bg-[#FFE5D9] text-[#B33E00]';
    } else {
      return base + 'bg-[#E0E9FF] text-[#2A52BE]';
    }
  }

  // Navigate to full details page with selected stadium
  navigateToDetails(id: string) {
    this.selectedStadiumId.set(id);
    this.currentView.set('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navigateToList() {
    this.currentView.set('list');
    this.selectedStadiumId.set(null);
  }

  // Triggered when clicking the Feature switch
  toggleFeaturedState() {
    const currentId = this.selectedStadiumId();
    if (currentId) {
      const stadium = this.stadiums().find(item => item.id === currentId);
      if (stadium) {
        if (stadium.isFeatured) {
          // Immediately deactivate if currently active
          this.stadiums.update(items => {
            return items.map(item => {
              if (item.id === currentId) {
                return { ...item, isFeatured: false, featureStartDate: undefined, featureEndDate: undefined };
              }
              return item;
            });
          });
          this.showDemoToast('Featured Court deactivated');
        } else {
          // Otherwise, open the promotion dates configurations modal
          this.openFeatureModal(stadium);
        }
      }
    }
  }

  // Open the Promote Settings Modal
  openFeatureModal(stadium: Stadium) {
    this.featureStartDate = stadium.featureStartDate || '2023-10-24';
    this.featureEndDate = stadium.featureEndDate || '2023-10-31';
    this.showFeatureModal.set(true);
  }

  closeFeatureModal() {
    this.showFeatureModal.set(false);
  }

  closeFeatureModalOnOutsideClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    if (targetElement && targetElement.id === 'featureModalOverlay') {
      this.closeFeatureModal();
    }
  }

  // Action inside Promote Settings Modal: Confirm & Publish
  publishFeaturedStatus() {
    const currentId = this.selectedStadiumId();
    if (currentId) {
      this.stadiums.update(items => {
        return items.map(item => {
          if (item.id === currentId) {
            return {
              ...item,
              isFeatured: true,
              featureStartDate: this.featureStartDate,
              featureEndDate: this.featureEndDate
            };
          }
          return item;
        });
      });
      this.showDemoToast('Featured Court successfully published!');
    }
    this.closeFeatureModal();
  }

  // Create Listing Modal triggers
  openCreateModal() {
    this.newStadium = {
      name: '',
      owner: '',
      area: 'Maadi, Cairo',
      sector: 'Sector 4',
      status: 'ACTIVE',
      capacity: '11x11',
      utilization: 88,
      surfaceType: 'Professional Turf',
      lighting: 'LED Floodlights'
    };
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  submitCreateListing() {
    if (!this.newStadium.name || !this.newStadium.owner) {
      this.showDemoToast('Please provide a valid name and owner.');
      return;
    }

    const uniqueIdNum = Math.floor(10000 + Math.random() * 90000);
    const addedItem: Stadium = {
      id: `#ST-${uniqueIdNum}`,
      name: this.newStadium.name,
      owner: this.newStadium.owner,
      location: `${this.newStadium.area} - ${this.newStadium.sector}`,
      status: this.newStadium.status,
      capacity: this.newStadium.capacity,
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
      utilization: this.newStadium.utilization,
      upcomingBookings: 0,
      surfaceType: this.newStadium.surfaceType,
      lighting: this.newStadium.lighting,
      isFeatured: false,
      recentActivity: []
    };

    this.stadiums.update(current => [addedItem, ...current]);
    this.closeCreateModal();
    this.showDemoToast('Stadium listing successfully created!');
  }

  // Toast Helper
  showDemoToast(msg: string) {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 3000);
  }
}