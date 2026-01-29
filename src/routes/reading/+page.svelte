<script lang="ts">
	import { onMount } from 'svelte';
	import type { Kana } from '$lib/types';
	import { recordStudy } from '$lib/db';
	import { playKanaAudio } from '$lib/services/audio';
	import { playCorrectSound, playIncorrectSound } from '$lib/services/sound';
	import BackButton from '$lib/components/BackButton.svelte';
	import TypeSwitcher from '$lib/components/TypeSwitcher.svelte';

	let kanaType = $state<'hiragana' | 'katakana'>('hiragana');
	let allKana = $state<Kana[]>([]);
	let currentKana = $state<Kana | null>(null);
	let choices = $state<Kana[]>([]);
	let selectedId = $state<string | null>(null);
	let isCorrect = $state<boolean | null>(null);
	let score = $state(0);
	let total = $state(0);
	let startTime = $state(Date.now());

	onMount(async () => {
		const [hiraganaRes, katakanaRes] = await Promise.all([
			fetch('/data/hiragana.json'),
			fetch('/data/katakana.json')
		]);
		const hiragana: Kana[] = await hiraganaRes.json();
		const katakana: Kana[] = await katakanaRes.json();

		// 清音のみ使用（拗音は除外）
		allKana = [...hiragana, ...katakana].filter((k) => k.row !== '拗音');

		nextQuestion();
	});

	function getKanaForType(): Kana[] {
		return allKana.filter((k) => k.type === kanaType);
	}

	function shuffle<T>(array: T[]): T[] {
		const arr = [...array];
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}

	function nextQuestion() {
		const kanaList = getKanaForType();
		if (kanaList.length < 3) return;

		const shuffled = shuffle(kanaList);
		currentKana = shuffled[0];

		const wrongChoices = shuffled.filter((k) => k.id !== currentKana!.id).slice(0, 2);
		choices = shuffle([currentKana, ...wrongChoices]);

		selectedId = null;
		isCorrect = null;
		startTime = Date.now();

		// 音声再生
		setTimeout(() => {
			if (currentKana) {
				playKanaAudio(currentKana.id, currentKana.character);
			}
		}, 500);
	}

	async function handleSelect(kana: Kana) {
		if (selectedId !== null || !currentKana) return;

		selectedId = kana.id;
		isCorrect = kana.id === currentKana.id;
		total++;

		const timeSpent = Date.now() - startTime;

		if (isCorrect) {
			score++;
			playCorrectSound();
		} else {
			playIncorrectSound();
		}

		await recordStudy({
			kanaId: currentKana.id,
			mode: 'reading',
			result: isCorrect ? 'correct' : 'incorrect',
			timeSpent
		});

		setTimeout(() => {
			nextQuestion();
		}, 1500);
	}

	function handleTypeChange(type: 'hiragana' | 'katakana') {
		kanaType = type;
		score = 0;
		total = 0;
		nextQuestion();
	}

	function handleSpeak() {
		if (currentKana) {
			playKanaAudio(currentKana.id, currentKana.character);
		}
	}
</script>

<svelte:head>
	<title>よみかたクイズ - かなマスター</title>
</svelte:head>

<div class="flex flex-col min-h-screen p-4">
	<!-- ヘッダー -->
	<header class="flex items-center justify-between mb-4">
		<BackButton href="/" />
		<div class="text-lg font-bold text-[var(--color-text)]">
			{score} / {total}
		</div>
	</header>

	<!-- タイプ切り替え -->
	<div class="mb-6">
		<TypeSwitcher selected={kanaType} onchange={handleTypeChange} />
	</div>

	{#if currentKana}
		<!-- 問題エリア -->
		<section class="flex-1 flex flex-col items-center justify-center">
			<!-- 音声ボタン -->
			<button
				onclick={handleSpeak}
				class="audio-btn w-28 h-28
					   bg-[var(--color-primary-light)] hover:bg-blue-200
					   border-4 border-[var(--color-primary)]
					   rounded-full flex items-center justify-center
					   text-5xl mb-6 transition-all"
				aria-label="もういちど きく"
			>
				🔊
			</button>

			<p class="text-lg text-[var(--color-text-secondary)] mb-6">どの もじかな?</p>

			<!-- 選択肢 -->
			<div class="grid grid-cols-3 gap-3 w-full max-w-sm">
				{#each choices as choice}
					<button
						onclick={() => handleSelect(choice)}
						disabled={selectedId !== null}
						class="choice-btn aspect-square rounded-xl
							   flex items-center justify-center
							   transition-all
							   {selectedId === null
								   ? 'bg-[var(--color-surface)] hover:bg-gray-50 border-2 border-[var(--color-border)]'
								   : choice.id === currentKana.id
									   ? 'bg-[var(--color-correct)] text-white border-2 border-[var(--color-correct)]'
									   : selectedId === choice.id
										   ? 'bg-[var(--color-incorrect)] text-white border-2 border-[var(--color-incorrect)]'
										   : 'bg-gray-100 border-2 border-gray-200 opacity-40'}"
						style="font-family: var(--font-main);"
					>
						<span class="text-4xl">{choice.character}</span>
					</button>
				{/each}
			</div>

			<!-- フィードバック -->
			{#if isCorrect !== null}
				<div class="mt-8 text-xl font-bold animate-scale-in">
					{#if isCorrect}
						<span class="text-[var(--color-correct)]">せいかい!</span>
					{:else}
						<span class="text-[var(--color-text-secondary)]">
							こたえは「<span class="text-[var(--color-text)]">{currentKana.character}</span>」
						</span>
					{/if}
				</div>
			{/if}
		</section>
	{:else}
		<div class="flex-1 flex items-center justify-center">
			<span class="text-lg text-[var(--color-muted)]">よみこみちゅう...</span>
		</div>
	{/if}
</div>

<style>
	.audio-btn:active {
		transform: scale(0.95);
	}
	.choice-btn:active:not(:disabled) {
		transform: scale(0.97);
	}
</style>
