# Architecture des Composants Angular - Portfolio John Doe

## Vue d'ensemble

Cette architecture définit la décomposition du template vanilla en composants Angular réutilisables et maintenables, suivant les bonnes pratiques d'Angular et les principes de séparation des responsabilités.

## Arborescence des Composants

```
AppComponent (app-root)
├── HeaderComponent (app-header)
│   ├── NavigationComponent (app-navigation)
│   ├── SocialIconsComponent (app-social-icons)
│   └── DecorativeElementsComponent (app-decorative-elements)
├── HeroComponent (app-hero)
├── AboutComponent (app-about)
│   └── TimelineComponent (app-timeline)
│       └── TimelineItemComponent (app-timeline-item) [*ngFor]
├── WorkComponent (app-work)
│   └── ProjectListComponent (app-project-list)
│       └── ProjectComponent (app-project) [*ngFor]
└── ContactComponent (app-contact)
```

## Description Détaillée des Composants

### 1. AppComponent
**Responsabilité :** Composant racine qui orchestre toute l'application
**Fichiers :**
- `app.component.ts`
- `app.component.html` 
- `app.component.scss`
- `app.component.spec.ts`

**Template :**
```html
<app-header></app-header>
<main>
  <app-hero></app-hero>
  <app-about></app-about>
  <app-work></app-work>
  <app-contact></app-contact>
</main>
```

### 2. HeaderComponent
**Responsabilité :** Header fixe avec navigation et éléments décoratifs
**Inputs :** Aucun
**Outputs :** `navigationClick: EventEmitter<string>`

**Fonctionnalités :**
- Gestion du header fixe
- Émission d'événements de navigation

### 3. NavigationComponent
**Responsabilité :** Menu de navigation principal
**Inputs :** `activeSection: string`
**Outputs :** `sectionClick: EventEmitter<string>`

**Fonctionnalités :**
- Gestion des liens de navigation
- Mise à jour de l'état actif
- Smooth scrolling

### 4. SocialIconsComponent
**Responsabilité :** Icônes des réseaux sociaux avec interactions
**Inputs :** `socialLinks: SocialLink[]`
**Outputs :** `socialClick: EventEmitter<string>`

**Interface SocialLink :**
```typescript
interface SocialLink {
  name: string;
  url: string;
  icon: string;
}
```

### 5. DecorativeElementsComponent
**Responsabilité :** Éléments décoratifs (barres et croix)
**Inputs :** Aucun
**Outputs :** Aucun

### 6. HeroComponent
**Responsabilité :** Section hero avec présentation personnelle
**Inputs :** `heroData: HeroData`
**Outputs :** `resumeClick: EventEmitter<void>`

**Interface HeroData :**
```typescript
interface HeroData {
  greeting: string;
  title: string;
  location: string;
  profileImage: string;
}
```

### 7. AboutComponent
**Responsabilité :** Section à propos avec description et timeline
**Inputs :** `aboutData: AboutData`
**Outputs :** Aucun

**Interface AboutData :**
```typescript
interface AboutData {
  description: string;
  timeline: TimelineItem[];
}
```

### 8. TimelineComponent
**Responsabilité :** Affichage de la timeline d'expérience
**Inputs :** `timelineItems: TimelineItem[]`
**Outputs :** Aucun

### 9. TimelineItemComponent
**Responsabilité :** Un élément individuel de la timeline
**Inputs :** `timelineItem: TimelineItem`
**Outputs :** Aucun

**Interface TimelineItem :**
```typescript
interface TimelineItem {
  period: string;
  description: string;
}
```

### 10. WorkComponent
**Responsabilité :** Section travaux avec description et projets
**Inputs :** `workData: WorkData`
**Outputs :** Aucun

**Interface WorkData :**
```typescript
interface WorkData {
  description: string;
  projects: Project[];
}
```

### 11. ProjectListComponent
**Responsabilité :** Liste des projets
**Inputs :** `projects: Project[]`
**Outputs :** `projectClick: EventEmitter<Project>`

