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

<div class="flex gap-2 p-1 bg-amber-100 rounded-xl">
	<button
		class="flex-1 py-3 px-6 rounded-lg text-xl font-bold transition-all tap-target
			   {selected === 'hiragana'
				   ? 'bg-amber-500 text-white shadow-md'
				   : 'bg-transparent text-amber-700 hover:bg-amber-200'}"
		onclick={() => handleClick('hiragana')}
	>
		ひらがな
	</button>
	<button
		class="flex-1 py-3 px-6 rounded-lg text-xl font-bold transition-all tap-target
			   {selected === 'katakana'
				   ? 'bg-amber-500 text-white shadow-md'
				   : 'bg-transparent text-amber-700 hover:bg-amber-200'}"
		onclick={() => handleClick('katakana')}
	>
		カタカナ
	</button>
</div>
