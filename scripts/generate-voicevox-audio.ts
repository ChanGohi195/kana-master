/**
 * VOICEVOX音声生成スクリプト
 *
 * 使用方法:
 * 1. VOICEVOXをインストール・起動（http://localhost:50021）
 * 2. npx tsx scripts/generate-voicevox-audio.ts
 *
 * 注意: VOICEVOXが起動していないと動作しません
 */

import fs from 'fs';
import path from 'path';

const VOICEVOX_URL = 'http://localhost:50021';
const SPEAKER_ID = 2; // ずんだもん（ノーマル）- 子供向けに適した声

// 清音46文字 + 濁音・半濁音25文字 = 71文字（拗音36文字は除外）
const KANA_LIST = [
	// 清音（あ行〜わ行）
	{ romaji: 'a', text: 'あ' },
	{ romaji: 'i', text: 'い' },
	{ romaji: 'u', text: 'う' },
	{ romaji: 'e', text: 'え' },
	{ romaji: 'o', text: 'お' },
	{ romaji: 'ka', text: 'か' },
	{ romaji: 'ki', text: 'き' },
	{ romaji: 'ku', text: 'く' },
	{ romaji: 'ke', text: 'け' },
	{ romaji: 'ko', text: 'こ' },
	{ romaji: 'sa', text: 'さ' },
	{ romaji: 'shi', text: 'し' },
	{ romaji: 'su', text: 'す' },
	{ romaji: 'se', text: 'せ' },
	{ romaji: 'so', text: 'そ' },
	{ romaji: 'ta', text: 'た' },
	{ romaji: 'chi', text: 'ち' },
	{ romaji: 'tsu', text: 'つ' },
	{ romaji: 'te', text: 'て' },
	{ romaji: 'to', text: 'と' },
	{ romaji: 'na', text: 'な' },
	{ romaji: 'ni', text: 'に' },
	{ romaji: 'nu', text: 'ぬ' },
	{ romaji: 'ne', text: 'ね' },
	{ romaji: 'no', text: 'の' },
	{ romaji: 'ha', text: 'は' },
	{ romaji: 'hi', text: 'ひ' },
	{ romaji: 'fu', text: 'ふ' },
	{ romaji: 'he', text: 'へ' },
	{ romaji: 'ho', text: 'ほ' },
	{ romaji: 'ma', text: 'ま' },
	{ romaji: 'mi', text: 'み' },
	{ romaji: 'mu', text: 'む' },
	{ romaji: 'me', text: 'め' },
	{ romaji: 'mo', text: 'も' },
	{ romaji: 'ya', text: 'や' },
	{ romaji: 'yu', text: 'ゆ' },
	{ romaji: 'yo', text: 'よ' },
	{ romaji: 'ra', text: 'ら' },
	{ romaji: 'ri', text: 'り' },
	{ romaji: 'ru', text: 'る' },
	{ romaji: 're', text: 'れ' },
	{ romaji: 'ro', text: 'ろ' },
	{ romaji: 'wa', text: 'わ' },
	{ romaji: 'wo', text: 'を' },
	{ romaji: 'n', text: 'ん' },

	// 濁音
	{ romaji: 'ga', text: 'が' },
	{ romaji: 'gi', text: 'ぎ' },
	{ romaji: 'gu', text: 'ぐ' },
	{ romaji: 'ge', text: 'げ' },
	{ romaji: 'go', text: 'ご' },
	{ romaji: 'za', text: 'ざ' },
	{ romaji: 'ji', text: 'じ' },
	{ romaji: 'zu', text: 'ず' },
	{ romaji: 'ze', text: 'ぜ' },
	{ romaji: 'zo', text: 'ぞ' },
	{ romaji: 'da', text: 'だ' },
	{ romaji: 'di', text: 'ぢ' },
	{ romaji: 'du', text: 'づ' },
	{ romaji: 'de', text: 'で' },
	{ romaji: 'do', text: 'ど' },
	{ romaji: 'ba', text: 'ば' },
	{ romaji: 'bi', text: 'び' },
	{ romaji: 'bu', text: 'ぶ' },
	{ romaji: 'be', text: 'べ' },
	{ romaji: 'bo', text: 'ぼ' },

	// 半濁音
	{ romaji: 'pa', text: 'ぱ' },
	{ romaji: 'pi', text: 'ぴ' },
	{ romaji: 'pu', text: 'ぷ' },
	{ romaji: 'pe', text: 'ぺ' },
	{ romaji: 'po', text: 'ぽ' },

	// 拗音（オプション）
	{ romaji: 'kya', text: 'きゃ' },
	{ romaji: 'kyu', text: 'きゅ' },
	{ romaji: 'kyo', text: 'きょ' },
	{ romaji: 'sha', text: 'しゃ' },
	{ romaji: 'shu', text: 'しゅ' },
	{ romaji: 'sho', text: 'しょ' },
	{ romaji: 'cha', text: 'ちゃ' },
	{ romaji: 'chu', text: 'ちゅ' },
	{ romaji: 'cho', text: 'ちょ' },
	{ romaji: 'nya', text: 'にゃ' },
	{ romaji: 'nyu', text: 'にゅ' },
	{ romaji: 'nyo', text: 'にょ' },
	{ romaji: 'hya', text: 'ひゃ' },
	{ romaji: 'hyu', text: 'ひゅ' },
	{ romaji: 'hyo', text: 'ひょ' },
	{ romaji: 'mya', text: 'みゃ' },
	{ romaji: 'myu', text: 'みゅ' },
	{ romaji: 'myo', text: 'みょ' },
	{ romaji: 'rya', text: 'りゃ' },
	{ romaji: 'ryu', text: 'りゅ' },
	{ romaji: 'ryo', text: 'りょ' },
	{ romaji: 'gya', text: 'ぎゃ' },
	{ romaji: 'gyu', text: 'ぎゅ' },
	{ romaji: 'gyo', text: 'ぎょ' },
	{ romaji: 'ja', text: 'じゃ' },
	{ romaji: 'ju', text: 'じゅ' },
	{ romaji: 'jo', text: 'じょ' },
	{ romaji: 'bya', text: 'びゃ' },
	{ romaji: 'byu', text: 'びゅ' },
	{ romaji: 'byo', text: 'びょ' },
	{ romaji: 'pya', text: 'ぴゃ' },
	{ romaji: 'pyu', text: 'ぴゅ' },
	{ romaji: 'pyo', text: 'ぴょ' }
];

