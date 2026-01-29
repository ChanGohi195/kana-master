/**
 * 手書きかな文字認識サービス
 *
 * TensorFlow.jsを使用してCanvas上の手書き文字を認識
 * モデルは別途準備が必要（ETL9G等のデータセットで学習）
 *
 * 現在の実装:
 * - ストローク数チェック（簡易判定）
 * - 画像前処理（64x64グレースケール）
 * - モデル読み込み・推論（モデルがある場合）
 */

// TensorFlow.jsの型定義
type TF = typeof import('@tensorflow/tfjs');
type LayersModel = import('@tensorflow/tfjs').LayersModel;
type Tensor4D = import('@tensorflow/tfjs').Tensor4D;

// 動的インポート用
let tf: TF | null = null;

// 認識結果
export interface RecognitionResult {
	predicted: string | null;
	confidence: number;
	isCorrect: boolean;
	strokeCountMatch: boolean;
	message: string;
}

// ひらがな・カタカナのラベル（107文字 × 2）
// モデル出力のインデックスに対応
const HIRAGANA_LABELS = [
	'あ', 'い', 'う', 'え', 'お',
	'か', 'き', 'く', 'け', 'こ',
	'さ', 'し', 'す', 'せ', 'そ',
	'た', 'ち', 'つ', 'て', 'と',
	'な', 'に', 'ぬ', 'ね', 'の',
	'は', 'ひ', 'ふ', 'へ', 'ほ',
	'ま', 'み', 'む', 'め', 'も',
	'や', 'ゆ', 'よ',
	'ら', 'り', 'る', 'れ', 'ろ',
	'わ', 'を', 'ん',
	// 濁音
	'が', 'ぎ', 'ぐ', 'げ', 'ご',
	'ざ', 'じ', 'ず', 'ぜ', 'ぞ',
	'だ', 'ぢ', 'づ', 'で', 'ど',
	'ば', 'び', 'ぶ', 'べ', 'ぼ',
	// 半濁音
	'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'
];

const KATAKANA_LABELS = HIRAGANA_LABELS.map(h => {
	// ひらがな → カタカナ変換
	return String.fromCharCode(h.charCodeAt(0) + 0x60);
});

// モデルのキャッシュ
let model: LayersModel | null = null;
let modelLoading = false;

/**
 * TensorFlow.jsを動的にロード
 */
async function loadTensorFlow(): Promise<TF | null> {
	if (tf) return tf;
	try {
		tf = await import('@tensorflow/tfjs');
		return tf;
	} catch (e) {
		console.warn('TensorFlow.js not available:', e);
		return null;
	}
}

/**
 * TensorFlow.jsモデルを読み込む
 */
export async function loadModel(): Promise<boolean> {
	if (model) return true;
	if (modelLoading) return false;

	modelLoading = true;

	try {
		const tfLib = await loadTensorFlow();
		if (!tfLib) return false;

		// モデルファイルの場所（static/model/以下に配置）
		model = await tfLib.loadLayersModel('/model/kana-model/model.json');
		console.log('Kana recognition model loaded');
		return true;
	} catch (e) {
		console.warn('Kana recognition model not available:', e);
		return false;
	} finally {
		modelLoading = false;
	}
}

/**
 * Canvasを64x64のグレースケール画像テンソルに変換
 */
function preprocessCanvas(canvas: HTMLCanvasElement): Tensor4D | null {
	if (!tf) return null;
	const targetSize = 64;

	// 一時Canvasで64x64にリサイズ
	const tempCanvas = document.createElement('canvas');
	tempCanvas.width = targetSize;
	tempCanvas.height = targetSize;
	const tempCtx = tempCanvas.getContext('2d')!;

	// 白背景で塗りつぶし
	tempCtx.fillStyle = 'white';
	tempCtx.fillRect(0, 0, targetSize, targetSize);

	// 元のCanvasを縮小描画
	tempCtx.drawImage(canvas, 0, 0, targetSize, targetSize);

	// ImageDataを取得
	const imageData = tempCtx.getImageData(0, 0, targetSize, targetSize);
	const data = imageData.data;

	// グレースケールに変換してテンソル化
	const grayscale = new Float32Array(targetSize * targetSize);

	for (let i = 0; i < data.length; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		// 反転（白背景・黒文字 → 黒背景・白文字）+ 正規化
		const gray = 1.0 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;
		grayscale[i / 4] = gray;
	}

	// [1, 64, 64, 1] の4次元テンソルを作成
	return tf!.tensor4d(grayscale, [1, targetSize, targetSize, 1]) as Tensor4D;
}

