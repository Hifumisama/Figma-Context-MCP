import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NavigationComponent } from './navigation/navigation.component';
import { SocialIconsComponent } from './social-icons/social-icons.component';
import { DecorativeElementsComponent } from './decorative-elements/decorative-elements.component';
import { SocialLink } from '../../models/portfolio.interfaces';

@Component({
  selector: 'app-header',
  imports: [
    NavigationComponent,
    SocialIconsComponent,
    DecorativeElementsComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() socialLinks: SocialLink[] = [];
  @Input() activeSection: string = 'home';
  @Output() navigationClick = new EventEmitter<string>();

  onNavigationClick(sectionId: string): void {
    this.navigationClick.emit(sectionId);
  }
}
