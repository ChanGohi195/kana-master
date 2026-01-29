<script lang="ts">
	let {
		href = '/'
	}: {
		href?: string;
	} = $props();
</script>

<a
	{href}
	class="inline-flex items-center justify-center
		   w-12 h-12
		   bg-[var(--color-surface)] hover:bg-gray-100
		   text-[var(--color-text)] font-bold rounded-xl
		   border-2 border-[var(--color-border)]
		   transition-all tap-target"
	aria-label="もどる"
>
	<span class="text-2xl">←</span>
</a>

<style>
	a:active {
		transform: scale(0.95);
	}
</style>
