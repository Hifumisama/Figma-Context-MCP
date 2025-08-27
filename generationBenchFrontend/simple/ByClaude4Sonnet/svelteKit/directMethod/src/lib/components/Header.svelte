<script lang="ts">
	import SocialIcons from './SocialIcons.svelte';
</script>

<header class="header">
	<div class="container">
		<div class="nav-brand">
			<h1 class="name">John Doe</h1>
		</div>
		
		<nav class="navigation">
			<a href="#home" class="nav-link">Home</a>
			<a href="#about" class="nav-link">About</a>
			<a href="#work" class="nav-link">Work</a>
		</nav>
		
		<SocialIcons />
	</div>
</header>

<style>
	.header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		background: #fbf8cc;
		z-index: 1000;
		padding: 1rem 0;
		border-bottom: 1px solid #03045e;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.name {
		font-family: 'Poppins', sans-serif;
		font-weight: 600;
		font-size: 1.5rem;
		color: #03045e;
		margin: 0;
	}

	.navigation {
		display: flex;
		gap: 2rem;
	}

	.nav-link {
		font-family: 'Poppins', sans-serif;
		font-weight: 400;
		font-size: 1.125rem;
		color: #03045e;
		text-decoration: none;
		transition: color 0.3s ease;
	}

	.nav-link:hover {
		color: #474306;
	}

	@media (max-width: 768px) {
		.container {
			padding: 0 1rem;
		}
		
		.navigation {
			gap: 1rem;
		}
		
		.nav-link {
			font-size: 1rem;
		}
	}
</style>