### 12. ProjectComponent
**Responsabilité :** Un projet individuel
**Inputs :** `project: Project`
**Outputs :** `projectClick: EventEmitter<Project>`

**Interface Project :**
```typescript
interface Project {
  id: string;
  title: string;
  date: string;
  description: string;
  image: string;
  url?: string;
}
```

### 13. ContactComponent
**Responsabilité :** Section contact avec informations et image
**Inputs :** `contactData: ContactData`
**Outputs :** `emailClick: EventEmitter<string>`, `socialClick: EventEmitter<string>`

**Interface ContactData :**
```typescript
interface ContactData {
  description: string;
  email: string;
  socialLinks: string[];
  image: string;
}
```

## Services

### 1. NavigationService
**Responsabilité :** Gestion de la navigation et du scroll
```typescript
@Injectable({ providedIn: 'root' })
export class NavigationService {
  scrollToSection(sectionId: string): void
  getCurrentSection(): string
  onSectionChange(): Observable<string>
}
```

### 2. PortfolioDataService
**Responsabilité :** Gestion des données du portfolio
```typescript
@Injectable({ providedIn: 'root' })
export class PortfolioDataService {
  getHeroData(): Observable<HeroData>
  getAboutData(): Observable<AboutData>
  getWorkData(): Observable<WorkData>
  getContactData(): Observable<ContactData>
}
```

## Structure des Dossiers

```
src/
├── app/
│   ├── components/
│   │   ├── header/
│   │   │   ├── header.component.ts|html|scss|spec.ts
│   │   │   ├── navigation/
│   │   │   │   └── navigation.component.ts|html|scss|spec.ts
│   │   │   ├── social-icons/
│   │   │   │   └── social-icons.component.ts|html|scss|spec.ts
│   │   │   └── decorative-elements/
│   │   │       └── decorative-elements.component.ts|html|scss|spec.ts
│   │   ├── hero/
│   │   │   └── hero.component.ts|html|scss|spec.ts
│   │   ├── about/
│   │   │   ├── about.component.ts|html|scss|spec.ts
│   │   │   └── timeline/
│   │   │       ├── timeline.component.ts|html|scss|spec.ts
│   │   │       └── timeline-item/
│   │   │           └── timeline-item.component.ts|html|scss|spec.ts
│   │   ├── work/
│   │   │   ├── work.component.ts|html|scss|spec.ts
│   │   │   └── project-list/
│   │   │       ├── project-list.component.ts|html|scss|spec.ts
│   │   │       └── project/
│   │   │           └── project.component.ts|html|scss|spec.ts
│   │   └── contact/
│   │       └── contact.component.ts|html|scss|spec.ts
│   ├── services/
│   │   ├── navigation.service.ts|spec.ts
│   │   └── portfolio-data.service.ts|spec.ts
│   ├── models/
│   │   └── portfolio.interfaces.ts
│   └── shared/
│       ├── directives/
│       ├── pipes/
│       └── animations/
│           └── scroll-animations.ts
```

## Stratégie de Tests

### Tests Unitaires
- Chaque composant aura son fichier `.spec.ts`
- Tests des inputs/outputs
- Tests des méthodes publiques
- Tests d'intégration avec les services

### Tests d'Intégration
- Tests de navigation entre sections
- Tests d'interaction utilisateur
- Tests de responsive design

### Tests E2E
- Parcours utilisateur complet
- Tests de performance
- Tests d'accessibilité

## Points d'Attention

1. **Réutilisabilité :** Les composants doivent être génériques et réutilisables
2. **Performance :** Utilisation d'OnPush change detection où possible
3. **Accessibilité :** Respect des standards WCAG
4. **Responsive :** Design adaptatif pour tous les écrans
5. **SEO :** Structure sémantique appropriée

## Ordre d'Implémentation

1. Création des interfaces dans `models/`
2. Création des services de base
3. Implémentation des composants de base (Header, Hero, etc.)
4. Implémentation des composants enfants
5. Tests unitaires pour chaque composant
6. Integration et tests E2E

