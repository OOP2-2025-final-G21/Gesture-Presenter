import { useRef, useCallback, useEffect } from 'react';

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

interface Options {
  swipeThreshold?: number;
  swipeCooldown?: number;
  pointerThrottle?: number;
  smoothingAlpha?: number;
  debugCallback?: (info: { centerX: number; dx?: number; pointer?: { x: number; y: number } | null }) => void;
  frameInterval?: number;
  pointerMovementThreshold?: number;
  requireIndexOnly?: boolean;
  enableThumbDirection?: boolean;
  thumbDirectionThreshold?: number;
  thumbCooldown?: number;
  // invert horizontal direction (useful if handedness/view flips cause left/right to be reversed)
  invertHorizontal?: boolean;
  // invert next/prev actions
  invertActions?: boolean;
}

export default function useGestureDetector(cb: Callbacks, opts?: Options) {
  const centersRef = useRef<Array<{ x: number; t: number }>>([]);
  const lastSwipeTime = useRef<number>(0);
  const pointerLastTime = useRef<number>(0);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);

  const cbRef = useRef<Callbacks>(cb);
  const optsRef = useRef<Options | undefined>(opts);

  useEffect(() => {
    cbRef.current = cb;
  }, [cb]);

  useEffect(() => {
    optsRef.current = opts;
  }, [opts]);

  const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

  const processResults = useCallback((results: Results) => {
    if (!results || !results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;

    const now = performance.now();
    const landmarks = results.multiHandLandmarks[0];

    let sumX = 0;
    for (const lm of landmarks) sumX += lm.x;
    const centerX = sumX / landmarks.length;

    const buf = centersRef.current;
    buf.push({ x: centerX, t: now });
    if (buf.length > 30) buf.shift();

    let dx: number | undefined = undefined;
  if (buf.length >= 10) {
      const k = 5;
      const recent = buf.slice(-k);
      const earlier = buf.slice(-2 * k, -k);
      const avgRecent = recent.reduce((s, v) => s + v.x, 0) / recent.length;
      const avgEarlier = earlier.reduce((s, v) => s + v.x, 0) / earlier.length;
  dx = avgRecent - avgEarlier;
  if (optsRef.current?.invertHorizontal) dx = -dx;
      const SWIPE_THRESHOLD = optsRef.current?.swipeThreshold ?? 0.12;
      const SWIPE_COOLDOWN = optsRef.current?.swipeCooldown ?? 800;
      if (now - lastSwipeTime.current > SWIPE_COOLDOWN) {
        const invert = !!optsRef.current?.invertActions;
        if (dx > SWIPE_THRESHOLD) {
          if (invert) cbRef.current.onPrev && cbRef.current.onPrev(); else cbRef.current.onNext && cbRef.current.onNext();
          lastSwipeTime.current = now;
        } else if (dx < -SWIPE_THRESHOLD) {
          if (invert) cbRef.current.onNext && cbRef.current.onNext(); else cbRef.current.onPrev && cbRef.current.onPrev();
          lastSwipeTime.current = now;
        }
      }
    }

    // Thumb-direction based navigation
    if (optsRef.current?.enableThumbDirection) {
      const thumbTip = landmarks[4];
      const thumbMcp = landmarks[2];
      const THUMB_THRESHOLD = optsRef.current?.thumbDirectionThreshold ?? 0.06;
      const THUMB_COOLDOWN = optsRef.current?.thumbCooldown ?? 800;
      if (thumbTip && thumbMcp && now - lastSwipeTime.current > THUMB_COOLDOWN) {
        const dxThumb = thumbTip.x - thumbMcp.x;
        const adjDxThumb = optsRef.current?.invertHorizontal ? -dxThumb : dxThumb;
        const invertAct = !!optsRef.current?.invertActions;
        if (adjDxThumb > THUMB_THRESHOLD) {
          if (invertAct) cbRef.current.onPrev && cbRef.current.onPrev(); else cbRef.current.onNext && cbRef.current.onNext();
          lastSwipeTime.current = now;
        } else if (adjDxThumb < -THUMB_THRESHOLD) {
          if (invertAct) cbRef.current.onNext && cbRef.current.onNext(); else cbRef.current.onPrev && cbRef.current.onPrev();
          lastSwipeTime.current = now;
        }
      }
    }

    const indexTip = landmarks[8];
    const indexPip = landmarks[6];
    const POINTER_THROTTLE = optsRef.current?.pointerThrottle ?? 30;
    if (indexTip && indexPip && cbRef.current.onPointerMove) {
      const indexExtended = indexTip.y < indexPip.y - 0.03;
      const pointerMovementThreshold = optsRef.current?.pointerMovementThreshold ?? 0.03;
      const moving = typeof dx === 'number' && Math.abs(dx) > pointerMovementThreshold;

      let othersFolded = true;
      if (optsRef.current?.requireIndexOnly) {
        const middleTip = landmarks[12];
        const middlePip = landmarks[10];
        const ringTip = landmarks[16];
        const ringPip = landmarks[14];
        const pinkyTip = landmarks[20];
        const pinkyPip = landmarks[18];
        const foldThresh = 0.03;
        if (middleTip && middlePip && middleTip.y < middlePip.y - foldThresh) othersFolded = false;
        if (ringTip && ringPip && ringTip.y < ringPip.y - foldThresh) othersFolded = false;
        if (pinkyTip && pinkyPip && pinkyTip.y < pinkyPip.y - foldThresh) othersFolded = false;
      }

      if (indexExtended && !moving && othersFolded) {
        if (now - pointerLastTime.current > POINTER_THROTTLE) {
          pointerLastTime.current = now;
          const target = { x: clamp(indexTip.x), y: clamp(indexTip.y) };
          const prev = pointerRef.current;
          const alpha = optsRef.current?.smoothingAlpha ?? 0.6;
          const smoothed = prev ? { x: prev.x * (1 - alpha) + target.x * alpha, y: prev.y * (1 - alpha) + target.y * alpha } : target;
          pointerRef.current = smoothed;
          cbRef.current.onPointerMove(smoothed);
        }
      }
    }

    if (optsRef.current?.debugCallback) {
      optsRef.current.debugCallback({ centerX, dx, pointer: pointerRef.current });
    }
  }, []);

  return { processResults };
}
