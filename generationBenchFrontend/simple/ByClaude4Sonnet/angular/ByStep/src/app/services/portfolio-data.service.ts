import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { 
  HeroData, 
  AboutData, 
  WorkData, 
  ContactData, 
  SocialLink, 
  PortfolioData,
  TimelineItem,
  Project
} from '../models/portfolio.interfaces';

@Injectable({
  providedIn: 'root'
})
export class PortfolioDataService {

  constructor() { }

  /**
   * Get hero section data
   */
  getHeroData(): Observable<HeroData> {
    const heroData: HeroData = {
      greeting: 'Hello, I\'m John,',
      title: 'Product Designer',
      location: 'based in Netherland.',
      profileImage: '/assets/images/profile-image.png'
    };

    return of(heroData);
  }

  /**
   * Get about section data including timeline
   */
  getAboutData(): Observable<AboutData> {
    const timeline: TimelineItem[] = [
      {
        period: '2014-2018',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.'
      },
      {
        period: '2018-2020',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.'
      },
      {
        period: '2020 - Present',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.'
      }
    ];

    const aboutData: AboutData = {
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.',
      timeline: timeline
    };

    return of(aboutData);
  }

  /**
   * Get work section data including projects
   */
  getWorkData(): Observable<WorkData> {
    const projects: Project[] = [
      {
        id: '1',
        title: 'Some Case Study',
        date: 'November 24, 2019',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed aliquam sollicitudin rhoncus morbi. Tincidunt quam sem elit a convallis. Eget ipsum, velit vitae eu nunc, consequat, at.',
        image: '/assets/images/project1.png',
        url: '#'
      },
      {
        id: '2',
        title: 'Some Case Study',
        date: 'November 24, 2019',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed aliquam sollicitudin rhoncus morbi. Tincidunt quam sem elit a convallis. Eget ipsum, velit vitae eu nunc, consequat, at.',
        image: '/assets/images/project2.png',
        url: '#'
      }
    ];

    const workData: WorkData = {
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.',
      projects: projects
    };

    return of(workData);
  }

  /**
   * Get contact section data
   */
  getContactData(): Observable<ContactData> {
    const contactData: ContactData = {
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.',
      email: 'johndoe@mail.com',
      socialLinks: [
        'twitter.com/johndoe',
        'behance.com/johndoe'
      ],
      image: '/assets/images/contact-image.png'
    };

    return of(contactData);
  }

  /**
   * Get social links data
   */
  getSocialLinks(): Observable<SocialLink[]> {
    const socialLinks: SocialLink[] = [
      {
        name: 'medium',
        url: 'https://medium.com/@johndoe',
        icon: '/assets/images/medium-icon.svg'
      },
      {
        name: 'behance',
        url: 'https://behance.net/johndoe',
        icon: '/assets/images/behance-icon.svg'
      },
      {
        name: 'twitter',
        url: 'https://twitter.com/johndoe',
        icon: '/assets/images/twitter-icon.svg'
      }
    ];

    return of(socialLinks);
  }

  /**
   * Get complete portfolio data
   */
  getPortfolioData(): Observable<PortfolioData> {
    // For simplicity, we'll combine all data here
    // In a real app, you might want to use forkJoin or combineLatest
    const heroData: HeroData = {
      greeting: 'Hello, I\'m John,',
      title: 'Product Designer',
      location: 'based in Netherland.',
      profileImage: '/assets/images/profile-image.png'
    };

    const timeline: TimelineItem[] = [
      {
        period: '2014-2018',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.'
      },
      {
        period: '2018-2020',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.'
      },
      {
        period: '2020 - Present',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.'
      }
    ];

    const aboutData: AboutData = {
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.',
      timeline: timeline
    };

    const projects: Project[] = [
      {
        id: '1',
        title: 'Some Case Study',
        date: 'November 24, 2019',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed aliquam sollicitudin rhoncus morbi. Tincidunt quam sem elit a convallis. Eget ipsum, velit vitae eu nunc, consequat, at.',
        image: '/assets/images/project1.png',
        url: '#'
      },
      {
        id: '2',
        title: 'Some Case Study',
        date: 'November 24, 2019',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed aliquam sollicitudin rhoncus morbi. Tincidunt quam sem elit a convallis. Eget ipsum, velit vitae eu nunc, consequat, at.',
        image: '/assets/images/project2.png',
        url: '#'
      }
    ];

    const workData: WorkData = {
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.',
      projects: projects
    };

    const contactData: ContactData = {
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.',
      email: 'johndoe@mail.com',
      socialLinks: [
        'twitter.com/johndoe',
        'behance.com/johndoe'
      ],
      image: '/assets/images/contact-image.png'
    };

    const socialLinks: SocialLink[] = [
      {
        name: 'medium',
        url: 'https://medium.com/@johndoe',
        icon: '/assets/images/medium-icon.svg'
      },
      {
        name: 'behance',
        url: 'https://behance.net/johndoe',
        icon: '/assets/images/behance-icon.svg'
      },
      {
        name: 'twitter',
        url: 'https://twitter.com/johndoe',
        icon: '/assets/images/twitter-icon.svg'
      }
    ];

    const portfolioData: PortfolioData = {
      hero: heroData,
      about: aboutData,
      work: workData,
      contact: contactData,
      socialLinks: socialLinks
    };

    return of(portfolioData);
  }
}
