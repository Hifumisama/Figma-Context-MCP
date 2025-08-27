import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialLink } from '../../../models/portfolio.interfaces';

@Component({
  selector: 'app-social-icons',
  imports: [CommonModule],
  templateUrl: './social-icons.component.html',
  styleUrl: './social-icons.component.scss'
})
export class SocialIconsComponent {
  @Input() socialLinks: SocialLink[] = [];

  onSocialClick(link: SocialLink): void {
    window.open(link.url, '_blank');
  }
}
