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
import { ReportListComponent } from './features/report-list/report-list.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard],
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
        path: 'report-list',
        component: ReportListComponent,
      },
      { 
        path: 'configuration', 
        component: ConfigurationComponent 
      },
      { 
        path: 'profile', 
        component: ProfileComponent 
      },
    ]
  },
  
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard] 
  },
  {
    path: 'signup',
    component: SignupComponent,
    canActivate: [guestGuard] 
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [guestGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];