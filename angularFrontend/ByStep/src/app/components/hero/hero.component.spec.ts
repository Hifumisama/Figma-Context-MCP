import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroComponent } from './hero.component';
import { HeroData } from '../../models/portfolio.interfaces';

describe('HeroComponent', () => {
  let component: HeroComponent;
  let fixture: ComponentFixture<HeroComponent>;

  const mockHeroData: HeroData = {
    greeting: 'Hello, I\'m John,',
    title: 'Product Designer',
    location: 'based in Netherland.',
    profileImage: 'assets/images/profile-image.png'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeroComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeroComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display hero data when provided', () => {
    component.heroData = mockHeroData;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    
    expect(compiled.querySelector('.hero-greeting')?.textContent).toContain(mockHeroData.greeting);
    expect(compiled.querySelector('.hero-title')?.textContent).toContain(mockHeroData.title);
    expect(compiled.querySelector('.hero-location')?.textContent).toContain(mockHeroData.location);
  });

  it('should display profile image with correct src and alt', () => {
    component.heroData = mockHeroData;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const profileImg = compiled.querySelector('.profile-img') as HTMLImageElement;
    
    expect(profileImg).toBeTruthy();
    expect(profileImg.src).toContain(mockHeroData.profileImage);
    expect(profileImg.alt).toBe('John Doe Profile');
  });

  it('should render resume button', () => {
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const resumeBtn = compiled.querySelector('.resume-btn');
    
    expect(resumeBtn).toBeTruthy();
    expect(resumeBtn?.textContent?.trim()).toBe('Resume');
  });

  it('should emit resume click event when button is clicked', () => {
    spyOn(component.resumeClick, 'emit');
    
    component.onResumeClick();
    
    expect(component.resumeClick.emit).toHaveBeenCalled();
  });

  it('should handle resume button click', () => {
    spyOn(component, 'onResumeClick');
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const resumeBtn = compiled.querySelector('.resume-btn') as HTMLElement;
    
    resumeBtn.click();
    
    expect(component.onResumeClick).toHaveBeenCalled();
  });

  it('should have proper hero section structure', () => {
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    
    expect(compiled.querySelector('.hero')).toBeTruthy();
    expect(compiled.querySelector('.hero-content')).toBeTruthy();
    expect(compiled.querySelector('.hero-text')).toBeTruthy();
    expect(compiled.querySelector('.hero-image')).toBeTruthy();
  });

  it('should handle missing hero data gracefully', () => {
    // Ne pas définir heroData
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Le composant ne devrait pas planter
    expect(compiled).toBeTruthy();
  });

  it('should apply correct CSS classes', () => {
    component.heroData = mockHeroData;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    
    expect(compiled.querySelector('.hero-greeting')).toBeTruthy();
    expect(compiled.querySelector('.hero-title')).toBeTruthy();
    expect(compiled.querySelector('.hero-location')).toBeTruthy();
    expect(compiled.querySelector('.profile-img')).toBeTruthy();
    expect(compiled.querySelector('.resume-btn')).toBeTruthy();
  });
});


