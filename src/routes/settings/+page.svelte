<script lang="ts">
	import { settings } from '$lib/stores/settings';
	import { clearAllData } from '$lib/db';
	import BackButton from '$lib/components/BackButton.svelte';

	let showClearConfirm = $state(false);
	let currentSettings = $state({
		soundEnabled: true,
		strokeWidth: 4,
		speechRate: 0.8,
		parentPin: '1234'
	});

	// 設定を購読
	settings.subscribe((s) => {
		currentSettings = { ...s };
	});

	function handleSoundToggle() {
		settings.update((s) => ({ ...s, soundEnabled: !s.soundEnabled }));
	}

	function handleStrokeWidthChange(e: Event) {
		const value = parseInt((e.target as HTMLInputElement).value);
		settings.update((s) => ({ ...s, strokeWidth: value }));
	}

	function handleSpeechRateChange(e: Event) {
		const value = parseFloat((e.target as HTMLInputElement).value);
		settings.update((s) => ({ ...s, speechRate: value }));
	}

	async function handleClearData() {
		await clearAllData();
		showClearConfirm = false;
		alert('データをけしました');
	}
</script>

<svelte:head>
	<title>せってい - かなマスター</title>
</svelte:head>

<div class="flex flex-col min-h-screen p-4">
	<!-- ヘッダー -->
	<header class="flex items-center gap-4 mb-6">
		<BackButton href="/" />
		<h1 class="text-2xl font-bold text-amber-700">せってい</h1>
	</header>

	<!-- 設定項目 -->
	<div class="space-y-6">
		<!-- 効果音 -->
		<section class="bg-white rounded-2xl p-4 shadow-md">
			<div class="flex items-center justify-between">
				<div>
					<h2 class="text-lg font-bold text-gray-800">こうかおん</h2>
					<p class="text-sm text-gray-500">せいかい・ふせいかいの おと</p>
				</div>
				<button
					onclick={handleSoundToggle}
					class="w-16 h-9 rounded-full transition-colors
						   {currentSettings.soundEnabled ? 'bg-green-400' : 'bg-gray-300'}"
				>
					<div
						class="w-7 h-7 bg-white rounded-full shadow-md transition-transform
							   {currentSettings.soundEnabled ? 'translate-x-8' : 'translate-x-1'}"
					></div>
				</button>
			</div>
		</section>

		<!-- 線の太さ -->
		<section class="bg-white rounded-2xl p-4 shadow-md">
			<h2 class="text-lg font-bold text-gray-800 mb-2">せんの ふとさ</h2>
			<input
				type="range"
				min="2"
				max="8"
				value={currentSettings.strokeWidth}
				oninput={handleStrokeWidthChange}
				class="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
			/>
			<div class="flex justify-between text-sm text-gray-500 mt-1">
				<span>ほそい</span>
				<span>ふつう</span>
				<span>ふとい</span>
			</div>
		</section>

		<!-- 音声速度 -->
		<section class="bg-white rounded-2xl p-4 shadow-md">
			<h2 class="text-lg font-bold text-gray-800 mb-2">よみあげの はやさ</h2>
			<input
				type="range"
				min="0.5"
				max="1.2"
				step="0.1"
				value={currentSettings.speechRate}
				oninput={handleSpeechRateChange}
				class="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
			/>
			<div class="flex justify-between text-sm text-gray-500 mt-1">
				<span>ゆっくり</span>
				<span>ふつう</span>
				<span>はやい</span>
			</div>
		</section>

		<!-- データ削除 -->
		<section class="bg-white rounded-2xl p-4 shadow-md">
			<h2 class="text-lg font-bold text-gray-800 mb-2">データ</h2>
			{#if showClearConfirm}
				<div class="bg-red-50 p-4 rounded-xl">
					<p class="text-red-700 mb-4">ほんとうに すべての データを けしますか?</p>
					<div class="flex gap-3">
						<button
							onclick={() => (showClearConfirm = false)}
							class="flex-1 py-3 bg-gray-200 rounded-xl font-bold"
						>
							やめる
						</button>
						<button
							onclick={handleClearData}
							class="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold"
						>
							けす
						</button>
					</div>
				</div>
			{:else}
				<button
					onclick={() => (showClearConfirm = true)}
					class="w-full py-3 bg-red-100 text-red-700 rounded-xl font-bold
						   hover:bg-red-200 transition-colors"
				>
					データを けす
				</button>
			{/if}
		</section>
	</div>
</div>

<style>
	input[type='range']::-webkit-slider-thumb {
		appearance: none;
		width: 24px;
		height: 24px;
		background: #f59e0b;
		border-radius: 50%;
		cursor: pointer;
	}
</style>
