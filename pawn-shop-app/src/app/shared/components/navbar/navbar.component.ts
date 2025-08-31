import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '../../../services/pipes/translate.pipe';
import { TranslationService } from '../../../services/TranslationService';
import { RouterEvent, RouterLinkActive, RouterLink } from "@angular/router";
import { Router } from 'express';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isProfileDropdownOpen = false;
  isLanguageDropdownOpen = false;
  isMobileMenuOpen = false;
  currentLanguage = 'en';
  private subscription?: Subscription;
  // private router = inject(Router);
  username: string | null = null;


  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.subscription = this.translationService.currentLanguage$.subscribe(language => {
      this.currentLanguage = language;
    });

    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.username = user.name || user.username || null;
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    console.log('Mobile menu toggled:', this.isMobileMenuOpen);
    this.isProfileDropdownOpen = false;
    this.isLanguageDropdownOpen = false;
  }

  toggleProfileDropdown(): void {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
    this.isLanguageDropdownOpen = false;
  }

  toggleLanguageDropdown(): void {
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
    this.isProfileDropdownOpen = false;
  }

  async changeLanguage(language: string): Promise<void> {
    await this.translationService.setLanguage(language);
    this.isLanguageDropdownOpen = false;
  }

  logout() {
    localStorage.removeItem('user')
    console.log("Logging out...");
  }
}