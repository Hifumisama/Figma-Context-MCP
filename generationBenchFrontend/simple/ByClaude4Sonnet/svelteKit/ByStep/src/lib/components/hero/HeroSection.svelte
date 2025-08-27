<script>
	/**
	 * Main hero section component
	 */
	
	// Hero sub-components will be imported here
</script>

<section class="hero">
	<div class="hero-content">
		<div class="hero-text">
			<!-- HeroText component will be added here -->
		</div>
		<div class="hero-image">
			<!-- HeroImage component will be added here -->
		</div>
	</div>
</section>

<style>
	.hero {
		/* Hero section styles will be implemented */
		padding: 80px 0 120px;
	}
	
	.hero-content {
		/* Hero content layout will be implemented */
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 80px;
		align-items: center;
	}
	
	.hero-text {
		/* Hero text container */
	}
	
	.hero-image {
		/* Hero image container */
	}
	
	@media (max-width: 768px) {
		.hero-content {
			grid-template-columns: 1fr;
			gap: 40px;
			text-align: center;
		}
	}
</style>
