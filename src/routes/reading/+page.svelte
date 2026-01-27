<script lang="ts">
	import { onMount } from 'svelte';
	import type { Kana } from '$lib/types';
	import { recordStudy } from '$lib/db';
	import { speak, initSpeech } from '$lib/services/speech';
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
		initSpeech();

		// 両方読み込み
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

		// ランダムに1つ選ぶ
		const shuffled = shuffle(kanaList);
		currentKana = shuffled[0];

		// 選択肢を3つ作る（正解含む）
		const wrongChoices = shuffled.filter((k) => k.id !== currentKana!.id).slice(0, 2);
		choices = shuffle([currentKana, ...wrongChoices]);

		selectedId = null;
		isCorrect = null;
		startTime = Date.now();

		// 読み上げ
		setTimeout(() => {
			if (currentKana) {
				speak(currentKana.character);
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

		// 記録保存
		await recordStudy({
			kanaId: currentKana.id,
			mode: 'reading',
			result: isCorrect ? 'correct' : 'incorrect',
			timeSpent
		});

		// 次の問題へ
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
			speak(currentKana.character);
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
		<div class="text-xl font-bold text-amber-700">
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
				class="w-32 h-32 bg-blue-100 hover:bg-blue-200 active:bg-blue-300
					   rounded-full flex items-center justify-center
					   text-6xl shadow-lg mb-8 transition-all"
			>
				🔊
			</button>

			<p class="text-xl text-gray-600 mb-6">どの もじかな?</p>

			<!-- 選択肢 -->
			<div class="grid grid-cols-3 gap-4 w-full max-w-md">
				{#each choices as choice}
					<button
						onclick={() => handleSelect(choice)}
						disabled={selectedId !== null}
						class="aspect-square rounded-2xl text-5xl font-bold
							   flex items-center justify-center
							   transition-all shadow-lg
							   {selectedId === null
								   ? 'bg-white hover:bg-amber-50 active:bg-amber-100 border-4 border-amber-300'
								   : choice.id === currentKana.id
									   ? 'bg-green-400 text-white border-4 border-green-500'
									   : selectedId === choice.id
										   ? 'bg-red-400 text-white border-4 border-red-500'
										   : 'bg-gray-100 border-4 border-gray-200 opacity-50'}"
					>
						{choice.character}
					</button>
				{/each}
			</div>

			<!-- フィードバック -->
			{#if isCorrect !== null}
				<div class="mt-8 text-3xl font-bold animate-bounce-in">
					{#if isCorrect}
						<span class="text-green-500">⭕ せいかい!</span>
					{:else}
						<span class="text-red-500">❌ ざんねん... こたえは「{currentKana.character}」</span>
					{/if}
				</div>
			{/if}
		</section>
	{:else}
		<div class="flex-1 flex items-center justify-center">
			<span class="text-2xl text-amber-400">よみこみちゅう...</span>
		</div>
	{/if}
</div>
