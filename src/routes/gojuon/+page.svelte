<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Kana, GrowthLevel } from '$lib/types';
	import { getAllProgress } from '$lib/db';
	import BackButton from '$lib/components/BackButton.svelte';
	import TypeSwitcher from '$lib/components/TypeSwitcher.svelte';
	import GojuonTable from '$lib/components/GojuonTable.svelte';

	let kanaType = $state<'hiragana' | 'katakana'>('hiragana');
	let hiraganaList = $state<Kana[]>([]);
	let katakanaList = $state<Kana[]>([]);
	let progressMap = $state<Record<string, GrowthLevel>>({});

	onMount(async () => {
		const [hiraganaRes, katakanaRes] = await Promise.all([
			fetch('/data/hiragana.json'),
			fetch('/data/katakana.json')
		]);
		hiraganaList = await hiraganaRes.json();
		katakanaList = await katakanaRes.json();

		const progress = await getAllProgress();
		for (const p of progress) {
			progressMap[p.kanaId] = p.growthLevel;
		}
	});

	function handleTypeChange(type: 'hiragana' | 'katakana') {
		kanaType = type;
	}

	function handleSelect(kana: Kana) {
		goto(`/kana/${kana.id}`);
	}

	const currentList = $derived(kanaType === 'hiragana' ? hiraganaList : katakanaList);
</script>

<svelte:head>
	<title>ごじゅうおんひょう - かなマスター</title>
</svelte:head>

<div class="flex flex-col min-h-screen p-4">
	<!-- ヘッダー -->
	<header class="flex items-center gap-4 mb-4">
		<BackButton href="/" />
		<h1 class="text-xl font-bold text-[var(--color-text)]">もじを えらぶ</h1>
	</header>

	<!-- タイプ切り替え -->
	<div class="mb-4">
		<TypeSwitcher selected={kanaType} onchange={handleTypeChange} />
	</div>

	<!-- 五十音表 -->
	<div class="flex-1 overflow-y-auto pb-4">
		{#if currentList.length > 0}
			<GojuonTable
				kanaList={currentList}
				{progressMap}
				onSelect={handleSelect}
			/>
		{:else}
			<div class="flex items-center justify-center h-64">
				<span class="text-lg text-[var(--color-muted)]">よみこみちゅう...</span>
			</div>
		{/if}
	</div>
</div>
