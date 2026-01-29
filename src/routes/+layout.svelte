<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="min-h-screen" style="background-color: var(--color-bg);">
	{@render children()}
</div>
