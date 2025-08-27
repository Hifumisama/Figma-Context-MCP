import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, fromEvent, EMPTY } from 'rxjs';
import { throttleTime, map } from 'rxjs/operators';
import { NavigationItem } from '../models/portfolio.interfaces';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private sectionChangeSubject = new BehaviorSubject<string>('home');
  private headerOffset = 80;
  private isInitialized = false;

  private navigationItems: NavigationItem[] = [
    { id: 'home', label: 'Home', sectionId: 'home' },
    { id: 'about', label: 'About', sectionId: 'about' },
    { id: 'work', label: 'Work', sectionId: 'work' }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.initializeScrollListener();
  }

  private initializeScrollListener(): void {
    // Only initialize in browser environment
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      // Wait for next tick to ensure DOM is ready
      setTimeout(() => {
        fromEvent(window, 'scroll')
          .pipe(
            throttleTime(100),
            map(() => this.getCurrentSection())
          )
          .subscribe(section => {
            if (section) {
              this.sectionChangeSubject.next(section);
            }
          });
        this.isInitialized = true;
      }, 100);
    }
  }

  /**
   * Scroll to a specific section with smooth behavior
   */
  scrollToSection(sectionId: string): void {
    if (!isPlatformBrowser(this.platformId) || typeof window === 'undefined') {
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - this.headerOffset;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  }

  /**
   * Get the current section based on scroll position
   */
  getCurrentSection(): string {
    if (!isPlatformBrowser(this.platformId) || typeof window === 'undefined') {
      return 'home';
    }

    const sections = document.querySelectorAll('section[id]') as NodeListOf<HTMLElement>;
    const scrollPosition = window.pageYOffset + 200; // Offset for better detection

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (section.offsetTop <= scrollPosition) {
        return section.id;
      }
    }

    return sections.length > 0 ? sections[0].id : 'home';
  }

  /**
   * Observable for section changes
   */
  onSectionChange(): Observable<string> {
    return this.sectionChangeSubject.asObservable();
  }

  /**
   * Get navigation items
   */
  getNavigationItems(): NavigationItem[] {
    return this.navigationItems;
  }

  /**
   * Get current active section
   */
  getActiveSection(): string {
    return this.sectionChangeSubject.value;
  }
}
