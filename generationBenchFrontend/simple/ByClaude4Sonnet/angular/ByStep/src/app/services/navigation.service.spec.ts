import { TestBed } from '@angular/core/testing';
import { NavigationService } from './navigation.service';

describe('NavigationService', () => {
  let service: NavigationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should scroll to section with correct offset', () => {
    // Mock window.scrollTo
    spyOn(window, 'scrollTo');
    
    // Mock element
    const mockElement = {
      offsetTop: 500
    } as HTMLElement;
    
    spyOn(document, 'getElementById').and.returnValue(mockElement);
    
    service.scrollToSection('about');
    
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 420, // 500 - 80 (header offset)
      behavior: 'smooth'
    });
  });

  it('should handle non-existent section gracefully', () => {
    spyOn(window, 'scrollTo');
    spyOn(document, 'getElementById').and.returnValue(null);
    
    service.scrollToSection('non-existent');
    
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('should get current section based on scroll position', () => {
    // Mock sections
    const mockSections = [
      { id: 'home', offsetTop: 0, clientHeight: 500 },
      { id: 'about', offsetTop: 500, clientHeight: 400 },
      { id: 'work', offsetTop: 900, clientHeight: 600 }
    ];

    spyOn(document, 'querySelectorAll').and.returnValue(mockSections as any);
    
    // Mock window.pageYOffset
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 600
    });
    
    const currentSection = service.getCurrentSection();
    
    expect(currentSection).toBe('about');
  });

  it('should return empty string when no sections found', () => {
    spyOn(document, 'querySelectorAll').and.returnValue([] as any);
    
    const currentSection = service.getCurrentSection();
    
    expect(currentSection).toBe('');
  });

  it('should emit section change events', (done) => {
    service.onSectionChange().subscribe(section => {
      expect(section).toBe('test-section');
      done();
    });
    
    // Simulate section change
    service['sectionChangeSubject'].next('test-section');
  });

  it('should update current section when scroll position changes', () => {
    spyOn(service, 'getCurrentSection').and.returnValue('work');
    
    // Simulate scroll event
    const scrollEvent = new Event('scroll');
    window.dispatchEvent(scrollEvent);
    
    expect(service.getCurrentSection).toHaveBeenCalled();
  });

  it('should provide navigation items', () => {
    const navItems = service.getNavigationItems();
    
    expect(navItems).toEqual([
      { id: 'home', label: 'Home', sectionId: 'home' },
      { id: 'about', label: 'About', sectionId: 'about' },
      { id: 'work', label: 'Work', sectionId: 'work' }
    ]);
  });

  it('should calculate correct offset for header', () => {
    const mockElement = {
      offsetTop: 1000
    } as HTMLElement;
    
    spyOn(document, 'getElementById').and.returnValue(mockElement);
    spyOn(window, 'scrollTo');
    
    service.scrollToSection('contact');
    
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 920, // 1000 - 80
      behavior: 'smooth'
    });
  });

  it('should handle scroll events and update current section', () => {
    const mockSections = [
      { id: 'home', offsetTop: 0, clientHeight: 800 }
    ];
    
    spyOn(document, 'querySelectorAll').and.returnValue(mockSections as any);
    spyOn(service['sectionChangeSubject'], 'next');
    
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 100
    });
    
    const scrollEvent = new Event('scroll');
    window.dispatchEvent(scrollEvent);
    
    expect(service['sectionChangeSubject'].next).toHaveBeenCalledWith('home');
  });
});

