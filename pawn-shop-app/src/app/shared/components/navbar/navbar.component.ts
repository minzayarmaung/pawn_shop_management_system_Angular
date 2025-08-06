// components/layout/navbar/navbar.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Input() user: User | null = null;
  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() searchQuery = new EventEmitter<string>();

  showUserMenu = false;
  showNotifications = false;

  onSidebarToggle(): void {
    this.sidebarToggle.emit();
  }

  onSearch(query: string): void {
    if (query.trim()) {
      this.searchQuery.emit(query.trim());
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
  }

  onLogout(): void {
    // Implement logout logic
    console.log('Logout clicked');
  }

  onProfile(): void {
    // Implement profile navigation
    console.log('Profile clicked');
  }

  onSettings(): void {
    // Implement settings navigation
    console.log('Settings clicked');
  }
}