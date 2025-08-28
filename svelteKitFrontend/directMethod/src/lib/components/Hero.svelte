<script lang="ts">
	import Button from './Button.svelte';
	import profileImage from '$lib/assets/profile-image.png';
</script>

<section id="home" class="hero">
	<div class="container">
		<div class="hero-content">
			<div class="hero-text">
				<p class="greeting">Hello, I'm John,</p>
				<h1 class="title">Product Designer</h1>
				<p class="location">based in Netherland.</p>
				
				<div class="decorative-bars">
					<div class="bar"></div>
					<div class="bar"></div>
					<div class="bar"></div>
					<div class="bar"></div>
					<div class="bar"></div>
				</div>
				
				<Button variant="primary" href="#contact">Resume</Button>
			</div>
			
			<div class="hero-image">
				<div class="image-container">
					<img src={profileImage} alt="John Doe - Product Designer" />
					<div class="decorative-elements">
						<div class="plus-icons">
							<div class="plus-icon">
								<div class="plus-horizontal"></div>
								<div class="plus-vertical"></div>
							</div>
							<div class="plus-icon">
								<div class="plus-horizontal"></div>
								<div class="plus-vertical"></div>
							</div>
							<div class="plus-icon">
								<div class="plus-horizontal"></div>
								<div class="plus-vertical"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.hero {
		min-height: 100vh;
		background: #fbf8cc;
		padding: 6rem 0 4rem 0;
		display: flex;
		align-items: center;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
		width: 100%;
	}

	.hero-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: center;
	}

	.hero-text {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.greeting {
		font-family: 'Poppins', sans-serif;
		font-weight: 500;
		font-size: 1.75rem;
		color: #03045e;
		margin: 0;
		line-height: 1.5;
	}

	.title {
		font-family: 'Poppins', sans-serif;
		font-weight: 800;
		font-size: 6.25rem;
		color: #03045e;
		margin: 0;
		line-height: 1.16;
	}

	.location {
		font-family: 'Poppins', sans-serif;
		font-weight: 500;
		font-size: 1.75rem;
		color: #03045e;
		margin: 0 0 2rem 0;
		line-height: 1.5;
	}

	.decorative-bars {
		display: flex;
		gap: 0.5rem;
		margin: 2rem 0;
	}

	.bar {
		width: 16px;
		height: 29px;
		background: #474306;
		border-radius: 6px;
	}

	.hero-image {
		display: flex;
		justify-content: center;
		position: relative;
	}

	.image-container {
		position: relative;
		max-width: 400px;
		width: 100%;
	}

	.image-container img {
		width: 100%;
		height: auto;
		border-radius: 12px;
		border: 1px solid #474306;
	}

	.decorative-elements {
		position: absolute;
		top: -20px;
		right: -20px;
	}

	.plus-icons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.plus-icon {
		position: relative;
		width: 24px;
		height: 24px;
		background: rgba(251, 248, 204, 0.9);
		border-radius: 6px;
		border: 1px solid #474306;
	}

	.plus-horizontal,
	.plus-vertical {
		position: absolute;
		background: #474306;
		border-radius: 6px;
	}

	.plus-horizontal {
		width: 24px;
		height: 6px;
		top: 50%;
		left: 0;
		transform: translateY(-50%);
	}

	.plus-vertical {
		width: 6px;
		height: 24px;
		left: 50%;
		top: 0;
		transform: translateX(-50%);
	}

	@media (max-width: 1024px) {
		.title {
			font-size: 5rem;
		}
	}

	@media (max-width: 768px) {
		.hero {
			padding: 5rem 0 3rem 0;
		}

		.container {
			padding: 0 1rem;
		}

		.hero-content {
			grid-template-columns: 1fr;
			gap: 3rem;
			text-align: center;
		}

		.greeting,
		.location {
			font-size: 1.5rem;
		}

		.title {
			font-size: 3.5rem;
		}

		.decorative-bars {
			justify-content: center;
		}

		.decorative-elements {
			top: -15px;
			right: -15px;
		}

		.plus-icon {
			width: 20px;
			height: 20px;
		}

		.plus-horizontal {
			width: 20px;
			height: 5px;
		}

		.plus-vertical {
			width: 5px;
			height: 20px;
		}
	}
</style>

