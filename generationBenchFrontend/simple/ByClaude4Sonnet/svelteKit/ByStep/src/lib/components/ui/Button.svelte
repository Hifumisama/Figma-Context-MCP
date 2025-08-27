<script>
	/**
	 * Generic reusable button component
	 * @typedef {Object} Props
	 * @property {'primary'|'secondary'|'outline'} [variant='primary'] - Button variant
	 * @property {'small'|'medium'|'large'} [size='medium'] - Button size
	 * @property {boolean} [disabled=false] - Whether button is disabled
	 * @property {boolean} [loading=false] - Whether button shows loading state
	 * @property {string} [href] - If provided, renders as link
	 * @property {'button'|'submit'|'reset'} [type='button'] - Button type
	 */
	
	/** @type {'primary'|'secondary'|'outline'} */
	export let variant = 'primary';
	
	/** @type {'small'|'medium'|'large'} */
	export let size = 'medium';
	
	/** @type {boolean} */
	export let disabled = false;
	
	/** @type {boolean} */
	export let loading = false;
	
	/** @type {string|undefined} */
	export let href = undefined;
	
	/** @type {'button'|'submit'|'reset'} */
	export let type = 'button';
</script>

{#if href}
	<a 
		{href} 
		class="btn btn-{variant} btn-{size}"
		class:btn-disabled={disabled}
		class:btn-loading={loading}
		role="button"
		tabindex={disabled ? -1 : 0}
		aria-disabled={disabled}
	>
		<slot />
	</a>
{:else}
	<button 
		{type}
		{disabled}
		class="btn btn-{variant} btn-{size}"
		class:btn-loading={loading}
		on:click
	>
		<slot />
	</button>
{/if}

<style>
	.btn {
		/* Base button styles */
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 2px solid transparent;
		border-radius: var(--radius-sm, 6px);
		font-family: 'Poppins', sans-serif;
		font-weight: var(--font-weight-regular, 400);
		text-decoration: none;
		cursor: pointer;
		transition: all var(--duration-normal, 0.3s) var(--ease, ease);
		white-space: nowrap;
	}
	
	/* Variants */
	.btn-primary {
		background-color: var(--color-surface, #F5EE84);
		border-color: var(--color-secondary, #474306);
		color: var(--color-secondary, #474306);
	}
	
	.btn-primary:hover {
		background-color: var(--color-secondary, #474306);
		color: var(--color-white, #FFFFFF);
	}
	
	.btn-secondary {
		background-color: var(--color-accent, #F7F197);
		border-color: var(--color-primary, #03045E);
		color: var(--color-primary, #03045E);
	}
	
	.btn-secondary:hover {
		background-color: var(--color-primary, #03045E);
		color: var(--color-white, #FFFFFF);
	}
	
	.btn-outline {
		background-color: transparent;
		border-color: var(--color-primary, #03045E);
		color: var(--color-primary, #03045E);
	}
	
	.btn-outline:hover {
		background-color: var(--color-primary, #03045E);
		color: var(--color-white, #FFFFFF);
	}
	
	/* Sizes */
	.btn-small {
		padding: 8px 16px;
		font-size: var(--font-size-xs, 15px);
	}
	
	.btn-medium {
		padding: 15px 30px;
		font-size: var(--font-size-md, 20px);
	}
	
	.btn-large {
		padding: 20px 40px;
		font-size: var(--font-size-lg, 24px);
	}
	
	/* States */
	.btn-disabled,
	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		pointer-events: none;
	}
	
	.btn-loading {
		position: relative;
		cursor: wait;
	}
	
	.btn-loading::after {
		content: '';
		position: absolute;
		width: 16px;
		height: 16px;
		margin: auto;
		border: 2px solid transparent;
		border-top-color: currentColor;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	
	/* Focus states for accessibility */
	.btn:focus {
		outline: 2px solid var(--color-primary, #03045E);
		outline-offset: 2px;
	}
	
	/* Keyframes for loading animation */
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	
	/* Responsive adjustments */
	@media (max-width: 768px) {
		.btn-large {
			padding: 16px 32px;
			font-size: var(--font-size-md, 20px);
		}
		
		.btn-medium {
			padding: 12px 24px;
			font-size: var(--font-size-sm, 18px);
		}
	}
</style>
