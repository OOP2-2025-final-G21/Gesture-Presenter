import React, { useEffect, useRef } from 'react';
import useGestureDetector from '../hooks/useGestureDetector';

// NOTE: We import Mediapipe types at runtime; TypeScript may need ambient types or @types packages.
// To avoid compile errors in projects without those types, some imports are typed as any.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Hands } from '@mediapipe/hands';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Camera } from '@mediapipe/camera_utils';

interface Props {
  onNext?: () => void;
  onPrev?: () => void;
  onPointerMove?: (p: { x: number; y: number }) => void; // normalized 0..1
  debug?: boolean;
}

export const HandDetector: React.FC<Props> = ({ onNext, onPrev, onPointerMove, debug = false }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { processResults } = useGestureDetector({ onNext, onPrev, onPointerMove });

  useEffect(() => {
    const videoEl = videoRef.current;
    const canvasEl = canvasRef.current;
    if (!videoEl || !canvasEl) return;

    const canvasCtx = canvasEl.getContext('2d');
    if (!canvasCtx) return;

    // @ts-ignore
    const hands = new Hands({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results: any) => {
      // draw the current video frame as the background of canvas
      canvasEl.width = videoEl.videoWidth;
      canvasEl.height = videoEl.videoHeight;
      canvasCtx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      canvasCtx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

      // draw landmarks simply
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

      // pass results to gesture detector
      try {
        processResults(results);
      } catch (e) {
        if (debug) console.error('gesture process error', e);
      }
    });

    // initialize camera
    // @ts-ignore
    const camera = new Camera(videoEl, {
      onFrame: async () => {
        try {
          // @ts-ignore
          await hands.send({ image: videoEl });
        } catch (e) {
          if (debug) console.warn('hands send error', e);
        }
      },
      width: 640,
      height: 480,
    });

    camera.start().catch((e: any) => {
      if (debug) console.error('camera start failed', e);
    });

    return () => {
      try {
        camera.stop();
      } catch (e) {
        // ignore
      }
      try {
        // @ts-ignore
        hands.close();
      } catch (e) {
        // ignore
      }
    };
  }, [processResults, debug]);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 800 }}>
      <video ref={videoRef} style={{ display: 'none' }} playsInline />
      <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', background: '#000' }} />
    </div>
  );
};

export default HandDetector;
