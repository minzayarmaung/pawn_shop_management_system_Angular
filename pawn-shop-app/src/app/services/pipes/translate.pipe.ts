import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslationService } from '../TranslationService';

@Pipe({
  name: 'translate',
  pure: false, // Make it impure so it updates when language changes
  standalone: true
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private subscription?: Subscription;
  private cachedKey = '';
  private cachedTranslation = '';

  constructor(private translationService: TranslationService) {}

  transform(key: string, params?: { [key: string]: string | number }): string {
    if (!key) return '';

    // If key hasn't changed and we have a cached translation, return it
    if (key === this.cachedKey && this.cachedTranslation) {
      return this.applyParams(this.cachedTranslation, params);
    }

    // Subscribe to translation changes if not already subscribed
    if (!this.subscription) {
      this.subscription = this.translationService.translations$.subscribe(() => {
        this.cachedTranslation = '';
        this.cachedKey = '';
      });
    }

    // Get new translation
    this.cachedKey = key;
    this.cachedTranslation = this.translationService.getTranslation(key) || key;

    return this.applyParams(this.cachedTranslation, params);
  }

  private applyParams(translation: string, params?: { [key: string]: string | number }): string {
    if (!params) return translation;

    let result = translation;
    Object.keys(params).forEach(param => {
      result = result.replace(`{{${param}}}`, String(params[param]));
    });

    return result;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}