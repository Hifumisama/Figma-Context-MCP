import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navigation',
  imports: [CommonModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {
  @Input() activeSection: string = 'home';
  @Output() sectionClick = new EventEmitter<string>();

  navigationItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'work', label: 'Work' }
  ];

  onSectionClick(sectionId: string, event: Event): void {
    event.preventDefault();
    this.sectionClick.emit(sectionId);
  }
}
