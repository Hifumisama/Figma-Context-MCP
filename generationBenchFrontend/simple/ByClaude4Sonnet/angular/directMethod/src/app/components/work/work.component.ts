import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-work',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './work.component.html',
  styleUrls: ['./work.component.scss']
})
export class WorkComponent {
  workData = {
    title: 'work.',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.',
    projects: [
      {
        id: 1,
        title: 'Some Case Study',
        date: 'November 24, 2019',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed aliquam sollicitudin rhoncus morbi. Tincidunt quam sem elit a convallis. Eget ipsum, velit vitae eu nunc, consequat, at.',
        image: 'assets/images/project1.png',
        link: '#'
      },
      {
        id: 2,
        title: 'Some Case Study',
        date: 'November 24, 2019',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed aliquam sollicitudin rhoncus morbi. Tincidunt quam sem elit a convallis. Eget ipsum, velit vitae eu nunc, consequat, at.',
        image: 'assets/images/project2.png',
        link: '#'
      }
    ]
  };
}
