import Dexie, { type Table } from 'dexie';
import type { GrowthLevel } from '../types';

// 学習記録
export interface StudyRecord {
	id?: number;
	kanaId: string;
	mode: 'writing' | 'reading';
	result: 'correct' | 'close' | 'incorrect';
	timeSpent: number;
	timestamp: Date;
}

// かなごとの進捗
export interface KanaProgress {
	kanaId: string;
	discoveredAt: Date | null;

	writingAttempts: number;
	writingCorrect: number;

	readingAttempts: number;
	readingCorrect: number;

	growthLevel: GrowthLevel;
	lastStudied: Date;
}

class KanaMasterDB extends Dexie {
	studyRecords!: Table<StudyRecord>;
	kanaProgress!: Table<KanaProgress>;

	constructor() {
		super('kana-master');
		this.version(1).stores({
			studyRecords: '++id, kanaId, mode, result, timestamp',
			kanaProgress: 'kanaId, growthLevel, lastStudied'
		});
	}
}

export const db = new KanaMasterDB();

// 空の進捗を作成
function createEmptyProgress(kanaId: string): KanaProgress {
	return {
		kanaId,
		discoveredAt: new Date(),
		writingAttempts: 0,
		writingCorrect: 0,
		readingAttempts: 0,
		readingCorrect: 0,
		growthLevel: 1,
		lastStudied: new Date()
	};
}

// 学習記録を保存
export async function recordStudy(record: Omit<StudyRecord, 'id' | 'timestamp'>) {
	const fullRecord: StudyRecord = {
		...record,
		timestamp: new Date()
	};

	await db.studyRecords.add(fullRecord);
	await updateProgress(record.kanaId, record.mode, record.result);
}

// 進捗を更新
async function updateProgress(
	kanaId: string,
	mode: 'writing' | 'reading',
	result: 'correct' | 'close' | 'incorrect'
) {
	let progress = await db.kanaProgress.get(kanaId);

	if (!progress) {
		progress = createEmptyProgress(kanaId);
	}

	// モード別に更新
	if (mode === 'writing') {
		progress.writingAttempts++;
		if (result === 'correct') progress.writingCorrect++;
	} else {
		progress.readingAttempts++;
		if (result === 'correct') progress.readingCorrect++;
	}

	progress.lastStudied = new Date();

	// 成長レベルを計算
	progress.growthLevel = calculateGrowthLevel(progress);

	await db.kanaProgress.put(progress);
}

// 成長レベルを計算
function calculateGrowthLevel(progress: KanaProgress): GrowthLevel {
	const totalAttempts = progress.writingAttempts + progress.readingAttempts;
	const totalCorrect = progress.writingCorrect + progress.readingCorrect;

	if (totalAttempts === 0) return 0;

	// 練習回数ベースで成長
	if (totalAttempts >= 20 && totalCorrect >= 15) return 5; // かんぺき
	if (totalAttempts >= 15 && totalCorrect >= 10) return 4; // マスター
	if (totalAttempts >= 10 && totalCorrect >= 5) return 3; // とくい
	if (totalAttempts >= 5) return 2; // れんしゅうちゅう
	return 1; // はじめて
}

// 進捗を取得
export async function getProgress(kanaId: string): Promise<KanaProgress | undefined> {
	return db.kanaProgress.get(kanaId);
}

// 全進捗を取得
export async function getAllProgress(): Promise<KanaProgress[]> {
	return db.kanaProgress.toArray();
}

// 成長レベル別にカウント
export async function getGrowthCounts(): Promise<Record<GrowthLevel, number>> {
	const all = await db.kanaProgress.toArray();
	const counts: Record<GrowthLevel, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
	for (const p of all) {
		counts[p.growthLevel]++;
	}
	return counts;
}

// 最近の学習記録
export async function getRecentRecords(limit: number = 20): Promise<StudyRecord[]> {
	return db.studyRecords.orderBy('timestamp').reverse().limit(limit).toArray();
}

// 日別の学習回数
export async function getDailyStats(days: number = 7): Promise<{ date: string; count: number }[]> {
	const records = await db.studyRecords.toArray();
	const now = new Date();
	const stats: Map<string, number> = new Map();

	for (let i = 0; i < days; i++) {
		const d = new Date(now);
		d.setDate(d.getDate() - i);
		const key = d.toISOString().split('T')[0];
		stats.set(key, 0);
	}

	for (const r of records) {
		const key = r.timestamp.toISOString().split('T')[0];
		if (stats.has(key)) {
			stats.set(key, (stats.get(key) || 0) + 1);
		}
	}

	return Array.from(stats.entries())
		.map(([date, count]) => ({ date, count }))
		.reverse();
}

// 総学習時間を取得（ミリ秒）
export async function getTotalStudyTime(): Promise<number> {
	const records = await db.studyRecords.toArray();
	return records.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
}

// 総問題数を取得
export async function getTotalQuestionCount(): Promise<number> {
	return db.studyRecords.count();
}

// 今日の学習統計を取得
export async function getTodayStats(): Promise<{ time: number; count: number }> {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const records = await db.studyRecords.where('timestamp').aboveOrEqual(today).toArray();

	return {
		time: records.reduce((sum, r) => sum + (r.timeSpent || 0), 0),
		count: records.length
	};
}

// データクリア
export async function clearAllData() {
	await db.studyRecords.clear();
	await db.kanaProgress.clear();
}
