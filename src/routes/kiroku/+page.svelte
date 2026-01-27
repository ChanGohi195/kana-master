<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getTotalStudyTime,
		getTotalQuestionCount,
		getDailyStats,
		getGrowthCounts
	} from '$lib/db';
	import type { GrowthLevel } from '$lib/types';
	import { getGrowthIcon, getGrowthLabel } from '$lib/types';
	import BackButton from '$lib/components/BackButton.svelte';

	let totalTime = $state(0);
	let totalCount = $state(0);
	let dailyStats = $state<{ date: string; count: number }[]>([]);
	let growthCounts = $state<Record<GrowthLevel, number>>({
		0: 0,
		1: 0,
		2: 0,
		3: 0,
		4: 0,
		5: 0
	});

	onMount(async () => {
		totalTime = await getTotalStudyTime();
		totalCount = await getTotalQuestionCount();
		dailyStats = await getDailyStats(7);
		growthCounts = await getGrowthCounts();
	});

	function formatTime(ms: number): string {
		const totalMinutes = Math.floor(ms / 60000);
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;

		if (hours > 0) {
			return `${hours}じかん ${minutes}ふん`;
		}
		if (minutes > 0) {
			return `${minutes}ふん`;
		}
		return '1ぷんみまん';
	}

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return `${date.getMonth() + 1}/${date.getDate()}`;
	}

	const maxCount = $derived(Math.max(...dailyStats.map((d) => d.count), 1));

	const growthLevels: GrowthLevel[] = [5, 4, 3, 2, 1, 0];
</script>

<svelte:head>
	<title>きろく - かなマスター</title>
</svelte:head>

<div class="flex flex-col min-h-screen p-4">
	<!-- ヘッダー -->
	<header class="flex items-center gap-4 mb-6">
		<BackButton href="/" />
		<h1 class="text-2xl font-bold text-amber-700">きろく</h1>
	</header>

	<!-- 総合統計 -->
	<section class="bg-white rounded-2xl p-4 mb-6 shadow-md">
		<h2 class="text-xl font-bold text-amber-700 mb-4">ぜんぶの きろく</h2>
		<div class="flex justify-around text-center">
			<div>
				<div class="text-3xl font-bold text-amber-600">{formatTime(totalTime)}</div>
				<div class="text-sm text-gray-600">べんきょうじかん</div>
			</div>
			<div>
				<div class="text-3xl font-bold text-amber-600">{totalCount}</div>
				<div class="text-sm text-gray-600">もんだいすう</div>
			</div>
		</div>
	</section>

	<!-- 週間グラフ -->
	<section class="bg-white rounded-2xl p-4 mb-6 shadow-md">
		<h2 class="text-xl font-bold text-amber-700 mb-4">1しゅうかん</h2>
		<div class="flex items-end justify-around h-32 gap-2">
			{#each dailyStats as stat}
				<div class="flex-1 flex flex-col items-center">
					<div
						class="w-full bg-amber-400 rounded-t-lg transition-all"
						style="height: {(stat.count / maxCount) * 100}%;"
					></div>
					<div class="text-xs text-gray-500 mt-1">{formatDate(stat.date)}</div>
					<div class="text-xs font-bold text-amber-600">{stat.count}</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- 成長レベル分布 -->
	<section class="bg-white rounded-2xl p-4 shadow-md">
		<h2 class="text-xl font-bold text-amber-700 mb-4">せいちょう</h2>
		<div class="space-y-3">
			{#each growthLevels as level}
				<div class="flex items-center gap-3">
					<span class="text-2xl w-8">{getGrowthIcon(level)}</span>
					<span class="text-sm text-gray-600 w-28">{getGrowthLabel(level)}</span>
					<div class="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
						<div
							class="h-full bg-amber-400 rounded-full transition-all"
							style="width: {(growthCounts[level] / 214) * 100}%;"
						></div>
					</div>
					<span class="text-sm font-bold text-amber-600 w-8 text-right">
						{growthCounts[level]}
					</span>
				</div>
			{/each}
		</div>
	</section>
</div>
