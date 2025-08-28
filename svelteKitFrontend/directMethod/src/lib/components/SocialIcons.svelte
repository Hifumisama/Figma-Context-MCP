<script lang="ts">
	import mediumIcon from '$lib/assets/medium-icon.svg';
	import behanceIcon from '$lib/assets/behance-icon.svg';
	import twitterIcon from '$lib/assets/twitter-icon.svg';
</script>

<div class="social-icons">
	<a href="https://medium.com/johndoe" class="social-link" aria-label="Medium">
		<img src={mediumIcon} alt="Medium" />
	</a>
	<a href="https://behance.com/johndoe" class="social-link" aria-label="Behance">
		<img src={behanceIcon} alt="Behance" />
	</a>
	<a href="https://twitter.com/johndoe" class="social-link" aria-label="Twitter">
		<img src={twitterIcon} alt="Twitter" />
	</a>
</div>

<style>
	.social-icons {
		display: flex;
		gap: 1.5rem;
		align-items: center;
	}

	.social-link {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.3s ease;
	}

	.social-link:hover {
		transform: scale(1.1);
	}

	.social-link img {
		width: 24px;
		height: auto;
		filter: brightness(0) saturate(100%) invert(9%) sepia(69%) saturate(7482%) hue-rotate(228deg) brightness(92%) contrast(117%);
	}

	@media (max-width: 768px) {
		.social-icons {
			gap: 1rem;
		}
		
		.social-link img {
			width: 20px;
		}
	}
</style>

