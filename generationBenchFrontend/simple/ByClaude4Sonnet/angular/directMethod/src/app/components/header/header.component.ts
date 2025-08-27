import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  navigationItems = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Work', href: '#work' }
  ];

  socialLinks = [
    { 
      name: 'Medium', 
      href: '#', 
      icon: 'images/medium-icon.svg' 
    },
    { 
      name: 'Behance', 
      href: '#', 
      icon: 'images/behance-icon.svg' 
    },
    { 
      name: 'Twitter', 
      href: '#', 
      icon: 'images/twitter-icon.svg' 
    }
  ];
}
