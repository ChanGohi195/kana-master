<script lang="ts">
	let {
		href = '/',
		label = 'もどる'
	}: {
		href?: string;
		label?: string;
	} = $props();
</script>

<a
	{href}
	class="inline-flex items-center gap-2 px-4 py-2
		   bg-amber-100 hover:bg-amber-200 active:bg-amber-300
		   text-amber-800 font-bold rounded-xl
		   transition-all tap-target"
>
	<span class="text-xl">←</span>
	<span>{label}</span>
</a>
