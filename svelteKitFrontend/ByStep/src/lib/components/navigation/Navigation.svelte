<script>
	/**
	 * Main navigation component
	 * @typedef {Object} NavItem
	 * @property {string} href - Link href
	 * @property {string} label - Link text
	 * 
	 * @typedef {Object} Props
	 * @property {NavItem[]} items - Navigation items
	 */
	
	/** @type {NavItem[]} */
	export let items = [
		{ href: '#home', label: 'Home' },
		{ href: '#about', label: 'About' },
		{ href: '#work', label: 'Work' }
	];
	
	function handleNavClick(href) {
		const targetId = href.replace('#', '');
		const targetElement = document.getElementById(targetId);
		if (targetElement) {
			targetElement.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

<nav class="navigation">
	<ul class="nav-list">
		{#each items as item}
			<li class="nav-item">
				<a 
					href={item.href} 
					class="nav-link"
					on:click|preventDefault={() => handleNavClick(item.href)}
				>
					{item.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.navigation {
		flex: 1;
		display: flex;
		justify-content: center;
	}
	
	.nav-list {
		display: flex;
		list-style: none;
		margin: 0;
		padding: 0;
		gap: 60px;
	}
	
	.nav-item {
		/* Individual nav item */
	}
	
	.nav-link {
		font-family: 'Poppins', sans-serif;
		font-size: var(--font-size-sm, 18px);
		font-weight: var(--font-weight-regular, 400);
		color: var(--color-primary, #03045E);
		text-decoration: none;
		transition: color var(--duration-normal, 0.3s) var(--ease, ease);
		position: relative;
	}
	
	.nav-link:hover {
		color: var(--color-secondary, #474306);
	}
	
	.nav-link:focus {
		outline: 2px solid var(--color-primary, #03045E);
		outline-offset: 2px;
	}
	
	/* Active state styling */
	.nav-link.active {
		color: var(--color-secondary, #474306);
		font-weight: var(--font-weight-semibold, 600);
	}
	
	/* Responsive design */
	@media (max-width: 768px) {
		.navigation {
			justify-content: center;
		}
		
		.nav-list {
			gap: 30px;
		}
		
		.nav-link {
			font-size: var(--font-size-xs, 15px);
		}
	}
	
	@media (max-width: 480px) {
		.nav-list {
			gap: 20px;
		}
		
		.nav-link {
			font-size: 14px;
		}
	}
</style>
