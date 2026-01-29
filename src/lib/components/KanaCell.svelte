<script lang="ts">
	import type { Kana, GrowthLevel } from '../types';
	import GrowthIcon from './GrowthIcon.svelte';

	let {
		kana,
		growthLevel = 0,
		onclick = () => {}
	}: {
		kana: Kana;
		growthLevel?: GrowthLevel;
		onclick?: () => void;
	} = $props();
</script>

<button
	class="kana-cell relative flex flex-col items-center justify-center
		   w-full aspect-square rounded-xl
		   bg-[var(--color-surface)] hover:bg-gray-50
		   border-2 border-[var(--color-border)] hover:border-[var(--color-primary)]
		   transition-all tap-target"
	{onclick}
>
	<span class="kana-cell-char text-[var(--color-text)]" style="font-family: var(--font-main);">
		{kana.character}
	</span>
	{#if growthLevel > 0}
		<span class="absolute top-0.5 right-0.5 text-xs opacity-70">
			<GrowthIcon level={growthLevel} size="sm" />
		</span>
	{/if}
</button>

<style>
	.kana-cell:active {
		transform: scale(0.95);
	}
	.kana-cell-char {
		font-size: clamp(28px, 8vw, 40px);
		font-weight: 400;
		line-height: 1;
	}
</style>
