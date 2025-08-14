import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TranslationService } from './services/TranslationService';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ToastContainerComponent } from "./shared/commons/toast-container/toast-container.component";

// Import your components
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    ToastContainerComponent
],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'your-app-name';

  constructor(private translationService: TranslationService) {}

  async ngOnInit(): Promise<void> {
    // Initialize translation service properly
    await this.translationService.initialize();
  }
}