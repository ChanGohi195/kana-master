// かなデータ型
export interface Kana {
	id: string;
	character: string;
	type: 'hiragana' | 'katakana';
	romaji: string;
	row: string;
	strokeCount: number;
}

// 成長レベル（植物メタファー）
// 0: まだ (❓)
// 1: はじめて (🌱)
// 2: れんしゅうちゅう (🌿)
// 3: とくい (🌳)
// 4: マスター (🌸)
// 5: かんぺき (💮)
export type GrowthLevel = 0 | 1 | 2 | 3 | 4 | 5;

// 成長アイコンを取得
export function getGrowthIcon(level: GrowthLevel): string {
	const icons: Record<GrowthLevel, string> = {
		0: '❓',
		1: '🌱',
		2: '🌿',
		3: '🌳',
		4: '🌸',
		5: '💮'
	};
	return icons[level];
}

// 成長ラベルを取得（ひらがな）
export function getGrowthLabel(level: GrowthLevel): string {
	const labels: Record<GrowthLevel, string> = {
		0: 'まだ',
		1: 'はじめて',
		2: 'れんしゅうちゅう',
		3: 'とくい',
		4: 'マスター',
		5: 'かんぺき'
	};
	return labels[level];
}
