import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ProjectListComponent } from './project-list/project-list.component';
import { WorkData, Project } from '../../models/portfolio.interfaces';

@Component({
  selector: 'app-work',
  imports: [
    ProjectListComponent
  ],
  templateUrl: './work.component.html',
  styleUrl: './work.component.scss'
})
export class WorkComponent {
  @Input() workData?: WorkData;
  @Output() projectClick = new EventEmitter<Project>();

  onProjectClick(project: Project): void {
    this.projectClick.emit(project);
  }
}
