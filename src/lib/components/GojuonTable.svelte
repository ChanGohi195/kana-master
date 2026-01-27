<script lang="ts">
	import type { Kana, GrowthLevel } from '../types';
	import KanaCell from './KanaCell.svelte';

	let {
		kanaList,
		progressMap = {},
		onSelect = (kana: Kana) => {}
	}: {
		kanaList: Kana[];
		progressMap?: Record<string, GrowthLevel>;
		onSelect?: (kana: Kana) => void;
	} = $props();

	// 五十音表の行定義
	const seionRows = ['あ行', 'か行', 'さ行', 'た行', 'な行', 'は行', 'ま行', 'や行', 'ら行', 'わ行'];
	const dakuonRows = ['が行', 'ざ行', 'だ行', 'ば行', 'ぱ行'];
	const katakanaSeionRows = ['ア行', 'カ行', 'サ行', 'タ行', 'ナ行', 'ハ行', 'マ行', 'ヤ行', 'ラ行', 'ワ行'];
	const katakanaDakuonRows = ['ガ行', 'ザ行', 'ダ行', 'バ行', 'パ行'];

	// 清音のみを取得
	$effect(() => {
		// 表示用にグループ化
	});

	function getKanaByRow(row: string): Kana[] {
		return kanaList.filter((k) => k.row === row && !k.row.includes('拗音'));
	}

	function getYoonKana(): Kana[] {
		return kanaList.filter((k) => k.row === '拗音');
	}

	function isHiragana(): boolean {
		return kanaList.length > 0 && kanaList[0].type === 'hiragana';
	}

	const rows = $derived(isHiragana() ? seionRows : katakanaSeionRows);
	const dakuRows = $derived(isHiragana() ? dakuonRows : katakanaDakuonRows);
</script>

<div class="gojuon-table space-y-6">
	<!-- 清音 -->
	<section>
		<h3 class="text-lg font-bold text-amber-700 mb-2">せいおん</h3>
		<div class="grid gap-2">
			{#each rows as row}
				{@const kanaInRow = getKanaByRow(row)}
				{#if kanaInRow.length > 0}
					<div class="grid grid-cols-5 gap-1">
						{#each kanaInRow as kana}
							<KanaCell
								{kana}
								growthLevel={progressMap[kana.id] ?? 0}
								onclick={() => onSelect(kana)}
							/>
						{/each}
					</div>
				{/if}
			{/each}
		</div>
	</section>

	<!-- 濁音・半濁音 -->
	<section>
		<h3 class="text-lg font-bold text-amber-700 mb-2">だくおん・はんだくおん</h3>
		<div class="grid gap-2">
			{#each dakuRows as row}
				{@const kanaInRow = getKanaByRow(row)}
				{#if kanaInRow.length > 0}
					<div class="grid grid-cols-5 gap-1">
						{#each kanaInRow as kana}
							<KanaCell
								{kana}
								growthLevel={progressMap[kana.id] ?? 0}
								onclick={() => onSelect(kana)}
							/>
						{/each}
					</div>
				{/if}
			{/each}
		</div>
	</section>

	<!-- 拗音 -->
	{@const yoon = getYoonKana()}
	{#if yoon.length > 0}
		<section>
			<h3 class="text-lg font-bold text-amber-700 mb-2">ようおん</h3>
			<div class="grid grid-cols-3 gap-1">
				{#each yoon as kana}
					<KanaCell
						{kana}
						growthLevel={progressMap[kana.id] ?? 0}
						onclick={() => onSelect(kana)}
					/>
				{/each}
			</div>
		</section>
	{/if}
</div>