/**
 * 手書き文字を認識
 */
export async function recognizeCharacter(
	canvas: HTMLCanvasElement,
	expectedCharacter: string,
	expectedStrokeCount: number,
	actualStrokeCount: number,
	kanaType: 'hiragana' | 'katakana'
): Promise<RecognitionResult> {
	// ストローク数チェック
	const strokeCountMatch = expectedStrokeCount === 0 ||
		Math.abs(actualStrokeCount - expectedStrokeCount) <= 1;

	// モデルがない場合はストローク数のみで判定
	if (!model) {
		const modelLoaded = await loadModel();

		if (!modelLoaded) {
			// モデルなし: ストローク数のみで簡易判定
			if (!strokeCountMatch) {
				const diff = actualStrokeCount - expectedStrokeCount;
				const message = diff > 0
					? `かきすぎかも？ あと ${Math.abs(diff)} かく へらしてみよう`
					: `もう ${Math.abs(diff)} かく かいてみよう`;
				return {
					predicted: null,
					confidence: 0,
					isCorrect: false,
					strokeCountMatch: false,
					message
				};
			}

			// ストローク数OK → 正解とみなす（簡易モード）
			return {
				predicted: expectedCharacter,
				confidence: 0.5,
				isCorrect: true,
				strokeCountMatch: true,
				message: 'じょうずにかけたね！'
			};
		}
	}

	// モデルで推論
	try {
		const inputTensor = preprocessCanvas(canvas);
		const prediction = model!.predict(inputTensor) as tf.Tensor;
		const probabilities = await prediction.data();

		// 最も確率の高いクラスを取得
		let maxProb = 0;
		let maxIndex = 0;
		for (let i = 0; i < probabilities.length; i++) {
			if (probabilities[i] > maxProb) {
				maxProb = probabilities[i];
				maxIndex = i;
			}
		}

		// ラベルを取得
		const labels = kanaType === 'hiragana' ? HIRAGANA_LABELS : KATAKANA_LABELS;
		const predicted = labels[maxIndex] || null;
		const confidence = maxProb;

		// 正解判定
		const isCorrect = predicted === expectedCharacter && confidence > 0.5;

		// メモリ解放
		inputTensor.dispose();
		prediction.dispose();

		// メッセージ生成
		let message: string;
		if (isCorrect) {
			if (confidence > 0.8) {
				message = 'すばらしい！ とてもじょうず！';
			} else if (confidence > 0.6) {
				message = 'じょうずにかけたね！';
			} else {
				message = 'かけたね！';
			}
		} else {
			if (!strokeCountMatch) {
				const diff = actualStrokeCount - expectedStrokeCount;
				message = diff > 0
					? `あと ${Math.abs(diff)} かく へらしてみよう`
					: `もう ${Math.abs(diff)} かく かいてみよう`;
			} else if (predicted) {
				message = `「${predicted}」にみえるよ。もういちどかいてみよう`;
			} else {
				message = 'もういちど かいてみよう';
			}
		}

		return {
			predicted,
			confidence,
			isCorrect,
			strokeCountMatch,
			message
		};
	} catch (e) {
		console.error('Recognition error:', e);
		return {
			predicted: null,
			confidence: 0,
			isCorrect: false,
			strokeCountMatch,
			message: 'にんしきできませんでした'
		};
	}
}

/**
 * ストローク数のみで簡易判定
 */
export function checkStrokeCount(
	expectedStrokeCount: number,
	actualStrokeCount: number
): { match: boolean; message: string } {
	if (expectedStrokeCount === 0) {
		return { match: true, message: '' };
	}

	const diff = actualStrokeCount - expectedStrokeCount;

	if (Math.abs(diff) <= 1) {
		return { match: true, message: '' };
	}

	const message = diff > 0
		? `${Math.abs(diff)} かく おおいよ`
		: `あと ${Math.abs(diff)} かく`;

	return { match: false, message };
}

/**
 * モデルが読み込まれているか確認
 */
export function isModelLoaded(): boolean {
	return model !== null;
}
