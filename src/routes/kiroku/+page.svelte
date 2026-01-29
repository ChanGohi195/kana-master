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
		<h1 class="text-xl font-bold text-[var(--color-text)]">きろく</h1>
	</header>

	<!-- 総合統計 -->
	<section class="bg-[var(--color-surface)] rounded-xl p-4 mb-4 border-2 border-[var(--color-border)]">
		<div class="flex justify-around text-center">
			<div>
				<div class="text-2xl font-bold text-[var(--color-text)]">{formatTime(totalTime)}</div>
				<div class="text-sm text-[var(--color-text-secondary)]">べんきょうじかん</div>
			</div>
			<div>
				<div class="text-2xl font-bold text-[var(--color-text)]">{totalCount}</div>
				<div class="text-sm text-[var(--color-text-secondary)]">もんだいすう</div>
			</div>
		</div>
	</section>

	<!-- 週間グラフ -->
	<section class="bg-[var(--color-surface)] rounded-xl p-4 mb-4 border-2 border-[var(--color-border)]">
		<h2 class="text-base font-bold text-[var(--color-text)] mb-3">1しゅうかん</h2>
		<div class="flex items-end justify-around h-28 gap-2">
			{#each dailyStats as stat}
				<div class="flex-1 flex flex-col items-center">
					<div
						class="w-full bg-[var(--color-primary)] rounded-t transition-all"
						style="height: {(stat.count / maxCount) * 100}%; min-height: {stat.count > 0 ? '4px' : '0'};"
					></div>
					<div class="text-xs text-[var(--color-muted)] mt-1">{formatDate(stat.date)}</div>
					<div class="text-xs font-bold text-[var(--color-text)]">{stat.count}</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- 成長レベル分布 -->
	<section class="bg-[var(--color-surface)] rounded-xl p-4 border-2 border-[var(--color-border)]">
		<h2 class="text-base font-bold text-[var(--color-text)] mb-3">せいちょう</h2>
		<div class="space-y-2">
			{#each growthLevels as level}
				<div class="flex items-center gap-2">
					<span class="text-base w-6">{getGrowthIcon(level)}</span>
					<span class="text-xs text-[var(--color-text-secondary)] w-20">{getGrowthLabel(level)}</span>
					<div class="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
						<div
							class="h-full bg-[var(--color-primary)] rounded-full transition-all"
							style="width: {(growthCounts[level] / 214) * 100}%;"
						></div>
					</div>
					<span class="text-xs font-bold text-[var(--color-text)] w-6 text-right">
						{growthCounts[level]}
					</span>
				</div>
			{/each}
		</div>
	</section>
</div>
