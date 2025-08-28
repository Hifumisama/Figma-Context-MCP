<script>
	/**
	 * Hero text content component
	 * @typedef {Object} Props
	 * @property {string} greeting - Greeting text
	 * @property {string} title - Main title
	 * @property {string} subtitle - Subtitle text
	 */
	
	/** @type {string} */
	export let greeting = "Hello, I'm John,";
	
	/** @type {string} */
	export let title = "Product Designer";
	
	/** @type {string} */
	export let subtitle = "based in Netherland.";
</script>

<div class="hero-text">
	<h2 class="hero-greeting">{greeting}</h2>
	<h1 class="hero-title">{title}</h1>
	<p class="hero-subtitle">{subtitle}</p>
	
	<!-- ResumeButton component will be added here -->
	<!-- DecorativeBars component will be added here -->
</div>

<style>
	.hero-text {
		/* Hero text container styles */
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md, 20px);
	}
	
	.hero-greeting {
		/* Greeting styles based on Figma */
		font-family: 'Poppins', sans-serif;
		font-size: var(--font-size-xl, 28px);
		font-weight: var(--font-weight-medium, 500);
		line-height: var(--line-height-normal, 1.5);
		color: var(--color-primary, #03045E);
		margin: 0;
	}
	
	.hero-title {
		/* Main title styles based on Figma */
		font-family: 'Poppins', sans-serif;
		font-size: var(--font-size-3xl, 100px);
		font-weight: var(--font-weight-bold, 800);
		line-height: var(--line-height-tight, 1.16);
		color: var(--color-primary, #03045E);
		margin: 0;
		text-rendering: optimizeLegibility;
	}
	
	.hero-subtitle {
		/* Subtitle styles based on Figma */
		font-family: 'Poppins', sans-serif;
		font-size: var(--font-size-xl, 28px);
		font-weight: var(--font-weight-medium, 500);
		line-height: var(--line-height-normal, 1.5);
		color: var(--color-primary, #03045E);
		margin: 0;
	}
	
	/* Responsive adjustments */
	@media (max-width: 768px) {
		.hero-title {
			font-size: 60px;
		}
		
		.hero-greeting,
		.hero-subtitle {
			font-size: var(--font-size-lg, 24px);
		}
	}
	
	@media (max-width: 480px) {
		.hero-title {
			font-size: 48px;
		}
		
		.hero-greeting,
		.hero-subtitle {
			font-size: var(--font-size-md, 20px);
		}
		
		.hero-text {
			text-align: center;
		}
	}
</style>
