<script lang="ts">
	import contactImage from '$lib/assets/contact-image.png';

	interface ContactInfo {
		type: string;
		value: string;
		link?: string;
	}

	const contactData: ContactInfo[] = [
		{
			type: "email",
			value: "johndoe@mail.com",
			link: "mailto:johndoe@mail.com"
		},
		{
			type: "twitter",
			value: "twitter.com/johndoe",
			link: "https://twitter.com/johndoe"
		},
		{
			type: "behance",
			value: "behance.com/johndoe",
			link: "https://behance.com/johndoe"
		}
	];
</script>

<section id="contact" class="contact">
	<div class="container">
		<div class="contact-content">
			<div class="contact-image">
				<img src={contactImage} alt="Contact" />
			</div>
			
			<div class="contact-info">
				<h2 class="section-title">contact.</h2>
				
				<p class="description">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. 
					Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.
				</p>
				
				<div class="contact-list">
					{#each contactData as contact}
						<div class="contact-item">
							{#if contact.link}
								<a href={contact.link} class="contact-link">
									{contact.value}
								</a>
							{:else}
								<span class="contact-value">{contact.value}</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.contact {
		background: #fbf8cc;
		padding: 6rem 0;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.contact-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: start;
	}

	.contact-image {
		width: 100%;
		height: 400px;
		overflow: hidden;
		border-radius: 8px;
	}

	.contact-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 8px;
	}

	.contact-info {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.section-title {
		font-family: 'Poppins', sans-serif;
		font-weight: 800;
		font-size: 6.25rem;
		color: #f7f197;
		margin: 0;
		line-height: 1.16;
	}

	.description {
		font-family: 'Poppins', sans-serif;
		font-weight: 400;
		font-size: 1.5rem;
		color: #03045e;
		line-height: 1.833;
		margin: 0;
		max-width: 640px;
	}

	.contact-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.contact-item {
		display: flex;
		align-items: center;
	}

	.contact-link,
	.contact-value {
		font-family: 'Poppins', sans-serif;
		font-weight: 400;
		font-size: 1.5rem;
		color: #03045e;
		line-height: 1.833;
		text-decoration: none;
		transition: color 0.3s ease;
	}

	.contact-link:hover {
		color: #474306;
		text-decoration: underline;
	}

	@media (max-width: 1024px) {
		.section-title {
			font-size: 5rem;
		}
	}

	@media (max-width: 768px) {
		.contact {
			padding: 4rem 0;
		}

		.container {
			padding: 0 1rem;
		}

		.contact-content {
			grid-template-columns: 1fr;
			gap: 3rem;
		}

		.section-title {
			font-size: 3.5rem;
		}

		.description {
			font-size: 1.25rem;
		}

		.contact-link,
		.contact-value {
			font-size: 1.25rem;
		}

		.contact-image {
			height: 300px;
		}
	}
</style>

