<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import About from '$lib/components/About.svelte';
	import Work from '$lib/components/Work.svelte';
	import Contact from '$lib/components/Contact.svelte';
</script>

<svelte:head>
	<title>John Doe - Product Designer Portfolio</title>
	<meta name="description" content="John Doe is a Product Designer based in Netherlands. View his portfolio and contact information." />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;800&display=swap" rel="stylesheet">
</svelte:head>

<Header />

<main>
	<Hero />
	<About />
	<Work />
	<Contact />
</main>

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(html) {
		scroll-behavior: smooth;
	}

	:global(body) {
		font-family: 'Poppins', sans-serif;
		background: #fbf8cc;
		color: #03045e;
		overflow-x: hidden;
	}

	main {
		position: relative;
	}
</style>