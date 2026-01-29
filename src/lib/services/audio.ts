// 音声再生サービス
// 優先順位: 1. 事前録音音声ファイル → 2. Web Speech API

import { speak, initSpeech, isSpeechAvailable } from './speech';

// 音声ファイルのキャッシュ
const audioCache = new Map<string, HTMLAudioElement>();

// 音声ファイルが存在するかチェック
async function checkAudioFileExists(url: string): Promise<boolean> {
	try {
		const response = await fetch(url, { method: 'HEAD' });
		return response.ok;
	} catch {
		return false;
	}
}

// 音声ファイルのパスを取得
function getAudioFilePath(kanaId: string): string {
	// kanaId形式: "hiragana-a" or "katakana-a"
	const parts = kanaId.split('-');
	if (parts.length < 2) return '';

	const type = parts[0]; // "hiragana" or "katakana"
	const romaji = parts.slice(1).join('-'); // "a", "ka", "kya" など

	return `/audio/${type}/${romaji}.mp3`;
}

// 音声ファイルを再生
async function playAudioFile(url: string): Promise<boolean> {
	return new Promise((resolve) => {
		// キャッシュを確認
		let audio = audioCache.get(url);

		if (!audio) {
			audio = new Audio(url);
			audioCache.set(url, audio);
		}

		audio.currentTime = 0;

		audio.onended = () => resolve(true);
		audio.onerror = () => resolve(false);

		audio.play().catch(() => resolve(false));
	});
}

// かな文字の音声を再生（メイン関数）
export async function playKanaAudio(kanaId: string, character: string): Promise<void> {
	// 1. まず事前録音音声を試す
	const audioPath = getAudioFilePath(kanaId);

	if (audioPath) {
		const exists = await checkAudioFileExists(audioPath);
		if (exists) {
			const played = await playAudioFile(audioPath);
			if (played) return;
		}
	}

	// 2. フォールバック: Web Speech API
	if (!isSpeechAvailable()) {
		initSpeech();
	}

	try {
		await speak(character, 0.7); // ゆっくり読む
	} catch (e) {
		console.warn('Speech synthesis failed:', e);
	}
}

// 音声ファイルをプリロード
export function preloadAudio(kanaIds: string[]): void {
	kanaIds.forEach(kanaId => {
		const path = getAudioFilePath(kanaId);
		if (path && !audioCache.has(path)) {
			const audio = new Audio();
			audio.preload = 'auto';
			audio.src = path;
			audioCache.set(path, audio);
		}
	});
}

// キャッシュをクリア
export function clearAudioCache(): void {
	audioCache.clear();
}
