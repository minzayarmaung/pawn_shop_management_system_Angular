import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule , FormsModule ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  currentLanguage: string;
  dropdownOpen = false;

  changeLanguage(arg0: string) {
  throw new Error('Method not implemented.');
  }

  constructor() {
    this.currentLanguage = 'en';
  }

  ngOnInit(): void {
  }

  toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
  }

}