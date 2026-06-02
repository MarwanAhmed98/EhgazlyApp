import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  isMobileMenuOpen = signal<boolean>(false);
  isDarkMode: boolean = false;
  private readonly platformId = inject(PLATFORM_ID);
  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
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
  venues = [
    {
      name: 'The Kinetic Park',
      location: 'Maadi, Cairo',
      price: '450 EGP',
      rating: 4.9,
      // Fixed: Using a guaranteed valid and high-quality football field image ID from Unsplash
      image: 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?auto=format&fit=crop&q=80&w=800',
      tags: ['Indoor', 'Shower', 'Cafe'],
      popular: true
    },
    {
      name: 'Premier Football Hub',
      location: 'Tagamoa, Cairo',
      price: '380 EGP',
      rating: 4.7,
      // Fixed: Using a solid stadium/pitch image ID
      image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&q=80&w=800',
      tags: ['Outdoor', 'Pro Equipment'],
      popular: false
    },
    {
      name: 'Elite Stadium 5',
      location: 'Sheikh Zayed',
      price: '550 EGP',
      rating: 5.0,
      // Fixed: Using another working high-quality stadium image ID
      image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
      tags: ['FIFA Approved', 'Locker Rooms'],
      popular: true
    }
  ];
}