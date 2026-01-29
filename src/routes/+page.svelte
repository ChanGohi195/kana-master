<script lang="ts">
	import { onMount } from 'svelte';
	import { getAllProgress, getTodayStats } from '$lib/db';

	let todayCount = $state(0);
	let masteredCount = $state(0);

	onMount(async () => {
		const stats = await getTodayStats();
		todayCount = stats.count;

		const progress = await getAllProgress();
		masteredCount = progress.filter((p) => p.growthLevel >= 4).length;
	});
</script>

<svelte:head>
	<title>かなマスター</title>
</svelte:head>

<div class="flex flex-col min-h-screen p-6">
	<!-- ヘッダー -->
	<header class="text-center mb-8 pt-4">
		<h1 class="text-3xl font-bold text-[var(--color-text)] mb-2" style="font-family: var(--font-main);">
			かなマスター
		</h1>
		{#if masteredCount > 0 || todayCount > 0}
			<p class="text-base text-[var(--color-text-secondary)]">
				きょう {todayCount}もんだい ・ {masteredCount}もじ マスター
			</p>
		{/if}
	</header>

	<!-- メインメニュー -->
	<nav class="flex-1 flex flex-col gap-4 max-w-md mx-auto w-full">
		<a
			href="/gojuon"
			class="menu-btn flex items-center gap-5 p-6
				   bg-[var(--color-surface)] rounded-2xl
				   border-2 border-[var(--color-primary)]
				   hover:bg-[var(--color-primary-light)]
				   transition-all"
		>
			<span class="text-4xl">📝</span>
			<div>
				<div class="text-xl font-bold text-[var(--color-text)]">かく</div>
				<div class="text-sm text-[var(--color-text-secondary)]">もじを れんしゅう</div>
			</div>
		</a>

		<a
			href="/reading"
			class="menu-btn flex items-center gap-5 p-6
				   bg-[var(--color-surface)] rounded-2xl
				   border-2 border-[var(--color-primary)]
				   hover:bg-[var(--color-primary-light)]
				   transition-all"
		>
			<span class="text-4xl">👂</span>
			<div>
				<div class="text-xl font-bold text-[var(--color-text)]">きく</div>
				<div class="text-sm text-[var(--color-text-secondary)]">おとを きいて えらぶ</div>
			</div>
		</a>

		<a
			href="/kiroku"
			class="menu-btn flex items-center gap-5 p-5
				   bg-[var(--color-surface)] rounded-xl
				   border-2 border-[var(--color-border)]
				   hover:border-[var(--color-primary)]
				   transition-all"
		>
			<div class="text-lg text-[var(--color-text-secondary)] w-full text-center">きろく</div>
		</a>
	</nav>

	<!-- フッター -->
	<footer class="mt-6 text-center pb-4">
		<a
			href="/settings"
			class="inline-block px-4 py-2 text-[var(--color-text-secondary)]
				   hover:text-[var(--color-text)] transition-colors"
		>
			せってい
		</a>
	</footer>
</div>

<style>
	.menu-btn:active {
		transform: scale(0.98);
	}
</style>
