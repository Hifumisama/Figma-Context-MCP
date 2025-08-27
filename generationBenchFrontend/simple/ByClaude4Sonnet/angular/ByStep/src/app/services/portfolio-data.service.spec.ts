import { TestBed } from '@angular/core/testing';
import { PortfolioDataService } from './portfolio-data.service';
import { HeroData, AboutData, WorkData, ContactData } from '../models/portfolio.interfaces';

describe('PortfolioDataService', () => {
  let service: PortfolioDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortfolioDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return hero data observable', (done) => {
    service.getHeroData().subscribe(data => {
      expect(data).toBeDefined();
      expect(data.greeting).toBe('Hello, I\'m John,');
      expect(data.title).toBe('Product Designer');
      expect(data.location).toBe('based in Netherland.');
      expect(data.profileImage).toContain('profile-image.png');
      done();
    });
  });

  it('should return about data observable with timeline', (done) => {
    service.getAboutData().subscribe(data => {
      expect(data).toBeDefined();
      expect(data.description).toBeDefined();
      expect(data.timeline).toBeDefined();
      expect(data.timeline.length).toBe(3);
      
      // Vérifier les périodes
      expect(data.timeline[0].period).toBe('2014-2018');
      expect(data.timeline[1].period).toBe('2018-2020');
      expect(data.timeline[2].period).toBe('2020 - Present');
      
      // Vérifier que chaque item a une description
      data.timeline.forEach(item => {
        expect(item.description).toBeDefined();
        expect(item.description.length).toBeGreaterThan(0);
      });
      
      done();
    });
  });

  it('should return work data observable with projects', (done) => {
    service.getWorkData().subscribe(data => {
      expect(data).toBeDefined();
      expect(data.description).toBeDefined();
      expect(data.projects).toBeDefined();
      expect(data.projects.length).toBe(2);
      
      // Vérifier le premier projet
      const project1 = data.projects[0];
      expect(project1.id).toBe('1');
      expect(project1.title).toBe('Some Case Study');
      expect(project1.date).toBe('November 24, 2019');
      expect(project1.image).toContain('project1.png');
      
      // Vérifier le deuxième projet
      const project2 = data.projects[1];
      expect(project2.id).toBe('2');
      expect(project2.title).toBe('Some Case Study');
      expect(project2.date).toBe('November 24, 2019');
      expect(project2.image).toContain('project2.png');
      
      done();
    });
  });

  it('should return contact data observable', (done) => {
    service.getContactData().subscribe(data => {
      expect(data).toBeDefined();
      expect(data.description).toBeDefined();
      expect(data.email).toBe('johndoe@mail.com');
      expect(data.socialLinks).toBeDefined();
      expect(data.socialLinks.length).toBe(2);
      expect(data.socialLinks).toContain('twitter.com/johndoe');
      expect(data.socialLinks).toContain('behance.com/johndoe');
      expect(data.image).toContain('contact-image.png');
      done();
    });
  });

  it('should return social links data', (done) => {
    service.getSocialLinks().subscribe(data => {
      expect(data).toBeDefined();
      expect(data.length).toBe(3);
      
      // Vérifier Medium
      const medium = data.find(link => link.name === 'medium');
      expect(medium).toBeDefined();
      expect(medium?.url).toBe('https://medium.com/@johndoe');
      expect(medium?.icon).toContain('medium-icon.svg');
      
      // Vérifier Behance
      const behance = data.find(link => link.name === 'behance');
      expect(behance).toBeDefined();
      expect(behance?.url).toBe('https://behance.net/johndoe');
      expect(behance?.icon).toContain('behance-icon.svg');
      
      // Vérifier Twitter
      const twitter = data.find(link => link.name === 'twitter');
      expect(twitter).toBeDefined();
      expect(twitter?.url).toBe('https://twitter.com/johndoe');
      expect(twitter?.icon).toContain('twitter-icon.svg');
      
      done();
    });
  });

  it('should return complete portfolio data', (done) => {
    service.getPortfolioData().subscribe(data => {
      expect(data).toBeDefined();
      expect(data.hero).toBeDefined();
      expect(data.about).toBeDefined();
      expect(data.work).toBeDefined();
      expect(data.contact).toBeDefined();
      expect(data.socialLinks).toBeDefined();
      done();
    });
  });

  it('should handle data consistency across methods', (done) => {
    let heroData: HeroData;
    let aboutData: AboutData;
    let workData: WorkData;
    let contactData: ContactData;
    let portfolioData: any;
    
    service.getHeroData().subscribe(data => heroData = data);
    service.getAboutData().subscribe(data => aboutData = data);
    service.getWorkData().subscribe(data => workData = data);
    service.getContactData().subscribe(data => contactData = data);
    
    service.getPortfolioData().subscribe(data => {
      portfolioData = data;
      
      // Vérifier la cohérence des données
      expect(portfolioData.hero).toEqual(heroData);
      expect(portfolioData.about).toEqual(aboutData);
      expect(portfolioData.work).toEqual(workData);
      expect(portfolioData.contact).toEqual(contactData);
      
      done();
    });
  });

  it('should return observables that complete', (done) => {
    let completed = 0;
    const expectComplete = () => {
      completed++;
      if (completed === 5) done();
    };
    
    service.getHeroData().subscribe({ complete: expectComplete });
    service.getAboutData().subscribe({ complete: expectComplete });
    service.getWorkData().subscribe({ complete: expectComplete });
    service.getContactData().subscribe({ complete: expectComplete });
    service.getSocialLinks().subscribe({ complete: expectComplete });
  });
});

