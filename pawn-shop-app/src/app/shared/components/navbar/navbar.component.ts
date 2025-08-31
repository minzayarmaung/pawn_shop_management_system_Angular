import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '../../../services/pipes/translate.pipe';
import { TranslationService } from '../../../services/TranslationService';
import { RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isProfileDropdownOpen = false;
  isLanguageDropdownOpen = false;
  isMobileMenuOpen = false;
  currentLanguage = 'en';
  private subscription?: Subscription;

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.subscription = this.translationService.currentLanguage$.subscribe(language => {
      this.currentLanguage = language;
    });
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
    console.log("Logging out...");
  }
}