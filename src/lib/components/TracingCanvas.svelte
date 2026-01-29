<script lang="ts">
	import { onMount } from 'svelte';
	import { getStroke } from 'perfect-freehand';

	let {
		character = '',
		expectedStrokeCount = 0,
		strokeColor = '#1f2937',
		strokeWidth = 4,
		guideOpacity = 0.25,
		disabled = false,
		onStrokeEnd = (strokes: number[][][]) => {},
		onStrokeCountChange = (count: number) => {}
	}: {
		character?: string;
		expectedStrokeCount?: number;
		strokeColor?: string;
		strokeWidth?: number;
		guideOpacity?: number;
		disabled?: boolean;
		onStrokeEnd?: (strokes: number[][][]) => void;
		onStrokeCountChange?: (count: number) => void;
	} = $props();

	let containerEl: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let isDrawing = false;
	let currentPoints: number[][] = [];
	let allStrokes: number[][][] = [];
	let canvasSize = $state(280);

	onMount(() => {
		// 動的サイズ計算
		updateCanvasSize();
		window.addEventListener('resize', updateCanvasSize);

		ctx = canvas.getContext('2d');
		if (ctx) {
			redraw();
		}

		return () => {
			window.removeEventListener('resize', updateCanvasSize);
		};
	});

	function updateCanvasSize() {
		// 90vw、最大400px
		const vw90 = window.innerWidth * 0.9;
		canvasSize = Math.min(vw90, 400);
	}

	$effect(() => {
		if (ctx && character !== undefined) {
			redraw();
		}
	});

	$effect(() => {
		if (canvas && canvasSize) {
			canvas.width = canvasSize;
			canvas.height = canvasSize;
			if (ctx) redraw();
		}
	});

	function getPointerPos(e: PointerEvent): [number, number, number] {
		const rect = canvas.getBoundingClientRect();
		const x = (e.clientX - rect.left) * (canvas.width / rect.width);
		const y = (e.clientY - rect.top) * (canvas.height / rect.height);
		const pressure = e.pressure || 0.5;
		return [x, y, pressure];
	}

	function handlePointerDown(e: PointerEvent) {
		if (disabled) return;
		e.preventDefault();
		canvas.setPointerCapture(e.pointerId);
		isDrawing = true;
		currentPoints = [getPointerPos(e)];
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDrawing || disabled) return;
		e.preventDefault();
		currentPoints.push(getPointerPos(e));
		redraw();
		drawCurrentStroke();
	}

	function handlePointerUp(e: PointerEvent) {
		if (!isDrawing || disabled) return;
		e.preventDefault();
		canvas.releasePointerCapture(e.pointerId);
		isDrawing = false;

		if (currentPoints.length > 1) {
			allStrokes.push([...currentPoints]);
			onStrokeEnd(allStrokes);
			onStrokeCountChange(allStrokes.length);
		}
		currentPoints = [];
		redraw();
	}

	function redraw() {
		if (!ctx || !canvas) return;

		const w = canvas.width;
		const h = canvas.height;

		// 背景（白）
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, w, h);

		// お手本文字（Klee One教科書体）
		if (character && guideOpacity > 0) {
			ctx.save();
			ctx.globalAlpha = guideOpacity;
			ctx.fillStyle = '#9ca3af';
			// Klee Oneフォントを使用
			ctx.font = `${w * 0.75}px "Klee One", serif`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(character, w / 2, h / 2);
			ctx.restore();
		}

		// ガイド線（十字）
		ctx.strokeStyle = '#e5e7eb';
		ctx.lineWidth = 1;
		ctx.setLineDash([6, 6]);

		ctx.beginPath();
		ctx.moveTo(w / 2, 0);
		ctx.lineTo(w / 2, h);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(0, h / 2);
		ctx.lineTo(w, h / 2);
		ctx.stroke();

		ctx.setLineDash([]);

		// 外枠（青）
		ctx.strokeStyle = 'var(--color-primary, #2563eb)';
		ctx.lineWidth = 3;
		ctx.strokeRect(1.5, 1.5, w - 3, h - 3);

		// 描いたストローク
		for (const stroke of allStrokes) {
			drawStroke(stroke);
		}
	}

	function drawStroke(points: number[][]) {
		if (!ctx || points.length < 2) return;

		const outlinePoints = getStroke(points, {
			size: strokeWidth * 3,
			thinning: 0.5,
			smoothing: 0.5,
			streamline: 0.5,
			simulatePressure: true
		});

		if (outlinePoints.length < 2) return;

		ctx.fillStyle = strokeColor;
		ctx.beginPath();
		ctx.moveTo(outlinePoints[0][0], outlinePoints[0][1]);

		for (let i = 1; i < outlinePoints.length; i++) {
			ctx.lineTo(outlinePoints[i][0], outlinePoints[i][1]);
		}

		ctx.closePath();
		ctx.fill();
	}

	function drawCurrentStroke() {
		if (currentPoints.length > 1) {
			drawStroke(currentPoints);
		}
	}

	export function clear() {
		allStrokes = [];
		currentPoints = [];
		onStrokeCountChange(0);
		redraw();
	}

	export function getStrokes(): number[][][] {
		return allStrokes;
	}

	export function getStrokeCount(): number {
		return allStrokes.length;
	}

	export function undo() {
		if (allStrokes.length > 0) {
			allStrokes.pop();
			redraw();
			onStrokeEnd(allStrokes);
			onStrokeCountChange(allStrokes.length);
		}
	}

	export function hasStrokes(): boolean {
		return allStrokes.length > 0;
	}

	export function getCanvasElement(): HTMLCanvasElement {
		return canvas;
	}

	// ストローク数の差を取得（手書き判定用）
	export function getStrokeDifference(): number {
		if (expectedStrokeCount === 0) return 0;
		return allStrokes.length - expectedStrokeCount;
	}
</script>

<div
	bind:this={containerEl}
	class="canvas-container flex items-center justify-center"
>
	<canvas
		bind:this={canvas}
		width={canvasSize}
		height={canvasSize}
		class="touch-none select-none rounded-xl"
		class:cursor-crosshair={!disabled}
		class:cursor-not-allowed={disabled}
		class:opacity-50={disabled}
		style="width: {canvasSize}px; height: {canvasSize}px;"
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointerleave={handlePointerUp}
		onpointercancel={handlePointerUp}
	></canvas>
</div>

<style>
	canvas {
		touch-action: none;
		background: white;
	}
</style>
