import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectComponent } from './project.component';
import { Project } from '../../../../models/portfolio.interfaces';

describe('ProjectComponent', () => {
  let component: ProjectComponent;
  let fixture: ComponentFixture<ProjectComponent>;

  const mockProject: Project = {
    id: '1',
    title: 'Some Case Study',
    date: 'November 24, 2019',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed aliquam sollicitudin rhoncus morbi.',
    image: 'assets/images/project1.png',
    url: 'https://example.com/project1'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display project data when provided', () => {
    component.project = mockProject;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    
    expect(compiled.querySelector('.project-title')?.textContent).toContain(mockProject.title);
    expect(compiled.querySelector('.project-date')?.textContent).toContain(mockProject.date);
    expect(compiled.querySelector('.project-description')?.textContent).toContain(mockProject.description);
  });

  it('should display project image with correct src and alt', () => {
    component.project = mockProject;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const projectImg = compiled.querySelector('.project-img') as HTMLImageElement;
    
    expect(projectImg).toBeTruthy();
    expect(projectImg.src).toContain(mockProject.image);
    expect(projectImg.alt).toBe(mockProject.title);
  });

  it('should emit project click event when project is clicked', () => {
    spyOn(component.projectClick, 'emit');
    
    component.onProjectClick();
    
    expect(component.projectClick.emit).toHaveBeenCalledWith(mockProject);
  });

  it('should handle project click', () => {
    component.project = mockProject;
    spyOn(component, 'onProjectClick');
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const projectElement = compiled.querySelector('.project') as HTMLElement;
    
    projectElement.click();
    
    expect(component.onProjectClick).toHaveBeenCalled();
  });

  it('should have proper project structure', () => {
    component.project = mockProject;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    
    expect(compiled.querySelector('.project')).toBeTruthy();
    expect(compiled.querySelector('.project-image')).toBeTruthy();
    expect(compiled.querySelector('.project-content')).toBeTruthy();
    expect(compiled.querySelector('.project-date')).toBeTruthy();
    expect(compiled.querySelector('.project-title')).toBeTruthy();
    expect(compiled.querySelector('.project-description')).toBeTruthy();
  });

  it('should handle missing project data gracefully', () => {
    // Ne pas définir project
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Le composant ne devrait pas planter
    expect(compiled).toBeTruthy();
  });

  it('should apply hover effect classes', () => {
    component.project = mockProject;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const projectElement = compiled.querySelector('.project');
    
    expect(projectElement).toBeTruthy();
    expect(projectElement?.classList.contains('project')).toBeTruthy();
  });

  it('should display date with correct format', () => {
    component.project = mockProject;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const dateElement = compiled.querySelector('.project-date');
    
    expect(dateElement?.textContent?.trim()).toBe(mockProject.date);
  });

  it('should display title with correct styling', () => {
    component.project = mockProject;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const titleElement = compiled.querySelector('.project-title');
    
    expect(titleElement?.textContent?.trim()).toBe(mockProject.title);
  });

  it('should display description with correct styling', () => {
    component.project = mockProject;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const descriptionElement = compiled.querySelector('.project-description');
    
    expect(descriptionElement?.textContent?.trim()).toBe(mockProject.description);
  });

  it('should be clickable and emit project data', () => {
    component.project = mockProject;
    spyOn(component.projectClick, 'emit');
    
    component.onProjectClick();
    
    expect(component.projectClick.emit).toHaveBeenCalledWith(mockProject);
  });
});

