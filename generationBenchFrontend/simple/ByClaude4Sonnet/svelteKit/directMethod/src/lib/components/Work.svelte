<script lang="ts">
	import project1 from '$lib/assets/project1.png';
	import project2 from '$lib/assets/project2.png';

	interface Project {
		id: number;
		title: string;
		date: string;
		description: string;
		image: string;
	}

	const projects: Project[] = [
		{
			id: 1,
			title: "Some Case Study",
			date: "November 24, 2019",
			description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed aliquam sollicitudin rhoncus morbi. Tincidunt quam sem elit a convallis. Eget ipsum, velit vitae eu nunc, consequat, at.",
			image: project1
		},
		{
			id: 2,
			title: "Some Case Study",
			date: "November 24, 2019",
			description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed aliquam sollicitudin rhoncus morbi. Tincidunt quam sem elit a convallis. Eget ipsum, velit vitae eu nunc, consequat, at.",
			image: project2
		}
	];
</script>

<section id="work" class="work">
	<div class="container">
		<h2 class="section-title">work.</h2>
		
		<p class="intro-text">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. 
			Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.
		</p>
		
		<div class="projects-grid">
			{#each projects as project}
				<article class="project-card">
					<div class="project-image">
						<img src={project.image} alt={project.title} />
					</div>
					<div class="project-content">
						<p class="project-date">{project.date}</p>
						<h3 class="project-title">{project.title}</h3>
						<p class="project-description">{project.description}</p>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	.work {
		background: #fbf8cc;
		padding: 6rem 0;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.section-title {
		font-family: 'Poppins', sans-serif;
		font-weight: 800;
		font-size: 6.25rem;
		color: #f7f197;
		margin: 0 0 3rem 0;
		line-height: 1.16;
	}

	.intro-text {
		font-family: 'Poppins', sans-serif;
		font-weight: 400;
		font-size: 1.5rem;
		color: #03045e;
		line-height: 1.833;
		margin: 0 0 4rem 0;
		max-width: 900px;
	}

	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
		gap: 4rem;
	}

	.project-card {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.project-image {
		width: 100%;
		height: 400px;
		overflow: hidden;
		border-radius: 8px;
		border: 1px solid #474306;
	}

	.project-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.project-card:hover .project-image img {
		transform: scale(1.05);
	}

	.project-content {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.project-date {
		font-family: 'Poppins', sans-serif;
		font-weight: 400;
		font-size: 0.9375rem;
		color: #03045e;
		margin: 0;
		line-height: 2.933;
	}

	.project-title {
		font-family: 'Poppins', sans-serif;
		font-weight: 600;
		font-size: 1.5rem;
		color: #03045e;
		margin: 0;
		line-height: 1.833;
	}

	.project-description {
		font-family: 'Poppins', sans-serif;
		font-weight: 400;
		font-size: 1.125rem;
		color: #03045e;
		line-height: 1.778;
		margin: 0;
	}

	@media (max-width: 1024px) {
		.section-title {
			font-size: 5rem;
		}

		.projects-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 768px) {
		.work {
			padding: 4rem 0;
		}

		.container {
			padding: 0 1rem;
		}

		.section-title {
			font-size: 3.5rem;
			margin-bottom: 2rem;
		}

		.intro-text {
			font-size: 1.25rem;
			margin-bottom: 3rem;
		}

		.projects-grid {
			gap: 3rem;
		}

		.project-image {
			height: 300px;
		}

		.project-title {
			font-size: 1.25rem;
		}

		.project-description {
			font-size: 1rem;
		}
	}

	@media (max-width: 600px) {
		.projects-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

