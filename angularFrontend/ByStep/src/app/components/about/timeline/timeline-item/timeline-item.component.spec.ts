import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimelineItemComponent } from './timeline-item.component';
import { TimelineItem } from '../../../../models/portfolio.interfaces';

describe('TimelineItemComponent', () => {
  let component: TimelineItemComponent;
  let fixture: ComponentFixture<TimelineItemComponent>;

  const mockTimelineItem: TimelineItem = {
    period: '2020 - Present',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis.'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimelineItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimelineItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display timeline item data when provided', () => {
    component.timelineItem = mockTimelineItem;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    
    expect(compiled.querySelector('.timeline-period')?.textContent).toContain(mockTimelineItem.period);
    expect(compiled.querySelector('.timeline-description')?.textContent).toContain(mockTimelineItem.description);
  });

  it('should render timeline dot', () => {
    component.timelineItem = mockTimelineItem;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const timelineDot = compiled.querySelector('.timeline-dot');
    
    expect(timelineDot).toBeTruthy();
  });

  it('should have proper timeline item structure', () => {
    component.timelineItem = mockTimelineItem;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    
    expect(compiled.querySelector('.timeline-item')).toBeTruthy();
    expect(compiled.querySelector('.timeline-dot')).toBeTruthy();
    expect(compiled.querySelector('.timeline-content')).toBeTruthy();
    expect(compiled.querySelector('.timeline-period')).toBeTruthy();
    expect(compiled.querySelector('.timeline-description')).toBeTruthy();
  });

  it('should handle missing timeline item data gracefully', () => {
    // Ne pas définir timelineItem
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Le composant ne devrait pas planter
    expect(compiled).toBeTruthy();
  });

  it('should apply correct CSS classes for styling', () => {
    component.timelineItem = mockTimelineItem;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const timelineItem = compiled.querySelector('.timeline-item');
    
    expect(timelineItem).toBeTruthy();
    expect(timelineItem?.classList.contains('timeline-item')).toBeTruthy();
  });

  it('should display period with correct styling', () => {
    component.timelineItem = mockTimelineItem;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const period = compiled.querySelector('.timeline-period');
    
    expect(period).toBeTruthy();
    expect(period?.textContent?.trim()).toBe(mockTimelineItem.period);
  });

  it('should display description with correct styling', () => {
    component.timelineItem = mockTimelineItem;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const description = compiled.querySelector('.timeline-description');
    
    expect(description).toBeTruthy();
    expect(description?.textContent?.trim()).toBe(mockTimelineItem.description);
  });
});


