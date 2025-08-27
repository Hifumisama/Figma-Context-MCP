import { describe, it, expect } from 'vitest';
import { render, screen } from '@vitest/browser/svelte';
import HeroText from './HeroText.svelte';

describe('HeroText Component', () => {
	describe('Rendering', () => {
		it('should render with default props', async () => {
			render(HeroText);
			
			// Check greeting
			const greeting = screen.getByText("Hello, I'm John,");
			expect.element(greeting).toBeInTheDocument();
			expect.element(greeting).toHaveClass('hero-greeting');
			
			// Check title
			const title = screen.getByText('Product Designer');
			expect.element(title).toBeInTheDocument();
			expect.element(title).toHaveClass('hero-title');
			
			// Check subtitle
			const subtitle = screen.getByText('based in Netherland.');
			expect.element(subtitle).toBeInTheDocument();
			expect.element(subtitle).toHaveClass('hero-subtitle');
		});

		it('should render with custom props', async () => {
			render(HeroText, {
				props: {
					greeting: 'Hi there!',
					title: 'Frontend Developer',
					subtitle: 'from France.'
				}
			});
			
			expect.element(screen.getByText('Hi there!')).toBeInTheDocument();
			expect.element(screen.getByText('Frontend Developer')).toBeInTheDocument();
			expect.element(screen.getByText('from France.')).toBeInTheDocument();
		});

		it('should handle empty strings', async () => {
			render(HeroText, {
				props: {
					greeting: '',
					title: '',
					subtitle: ''
				}
			});
			
			const greeting = screen.getByRole('heading', { level: 2 });
			const title = screen.getByRole('heading', { level: 1 });
			const subtitle = document.querySelector('.hero-subtitle');
			
			expect.element(greeting).toHaveTextContent('');
			expect.element(title).toHaveTextContent('');
			expect.element(subtitle).toHaveTextContent('');
		});
	});

	describe('HTML Structure', () => {
		it('should have correct HTML structure', async () => {
			render(HeroText);
			
			const container = document.querySelector('.hero-text');
			expect.element(container).toBeInTheDocument();
			
			// Check heading hierarchy
			const h2 = container.querySelector('h2.hero-greeting');
			const h1 = container.querySelector('h1.hero-title');
			const p = container.querySelector('p.hero-subtitle');
			
			expect.element(h2).toBeInTheDocument();
			expect.element(h1).toBeInTheDocument();
			expect.element(p).toBeInTheDocument();
		});

		it('should maintain proper heading hierarchy', async () => {
			render(HeroText);
			
			const h1 = screen.getByRole('heading', { level: 1 });
			const h2 = screen.getByRole('heading', { level: 2 });
			
			expect.element(h1).toBeInTheDocument();
			expect.element(h2).toBeInTheDocument();
		});
	});

	describe('CSS Classes', () => {
		it('should apply correct CSS classes', async () => {
			render(HeroText);
			
			const greeting = screen.getByText("Hello, I'm John,");
			const title = screen.getByText('Product Designer');
			const subtitle = screen.getByText('based in Netherland.');
			
			expect.element(greeting).toHaveClass('hero-greeting');
			expect.element(title).toHaveClass('hero-title');
			expect.element(subtitle).toHaveClass('hero-subtitle');
		});
	});

	describe('Accessibility', () => {
		it('should have proper heading structure for screen readers', async () => {
			render(HeroText);
			
			const mainTitle = screen.getByRole('heading', { level: 1 });
			const subheading = screen.getByRole('heading', { level: 2 });
			
			expect.element(mainTitle).toBeInTheDocument();
			expect.element(subheading).toBeInTheDocument();
		});

		it('should have meaningful text content', async () => {
			render(HeroText, {
				props: {
					greeting: 'Hello World',
					title: 'Web Developer',
					subtitle: 'Creating amazing experiences'
				}
			});
			
			expect.element(screen.getByText('Hello World')).toBeInTheDocument();
			expect.element(screen.getByText('Web Developer')).toBeInTheDocument();
			expect.element(screen.getByText('Creating amazing experiences')).toBeInTheDocument();
		});
	});

	describe('Props Validation', () => {
		it('should handle special characters', async () => {
			render(HeroText, {
				props: {
					greeting: 'Bonjour & Bienvenue!',
					title: 'Développeur <Frontend>',
					subtitle: 'Basé à Paris & Lyon.'
				}
			});
			
			expect.element(screen.getByText('Bonjour & Bienvenue!')).toBeInTheDocument();
			expect.element(screen.getByText('Développeur <Frontend>')).toBeInTheDocument();
			expect.element(screen.getByText('Basé à Paris & Lyon.')).toBeInTheDocument();
		});

		it('should handle long text content', async () => {
			const longTitle = 'Very Long Professional Title That Should Still Render Properly';
			const longSubtitle = 'A very long subtitle that describes the person location and many other details that should still be displayed correctly';
			
			render(HeroText, {
				props: {
					title: longTitle,
					subtitle: longSubtitle
				}
			});
			
			expect.element(screen.getByText(longTitle)).toBeInTheDocument();
			expect.element(screen.getByText(longSubtitle)).toBeInTheDocument();
		});
	});
});
