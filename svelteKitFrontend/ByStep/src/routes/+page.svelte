<script>
	import Header from '$lib/components/layout/Header.svelte';
	import Container from '$lib/components/layout/Container.svelte';
	import HeroSection from '$lib/components/hero/HeroSection.svelte';
	import HeroText from '$lib/components/hero/HeroText.svelte';
	import HeroImage from '$lib/components/hero/HeroImage.svelte';
	import ResumeButton from '$lib/components/hero/ResumeButton.svelte';
	import SectionTitle from '$lib/components/ui/SectionTitle.svelte';
	import AboutSection from '$lib/components/about/AboutSection.svelte';
	import ProjectCard from '$lib/components/work/ProjectCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { 
		DEFAULT_CONTENT, 
		DEFAULT_TIMELINE_ITEMS, 
		DEFAULT_PROJECTS, 
		DEFAULT_CONTACT_INFO 
	} from '$lib/utils/constants.js';
</script>

<svelte:head>
	<title>John Doe - Portfolio</title>
	<meta name="description" content="John Doe's portfolio showcasing product design work and experience" />
</svelte:head>

<!-- Header -->
<Header />

<main>
	<!-- Hero Section -->
	<section id="home" class="hero">
		<Container>
			<div class="hero-content">
				<div class="hero-text-container">
					<HeroText 
						greeting={DEFAULT_CONTENT.HERO.greeting}
						title={DEFAULT_CONTENT.HERO.title}
						subtitle={DEFAULT_CONTENT.HERO.subtitle}
					/>
					<ResumeButton />
					<div class="decorative-bars">
						{#each Array(5) as _, i}
							<div class="bar" style="animation-delay: {i * 0.1}s"></div>
						{/each}
					</div>
				</div>
				<div class="hero-image-container">
					<HeroImage 
						src="/images/profile-image.png"
						alt="John Doe Profile"
						showDecorations={true}
					/>
				</div>
			</div>
		</Container>
	</section>

	<!-- About Section -->
	<section id="about" class="about">
		<Container>
			<SectionTitle text={DEFAULT_CONTENT.ABOUT.title} level={2} />
			<p class="section-description">{DEFAULT_CONTENT.ABOUT.description}</p>
			
			<div class="timeline">
				{#each DEFAULT_TIMELINE_ITEMS as item, index}
					<div class="timeline-item">
						<div class="timeline-dot"></div>
						<div class="timeline-content">
							<span class="timeline-period">{item.period}</span>
							<p class="timeline-description">{item.description}</p>
						</div>
					</div>
				{/each}
			</div>
		</Container>
	</section>

	<!-- Work Section -->
	<section id="work" class="work">
		<Container>
			<SectionTitle text={DEFAULT_CONTENT.WORK.title} level={2} />
			<p class="section-description">{DEFAULT_CONTENT.WORK.description}</p>
			
			<div class="projects-grid">
				{#each DEFAULT_PROJECTS as project}
					<ProjectCard {project} />
				{/each}
			</div>
		</Container>
	</section>

	<!-- Contact Section -->
	<section id="contact" class="contact">
		<Container>
			<div class="contact-content">
				<div class="contact-image">
					<img src="/images/contact-image.png" alt="Contact" />
				</div>
				<div class="contact-info">
					<SectionTitle text={DEFAULT_CONTENT.CONTACT.title} level={2} />
					<p class="contact-description">{DEFAULT_CONTENT.CONTACT.description}</p>
					<div class="contact-details">
						{#each DEFAULT_CONTACT_INFO as contact}
							<a href={contact.href} class="contact-link">
								{contact.label}
							</a>
						{/each}
					</div>
				</div>
			</div>
		</Container>
	</section>
</main>

<style>
	/* Hero Section */
	.hero {
		padding: var(--spacing-2xl, 80px) 0 var(--spacing-3xl, 120px);
		background-color: var(--color-background, #FBF8CC);
	}
	
	.hero-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-2xl, 80px);
		align-items: center;
	}
	
	.hero-text-container {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg, 40px);
	}
	
	.decorative-bars {
		display: flex;
		gap: 5px;
	}
	
	.bar {
		width: 16px;
		height: 30px;
		background-color: var(--color-secondary, #474306);
		border-radius: 3px;
		transform: scaleY(0);
		transform-origin: bottom;
		animation: scaleUp 0.5s ease forwards;
	}
	
	@keyframes scaleUp {
		to {
			transform: scaleY(1);
		}
	}
	
	/* About Section */
	.about {
		padding: var(--spacing-2xl, 80px) 0;
		background-color: var(--color-background, #FBF8CC);
	}
	
	.section-description {
		font-family: 'Poppins', sans-serif;
		font-size: var(--font-size-lg, 24px);
		font-weight: var(--font-weight-regular, 400);
		line-height: var(--line-height-loose, 1.83);
		color: var(--color-primary, #03045E);
		max-width: 900px;
		margin-bottom: var(--spacing-xl, 60px);
	}
	
	.timeline {
		position: relative;
		max-width: 900px;
		margin-left: 60px;
	}
	
	.timeline-item {
		position: relative;
		padding-left: 40px;
		margin-bottom: var(--spacing-xl, 60px);
	}
	
	.timeline-dot {
		position: absolute;
		left: -6px;
		top: 20px;
		width: 13px;
		height: 13px;
		background-color: var(--color-primary, #03045E);
		border-radius: 50%;
	}
	
	.timeline-period {
		font-family: 'Poppins', sans-serif;
		font-size: var(--font-size-lg, 24px);
		font-weight: var(--font-weight-semibold, 600);
		color: var(--color-primary, #03045E);
		display: block;
		margin-bottom: 10px;
	}
	
	.timeline-description {
		font-family: 'Poppins', sans-serif;
		font-size: var(--font-size-lg, 24px);
		font-weight: var(--font-weight-regular, 400);
		line-height: var(--line-height-loose, 1.83);
		color: var(--color-primary, #03045E);
		margin: 0;
	}
	
	/* Work Section */
	.work {
		padding: var(--spacing-2xl, 80px) 0;
		background-color: var(--color-background, #FBF8CC);
	}
	
	.projects-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-xl, 60px);
		margin-top: var(--spacing-xl, 60px);
	}
	
	/* Contact Section */
	.contact {
		padding: var(--spacing-2xl, 80px) 0;
		background-color: var(--color-background, #FBF8CC);
	}
	
	.contact-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-2xl, 80px);
		align-items: center;
	}
	
	.contact-image img {
		width: 100%;
		height: 314px;
		object-fit: cover;
		border-radius: var(--radius-md, 8px);
	}
	
	.contact-description {
		font-family: 'Poppins', sans-serif;
		font-size: var(--font-size-lg, 24px);
		font-weight: var(--font-weight-regular, 400);
		line-height: var(--line-height-loose, 1.83);
		color: var(--color-primary, #03045E);
		margin-bottom: var(--spacing-lg, 40px);
	}
	
	.contact-details {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	
	.contact-link {
		font-family: 'Poppins', sans-serif;
		font-size: var(--font-size-lg, 24px);
		font-weight: var(--font-weight-regular, 400);
		color: var(--color-primary, #03045E);
		text-decoration: none;
		line-height: var(--line-height-loose, 1.83);
		transition: color var(--duration-normal, 0.3s) var(--ease, ease);
	}
	
	.contact-link:hover {
		color: var(--color-secondary, #474306);
	}
	
	/* Responsive Design */
	@media (max-width: 768px) {
		.hero-content {
			grid-template-columns: 1fr;
			gap: var(--spacing-lg, 40px);
			text-align: center;
		}
		
		.projects-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-lg, 40px);
		}
		
		.contact-content {
			grid-template-columns: 1fr;
			gap: var(--spacing-lg, 40px);
		}
		
		.timeline {
			margin-left: 30px;
		}
	}
	
	@media (max-width: 480px) {
		.hero,
		.about,
		.work,
		.contact {
			padding: var(--spacing-xl, 60px) 0;
		}
		
		.hero-text-container {
			gap: var(--spacing-md, 20px);
		}
		
		.section-description,
		.contact-description,
		.timeline-description {
			font-size: var(--font-size-md, 20px);
		}
		
		.timeline-period {
			font-size: var(--font-size-md, 20px);
		}
		
		.contact-link {
			font-size: var(--font-size-md, 20px);
		}
	}
</style>
