import { describe, it, expect } from 'vitest';
import { render, screen } from '@vitest/browser/svelte';
import Navigation from './Navigation.svelte';

describe('Navigation Component', () => {
	const defaultItems = [
		{ href: '#home', label: 'Home' },
		{ href: '#about', label: 'About' },
		{ href: '#work', label: 'Work' }
	];

	const customItems = [
		{ href: '#services', label: 'Services' },
		{ href: '#portfolio', label: 'Portfolio' },
		{ href: '#contact', label: 'Contact' },
		{ href: '#blog', label: 'Blog' }
	];

	describe('Rendering', () => {
		it('should render with default navigation items', async () => {
			render(Navigation);
			
			const nav = screen.getByRole('navigation');
			expect.element(nav).toBeInTheDocument();
			expect.element(nav).toHaveClass('navigation');
			
			const list = screen.getByRole('list');
			expect.element(list).toBeInTheDocument();
			expect.element(list).toHaveClass('nav-list');
			
			// Check default items
			expect.element(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
			expect.element(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
			expect.element(screen.getByRole('link', { name: 'Work' })).toBeInTheDocument();
		});

		it('should render with custom navigation items', async () => {
			render(Navigation, { props: { items: customItems } });
			
			expect.element(screen.getByRole('link', { name: 'Services' })).toBeInTheDocument();
			expect.element(screen.getByRole('link', { name: 'Portfolio' })).toBeInTheDocument();
			expect.element(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
			expect.element(screen.getByRole('link', { name: 'Blog' })).toBeInTheDocument();
		});

		it('should render correct number of navigation items', async () => {
			render(Navigation, { props: { items: customItems } });
			
			const links = screen.getAllByRole('link');
			expect(links).toHaveLength(4);
		});

		it('should handle empty items array', async () => {
			render(Navigation, { props: { items: [] } });
			
			const nav = screen.getByRole('navigation');
			expect.element(nav).toBeInTheDocument();
			
			const list = screen.getByRole('list');
			expect.element(list).toBeInTheDocument();
			
			const links = screen.queryAllByRole('link');
			expect(links).toHaveLength(0);
		});
	});

	describe('HTML Structure', () => {
		it('should have correct HTML structure', async () => {
			render(Navigation);
			
			const nav = document.querySelector('nav.navigation');
			const list = nav.querySelector('ul.nav-list');
			const items = list.querySelectorAll('li.nav-item');
			const links = list.querySelectorAll('a.nav-link');
			
			expect.element(nav).toBeInTheDocument();
			expect.element(list).toBeInTheDocument();
			expect(items).toHaveLength(3);
			expect(links).toHaveLength(3);
		});

		it('should use semantic HTML elements', async () => {
			render(Navigation);
			
			// Should use nav element
			const nav = screen.getByRole('navigation');
			expect.element(nav).toBeInTheDocument();
			
			// Should use ul/li structure
			const list = screen.getByRole('list');
			expect.element(list).toBeInTheDocument();
			
			// Should use anchor elements for links
			const links = screen.getAllByRole('link');
			expect(links.length).toBeGreaterThan(0);
		});
	});

	describe('Link Properties', () => {
		it('should set correct href attributes', async () => {
			render(Navigation);
			
			const homeLink = screen.getByRole('link', { name: 'Home' });
			const aboutLink = screen.getByRole('link', { name: 'About' });
			const workLink = screen.getByRole('link', { name: 'Work' });
			
			expect.element(homeLink).toHaveAttribute('href', '#home');
			expect.element(aboutLink).toHaveAttribute('href', '#about');
			expect.element(workLink).toHaveAttribute('href', '#work');
		});

		it('should display correct link text', async () => {
			render(Navigation, { props: { items: customItems } });
			
			expect.element(screen.getByText('Services')).toBeInTheDocument();
			expect.element(screen.getByText('Portfolio')).toBeInTheDocument();
			expect.element(screen.getByText('Contact')).toBeInTheDocument();
			expect.element(screen.getByText('Blog')).toBeInTheDocument();
		});

		it('should handle special characters in labels', async () => {
			const specialItems = [
				{ href: '#about', label: 'À propos' },
				{ href: '#contact', label: 'Contactez-nous!' },
				{ href: '#work', label: 'Mes Œuvres & Projets' }
			];
			
			render(Navigation, { props: { items: specialItems } });
			
			expect.element(screen.getByText('À propos')).toBeInTheDocument();
			expect.element(screen.getByText('Contactez-nous!')).toBeInTheDocument();
			expect.element(screen.getByText('Mes Œuvres & Projets')).toBeInTheDocument();
		});
	});

	describe('CSS Classes', () => {
		it('should apply correct CSS classes', async () => {
			render(Navigation);
			
			const nav = document.querySelector('nav');
			const list = document.querySelector('ul');
			const items = document.querySelectorAll('li');
			const links = document.querySelectorAll('a');
			
			expect.element(nav).toHaveClass('navigation');
			expect.element(list).toHaveClass('nav-list');
			
			items.forEach(item => {
				expect.element(item).toHaveClass('nav-item');
			});
			
			links.forEach(link => {
				expect.element(link).toHaveClass('nav-link');
			});
		});
	});

	describe('Accessibility', () => {
		it('should have proper navigation landmark', async () => {
			render(Navigation);
			
			const nav = screen.getByRole('navigation');
			expect.element(nav).toBeInTheDocument();
		});

		it('should have focusable links', async () => {
			render(Navigation);
			
			const links = screen.getAllByRole('link');
			
			for (const link of links) {
				await link.focus();
				expect.element(link).toBeFocused();
			}
		});

		it('should have meaningful link text', async () => {
			render(Navigation);
			
			const homeLink = screen.getByRole('link', { name: 'Home' });
			const aboutLink = screen.getByRole('link', { name: 'About' });
			const workLink = screen.getByRole('link', { name: 'Work' });
			
			expect.element(homeLink).toBeInTheDocument();
			expect.element(aboutLink).toBeInTheDocument();
			expect.element(workLink).toBeInTheDocument();
		});

		it('should support keyboard navigation', async () => {
			render(Navigation);
			
			const links = screen.getAllByRole('link');
			
			// Focus first link
			await links[0].focus();
			expect.element(links[0]).toBeFocused();
			
			// Tab to next link
			await links[1].focus();
			expect.element(links[1]).toBeFocused();
		});
	});

	describe('Props Validation', () => {
		it('should handle missing href in items', async () => {
			const itemsWithMissingHref = [
				{ label: 'Home' },
				{ href: '#about', label: 'About' }
			];
			
			render(Navigation, { props: { items: itemsWithMissingHref } });
			
			const nav = screen.getByRole('navigation');
			expect.element(nav).toBeInTheDocument();
		});

		it('should handle missing label in items', async () => {
			const itemsWithMissingLabel = [
				{ href: '#home' },
				{ href: '#about', label: 'About' }
			];
			
			render(Navigation, { props: { items: itemsWithMissingLabel } });
			
			const nav = screen.getByRole('navigation');
			expect.element(nav).toBeInTheDocument();
		});

		it('should handle undefined items prop', async () => {
			render(Navigation, { props: { items: undefined } });
			
			const nav = screen.getByRole('navigation');
			expect.element(nav).toBeInTheDocument();
		});
	});
});
