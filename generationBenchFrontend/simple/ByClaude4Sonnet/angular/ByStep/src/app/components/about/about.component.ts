import { Component, Input } from '@angular/core';
import { TimelineComponent } from './timeline/timeline.component';
import { AboutData } from '../../models/portfolio.interfaces';

@Component({
  selector: 'app-about',
  imports: [
    TimelineComponent
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  @Input() aboutData?: AboutData;
}
