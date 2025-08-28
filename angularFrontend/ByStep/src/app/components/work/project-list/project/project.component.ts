import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../../../models/portfolio.interfaces';

@Component({
  selector: 'app-project',
  imports: [CommonModule],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss'
})
export class ProjectComponent {
  @Input() project?: Project;
  @Output() projectClick = new EventEmitter<Project>();

  onProjectClick(): void {
    if (this.project) {
      this.projectClick.emit(this.project);
    }
  }
}
