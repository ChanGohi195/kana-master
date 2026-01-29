<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		onclick = () => {},
		children
	}: {
		variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
		size?: 'sm' | 'md' | 'lg' | 'xl';
		disabled?: boolean;
		onclick?: () => void;
		children: Snippet;
	} = $props();

	const baseClasses = `
		inline-flex items-center justify-center gap-2
		font-bold rounded-xl
		transition-all duration-200
		disabled:opacity-50 disabled:cursor-not-allowed
		focus-visible:outline-2 focus-visible:outline-offset-2
	`;

	const variantClasses = {
		primary: `
			bg-[var(--color-primary)] text-white
			hover:bg-[var(--color-primary-hover)]
			focus-visible:outline-[var(--color-primary)]
			border-2 border-[var(--color-primary)]
		`,
		secondary: `
			bg-[var(--color-surface)] text-[var(--color-text)]
			hover:bg-gray-100
			border-2 border-[var(--color-border)]
			focus-visible:outline-[var(--color-primary)]
		`,
		success: `
			bg-[var(--color-correct)] text-white
			hover:opacity-90
			border-2 border-[var(--color-correct)]
			focus-visible:outline-[var(--color-correct)]
		`,
		danger: `
			bg-[var(--color-incorrect-light)] text-[var(--color-incorrect)]
			hover:bg-red-100
			border-2 border-[var(--color-incorrect-light)]
			focus-visible:outline-[var(--color-incorrect)]
		`,
		ghost: `
			bg-transparent text-[var(--color-text-secondary)]
			hover:bg-gray-100
			border-2 border-transparent
			focus-visible:outline-[var(--color-primary)]
		`
	};

	const sizeClasses = {
		sm: 'px-3 py-2 text-sm min-h-[44px]',
		md: 'px-4 py-3 text-base min-h-[var(--tap-target-min)]',
		lg: 'px-6 py-4 text-lg min-h-[var(--tap-target-large)]',
		xl: 'px-8 py-5 text-xl min-h-[var(--tap-target-xl)]'
	};
</script>

<button
	class="{baseClasses} {variantClasses[variant]} {sizeClasses[size]}"
	{disabled}
	{onclick}
>
	{@render children()}
</button>

<style>
	button:active:not(:disabled) {
		transform: scale(0.98);
	}
</style>
