<script lang="ts">
	import { onMount } from 'svelte';
	import { getAllProgress, getTodayStats } from '$lib/db';
	import type { GrowthLevel } from '$lib/types';
	import GrowthIcon from '$lib/components/GrowthIcon.svelte';

	let todayCount = $state(0);
	let todayTime = $state(0);
	let masteredCount = $state(0);
	let totalKana = 214; // ひらがな107 + カタカナ107

	onMount(async () => {
		const stats = await getTodayStats();
		todayCount = stats.count;
		todayTime = stats.time;

		const progress = await getAllProgress();
		masteredCount = progress.filter((p) => p.growthLevel >= 4).length;
	});

	function formatTime(ms: number): string {
		const minutes = Math.floor(ms / 60000);
		if (minutes < 1) return '1ぷんみまん';
		return `${minutes}ふん`;
	}
</script>

<svelte:head>
	<title>かなマスター</title>
</svelte:head>

<div class="flex flex-col min-h-screen p-4">
	<!-- ヘッダー -->
	<header class="text-center mb-6">
		<h1 class="text-4xl font-bold text-amber-600 mb-2">かなマスター</h1>
		<p class="text-lg text-amber-700">ひらがな・カタカナを たのしくれんしゅう!</p>
	</header>

	<!-- 今日の進捗 -->
	<section class="bg-white rounded-2xl p-4 mb-6 shadow-md">
		<h2 class="text-xl font-bold text-amber-700 mb-3">きょうの がんばり</h2>
		<div class="flex justify-around text-center">
			<div>
				<div class="text-3xl font-bold text-amber-600">{todayCount}</div>
				<div class="text-sm text-gray-600">もんだい</div>
			</div>
			<div>
				<div class="text-3xl font-bold text-amber-600">{formatTime(todayTime)}</div>
				<div class="text-sm text-gray-600">べんきょう</div>
			</div>
			<div>
				<div class="text-3xl font-bold text-amber-600">{masteredCount}</div>
				<div class="text-sm text-gray-600">マスター</div>
			</div>
		</div>
	</section>

	<!-- メインメニュー -->
	<nav class="flex-1 space-y-4">
		<a
			href="/gojuon"
			class="block bg-gradient-to-r from-amber-400 to-orange-400
				   text-white rounded-2xl p-6 shadow-lg
				   hover:from-amber-500 hover:to-orange-500
				   active:scale-98 transition-all"
		>
			<div class="flex items-center gap-4">
				<span class="text-5xl">📝</span>
				<div>
					<div class="text-2xl font-bold">かきかた れんしゅう</div>
					<div class="text-amber-100">ごじゅうおんひょうから えらんで かく</div>
				</div>
			</div>
		</a>

		<a
			href="/reading"
			class="block bg-gradient-to-r from-blue-400 to-cyan-400
				   text-white rounded-2xl p-6 shadow-lg
				   hover:from-blue-500 hover:to-cyan-500
				   active:scale-98 transition-all"
		>
			<div class="flex items-center gap-4">
				<span class="text-5xl">🔊</span>
				<div>
					<div class="text-2xl font-bold">よみかた クイズ</div>
					<div class="text-blue-100">おとを きいて もじを えらぶ</div>
				</div>
			</div>
		</a>

		<a
			href="/kiroku"
			class="block bg-gradient-to-r from-green-400 to-emerald-400
				   text-white rounded-2xl p-6 shadow-lg
				   hover:from-green-500 hover:to-emerald-500
				   active:scale-98 transition-all"
		>
			<div class="flex items-center gap-4">
				<span class="text-5xl">📊</span>
				<div>
					<div class="text-2xl font-bold">きろく</div>
					<div class="text-green-100">がんばった きろくを みる</div>
				</div>
			</div>
		</a>
	</nav>

	<!-- フッター -->
	<footer class="mt-6 text-center">
		<a href="/settings" class="text-amber-600 hover:text-amber-800 text-lg">
			⚙️ せってい
		</a>
	</footer>
</div>

<style>
	.active\:scale-98:active {
		transform: scale(0.98);
	}
</style>
