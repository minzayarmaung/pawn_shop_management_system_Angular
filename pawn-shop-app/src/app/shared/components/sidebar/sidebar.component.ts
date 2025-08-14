import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Subscription } from 'rxjs';
import { TranslationService } from '../../../services/TranslationService';
import { TranslatePipe } from '../../../services/pipes/translate.pipe';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    // Subscribe to language changes to trigger UI updates
    this.subscription = this.translationService.currentLanguage$.subscribe(language => {
      console.log('Language changed to:', language);
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}