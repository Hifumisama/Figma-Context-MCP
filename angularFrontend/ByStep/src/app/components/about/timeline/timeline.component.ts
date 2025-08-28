import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineItemComponent } from './timeline-item/timeline-item.component';
import { TimelineItem } from '../../../models/portfolio.interfaces';

@Component({
  selector: 'app-timeline',
  imports: [
    CommonModule,
    TimelineItemComponent
  ],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss'
})
export class TimelineComponent {
  @Input() timelineItems: TimelineItem[] = [];
}
