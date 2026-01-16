import React, { useEffect, useRef } from 'react';
import useGestureDetector from '../hooks/useGestureDetector';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

interface GestureSettings {
	swipeThreshold?: number;
	swipeCooldown?: number;
	pointerThrottle?: number;
	smoothingAlpha?: number;
	frameInterval?: number;
	canvasScale?: number;
	pointerMovementThreshold?: number;
	requireIndexOnly?: boolean;
	enableThumbDirection?: boolean;
	thumbDirectionThreshold?: number;
	thumbCooldown?: number;
	invertHorizontal?: boolean;
	invertActions?: boolean;
}

interface Props {
	onNext?: () => void;
	onPrev?: () => void;
	onPointerMove?: (p: { x: number; y: number }) => void;
	debug?: boolean;
	gestureSettings?: GestureSettings;
}

const HandDetector: React.FC<Props> = ({ onNext, onPrev, onPointerMove, debug = false, gestureSettings }) => {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const defaultGestureOpts = {
		swipeThreshold: 0.12,
		swipeCooldown: 800,
		pointerThrottle: 30,
		smoothingAlpha: 0.6,
		frameInterval: 100,
		canvasScale: 1.0,
		pointerMovementThreshold: 0.04,
		requireIndexOnly: true,
		enableThumbDirection: false,
			thumbDirectionThreshold: 0.06,
			thumbCooldown: 800,
				invertHorizontal: true,
				invertActions: true,
	};

	const mergedGestureOpts = { ...defaultGestureOpts, ...(gestureSettings || {}) };
	(mergedGestureOpts as unknown as { debugCallback: (info: unknown) => void }).debugCallback = (info: unknown) => debug && console.log('gesture debug', info);

	const latestPointerRef = useRef<{ x: number; y: number } | null>(null);
	const pointerLastUpdateRef = useRef<number>(0);

	const localOnPointerMove = (p: { x: number; y: number }) => {
		latestPointerRef.current = p;
		pointerLastUpdateRef.current = performance.now();
		if (onPointerMove) onPointerMove(p);
	};

	const { processResults } = useGestureDetector({ onNext, onPrev, onPointerMove: localOnPointerMove }, mergedGestureOpts);	useEffect(() => {
		const videoEl = videoRef.current;
		const canvasEl = canvasRef.current;
		if (!videoEl || !canvasEl) return;

		const canvasCtx = canvasEl.getContext('2d');
		if (!canvasCtx) return;

		const hands = new Hands({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });

		hands.setOptions({
			maxNumHands: 1,
			modelComplexity: 1,
			minDetectionConfidence: 0.6,
			minTrackingConfidence: 0.5,
		});

		hands.onResults((results: Results) => {
			canvasEl.width = videoEl.videoWidth;
			canvasEl.height = videoEl.videoHeight;
			canvasCtx.clearRect(0, 0, canvasEl.width, canvasEl.height);
			// Draw video flipped horizontally to present non-mirrored view (cancel browser selfie mirroring)
			canvasCtx.save();
			canvasCtx.translate(canvasEl.width, 0);
			canvasCtx.scale(-1, 1);
			canvasCtx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
			canvasCtx.restore();

					if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
				for (const landmarks of results.multiHandLandmarks) {
					for (const lm of landmarks) {
						const x = lm.x * canvasEl.width;
						const y = lm.y * canvasEl.height;
						canvasCtx.beginPath();
						canvasCtx.arc(x, y, 5, 0, 2 * Math.PI);
						canvasCtx.fillStyle = 'rgba(0,200,100,0.8)';
						canvasCtx.fill();
					}
				}
			}

		// draw pointer onto canvas so it exactly matches the landmarks/canvas transform
		const lp = latestPointerRef.current;
		const POINTER_TIMEOUT = 200; // hide pointer if no update for 200ms
		const isPointerActive = lp && (performance.now() - pointerLastUpdateRef.current < POINTER_TIMEOUT);
		if (isPointerActive) {
			const pxNorm = mergedGestureOpts.invertHorizontal ? 1 - lp.x : lp.x;
			const px = pxNorm * canvasEl.width;
			const py = lp.y * canvasEl.height;
			canvasCtx.beginPath();
			canvasCtx.arc(px, py, 10, 0, Math.PI * 2);
			canvasCtx.fillStyle = 'rgba(255,0,0,0.9)';
			canvasCtx.fill();
			canvasCtx.lineWidth = 2;
			canvasCtx.strokeStyle = 'rgba(255,255,255,0.6)';
			canvasCtx.stroke();
		}			try {
				processResults(results);
			} catch (e) {
				if (debug) console.error('gesture process error', e);
			}
		});

		const camera = new Camera(videoEl, {
			onFrame: async () => {
				try {
					await hands.send({ image: videoEl });
				} catch (e) {
					if (debug) console.warn('hands send error', e);
				}
			},
			width: 640,
			height: 480,
		});

		camera.start().catch((e: unknown) => {
			if (debug) console.error('camera start failed', e);
		});

		return () => {
			try { 
				camera.stop(); 
			} catch {
				// Ignore cleanup errors
			}
			try { 
				hands.close();
			} catch {
				// Ignore cleanup errors
			}
		};
	}, [processResults, debug, mergedGestureOpts.invertHorizontal]);

	return (
		<div style={{ position: 'relative', width: '100%', maxWidth: 800 }}>
			<video ref={videoRef} style={{ display: 'none' }} playsInline />
			<canvas ref={canvasRef} style={{ width: '100%', height: 'auto', background: '#000' }} />
		</div>
	);
};

export default HandDetector;
