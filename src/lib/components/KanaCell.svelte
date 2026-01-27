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
		   bg-white hover:bg-amber-50 active:bg-amber-100
		   border-2 border-amber-200 hover:border-amber-400
		   shadow-sm hover:shadow-md
		   transition-all tap-target"
	{onclick}
>
	<span class="text-3xl sm:text-4xl font-bold text-gray-800">
		{kana.character}
	</span>
	<span class="absolute top-1 right-1">
		<GrowthIcon level={growthLevel} size="sm" />
	</span>
</button>

<style>
	.kana-cell:active {
		transform: scale(0.95);
	}
</style>
