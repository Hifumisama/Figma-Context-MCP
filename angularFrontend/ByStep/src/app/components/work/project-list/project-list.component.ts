import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectComponent } from './project/project.component';
import { Project } from '../../../models/portfolio.interfaces';

@Component({
  selector: 'app-project-list',
  imports: [
    CommonModule,
    ProjectComponent
  ],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss'
})
export class ProjectListComponent {
  @Input() projects: Project[] = [];
  @Output() projectClick = new EventEmitter<Project>();

  onProjectClick(project: Project): void {
    this.projectClick.emit(project);
  }
}
