<script lang="ts">
	import { playKanaAudio } from '$lib/services/audio';

	let {
		kanaId,
		character,
		size = 'md',
		showLabel = false
	}: {
		kanaId: string;
		character: string;
		size?: 'sm' | 'md' | 'lg' | 'xl';
		showLabel?: boolean;
	} = $props();

	let playing = $state(false);

	async function handleClick() {
		if (playing) return;
		playing = true;
		try {
			await playKanaAudio(kanaId, character);
		} catch (e) {
			console.error('Audio playback error:', e);
		}
		playing = false;
	}

	const sizeClasses = {
		sm: 'w-10 h-10 text-lg',
		md: 'w-14 h-14 text-2xl',
		lg: 'w-20 h-20 text-3xl',
		xl: 'w-28 h-28 text-5xl'
	};
</script>

<button
	onclick={handleClick}
	disabled={playing}
	class="audio-btn rounded-full
		   bg-[var(--color-primary-light)] hover:bg-blue-200
		   text-[var(--color-primary)]
		   flex items-center justify-center gap-2
		   border-2 border-[var(--color-primary)]
		   transition-all
		   disabled:opacity-70
		   {sizeClasses[size]}"
	aria-label="よみあげる"
>
	<span>{playing ? '...' : '🔊'}</span>
	{#if showLabel}
		<span class="text-base font-bold">きく</span>
	{/if}
</button>

<style>
	.audio-btn:active:not(:disabled) {
		transform: scale(0.95);
	}
</style>
