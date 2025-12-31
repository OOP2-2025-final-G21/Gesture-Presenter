import { useRef } from 'react';

type OnNext = () => void;
type OnPrev = () => void;
type OnPointerMove = (p: { x: number; y: number }) => void;

interface Callbacks {
  onNext?: OnNext;
  onPrev?: OnPrev;
  onPointerMove?: OnPointerMove;
}

type Landmark = { x: number; y: number; z?: number; visibility?: number };
type Results = { multiHandLandmarks?: Landmark[][] };

// Simple hook that returns a handler to process Mediapipe results
interface Options {
  swipeThreshold?: number;
  swipeCooldown?: number;
  pointerThrottle?: number;
  smoothingAlpha?: number;
  debugCallback?: (info: { centerX: number; dx?: number; pointer?: { x: number; y: number } | null }) => void;
  frameInterval?: number; // ms between frames sent to MediaPipe
}

export default function useGestureDetector(cb: Callbacks, opts?: Options) {
  const centersRef = useRef<Array<{ x: number; t: number }>>([]);
  const lastSwipeTime = useRef<number>(0);
  const pointerLastTime = useRef<number>(0);
  // zoomState and lastZoomToggle were used for zoom toggle logic previously; remove to avoid unused variables
  const pointerRef = useRef<{ x: number; y: number } | null>(null);

  const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

  const processResults = (results: Results) => {
    if (!results || !results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;

    const now = performance.now();
    const landmarks = results.multiHandLandmarks[0];

    // compute hand center x and width
    let sumX = 0;
    let minX = Infinity;
    let maxX = -Infinity;
    for (const lm of landmarks) {
      sumX += lm.x;
      if (lm.x < minX) minX = lm.x;
      if (lm.x > maxX) maxX = lm.x;
    }
    const centerX = sumX / landmarks.length;

    // push center to ring buffer
    const buf = centersRef.current;
    buf.push({ x: centerX, t: now });
    if (buf.length > 30) buf.shift();

    // SWIPE detection: compare avg of recent k vs previous k with cooldown
    let dx: number | undefined = undefined;
    if (buf.length >= 10) {
      const k = 5;
      const recent = buf.slice(-k);
      const earlier = buf.slice(-2 * k, -k);
      const avgRecent = recent.reduce((s: number, v: { x: number; t: number }) => s + v.x, 0) / recent.length;
      const avgEarlier = earlier.reduce((s: number, v: { x: number; t: number }) => s + v.x, 0) / earlier.length;
      dx = avgRecent - avgEarlier; // normalized -1..1
      const SWIPE_THRESHOLD = opts?.swipeThreshold ?? 0.12; // fraction of width
      const SWIPE_COOLDOWN = opts?.swipeCooldown ?? 800; // ms
      if (now - lastSwipeTime.current > SWIPE_COOLDOWN) {
        if (dx > SWIPE_THRESHOLD) {
          cb.onNext && cb.onNext();
          lastSwipeTime.current = now;
        } else if (dx < -SWIPE_THRESHOLD) {
          cb.onPrev && cb.onPrev();
          lastSwipeTime.current = now;
        }
      }
    }

    // POINTER detection: index finger extended -> smoothed pointer
    const indexTip = landmarks[8];
    const indexPip = landmarks[6];
  const POINTER_THROTTLE = opts?.pointerThrottle ?? 30; // ms
    if (indexTip && indexPip && cb.onPointerMove) {
      // indexTip.y smaller => finger pointing forward/up relative to image coordinates
      if (indexTip.y < indexPip.y - 0.03) {
        if (now - pointerLastTime.current > POINTER_THROTTLE) {
          pointerLastTime.current = now;
          // normalized coords
          const target = { x: clamp(indexTip.x), y: clamp(indexTip.y) };
          // smooth: low-pass filter
          const prev = pointerRef.current;
          const alpha = opts?.smoothingAlpha ?? 0.6; // smoothing factor (0..1)
          const smoothed = prev ? { x: prev.x * (1 - alpha) + target.x * alpha, y: prev.y * (1 - alpha) + target.y * alpha } : target;
          pointerRef.current = smoothed;
          cb.onPointerMove(smoothed);
        }
      }
    }

    // call debug callback with dx and pointer
    if (opts?.debugCallback) {
      opts.debugCallback({ centerX, dx, pointer: pointerRef.current });
    }
  };

  return { processResults };
}
