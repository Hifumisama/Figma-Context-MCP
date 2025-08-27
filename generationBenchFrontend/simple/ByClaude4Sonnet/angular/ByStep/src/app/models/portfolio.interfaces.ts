// Portfolio Interfaces and Models

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export interface HeroData {
  greeting: string;
  title: string;
  location: string;
  profileImage: string;
}

export interface TimelineItem {
  period: string;
  description: string;
}

export interface AboutData {
  description: string;
  timeline: TimelineItem[];
}

export interface Project {
  id: string;
  title: string;
  date: string;
  description: string;
  image: string;
  url?: string;
}

export interface WorkData {
  description: string;
  projects: Project[];
}

export interface ContactData {
  description: string;
  email: string;
  socialLinks: string[];
  image: string;
}

export interface PortfolioData {
  hero: HeroData;
  about: AboutData;
  work: WorkData;
  contact: ContactData;
  socialLinks: SocialLink[];
}

// Navigation related interfaces
export interface NavigationItem {
  id: string;
  label: string;
  sectionId: string;
}

// Event interfaces
export interface NavigationEvent {
  sectionId: string;
  label: string;
}

export interface ProjectClickEvent {
  project: Project;
  action: 'view' | 'click';
}

export interface SocialClickEvent {
  platform: string;
  url: string;
}

