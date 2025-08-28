import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Import des composants
import { HeaderComponent } from './components/header/header.component';
import { HeroComponent } from './components/hero/hero.component';
import { AboutComponent } from './components/about/about.component';
import { WorkComponent } from './components/work/work.component';
import { ContactComponent } from './components/contact/contact.component';

// Import des services
import { PortfolioDataService } from './services/portfolio-data.service';

// Import des interfaces
import { 
  HeroData, 
  AboutData, 
  WorkData, 
  ContactData, 
  SocialLink 
} from './models/portfolio.interfaces';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    HeroComponent,
    AboutComponent,
    WorkComponent,
    ContactComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'John Doe - Product Designer Portfolio';
  
  // Data properties - initialisées avec des valeurs par défaut
  heroData: HeroData = {
    greeting: 'Hello, I\'m John,',
    title: 'Product Designer',
    location: 'based in Netherland.',
    profileImage: '/assets/images/profile-image.png'
  };

  aboutData: AboutData = {
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.',
    timeline: [
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
    ]
  };

  workData: WorkData = {
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.',
    projects: [
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
    ]
  };

  contactData: ContactData = {
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.',
    email: 'johndoe@mail.com',
    socialLinks: [
      'twitter.com/johndoe',
      'behance.com/johndoe'
    ],
    image: '/assets/images/contact-image.png'
  };

  socialLinks: SocialLink[] = [
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
  
  // Navigation
  currentSection = 'home';

  constructor(private portfolioDataService: PortfolioDataService) {}

  ngOnInit(): void {
    // Les données sont déjà initialisées, pas besoin de les charger
    console.log('Portfolio application initialized');
  }

  // Event handlers
  onNavigationClick(sectionId: string): void {
    // Navigation simple sans service pour éviter les erreurs
    if (typeof window !== 'undefined') {
      const element = document.getElementById(sectionId);
      if (element) {
        const offsetTop = element.offsetTop - 80; // Header offset
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    }
  }

  onResumeClick(): void {
    console.log('Resume button clicked');
    // Ici vous pourriez ouvrir le CV ou déclencher un téléchargement
    // Exemple : window.open('assets/documents/resume.pdf', '_blank');
  }

  onProjectClick(project: any): void {
    console.log('Project clicked:', project);
    // Ici vous pourriez naviguer vers une page de détail du projet
    // Exemple : this.router.navigate(['/project', project.id]);
  }

  onSocialClick(platform: string): void {
    // Gérer les clics sur les réseaux sociaux
    const socialLink = this.socialLinks.find(link => link.name === platform);
    if (socialLink && typeof window !== 'undefined') {
      window.open(socialLink.url, '_blank');
    }
  }

  onEmailClick(email: string): void {
    // Copier l'email ou ouvrir le client mail
    if (typeof window !== 'undefined') {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(email).then(() => {
          console.log('Email copied to clipboard');
          // Vous pourriez afficher une notification ici
        });
      } else {
        window.location.href = `mailto:${email}`;
      }
    }
  }
}
