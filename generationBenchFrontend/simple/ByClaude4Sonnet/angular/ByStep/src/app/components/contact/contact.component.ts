import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactData } from '../../models/portfolio.interfaces';

@Component({
  selector: 'app-contact',
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  @Input() contactData?: ContactData;
  @Output() emailClick = new EventEmitter<string>();
  @Output() socialClick = new EventEmitter<string>();

  onEmailClick(): void {
    if (this.contactData?.email) {
      this.emailClick.emit(this.contactData.email);
    }
  }

  onSocialClick(social: string): void {
    this.socialClick.emit(social);
  }
}
