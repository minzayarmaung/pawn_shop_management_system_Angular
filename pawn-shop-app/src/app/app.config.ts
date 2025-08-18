import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http'; // ✅ import this
import { HttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { TranslationService } from './services/TranslationService';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    //provideClientHydration(),
    provideHttpClient() ,// ✅ make HttpClient available globally
    TranslationService ,
    provideAnimations(),
    BrowserAnimationsModule
  ]
};
