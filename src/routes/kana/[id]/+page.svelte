<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { Kana } from '$lib/types';
	import { recordStudy, getProgress } from '$lib/db';
	import { playCorrectSound } from '$lib/services/sound';
	import { recognizeCharacter, checkStrokeCount } from '$lib/services/recognition';
	import { playKanaAudio } from '$lib/services/audio';
	import BackButton from '$lib/components/BackButton.svelte';
	import TracingCanvas from '$lib/components/TracingCanvas.svelte';
	import GrowthIcon from '$lib/components/GrowthIcon.svelte';
	import Button from '$lib/components/Button.svelte';

	let kana = $state<Kana | null>(null);
	let canvas: TracingCanvas;
	let practiceCount = $state(0);
	let guideLevel = $state(0); // 0: 濃い, 1: 薄い, 2: なし
	let startTime = $state(Date.now());
	let growthLevel = $state<0 | 1 | 2 | 3 | 4 | 5>(0);
	let strokeCount = $state(0);
	let feedback = $state<{ message: string; isCorrect: boolean } | null>(null);

	const guideOpacities = [0.3, 0.12, 0];

	onMount(async () => {
		const id = $page.params.id;

		const isHiragana = id.startsWith('hiragana');
		const dataFile = isHiragana ? '/data/hiragana.json' : '/data/katakana.json';
		const res = await fetch(dataFile);
		const list: Kana[] = await res.json();
		kana = list.find((k) => k.id === id) || null;

		if (kana) {
			const progress = await getProgress(kana.id);
			if (progress) {
				growthLevel = progress.growthLevel;
			}
		}

		startTime = Date.now();
	});

	function handleStrokeCountChange(count: number) {
		strokeCount = count;
		feedback = null;
	}

	async function handleComplete() {
		if (!kana || !canvas) return;

		const timeSpent = Date.now() - startTime;

		// TensorFlow.jsで認識（モデルがない場合はストローク数で簡易判定）
		const kanaType = kana.type as 'hiragana' | 'katakana';
		const result = await recognizeCharacter(
			canvas.getCanvasElement(),
			kana.character,
			kana.strokeCount,
			strokeCount,
			kanaType
		);

		if (result.isCorrect) {
			// 正解
			await recordStudy({
				kanaId: kana.id,
				mode: 'writing',
				result: 'correct',
				timeSpent
			});

			playCorrectSound();
			practiceCount++;

			feedback = { message: result.message, isCorrect: true };

			// 3回練習したらガイドレベルを上げる
			if (practiceCount >= 3 && guideLevel < 2) {
				guideLevel++;
			}

			// 進捗更新
			const progress = await getProgress(kana.id);
			if (progress) {
				growthLevel = progress.growthLevel;
			}

			// 1.5秒後にクリア
			setTimeout(() => {
				canvas.clear();
				feedback = null;
				startTime = Date.now();
			}, 1500);
		} else {
			// 不正解
			feedback = { message: result.message, isCorrect: false };
		}
	}

	function handleClear() {
		canvas.clear();
		feedback = null;
	}

	function handleUndo() {
		canvas.undo();
		feedback = null;
	}

	function cycleGuideLevel() {
		guideLevel = ((guideLevel + 1) % 3) as 0 | 1 | 2;
	}

	async function handleSpeak() {
		if (kana) {
			await playKanaAudio(kana.id, kana.character);
		}
	}

	const guideLabels = ['こい', 'うすい', 'なし'];
</script>

<svelte:head>
	<title>{kana?.character ?? 'もじ'} - かなマスター</title>
</svelte:head>

<div class="flex flex-col min-h-screen p-4">
	<!-- ヘッダー -->
	<header class="flex items-center justify-between mb-2">
		<BackButton href="/gojuon" />
		<button
			onclick={handleSpeak}
			class="w-12 h-12 flex items-center justify-center
				   bg-[var(--color-primary-light)] hover:bg-blue-200
				   text-[var(--color-primary)] text-2xl
				   rounded-full border-2 border-[var(--color-primary)]
				   transition-all"
			aria-label="よみあげる"
		>
			🔊
		</button>
	</header>

	{#if kana}
		<!-- 文字表示エリア -->
		<section class="text-center mb-3">
			<div class="kana-large text-[var(--color-text)]" style="font-family: var(--font-main); font-size: 100px;">
				{kana.character}
			</div>
			<div class="flex items-center justify-center gap-3 text-[var(--color-text-secondary)]">
				<span class="text-xl">({kana.romaji})</span>
				{#if growthLevel > 0}
					<GrowthIcon level={growthLevel} size="md" />
				{/if}
			</div>
		</section>

		<!-- キャンバス -->
		<section class="flex flex-col items-center mb-4">
			<TracingCanvas
				bind:this={canvas}
				character={kana.character}
				expectedStrokeCount={kana.strokeCount}
				guideOpacity={guideOpacities[guideLevel]}
				onStrokeCountChange={handleStrokeCountChange}
			/>

			<!-- ストローク数表示 -->
			{#if kana.strokeCount > 0}
				<div class="mt-2 text-sm text-[var(--color-text-secondary)]">
					{strokeCount} / {kana.strokeCount} かく
				</div>
			{/if}
		</section>

		<!-- フィードバック -->
		{#if feedback}
			<div
				class="text-center mb-3 py-2 px-4 rounded-xl animate-scale-in
					   {feedback.isCorrect
						   ? 'bg-[var(--color-correct-light)] text-[var(--color-correct)]'
						   : 'bg-gray-100 text-[var(--color-text-secondary)]'}"
			>
				{feedback.message}
			</div>
		{/if}

		<!-- コントロールボタン -->
		<section class="flex justify-center gap-3 mb-3">
			<Button variant="secondary" size="md" onclick={handleClear}>
				けす
			</Button>
			<Button variant="success" size="lg" onclick={handleComplete}>
				できた
			</Button>
		</section>

		<!-- ガイド切り替え・もどす -->
		<section class="flex justify-center gap-3">
			<button
				onclick={handleUndo}
				class="px-4 py-2 text-[var(--color-text-secondary)]
					   hover:bg-gray-100 rounded-lg transition-colors"
			>
				↩ もどす
			</button>
			<button
				onclick={cycleGuideLevel}
				class="px-4 py-2 text-[var(--color-text-secondary)]
					   hover:bg-gray-100 rounded-lg transition-colors"
			>
				おてほん: {guideLabels[guideLevel]}
			</button>
		</section>
	{:else}
		<div class="flex-1 flex items-center justify-center">
			<span class="text-lg text-[var(--color-muted)]">よみこみちゅう...</span>
		</div>
	{/if}
</div>
