import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule , RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  isMobileMenuOpen = signal<boolean>(false);

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
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