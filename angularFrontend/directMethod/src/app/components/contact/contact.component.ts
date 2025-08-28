import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  contactData = {
    title: 'contact.',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.',
    image: 'assets/images/contact-image.png',
    contactInfo: [
      {
        type: 'email',
        label: 'johndoe@mail.com',
        href: 'mailto:johndoe@mail.com'
      },
      {
        type: 'twitter',
        label: 'twitter.com/johndoe',
        href: 'https://twitter.com/johndoe'
      },
      {
        type: 'behance',
        label: 'behance.com/johndoe',
        href: 'https://behance.com/johndoe'
      }
    ]
  };
}
