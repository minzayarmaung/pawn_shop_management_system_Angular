import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '../../../services/pipes/translate.pipe';
import { TranslationService } from '../../../services/TranslationService';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  dropdownOpen = false;
  currentLanguage = 'en';
  private subscription?: Subscription;

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    // Subscribe to language changes
    this.subscription = this.translationService.currentLanguage$.subscribe(language => {
      this.currentLanguage = language;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  async changeLanguage(language: string): Promise<void> {
    await this.translationService.setLanguage(language);
    this.dropdownOpen = false;
  }

  getCurrentLanguageLabel(): string {
    return this.currentLanguage === 'en' ? 'English' : 'မြန်မာစာ';
  }

  getCurrentLanguageFlag(): string {
    return this.currentLanguage === 'en' 
      ? 'assets/images/language_icons/usa.png' 
      : 'assets/images/language_icons/myanmar.png';
  }
}