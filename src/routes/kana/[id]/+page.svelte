<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { Kana } from '$lib/types';
	import { recordStudy, getProgress } from '$lib/db';
	import { playCorrectSound } from '$lib/services/sound';
	import BackButton from '$lib/components/BackButton.svelte';
	import TracingCanvas from '$lib/components/TracingCanvas.svelte';
	import SpeakButton from '$lib/components/SpeakButton.svelte';
	import GrowthIcon from '$lib/components/GrowthIcon.svelte';

	let kana = $state<Kana | null>(null);
	let canvas: TracingCanvas;
	let practiceCount = $state(0);
	let guideLevel = $state(0); // 0: 濃い, 1: 薄い, 2: なし
	let startTime = $state(Date.now());
	let growthLevel = $state<0 | 1 | 2 | 3 | 4 | 5>(0);

	const guideOpacities = [0.4, 0.15, 0];

	onMount(async () => {
		const id = $page.params.id;

		// データ読み込み
		const isHiragana = id.startsWith('hiragana');
		const dataFile = isHiragana ? '/data/hiragana.json' : '/data/katakana.json';
		const res = await fetch(dataFile);
		const list: Kana[] = await res.json();
		kana = list.find((k) => k.id === id) || null;

		// 進捗読み込み
		if (kana) {
			const progress = await getProgress(kana.id);
			if (progress) {
				growthLevel = progress.growthLevel;
			}
		}

		startTime = Date.now();
	});

	async function handleComplete() {
		if (!kana) return;

		const timeSpent = Date.now() - startTime;

		// 学習記録を保存
		await recordStudy({
			kanaId: kana.id,
			mode: 'writing',
			result: 'correct',
			timeSpent
		});

		playCorrectSound();
		practiceCount++;

		// 3回練習したらガイドレベルを上げる
		if (practiceCount >= 3 && guideLevel < 2) {
			guideLevel++;
		}

		// 進捗更新
		const progress = await getProgress(kana.id);
		if (progress) {
			growthLevel = progress.growthLevel;
		}

		// キャンバスクリア
		canvas.clear();
		startTime = Date.now();
	}

	function handleClear() {
		canvas.clear();
	}

	function handleUndo() {
		canvas.undo();
	}

	function cycleGuideLevel() {
		guideLevel = ((guideLevel + 1) % 3) as 0 | 1 | 2;
	}

	const guideLabels = ['こい', 'うすい', 'なし'];
</script>

<svelte:head>
	<title>{kana?.character ?? 'もじ'} - かなマスター</title>
</svelte:head>

<div class="flex flex-col min-h-screen p-4">
	<!-- ヘッダー -->
	<header class="flex items-center justify-between mb-4">
		<BackButton href="/gojuon" />
		{#if kana}
			<div class="flex items-center gap-2">
				<GrowthIcon level={growthLevel} size="lg" />
				<span class="text-lg text-gray-600">{practiceCount}かい</span>
			</div>
		{/if}
	</header>

	{#if kana}
		<!-- 文字表示エリア -->
		<section class="text-center mb-4">
			<div class="kana-large text-gray-800 mb-2">{kana.character}</div>
			<div class="flex items-center justify-center gap-4">
				<span class="text-2xl text-gray-500">({kana.romaji})</span>
				<SpeakButton text={kana.character} size="md" />
			</div>
		</section>

		<!-- キャンバス -->
		<section class="flex flex-col items-center mb-4">
			<TracingCanvas
				bind:this={canvas}
				width={280}
				height={280}
				character={kana.character}
				guideOpacity={guideOpacities[guideLevel]}
			/>
		</section>

		<!-- コントロールボタン -->
		<section class="flex justify-center gap-3 mb-4">
			<button
				onclick={handleUndo}
				class="px-5 py-3 bg-gray-200 hover:bg-gray-300
					   rounded-xl text-lg font-bold tap-target"
			>
				↩️ もどす
			</button>
			<button
				onclick={handleClear}
				class="px-5 py-3 bg-red-100 hover:bg-red-200
					   rounded-xl text-lg font-bold tap-target"
			>
				🗑️ けす
			</button>
			<button
				onclick={handleComplete}
				class="px-5 py-3 bg-green-400 hover:bg-green-500 text-white
					   rounded-xl text-lg font-bold tap-target"
			>
				✓ かけた!
			</button>
		</section>

		<!-- ガイド切り替え -->
		<section class="text-center">
			<button
				onclick={cycleGuideLevel}
				class="px-4 py-2 bg-amber-100 hover:bg-amber-200
					   rounded-lg text-amber-700"
			>
				おてほん: {guideLabels[guideLevel]}
			</button>
		</section>
	{:else}
		<div class="flex-1 flex items-center justify-center">
			<span class="text-2xl text-amber-400">よみこみちゅう...</span>
		</div>
	{/if}
</div>
