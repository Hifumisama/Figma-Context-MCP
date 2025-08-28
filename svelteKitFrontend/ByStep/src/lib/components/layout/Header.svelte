<script>
	import Navigation from '../navigation/Navigation.svelte';
	import SocialLinks from '../navigation/SocialLinks.svelte';
	import Container from './Container.svelte';
	import { DEFAULT_NAVIGATION, DEFAULT_SOCIAL_LINKS } from '$lib/utils/constants.js';
	
	/**
	 * Header component with navigation and social links
	 * @typedef {Object} Props
	 * @property {string} [logo='John Doe'] - Logo text
	 */
	
	/** @type {string} */
	export let logo = 'John Doe';
</script>

<header class="header">
	<Container>
		<div class="header-content">
			<h1 class="logo">{logo}</h1>
			<Navigation items={DEFAULT_NAVIGATION} />
			<SocialLinks links={DEFAULT_SOCIAL_LINKS} />
		</div>
	</Container>
</header>

<style>
	.header {
		padding: var(--spacing-md, 20px) 0;
		background-color: var(--color-background, #FBF8CC);
	}
	
	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.logo {
		font-family: 'Poppins', sans-serif;
		font-size: var(--font-size-lg, 24px);
		font-weight: var(--font-weight-semibold, 600);
		color: var(--color-primary, #03045E);
		margin: 0;
	}
	
	/* Responsive design */
	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			gap: var(--spacing-md, 20px);
		}
		
		.logo {
			font-size: var(--font-size-md, 20px);
		}
	}
</style>
