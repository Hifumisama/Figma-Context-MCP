<script>
	/**
	 * Social links component
	 * @typedef {Object} SocialLink
	 * @property {string} href - Link URL
	 * @property {string} icon - Icon filename
	 * @property {string} name - Social network name
	 * 
	 * @typedef {Object} Props
	 * @property {SocialLink[]} links - Social media links
	 */
	
	/** @type {SocialLink[]} */
	export let links = [
		{ href: '#', icon: 'medium-icon.svg', name: 'Medium' },
		{ href: '#', icon: 'behance-icon.svg', name: 'Behance' },
		{ href: '#', icon: 'twitter-icon.svg', name: 'Twitter' }
	];
</script>

<div class="social-links">
	{#each links as link}
		<a 
			href={link.href} 
			class="social-link" 
			aria-label={link.name}
			target="_blank"
			rel="noopener noreferrer"
		>
			<img src="/images/{link.icon}" alt={link.name} />
		</a>
	{/each}
</div>

<style>
	.social-links {
		display: flex;
		gap: 15px;
		align-items: center;
	}
	
	.social-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 18px;
		transition: transform var(--duration-normal, 0.3s) var(--ease, ease);
	}
	
	.social-link:hover {
		transform: scale(1.2) rotate(5deg);
	}
	
	.social-link:focus {
		outline: 2px solid var(--color-primary, #03045E);
		outline-offset: 2px;
		border-radius: 2px;
	}
	
	.social-link img {
		width: 100%;
		height: auto;
		filter: brightness(0) saturate(100%) invert(9%) sepia(85%) saturate(4613%) hue-rotate(240deg) brightness(95%) contrast(120%);
		transition: filter var(--duration-normal, 0.3s) var(--ease, ease);
	}
	
	.social-link:hover img {
		filter: brightness(0) saturate(100%) invert(19%) sepia(77%) saturate(1686%) hue-rotate(38deg) brightness(96%) contrast(93%);
	}
	
	/* Responsive design */
	@media (max-width: 768px) {
		.social-links {
			gap: 12px;
		}
		
		.social-link {
			width: 22px;
			height: 16px;
		}
	}
	
	@media (max-width: 480px) {
		.social-links {
			gap: 10px;
		}
		
		.social-link {
			width: 20px;
			height: 14px;
		}
	}
</style>
