import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Translation {
  [key: string]: string | Translation;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguageSubject = new BehaviorSubject<string>('en');
  private translationsSubject = new BehaviorSubject<Translation>({});

  public currentLanguage$ = this.currentLanguageSubject.asObservable();
  public translations$ = this.translationsSubject.asObservable();

  private translations: { [key: string]: Translation } = {};
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Only access localStorage in browser environment
    const savedLanguage = this.isBrowser 
      ? localStorage.getItem('selectedLanguage') || 'en'
      : 'en';
    
    // Don't call setLanguage in constructor to avoid SSR issues
    this.currentLanguageSubject.next(savedLanguage);
  }

  // Initialize method to be called after component initialization
  async initialize(): Promise<void> {
    const currentLanguage = this.currentLanguageSubject.value;
    await this.setLanguage(currentLanguage);
  }

  async setLanguage(language: string): Promise<void> {
    try {
      // Check if translations are already loaded
      if (!this.translations[language]) {
        const translations = await this.loadTranslations(language);
        this.translations[language] = translations;
      }

      this.currentLanguageSubject.next(language);
      this.translationsSubject.next(this.translations[language]);
      
      // Save language preference only in browser
      if (this.isBrowser) {
        localStorage.setItem('selectedLanguage', language);
      }
    } catch (error) {
      console.error(`Failed to load translations for ${language}:`, error);
      // Fallback to English if loading fails
      if (language !== 'en') {
        await this.setLanguage('en');
      }
    }
  }

  private async loadTranslations(language: string): Promise<Translation> {
    try {
      const translations = await firstValueFrom(
        this.http.get<Translation>(`assets/i18n/${language}.json`)
      );
      return translations || {};
    } catch (error) {
      console.error(`Failed to load translations for ${language}:`, error);
      return {};
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  getTranslation(key: string): string {
    const translations = this.translationsSubject.value;
    return this.getNestedTranslation(translations, key) || key;
  }

  private getNestedTranslation(translations: Translation, key: string): string {
    const keys = key.split('.');
    let result: any = translations;

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return '';
      }
    }

    return typeof result === 'string' ? result : '';
  }

  // Method to get translation with parameters
  getTranslationWithParams(key: string, params: { [key: string]: string | number }): string {
    let translation = this.getTranslation(key);
    
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{{${param}}}`, String(params[param]));
    });

    return translation;
  }
}