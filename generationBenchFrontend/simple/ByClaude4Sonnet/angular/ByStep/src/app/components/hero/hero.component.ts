import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroData } from '../../models/portfolio.interfaces';

@Component({
  selector: 'app-hero',
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  @Input() heroData?: HeroData;
  @Output() resumeClick = new EventEmitter<void>();

  onResumeClick(): void {
    this.resumeClick.emit();
  }
}
