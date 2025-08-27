<script lang="ts">
	interface TimelineItem {
		period: string;
		description: string;
	}

	const timelineData: TimelineItem[] = [
		{
			period: "2014-2018",
			description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam."
		},
		{
			period: "2018-2020",
			description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam."
		},
		{
			period: "2020 - Present",
			description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam."
		}
	];
</script>

<section id="about" class="about">
	<div class="container">
		<h2 class="section-title">about.</h2>
		
		<p class="intro-text">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet vulputate tristique quam felis. 
			Id phasellus dui orci vulputate consequat nulla proin. Id sit scelerisque neque, proin bibendum diam.
		</p>
		
		<div class="timeline">
			{#each timelineData as item, index}
				<div class="timeline-item">
					<div class="timeline-marker">
						<div class="dot"></div>
					</div>
					<div class="timeline-content">
						<h3 class="period">{item.period}</h3>
						<p class="description">{item.description}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.about {
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

	.timeline {
		position: relative;
		max-width: 900px;
		margin-left: 2rem;
	}

	.timeline::before {
		content: '';
		position: absolute;
		left: -2rem;
		top: 0;
		bottom: 0;
		width: 2px;
		background: #03045e;
	}

	.timeline-item {
		position: relative;
		margin-bottom: 3rem;
		display: flex;
		align-items: flex-start;
		gap: 2rem;
	}

	.timeline-item:last-child {
		margin-bottom: 0;
	}

	.timeline-marker {
		position: absolute;
		left: -2.5rem;
		top: 0.5rem;
		width: 13px;
		height: 13px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.dot {
		width: 13px;
		height: 13px;
		background: #03045e;
		border-radius: 50%;
	}

	.timeline-content {
		flex: 1;
	}

	.period {
		font-family: 'Poppins', sans-serif;
		font-weight: 600;
		font-size: 1.5rem;
		color: #03045e;
		margin: 0 0 1rem 0;
		line-height: 1.667;
	}

	.description {
		font-family: 'Poppins', sans-serif;
		font-weight: 400;
		font-size: 1.5rem;
		color: #03045e;
		line-height: 1.833;
		margin: 0;
	}

	@media (max-width: 1024px) {
		.section-title {
			font-size: 5rem;
		}
	}

	@media (max-width: 768px) {
		.about {
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

		.timeline {
			margin-left: 1.5rem;
		}

		.timeline::before {
			left: -1.5rem;
		}

		.timeline-marker {
			left: -2rem;
		}

		.period {
			font-size: 1.25rem;
		}

		.description {
			font-size: 1.25rem;
		}

		.timeline-item {
			margin-bottom: 2.5rem;
		}
	}
</style>
