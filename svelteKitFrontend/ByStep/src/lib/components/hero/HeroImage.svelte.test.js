import { describe, it, expect } from 'vitest';
import { render, screen } from '@vitest/browser/svelte';
import HeroImage from './HeroImage.svelte';

describe('HeroImage Component', () => {
	describe('Rendering', () => {
		it('should render with default props', async () => {
			render(HeroImage);
			
			const image = screen.getByRole('img');
			expect.element(image).toBeInTheDocument();
			expect.element(image).toHaveAttribute('src', '/images/profile-image.png');
			expect.element(image).toHaveAttribute('alt', 'John Doe Profile');
			
			const container = document.querySelector('.hero-image');
			expect.element(container).toBeInTheDocument();
		});

		it('should render with custom props', async () => {
			render(HeroImage, {
				props: {
					src: '/custom/image.jpg',
					alt: 'Custom Alt Text',
					showDecorations: false
				}
			});
			
			const image = screen.getByRole('img');
			expect.element(image).toHaveAttribute('src', '/custom/image.jpg');
			expect.element(image).toHaveAttribute('alt', 'Custom Alt Text');
		});

		it('should show decorations when showDecorations is true', async () => {
			render(HeroImage, {
				props: { showDecorations: true }
			});
			
			const decorations = document.querySelector('.decorative-icons');
			expect.element(decorations).toBeInTheDocument();
		});

		it('should hide decorations when showDecorations is false', async () => {
			render(HeroImage, {
				props: { showDecorations: false }
			});
			
			const decorations = document.querySelector('.decorative-icons');
			expect.element(decorations).not.toBeInTheDocument();
		});
	});

	describe('HTML Structure', () => {
		it('should have correct HTML structure', async () => {
			render(HeroImage);
			
			const container = document.querySelector('.hero-image');
			const image = container.querySelector('img');
			const decorations = container.querySelector('.decorative-icons');
			
			expect.element(container).toBeInTheDocument();
			expect.element(image).toBeInTheDocument();
			expect.element(decorations).toBeInTheDocument();
		});

		it('should apply correct CSS classes', async () => {
			render(HeroImage);
			
			const container = document.querySelector('.hero-image');
			expect.element(container).toHaveClass('hero-image');
		});
	});

	describe('Image Properties', () => {
		it('should handle different image formats', async () => {
			const testCases = [
				{ src: '/test.jpg', alt: 'JPEG Image' },
				{ src: '/test.png', alt: 'PNG Image' },
				{ src: '/test.svg', alt: 'SVG Image' },
				{ src: '/test.webp', alt: 'WebP Image' }
			];

			for (const testCase of testCases) {
				const { unmount } = render(HeroImage, { props: testCase });
				
				const image = screen.getByRole('img');
				expect.element(image).toHaveAttribute('src', testCase.src);
				expect.element(image).toHaveAttribute('alt', testCase.alt);
				
				unmount();
			}
		});

		it('should handle empty alt text', async () => {
			render(HeroImage, {
				props: { alt: '' }
			});
			
			const image = screen.getByRole('img');
			expect.element(image).toHaveAttribute('alt', '');
		});

		it('should handle special characters in alt text', async () => {
			render(HeroImage, {
				props: { alt: 'Image with "quotes" & <symbols>' }
			});
			
			const image = screen.getByRole('img');
			expect.element(image).toHaveAttribute('alt', 'Image with "quotes" & <symbols>');
		});
	});

	describe('Decorative Elements', () => {
		it('should render decorative icons when enabled', async () => {
			render(HeroImage, {
				props: { showDecorations: true }
			});
			
			const decorations = document.querySelector('.decorative-icons');
			expect.element(decorations).toBeInTheDocument();
		});

		it('should not render decorative icons when disabled', async () => {
			render(HeroImage, {
				props: { showDecorations: false }
			});
			
			const decorations = document.querySelector('.decorative-icons');
			expect.element(decorations).not.toBeInTheDocument();
		});

		it('should toggle decorations based on prop changes', async () => {
			const { rerender } = render(HeroImage, {
				props: { showDecorations: true }
			});
			
			let decorations = document.querySelector('.decorative-icons');
			expect.element(decorations).toBeInTheDocument();
			
			await rerender({ showDecorations: false });
			decorations = document.querySelector('.decorative-icons');
			expect.element(decorations).not.toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('should have proper img role', async () => {
			render(HeroImage);
			
			const image = screen.getByRole('img');
			expect.element(image).toBeInTheDocument();
		});

		it('should have meaningful alt text', async () => {
			render(HeroImage, {
				props: { alt: 'Professional headshot of John Doe' }
			});
			
			const image = screen.getByRole('img');
			expect.element(image).toHaveAttribute('alt', 'Professional headshot of John Doe');
		});

		it('should be keyboard accessible', async () => {
			render(HeroImage);
			
			const image = screen.getByRole('img');
			// Images are not focusable by default, which is correct
			expect.element(image).not.toHaveAttribute('tabindex');
		});
	});

	describe('Props Validation', () => {
		it('should handle undefined src gracefully', async () => {
			render(HeroImage, {
				props: { src: undefined }
			});
			
			const image = screen.getByRole('img');
			expect.element(image).toBeInTheDocument();
		});

		it('should handle boolean showDecorations prop', async () => {
			const { rerender } = render(HeroImage, {
				props: { showDecorations: true }
			});
			
			let decorations = document.querySelector('.decorative-icons');
			expect.element(decorations).toBeInTheDocument();
			
			await rerender({ showDecorations: false });
			decorations = document.querySelector('.decorative-icons');
			expect.element(decorations).not.toBeInTheDocument();
		});
	});
});
