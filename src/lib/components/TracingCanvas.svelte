<script lang="ts">
	import { onMount } from 'svelte';
	import { getStroke } from 'perfect-freehand';

	let {
		width = 280,
		height = 280,
		character = '',
		strokeColor = '#333333',
		strokeWidth = 4,
		backgroundColor = '#ffffff',
		guideColor = '#e0e0e0',
		showGuide = true,
		guideOpacity = 0.3,
		disabled = false,
		onStrokeEnd = (strokes: number[][][]) => {}
	}: {
		width?: number;
		height?: number;
		character?: string;
		strokeColor?: string;
		strokeWidth?: number;
		backgroundColor?: string;
		guideColor?: string;
		showGuide?: boolean;
		guideOpacity?: number;
		disabled?: boolean;
		onStrokeEnd?: (strokes: number[][][]) => void;
	} = $props();

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let isDrawing = false;
	let currentPoints: number[][] = [];
	let allStrokes: number[][][] = [];

	onMount(() => {
		ctx = canvas.getContext('2d');
		if (ctx) {
			redraw();
		}
	});

	$effect(() => {
		if (ctx && character !== undefined) {
			redraw();
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
		}
		currentPoints = [];
		redraw();
	}

	function redraw() {
		if (!ctx) return;

		// 背景
		ctx.fillStyle = backgroundColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// お手本文字（半透明で下地に）
		if (character && guideOpacity > 0) {
			ctx.save();
			ctx.globalAlpha = guideOpacity;
			ctx.fillStyle = '#999999';
			ctx.font = `bold ${canvas.width * 0.75}px "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(character, canvas.width / 2, canvas.height / 2);
			ctx.restore();
		}

		// ガイド線
		if (showGuide) {
			ctx.strokeStyle = guideColor;
			ctx.lineWidth = 2;
			ctx.setLineDash([8, 8]);

			ctx.beginPath();
			ctx.moveTo(canvas.width / 2, 0);
			ctx.lineTo(canvas.width / 2, canvas.height);
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(0, canvas.height / 2);
			ctx.lineTo(canvas.width, canvas.height / 2);
			ctx.stroke();

			ctx.setLineDash([]);
			ctx.strokeStyle = '#fbbf24';
			ctx.lineWidth = 4;
			ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
		}

		ctx.setLineDash([]);

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
		}
	}

	export function hasStrokes(): boolean {
		return allStrokes.length > 0;
	}

	export function setGuideOpacity(opacity: number) {
		guideOpacity = opacity;
		redraw();
	}
</script>

<canvas
	bind:this={canvas}
	{width}
	{height}
	class="touch-none select-none rounded-2xl shadow-lg"
	class:cursor-crosshair={!disabled}
	class:cursor-not-allowed={disabled}
	class:opacity-50={disabled}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointerleave={handlePointerUp}
	onpointercancel={handlePointerUp}
></canvas>

<style>
	canvas {
		touch-action: none;
	}
</style>
