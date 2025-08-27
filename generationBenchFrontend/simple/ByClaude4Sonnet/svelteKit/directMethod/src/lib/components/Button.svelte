<script lang="ts">
	export let variant: 'primary' | 'secondary' = 'primary';
	export let href: string | undefined = undefined;
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let disabled: boolean = false;
</script>

{#if href}
	<a {href} class="btn btn-{variant}" class:disabled>
		<slot />
	</a>
{:else}
	<button {type} class="btn btn-{variant}" {disabled} on:click>
		<slot />
	</button>
{/if}

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.75rem 2rem;
		font-family: 'Poppins', sans-serif;
		font-weight: 400;
		font-size: 1.25rem;
		text-decoration: none;
		border: 2px solid #474306;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.3s ease;
		min-width: 160px;
		height: 68px;
	}

	.btn-primary {
		background: #f5ee84;
		color: #474306;
	}

	.btn-primary:hover:not(.disabled) {
		background: #474306;
		color: #f5ee84;
	}

	.btn-secondary {
		background: transparent;
		color: #474306;
	}

	.btn-secondary:hover:not(.disabled) {
		background: #f5ee84;
	}

	.btn:disabled,
	.btn.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: 768px) {
		.btn {
			padding: 0.5rem 1.5rem;
			font-size: 1rem;
			min-width: 140px;
			height: 56px;
		}
	}
</style>
