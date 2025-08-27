/**
 * Constantes extraites de la maquette Figma
 * Utilisées dans toute l'application pour la cohérence
 */

// Palette de couleurs Figma
export const COLORS = {
	PRIMARY: '#03045E',     // Bleu foncé
	SECONDARY: '#474306',   // Marron foncé  
	ACCENT: '#F7F197',      // Jaune clair
	BACKGROUND: '#FBF8CC',  // Crème
	SURFACE: '#F5EE84',     // Jaune
	WHITE: '#FFFFFF'        // Blanc
};

// Tailles de typographie Figma
export const FONT_SIZES = {
	XS: '15px',
	SM: '18px', 
	MD: '20px',
	LG: '24px',
	XL: '28px',
	'2XL': '40px',
	'3XL': '100px'
};

// Poids de police
export const FONT_WEIGHTS = {
	REGULAR: 400,
	MEDIUM: 500,
	SEMIBOLD: 600,
	BOLD: 800
};

// Hauteurs de ligne extraites de Figma
export const LINE_HEIGHTS = {
	TIGHT: 1.16,
	NORMAL: 1.5,
	RELAXED: 1.78,
	LOOSE: 1.83,
	EXTRA_LOOSE: 2.93
};

// Espacements cohérents
export const SPACING = {
	XS: '8px',
	SM: '12px',
	MD: '20px',
	LG: '40px',
	XL: '60px',
	'2XL': '80px',
	'3XL': '120px'
};

// Border radius
export const RADIUS = {
	SM: '6px',
	MD: '8px', 
	LG: '10px',
	XL: '40px'
};

// Breakpoints responsive
export const BREAKPOINTS = {
	SM: '480px',
	MD: '768px',
	LG: '1024px',
	XL: '1266px'
};

// Durées d'animation
export const DURATIONS = {
	FAST: '0.15s',
	NORMAL: '0.3s',
	SLOW: '0.5s',
	SLOWER: '0.8s'
};

// Navigation par défaut
export const DEFAULT_NAVIGATION = [
	{ href: '#home', label: 'Home' },
	{ href: '#about', label: 'About' },
	{ href: '#work', label: 'Work' }
];

// Liens sociaux par défaut
export const DEFAULT_SOCIAL_LINKS = [
	{ href: '#', icon: 'medium-icon.svg', name: 'Medium' },
	{ href: '#', icon: 'behance-icon.svg', name: 'Behance' },
	{ href: '#', icon: 'twitter-icon.svg', name: 'Twitter' }
];

// Timeline par défaut pour la section About
export const DEFAULT_TIMELINE_ITEMS = [
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

// Projets par défaut pour la section Work
export const DEFAULT_PROJECTS = [
	{
		id: 'project-1',
		title: 'Some Case Study',
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed aliquam sollicitudin rhoncus morbi. Tincidunt quam sem elit a convallis. Eget ipsum, velit vitae eu nunc, consequat, at.',
		date: 'November 24, 2019',
		image: '/images/project1.png'
	},
	{
		id: 'project-2', 
		title: 'Some Case Study',
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed aliquam sollicitudin rhoncus morbi. Tincidunt quam sem elit a convallis. Eget ipsum, velit vitae eu nunc, consequat, at.',
		date: 'November 24, 2019',
		image: '/images/project2.png'
	}
];

// Informations de contact par défaut
export const DEFAULT_CONTACT_INFO = [
	{
		type: 'email',
		label: 'johndoe@mail.com',
		value: 'johndoe@mail.com',
		href: 'mailto:johndoe@mail.com'
	},
	{
		type: 'social',
		label: 'twitter.com/johndoe',
		value: 'twitter.com/johndoe', 
		href: 'https://twitter.com/johndoe'
	},
	{
		type: 'social',
		label: 'behance.com/johndoe',
		value: 'behance.com/johndoe',
		href: 'https://behance.com/johndoe'
	}
];

// Contenu textuel par défaut
export const DEFAULT_CONTENT = {
	HERO: {
		greeting: "Hello, I'm John,",
		title: 'Product Designer',
		subtitle: 'based in Netherland.'
	},
	ABOUT: {
		title: 'about.',
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.'
	},
	WORK: {
		title: 'work.',
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.'
	},
	CONTACT: {
		title: 'contact.',
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.'
	}
};

// Configuration d'animation
export const ANIMATION_CONFIG = {
	INTERSECTION_THRESHOLD: 0.1,
	TIMELINE_STAGGER_DELAY: 100,
	SCROLL_OFFSET: 50
};
