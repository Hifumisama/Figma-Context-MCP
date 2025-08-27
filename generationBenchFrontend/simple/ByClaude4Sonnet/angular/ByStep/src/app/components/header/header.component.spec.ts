import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { NavigationComponent } from './navigation/navigation.component';
import { SocialIconsComponent } from './social-icons/social-icons.component';
import { DecorativeElementsComponent } from './decorative-elements/decorative-elements.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ 
        HeaderComponent,
        NavigationComponent,
        SocialIconsComponent,
        DecorativeElementsComponent
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render logo with "John Doe" text', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const logo = compiled.querySelector('.logo h1');
    expect(logo?.textContent).toContain('John Doe');
  });

  it('should have fixed header class', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const header = compiled.querySelector('.header');
    expect(header).toBeTruthy();
  });

  it('should contain navigation component', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const navigation = compiled.querySelector('app-navigation');
    expect(navigation).toBeTruthy();
  });

  it('should contain social icons component', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const socialIcons = compiled.querySelector('app-social-icons');
    expect(socialIcons).toBeTruthy();
  });

  it('should contain decorative elements component', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const decorativeElements = compiled.querySelector('app-decorative-elements');
    expect(decorativeElements).toBeTruthy();
  });

  it('should emit navigation click event', () => {
    spyOn(component.navigationClick, 'emit');
    
    component.onNavigationClick('about');
    
    expect(component.navigationClick.emit).toHaveBeenCalledWith('about');
  });
});

