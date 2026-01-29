<script lang="ts">
	import { settings } from '$lib/stores/settings';
	import { clearAllData } from '$lib/db';
	import BackButton from '$lib/components/BackButton.svelte';
	import Button from '$lib/components/Button.svelte';

	let showClearConfirm = $state(false);
	let currentSettings = $state({
		soundEnabled: true,
		strokeWidth: 4,
		speechRate: 0.8,
		parentPin: '1234'
	});

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
		<h1 class="text-xl font-bold text-[var(--color-text)]">せってい</h1>
	</header>

	<!-- 設定項目 -->
	<div class="space-y-4">
		<!-- 効果音 -->
		<section class="bg-[var(--color-surface)] rounded-xl p-4 border-2 border-[var(--color-border)]">
			<div class="flex items-center justify-between">
				<div>
					<h2 class="text-base font-bold text-[var(--color-text)]">こうかおん</h2>
					<p class="text-sm text-[var(--color-text-secondary)]">せいかい・ふせいかいの おと</p>
				</div>
				<button
					onclick={handleSoundToggle}
					aria-label="こうかおん オン・オフ"
					class="w-14 h-8 rounded-full transition-colors
						   {currentSettings.soundEnabled ? 'bg-[var(--color-correct)]' : 'bg-gray-300'}"
				>
					<div
						class="w-6 h-6 bg-white rounded-full shadow transition-transform
							   {currentSettings.soundEnabled ? 'translate-x-7' : 'translate-x-1'}"
					></div>
				</button>
			</div>
		</section>

		<!-- 線の太さ -->
		<section class="bg-[var(--color-surface)] rounded-xl p-4 border-2 border-[var(--color-border)]">
			<h2 class="text-base font-bold text-[var(--color-text)] mb-3">せんの ふとさ</h2>
			<input
				type="range"
				min="2"
				max="8"
				value={currentSettings.strokeWidth}
				oninput={handleStrokeWidthChange}
				class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
			/>
			<div class="flex justify-between text-xs text-[var(--color-text-secondary)] mt-2">
				<span>ほそい</span>
				<span>ふつう</span>
				<span>ふとい</span>
			</div>
		</section>

		<!-- 音声速度 -->
		<section class="bg-[var(--color-surface)] rounded-xl p-4 border-2 border-[var(--color-border)]">
			<h2 class="text-base font-bold text-[var(--color-text)] mb-3">よみあげの はやさ</h2>
			<input
				type="range"
				min="0.5"
				max="1.2"
				step="0.1"
				value={currentSettings.speechRate}
				oninput={handleSpeechRateChange}
				class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
			/>
			<div class="flex justify-between text-xs text-[var(--color-text-secondary)] mt-2">
				<span>ゆっくり</span>
				<span>ふつう</span>
				<span>はやい</span>
			</div>
		</section>

		<!-- データ削除 -->
		<section class="bg-[var(--color-surface)] rounded-xl p-4 border-2 border-[var(--color-border)]">
			<h2 class="text-base font-bold text-[var(--color-text)] mb-3">データ</h2>
			{#if showClearConfirm}
				<div class="bg-[var(--color-incorrect-light)] p-4 rounded-xl">
					<p class="text-[var(--color-incorrect)] text-sm mb-4">ほんとうに すべての データを けしますか?</p>
					<div class="flex gap-3">
						<Button variant="secondary" onclick={() => (showClearConfirm = false)}>
							やめる
						</Button>
						<Button variant="danger" onclick={handleClearData}>
							けす
						</Button>
					</div>
				</div>
			{:else}
				<button
					onclick={() => (showClearConfirm = true)}
					class="w-full py-3 bg-[var(--color-incorrect-light)] text-[var(--color-incorrect)]
						   rounded-xl font-bold hover:opacity-90 transition-opacity"
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
		width: 20px;
		height: 20px;
		background: var(--color-primary);
		border-radius: 50%;
		cursor: pointer;
	}
</style>
