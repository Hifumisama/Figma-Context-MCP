import { describe, it, expect } from 'vitest';
import { render, screen } from '@vitest/browser/svelte';
import ProjectCard from './ProjectCard.svelte';

describe('ProjectCard Component', () => {
	const mockProject = {
		id: 'project-1',
		title: 'Awesome Project',
		description: 'This is an amazing project that showcases modern web development techniques.',
		date: 'November 24, 2019',
		image: '/images/project1.png',
		link: 'https://example.com/project'
	};

	const mockProjectWithoutLink = {
		id: 'project-2',
		title: 'Simple Project',
		description: 'A project without external link.',
		date: 'January 15, 2020',
		image: '/images/project2.png'
	};

	describe('Rendering', () => {
		it('should render project with all information', async () => {
			render(ProjectCard, { props: { project: mockProject } });
			
			// Check article container
			const article = screen.getByRole('article');
			expect.element(article).toBeInTheDocument();
			expect.element(article).toHaveClass('project-card');
			
			// Check image
			const image = screen.getByRole('img');
			expect.element(image).toHaveAttribute('src', mockProject.image);
			expect.element(image).toHaveAttribute('alt', mockProject.title);
			expect.element(image).toHaveClass('project-image');
			
			// Check date
			const date = screen.getByText(mockProject.date);
			expect.element(date).toBeInTheDocument();
			expect.element(date).toHaveClass('project-date');
			
			// Check title
			const title = screen.getByRole('heading', { level: 3 });
			expect.element(title).toHaveTextContent(mockProject.title);
			expect.element(title).toHaveClass('project-title');
			
			// Check description
			const description = screen.getByText(mockProject.description);
			expect.element(description).toBeInTheDocument();
			expect.element(description).toHaveClass('project-description');
			
			// Check link
			const link = screen.getByText('View Project');
			expect.element(link).toBeInTheDocument();
			expect.element(link).toHaveAttribute('href', mockProject.link);
			expect.element(link).toHaveClass('project-link');
		});

		it('should render project without link', async () => {
			render(ProjectCard, { props: { project: mockProjectWithoutLink } });
			
			// Should render all other elements
			expect.element(screen.getByRole('article')).toBeInTheDocument();
			expect.element(screen.getByRole('img')).toBeInTheDocument();
			expect.element(screen.getByText(mockProjectWithoutLink.title)).toBeInTheDocument();
			
			// Should not render link
			const link = document.querySelector('.project-link');
			expect.element(link).not.toBeInTheDocument();
		});

		it('should handle empty project data gracefully', async () => {
			const emptyProject = {
				id: '',
				title: '',
				description: '',
				date: '',
				image: ''
			};
			
			render(ProjectCard, { props: { project: emptyProject } });
			
			const article = screen.getByRole('article');
			expect.element(article).toBeInTheDocument();
		});
	});

	describe('HTML Structure', () => {
		it('should have correct HTML structure', async () => {
			render(ProjectCard, { props: { project: mockProject } });
			
			const article = document.querySelector('article.project-card');
			const image = article.querySelector('img.project-image');
			const info = article.querySelector('.project-info');
			const date = info.querySelector('.project-date');
			const title = info.querySelector('h3.project-title');
			const description = info.querySelector('p.project-description');
			const link = info.querySelector('a.project-link');
			
			expect.element(article).toBeInTheDocument();
			expect.element(image).toBeInTheDocument();
			expect.element(info).toBeInTheDocument();
			expect.element(date).toBeInTheDocument();
			expect.element(title).toBeInTheDocument();
			expect.element(description).toBeInTheDocument();
			expect.element(link).toBeInTheDocument();
		});

		it('should use semantic HTML elements', async () => {
			render(ProjectCard, { props: { project: mockProject } });
			
			// Should use article for the card
			const article = screen.getByRole('article');
			expect.element(article).toBeInTheDocument();
			
			// Should use h3 for the title
			const heading = screen.getByRole('heading', { level: 3 });
			expect.element(heading).toBeInTheDocument();
			
			// Should use img for the image
			const image = screen.getByRole('img');
			expect.element(image).toBeInTheDocument();
			
			// Should use link for project link if present
			if (mockProject.link) {
				const link = screen.getByRole('link');
				expect.element(link).toBeInTheDocument();
			}
		});
	});

	describe('CSS Classes', () => {
		it('should apply correct CSS classes', async () => {
			render(ProjectCard, { props: { project: mockProject } });
			
			expect.element(document.querySelector('article')).toHaveClass('project-card');
			expect.element(document.querySelector('img')).toHaveClass('project-image');
			expect.element(document.querySelector('.project-info')).toBeInTheDocument();
			expect.element(document.querySelector('.project-date')).toBeInTheDocument();
			expect.element(document.querySelector('.project-title')).toBeInTheDocument();
			expect.element(document.querySelector('.project-description')).toBeInTheDocument();
		});
	});

	describe('Image Handling', () => {
		it('should handle different image formats', async () => {
			const projectWithSVG = {
				...mockProject,
				image: '/images/project.svg'
			};
			
			render(ProjectCard, { props: { project: projectWithSVG } });
			
			const image = screen.getByRole('img');
			expect.element(image).toHaveAttribute('src', '/images/project.svg');
		});

		it('should use title as alt text', async () => {
			render(ProjectCard, { props: { project: mockProject } });
			
			const image = screen.getByRole('img');
			expect.element(image).toHaveAttribute('alt', mockProject.title);
		});
	});

	describe('Link Behavior', () => {
		it('should render external link correctly', async () => {
			render(ProjectCard, { props: { project: mockProject } });
			
			const link = screen.getByRole('link');
			expect.element(link).toHaveAttribute('href', mockProject.link);
			expect.element(link).toHaveTextContent('View Project');
		});

		it('should not render link when not provided', async () => {
			render(ProjectCard, { props: { project: mockProjectWithoutLink } });
			
			const link = document.querySelector('a.project-link');
			expect.element(link).not.toBeInTheDocument();
		});

		it('should handle empty link gracefully', async () => {
			const projectWithEmptyLink = {
				...mockProject,
				link: ''
			};
			
			render(ProjectCard, { props: { project: projectWithEmptyLink } });
			
			const link = document.querySelector('a.project-link');
			expect.element(link).not.toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('should have proper heading hierarchy', async () => {
			render(ProjectCard, { props: { project: mockProject } });
			
			const heading = screen.getByRole('heading', { level: 3 });
			expect.element(heading).toBeInTheDocument();
		});

		it('should have meaningful alt text for images', async () => {
			render(ProjectCard, { props: { project: mockProject } });
			
			const image = screen.getByRole('img');
			expect.element(image).toHaveAttribute('alt', mockProject.title);
		});

		it('should have accessible link text', async () => {
			render(ProjectCard, { props: { project: mockProject } });
			
			const link = screen.getByRole('link');
			expect.element(link).toHaveTextContent('View Project');
		});
	});

	describe('Props Validation', () => {
		it('should handle missing project properties', async () => {
			const incompleteProject = {
				id: 'test',
				title: 'Test Project'
				// Missing other properties
			};
			
			render(ProjectCard, { props: { project: incompleteProject } });
			
			const article = screen.getByRole('article');
			expect.element(article).toBeInTheDocument();
		});

		it('should handle special characters in text', async () => {
			const projectWithSpecialChars = {
				...mockProject,
				title: 'Project with "Quotes" & <HTML>',
				description: 'Description with special chars: àáâãäå & çčćĉ'
			};
			
			render(ProjectCard, { props: { project: projectWithSpecialChars } });
			
			expect.element(screen.getByText('Project with "Quotes" & <HTML>')).toBeInTheDocument();
			expect.element(screen.getByText('Description with special chars: àáâãäå & çčćĉ')).toBeInTheDocument();
		});
	});
});
