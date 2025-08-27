<script>
	/**
	 * About section component
	 * @typedef {Object} TimelineItem
	 * @property {string} period - Time period
	 * @property {string} description - Description text
	 * 
	 * @typedef {Object} Props
	 * @property {string} title - Section title
	 * @property {string} description - Section description
	 * @property {TimelineItem[]} timelineItems - Timeline items
	 */
	
	/** @type {string} */
	export let title = 'about.';
	
	/** @type {string} */
	export let description = '';
	
	/** @type {TimelineItem[]} */
	export let timelineItems = [];
	
	// Timeline component will be imported here
</script>

<section class="about">
	<h2 class="section-title">{title}</h2>
	<p class="section-description">{description}</p>
	
	<!-- Timeline component will be added here -->
	<div class="timeline-container">
		{#each timelineItems as item}
			<div class="timeline-item">
				<span class="timeline-period">{item.period}</span>
				<p class="timeline-description">{item.description}</p>
			</div>
		{/each}
	</div>
</section>

<style>
	.about {
		/* About section styles will be implemented */
		padding: 80px 0;
	}
	
	.section-title {
		/* Title styles will be implemented */
	}
	
	.section-description {
		/* Description styles will be implemented */
		margin-bottom: 60px;
	}
	
	.timeline-container {
		/* Timeline container styles will be implemented */
	}
	
	.timeline-item {
		/* Timeline item styles will be implemented */
		margin-bottom: 60px;
	}
	
	.timeline-period {
		/* Period styles will be implemented */
		font-weight: 600;
		display: block;
		margin-bottom: 10px;
	}
	
	.timeline-description {
		/* Description styles will be implemented */
	}
</style>
