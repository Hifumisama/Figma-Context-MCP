import { describe, it, expect } from 'vitest';
import { render, screen } from '@vitest/browser/svelte';
import SectionTitle from './SectionTitle.svelte';

describe('SectionTitle Component', () => {
	describe('Rendering', () => {
		it('should render h1 by default', async () => {
			render(SectionTitle, { props: { text: 'Default Title' } });
			
			const heading = screen.getByRole('heading', { level: 1 });
			expect.element(heading).toBeInTheDocument();
			expect.element(heading).toHaveTextContent('Default Title');
			expect.element(heading).toHaveClass('section-title');
		});

		it('should render correct heading level', async () => {
			const { rerender } = render(SectionTitle, { 
				props: { text: 'H2 Title', level: 2 }
			});
			
			let heading = screen.getByRole('heading', { level: 2 });
			expect.element(heading).toBeInTheDocument();
			expect.element(heading).toHaveTextContent('H2 Title');
			
			await rerender({ text: 'H3 Title', level: 3 });
			heading = screen.getByRole('heading', { level: 3 });
			expect.element(heading).toBeInTheDocument();
			expect.element(heading).toHaveTextContent('H3 Title');
			
			await rerender({ text: 'H6 Title', level: 6 });
			heading = screen.getByRole('heading', { level: 6 });
			expect.element(heading).toBeInTheDocument();
			expect.element(heading).toHaveTextContent('H6 Title');
		});

		it('should handle empty text', async () => {
			render(SectionTitle, { props: { text: '' } });
			
			const heading = screen.getByRole('heading', { level: 1 });
			expect.element(heading).toBeInTheDocument();
			expect.element(heading).toHaveTextContent('');
		});

		it('should handle special characters and HTML entities', async () => {
			render(SectionTitle, { props: { text: 'Title & <Special>' } });
			
			const heading = screen.getByRole('heading', { level: 1 });
			expect.element(heading).toHaveTextContent('Title & <Special>');
		});
	});

	describe('CSS Classes', () => {
		it('should always have section-title class', async () => {
			const { rerender } = render(SectionTitle, { 
				props: { text: 'Test', level: 1 }
			});
			
			let heading = screen.getByRole('heading', { level: 1 });
			expect.element(heading).toHaveClass('section-title');
			
			await rerender({ text: 'Test', level: 4 });
			heading = screen.getByRole('heading', { level: 4 });
			expect.element(heading).toHaveClass('section-title');
		});
	});

	describe('Accessibility', () => {
		it('should have proper heading hierarchy', async () => {
			render(SectionTitle, { props: { text: 'Main Title', level: 1 } });
			
			const heading = screen.getByRole('heading', { level: 1 });
			expect.element(heading).toBeInTheDocument();
		});

		it('should be readable by screen readers', async () => {
			render(SectionTitle, { props: { text: 'Accessible Title' } });
			
			const heading = screen.getByText('Accessible Title');
			expect.element(heading).toBeInTheDocument();
		});
	});

	describe('Props Validation', () => {
		it('should handle invalid level gracefully', async () => {
			// Level should fallback to h6 for invalid numbers
			render(SectionTitle, { props: { text: 'Test', level: 7 } });
			
			const heading = screen.getByRole('heading', { level: 6 });
			expect.element(heading).toBeInTheDocument();
		});

		it('should require text prop', async () => {
			// This should be handled in the component implementation
			render(SectionTitle, { props: { text: undefined } });
			
			const heading = screen.getByRole('heading', { level: 1 });
			expect.element(heading).toBeInTheDocument();
		});
	});
});
