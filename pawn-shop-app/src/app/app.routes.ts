import { Routes } from '@angular/router';
import { HomeComponent } from './shared/components/home/home.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PawnItemsComponent } from './features/pawn-items/pawn-items.component';
import { ConfigurationComponent } from './features/configuration/configuration.component';
import { ProfileComponent } from './shared/components/profile/profile.component';
import { LoginComponent } from './shared/components/login/login.component';
import { SignupComponent } from './shared/components/sign-up/sign-up.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'pawn-items', component: PawnItemsComponent },
      { path: 'configuration', component: ConfigurationComponent },
      { path: 'profile' , component : ProfileComponent }
    ]
  } ,
  {
    path:'login',
    component:LoginComponent
  } ,
  {
    path:'signup',
    component: SignupComponent
  }
];

