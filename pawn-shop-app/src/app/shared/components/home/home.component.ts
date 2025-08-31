// home.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { NavbarComponent } from "../navbar/navbar.component";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SidebarComponent, NavbarComponent, RouterOutlet],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  isMobileMenuOpen = false;

  onMobileMenuToggle(isOpen: boolean): void {
    this.isMobileMenuOpen = isOpen;
    console.log('Home component received mobile menu toggle:', isOpen);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
}