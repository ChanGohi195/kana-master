<script lang="ts">
	let {
		selected = 'hiragana',
		onchange = (type: 'hiragana' | 'katakana') => {}
	}: {
		selected?: 'hiragana' | 'katakana';
		onchange?: (type: 'hiragana' | 'katakana') => void;
	} = $props();

	function handleClick(type: 'hiragana' | 'katakana') {
		if (type !== selected) {
			onchange(type);
		}
	}
</script>

<div class="flex gap-1 p-1 bg-gray-100 rounded-xl border-2 border-[var(--color-border)]">
	<button
		class="flex-1 py-3 px-6 rounded-lg text-lg font-bold transition-all tap-target
			   {selected === 'hiragana'
				   ? 'bg-[var(--color-primary)] text-white'
				   : 'bg-transparent text-[var(--color-text-secondary)] hover:bg-gray-200'}"
		onclick={() => handleClick('hiragana')}
	>
		ひらがな
	</button>
	<button
		class="flex-1 py-3 px-6 rounded-lg text-lg font-bold transition-all tap-target
			   {selected === 'katakana'
				   ? 'bg-[var(--color-primary)] text-white'
				   : 'bg-transparent text-[var(--color-text-secondary)] hover:bg-gray-200'}"
		onclick={() => handleClick('katakana')}
	>
		カタカナ
	</button>
</div>
