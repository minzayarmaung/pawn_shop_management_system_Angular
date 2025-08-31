import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { authInterceptor } from './services/auth/auth.interceptor';

import { routes } from './app.routes';
import { TranslationService } from './services/TranslationService';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { SidebarService } from './services/SidebarService';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    SidebarService,
    //provideClientHydration(),
    provideHttpClient(
       withInterceptors([authInterceptor])
    ) ,
    TranslationService ,
    provideAnimations(),
    BrowserAnimationsModule
  ]
};
