import { Routes } from '@angular/router';
import { HomeComponent } from './shared/components/home/home.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PawnItemsComponent } from './features/pawn-items/pawn-items.component';
import { ConfigurationComponent } from './features/configuration/configuration.component';
import { ProfileComponent } from './shared/components/profile/profile.component';
import { LoginComponent } from './shared/components/login/login.component';
import { SignupComponent } from './shared/components/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './shared/components/forgot-password/forgot-password.component';
import { authGuard, guestGuard } from './services/auth/auth.guard';

export const routes: Routes = [
  // Default redirect to dashboard
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  
  // Protected routes - require authentication
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard], // Protect the entire home layout
    children: [
      { 
        path: 'dashboard', 
        component: DashboardComponent 
      },
      { 
        path: 'pawn-items', 
        component: PawnItemsComponent 
      },
      { 
        path: 'configuration', 
        component: ConfigurationComponent 
      },
      { 
        path: 'profile', 
        component: ProfileComponent 
      }
    ]
  },
  
  // Public routes - redirect if already authenticated
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard] // Redirect to dashboard if already logged in
  },
  {
    path: 'signup',
    component: SignupComponent,
    canActivate: [guestGuard] // Redirect to dashboard if already logged in
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [guestGuard] // Redirect to dashboard if already logged in
  },
  
  // Catch-all route - redirect to dashboard
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];