async function generateAudio(text: string, outputPath: string): Promise<void> {
	// 音声合成クエリを作成
	const queryResponse = await fetch(
		`${VOICEVOX_URL}/audio_query?text=${encodeURIComponent(text)}&speaker=${SPEAKER_ID}`,
		{ method: 'POST' }
	);

	if (!queryResponse.ok) {
		throw new Error(`Failed to create audio query: ${queryResponse.statusText}`);
	}

	const query = await queryResponse.json();

	// 話速を調整（少しゆっくり）
	query.speedScale = 0.85;
	query.pitchScale = 0.05; // 少し高め

	// 音声合成
	const synthesisResponse = await fetch(
		`${VOICEVOX_URL}/synthesis?speaker=${SPEAKER_ID}`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(query)
		}
	);

	if (!synthesisResponse.ok) {
		throw new Error(`Failed to synthesize audio: ${synthesisResponse.statusText}`);
	}

	const audioBuffer = await synthesisResponse.arrayBuffer();
	fs.writeFileSync(outputPath, Buffer.from(audioBuffer));
}

async function main() {
	const baseDir = path.join(process.cwd(), 'static/audio');

	// VOICEVOXの接続確認
	try {
		const versionResponse = await fetch(`${VOICEVOX_URL}/version`);
		if (!versionResponse.ok) {
			throw new Error('VOICEVOX is not running');
		}
		const version = await versionResponse.text();
		console.log(`VOICEVOX version: ${version}`);
	} catch (error) {
		console.error('Error: VOICEVOXが起動していません。');
		console.error('VOICEVOXを起動してから再度実行してください。');
		process.exit(1);
	}

	// ひらがな音声生成
	console.log('\n=== ひらがな音声生成 ===');
	const hiraganaDir = path.join(baseDir, 'hiragana');

	for (const kana of KANA_LIST) {
		const outputPath = path.join(hiraganaDir, `${kana.romaji}.mp3`);

		// 既に存在する場合はスキップ
		if (fs.existsSync(outputPath)) {
			console.log(`Skip: ${kana.text} (${kana.romaji}) - already exists`);
			continue;
		}

		try {
			// WAVで生成してからMP3に変換する方が良いが、
			// VOICEVOXはWAV出力のみなので、ここではWAVを直接保存
			const wavPath = outputPath.replace('.mp3', '.wav');
			await generateAudio(kana.text, wavPath);
			console.log(`Generated: ${kana.text} (${kana.romaji})`);

			// 少し待機（API負荷軽減）
			await new Promise((resolve) => setTimeout(resolve, 100));
		} catch (error) {
			console.error(`Error generating ${kana.text}:`, error);
		}
	}

	// カタカナ音声生成（同じ発音なのでひらがなをコピー）
	console.log('\n=== カタカナ音声（ひらがなと同一発音） ===');
	const katakanaDir = path.join(baseDir, 'katakana');

	for (const kana of KANA_LIST) {
		const hiraganaPath = path.join(hiraganaDir, `${kana.romaji}.wav`);
		const katakanaPath = path.join(katakanaDir, `${kana.romaji}.wav`);

		if (fs.existsSync(hiraganaPath) && !fs.existsSync(katakanaPath)) {
			fs.copyFileSync(hiraganaPath, katakanaPath);
			console.log(`Copied: ${kana.romaji}`);
		}
	}

	console.log('\n完了！');
	console.log('注意: VOICEVOXはWAV形式で出力します。');
	console.log('MP3に変換する場合は ffmpeg を使用してください:');
	console.log('  for f in static/audio/**/*.wav; do ffmpeg -i "$f" "${f%.wav}.mp3"; done');
}

main().catch(console.error);
