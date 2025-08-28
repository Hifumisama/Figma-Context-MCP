import { Component, Input } from '@angular/core';
import { TimelineItem } from '../../../../models/portfolio.interfaces';

@Component({
  selector: 'app-timeline-item',
  imports: [],
  templateUrl: './timeline-item.component.html',
  styleUrl: './timeline-item.component.scss'
})
export class TimelineItemComponent {
  @Input() timelineItem?: TimelineItem;
}
