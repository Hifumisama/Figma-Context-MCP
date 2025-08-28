<script>
	/**
	 * Project card component
	 * @typedef {Object} Project
	 * @property {string} id - Unique project ID
	 * @property {string} title - Project title
	 * @property {string} description - Project description
	 * @property {string} date - Project date
	 * @property {string} image - Project image URL
	 * @property {string} [link] - Optional project link
	 * 
	 * @typedef {Object} Props
	 * @property {Project} project - Project data
	 */
	
	/** @type {Project} */
	export let project;
</script>

<article class="project-card">
	<img src={project.image} alt={project.title} class="project-image" />
	<div class="project-info">
		<span class="project-date">{project.date}</span>
		<h3 class="project-title">{project.title}</h3>
		<p class="project-description">{project.description}</p>
		{#if project.link}
			<a href={project.link} class="project-link" target="_blank" rel="noopener noreferrer">
				View Project
			</a>
		{/if}
	</div>
</article>

<style>
	.project-card {
		/* Project card styles based on Figma */
		background-color: transparent;
		transition: transform var(--duration-normal, 0.3s) var(--ease, ease);
	}
	
	.project-card:hover {
		transform: translateY(-5px);
	}
	
	.project-image {
		/* Image styles based on Figma */
		width: 100%;
		height: 400px;
		object-fit: cover;
		border-radius: var(--radius-md, 8px);
		margin-bottom: var(--spacing-md, 20px);
	}
	
	.project-info {
		/* Info container styles */
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs, 8px);
	}
	
	.project-date {
		/* Date styles based on Figma */
		font-family: 'Poppins', sans-serif;
		font-size: var(--font-size-xs, 15px);
		font-weight: var(--font-weight-regular, 400);
		color: var(--color-primary, #03045E);
		line-height: var(--line-height-extra-loose, 2.93);
		display: block;
		margin-bottom: var(--spacing-xs, 8px);
	}
	
	.project-title {
		/* Title styles based on Figma */
		font-family: 'Poppins', sans-serif;
		font-size: var(--font-size-lg, 24px);
		font-weight: var(--font-weight-semibold, 600);
		color: var(--color-primary, #03045E);
		line-height: var(--line-height-loose, 1.83);
		margin: 0 0 var(--spacing-sm, 12px) 0;
	}
	
	.project-description {
		/* Description styles based on Figma */
		font-family: 'Poppins', sans-serif;
		font-size: var(--font-size-sm, 18px);
		font-weight: var(--font-weight-regular, 400);
		color: var(--color-primary, #03045E);
		line-height: var(--line-height-relaxed, 1.78);
		margin: 0;
	}
	
	.project-link {
		/* Link styles */
		font-family: 'Poppins', sans-serif;
		font-size: var(--font-size-sm, 18px);
		font-weight: var(--font-weight-medium, 500);
		color: var(--color-secondary, #474306);
		text-decoration: none;
		margin-top: var(--spacing-sm, 12px);
		transition: color var(--duration-normal, 0.3s) var(--ease, ease);
	}
	
	.project-link:hover {
		color: var(--color-primary, #03045E);
		text-decoration: underline;
	}
	
	.project-link:focus {
		outline: 2px solid var(--color-primary, #03045E);
		outline-offset: 2px;
	}
	
	/* Responsive adjustments */
	@media (max-width: 768px) {
		.project-image {
			height: 300px;
		}
		
		.project-title {
			font-size: var(--font-size-md, 20px);
		}
		
		.project-description {
			font-size: var(--font-size-xs, 15px);
		}
		
		.project-date,
		.project-link {
			font-size: 14px;
		}
	}
	
	@media (max-width: 480px) {
		.project-image {
			height: 250px;
		}
		
		.project-title {
			font-size: var(--font-size-sm, 18px);
		}
		
		.project-description {
			font-size: 14px;
		}
	}
</style>
