<script>
	/**
	 * Hero image component with decorative elements
	 * @typedef {Object} Props
	 * @property {string} src - Image source URL
	 * @property {string} alt - Alt text for accessibility
	 * @property {boolean} [showDecorations=true] - Show decorative icons
	 */
	
	/** @type {string} */
	export let src = '/images/profile-image.png';
	
	/** @type {string} */
	export let alt = 'John Doe Profile';
	
	/** @type {boolean} */
	export let showDecorations = true;
</script>

<div class="hero-image">
	<img {src} {alt} />
	
	{#if showDecorations}
		<div class="decorative-icons">
			<div class="icon-group">
				<div class="plus-icon"></div>
				<div class="plus-icon"></div>
				<div class="plus-icon"></div>
			</div>
		</div>
	{/if}
</div>

<style>
	.hero-image {
		/* Hero image container styles */
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.hero-image img {
		/* Image styles based on Figma */
		width: 100%;
		max-width: 493px;
		height: auto;
		border-radius: var(--radius-lg, 10px);
		object-fit: cover;
	}
	
	.decorative-icons {
		/* Decorative elements styles */
		position: absolute;
		top: -20px;
		right: -20px;
		z-index: 1;
	}
	
	.icon-group {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		gap: 8px;
		width: 50px;
		height: 56px;
	}
	
	.plus-icon {
		width: 24px;
		height: 24px;
		background-color: var(--color-secondary, #474306);
		position: relative;
		border-radius: var(--radius-sm, 6px);
		opacity: 0;
		animation: fadeInScale 0.5s ease forwards;
	}
	
	.plus-icon:nth-child(1) { animation-delay: 0.1s; }
	.plus-icon:nth-child(2) { animation-delay: 0.2s; }
	.plus-icon:nth-child(3) { animation-delay: 0.3s; }
	
	.plus-icon::before,
	.plus-icon::after {
		content: '';
		position: absolute;
		background-color: var(--color-secondary, #474306);
		border-radius: var(--radius-sm, 6px);
	}
	
	.plus-icon::before {
		width: 6px;
		height: 24px;
		left: 9px;
		top: 0;
	}
	
	.plus-icon::after {
		width: 24px;
		height: 6px;
		left: 0;
		top: 9px;
	}
	
	/* Animations */
	@keyframes fadeInScale {
		from {
			opacity: 0;
			transform: scale(0.5);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	
	/* Responsive adjustments */
	@media (max-width: 768px) {
		.hero-image img {
			max-width: 400px;
		}
		
		.decorative-icons {
			top: -10px;
			right: -10px;
		}
		
		.icon-group {
			width: 40px;
			height: 46px;
		}
		
		.plus-icon {
			width: 20px;
			height: 20px;
		}
		
		.plus-icon::before {
			width: 5px;
			height: 20px;
			left: 7.5px;
		}
		
		.plus-icon::after {
			width: 20px;
			height: 5px;
			top: 7.5px;
		}
	}
	
	@media (max-width: 480px) {
		.hero-image img {
			max-width: 300px;
		}
		
		.decorative-icons {
			display: none;
		}
	}
</style>
