import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../../services/TranslationService';
import { TranslatePipe } from '../../../services/pipes/translate.pipe';
import { SidebarService } from '../../../services/SidebarService';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;
  private sidebarSubscription?: Subscription;
  isMobileMenuOpen = false;

  constructor(
    private translationService: TranslationService,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    // Subscribe to language changes to trigger UI updates
    this.subscription = this.translationService.currentLanguage$.subscribe(language => {
      console.log('Language changed to:', language);
    });

    // Subscribe to sidebar state changes
    this.sidebarSubscription = this.sidebarService.isMobileMenuOpen$.subscribe((isOpen: boolean) => {
      this.isMobileMenuOpen = isOpen;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.sidebarSubscription) {
      this.sidebarSubscription.unsubscribe();
    }
  }

  closeMobileMenu(): void {
    this.sidebarService.closeMobileMenu();
  }

  onNavLinkClick(): void {
    // Close mobile menu when a navigation link is clicked
    this.sidebarService.closeMobileMenu();
  }
}