<script>
	/**
	 * Reusable container component with responsive constraints
	 * @typedef {Object} Props
	 * @property {string} [maxWidth='1266px'] - Maximum width of container
	 * @property {string} [padding='0 20px'] - Horizontal padding
	 */
	
	/** @type {string} */
	export let maxWidth = '1266px';
	
	/** @type {string} */
	export let padding = '0 20px';
</script>

<div class="container" style="max-width: {maxWidth}; padding: {padding};">
	<slot />
</div>

<style>
	.container {
		margin: 0 auto;
		width: 100%;
	}
	
	@media (max-width: 768px) {
		.container {
			padding: 0 15px;
		}
	}
	
	@media (max-width: 480px) {
		.container {
			padding: 0 10px;
		}
	}
</style>
