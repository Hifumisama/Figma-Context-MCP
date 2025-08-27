import { describe, it, expect } from 'vitest';
import { render, screen } from '@vitest/browser/svelte';
import Button from './Button.svelte';

describe('Button Component', () => {
	describe('Rendering', () => {
		it('should render button with default props', async () => {
			render(Button, { children: 'Click me' });
			
			const button = screen.getByRole('button');
			expect.element(button).toBeInTheDocument();
			expect.element(button).toHaveTextContent('Click me');
			expect.element(button).toHaveClass('btn', 'btn-primary', 'btn-medium');
		});

		it('should render as link when href is provided', async () => {
			render(Button, { 
				props: { href: '/test' },
				children: 'Link button'
			});
			
			const link = screen.getByRole('link');
			expect.element(link).toBeInTheDocument();
			expect.element(link).toHaveAttribute('href', '/test');
			expect.element(link).toHaveTextContent('Link button');
		});

		it('should render different variants correctly', async () => {
			const { rerender } = render(Button, { 
				props: { variant: 'secondary' },
				children: 'Secondary'
			});
			
			let button = screen.getByRole('button');
			expect.element(button).toHaveClass('btn-secondary');
			
			await rerender({ variant: 'outline' });
			button = screen.getByRole('button');
			expect.element(button).toHaveClass('btn-outline');
		});

		it('should render different sizes correctly', async () => {
			const { rerender } = render(Button, { 
				props: { size: 'small' },
				children: 'Small'
			});
			
			let button = screen.getByRole('button');
			expect.element(button).toHaveClass('btn-small');
			
			await rerender({ size: 'large' });
			button = screen.getByRole('button');
			expect.element(button).toHaveClass('btn-large');
		});
	});

	describe('States', () => {
		it('should be disabled when disabled prop is true', async () => {
			render(Button, { 
				props: { disabled: true },
				children: 'Disabled'
			});
			
			const button = screen.getByRole('button');
			expect.element(button).toBeDisabled();
		});

		it('should show loading state', async () => {
			render(Button, { 
				props: { loading: true },
				children: 'Loading'
			});
			
			const button = screen.getByRole('button');
			expect.element(button).toHaveClass('btn-loading');
		});

		it('should have correct type attribute', async () => {
			const { rerender } = render(Button, { 
				props: { type: 'submit' },
				children: 'Submit'
			});
			
			let button = screen.getByRole('button');
			expect.element(button).toHaveAttribute('type', 'submit');
			
			await rerender({ type: 'reset' });
			button = screen.getByRole('button');
			expect.element(button).toHaveAttribute('type', 'reset');
		});
	});

	describe('Interactions', () => {
		it('should trigger click event', async () => {
			let clicked = false;
			
			render(Button, { 
				props: {
					onclick: () => { clicked = true; }
				},
				children: 'Click me'
			});
			
			const button = screen.getByRole('button');
			await button.click();
			
			expect(clicked).toBe(true);
		});

		it('should not trigger click when disabled', async () => {
			let clicked = false;
			
			render(Button, { 
				props: {
					disabled: true,
					onclick: () => { clicked = true; }
				},
				children: 'Disabled'
			});
			
			const button = screen.getByRole('button');
			await button.click();
			
			expect(clicked).toBe(false);
		});
	});

	describe('Accessibility', () => {
		it('should have correct role', async () => {
			render(Button, { children: 'Button' });
			
			const button = screen.getByRole('button');
			expect.element(button).toBeInTheDocument();
		});

		it('should be focusable when not disabled', async () => {
			render(Button, { children: 'Focusable' });
			
			const button = screen.getByRole('button');
			await button.focus();
			
			expect.element(button).toBeFocused();
		});

		it('should not be focusable when disabled', async () => {
			render(Button, { 
				props: { disabled: true },
				children: 'Not focusable'
			});
			
			const button = screen.getByRole('button');
			expect.element(button).toBeDisabled();
		});
	});
});
