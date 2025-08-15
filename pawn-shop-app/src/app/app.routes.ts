import { Routes } from '@angular/router';
import { HomeComponent } from './shared/components/home/home.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PawnItemsComponent } from './features/pawn-items/pawn-items.component';
import { ConfigurationComponent } from './features/configuration/configuration.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'pawn-items', component: PawnItemsComponent },
      { path: 'configuration', component: ConfigurationComponent },
    ]
  }
];

