import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-login-navbar',
  imports: [],
  templateUrl: './login-navbar.component.html',
  styleUrl: './login-navbar.component.scss'
})
export class LoginNavbarComponent implements OnInit {
  isDarkMode: boolean = false;
  private readonly platformId = inject(PLATFORM_ID);
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
}
