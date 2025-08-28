<script>
	/**
	 * Resume download button component
	 * @typedef {Object} Props
	 * @property {string} [downloadUrl] - URL for resume download
	 * @property {boolean} [disabled=false] - Whether button is disabled
	 */
	
	/** @type {string|undefined} */
	export let downloadUrl = undefined;
	
	/** @type {boolean} */
	export let disabled = false;
	
	function handleClick() {
		// Simulate download functionality
		if (downloadUrl) {
			window.open(downloadUrl, '_blank');
		} else {
			console.log('Téléchargement du CV...');
			// Here you would typically trigger a file download
		}
	}
</script>

<button 
	class="btn-resume" 
	{disabled}
	on:click={handleClick}
>
	Resume
</button>

<style>
	.btn-resume {
		/* Resume button styles based on Figma */
		display: inline-block;
		padding: 15px 30px;
		background-color: var(--color-surface, #F5EE84);
		border: 2px solid var(--color-secondary, #474306);
		border-radius: var(--radius-sm, 6px);
		color: var(--color-secondary, #474306);
		font-family: 'Poppins', sans-serif;
		font-size: var(--font-size-md, 20px);
		font-weight: var(--font-weight-regular, 400);
		cursor: pointer;
		transition: all var(--duration-normal, 0.3s) var(--ease, ease);
		white-space: nowrap;
	}
	
	.btn-resume:hover {
		background-color: var(--color-secondary, #474306);
		color: var(--color-white, #FFFFFF);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(71, 67, 6, 0.3);
	}
	
	.btn-resume:focus {
		outline: 2px solid var(--color-primary, #03045E);
		outline-offset: 2px;
	}
	
	.btn-resume:active {
		transform: translateY(0);
		box-shadow: 0 2px 6px rgba(71, 67, 6, 0.2);
	}
	
	.btn-resume:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		pointer-events: none;
	}
	
	/* Responsive adjustments */
	@media (max-width: 768px) {
		.btn-resume {
			padding: 12px 24px;
			font-size: var(--font-size-sm, 18px);
		}
	}
	
	@media (max-width: 480px) {
		.btn-resume {
			padding: 10px 20px;
			font-size: var(--font-size-xs, 15px);
		}
	}
</style>
