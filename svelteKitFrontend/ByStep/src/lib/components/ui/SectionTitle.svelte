<script>
	/**
	 * Section title component with consistent styling
	 * @typedef {Object} Props
	 * @property {string} text - Title text
	 * @property {1|2|3|4|5|6} [level=1] - Heading level for accessibility
	 */
	
	/** @type {string} */
	export let text = '';
	
	/** @type {1|2|3|4|5|6} */
	export let level = 1;
	
	// Ensure level is within valid range
	$: validLevel = level >= 1 && level <= 6 ? level : 6;
</script>

{#if validLevel === 1}
	<h1 class="section-title">{text}</h1>
{:else if validLevel === 2}
	<h2 class="section-title">{text}</h2>
{:else if validLevel === 3}
	<h3 class="section-title">{text}</h3>
{:else if validLevel === 4}
	<h4 class="section-title">{text}</h4>
{:else if validLevel === 5}
	<h5 class="section-title">{text}</h5>
{:else}
	<h6 class="section-title">{text}</h6>
{/if}

<style>
	.section-title {
		/* Section title styles based on Figma */
		font-family: 'Poppins', sans-serif;
		font-size: var(--font-size-3xl, 100px);
		font-weight: var(--font-weight-bold, 800);
		line-height: var(--line-height-tight, 1.16);
		color: var(--color-accent, #F7F197);
		margin: 0 0 var(--spacing-lg, 40px) 0;
		text-rendering: optimizeLegibility;
	}
	
	/* Responsive adjustments */
	@media (max-width: 768px) {
		.section-title {
			font-size: 60px;
		}
	}
	
	@media (max-width: 480px) {
		.section-title {
			font-size: 48px;
			margin-bottom: var(--spacing-md, 20px);
		}
	}
</style>
