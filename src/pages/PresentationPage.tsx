import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useSlidesStore } from '../store/slidesStore';
import HandDetector from '../components/HandDetector';

export const PresentationPage = () => {
  const navigate = useNavigate();
  const {
    slides,
    currentSlideIndex,
    isPlaying,
    endPresentation,
    nextSlide,
    previousSlide,
  } = useSlidesStore();

  const [showHeader, setShowHeader] = useState(false);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerLastUpdateRef = useRef<number>(0);

  // スライドがない、または再生中でない場合はホームにリダイレクト
  useEffect(() => {
    if (!isPlaying || slides.length === 0) {
      navigate('/', { replace: true });
    }
  }, [isPlaying, slides.length, navigate]);

  // スライド終了
  const handleEndSlide = () => {
    endPresentation();
    navigate('/');
  };

  // ===== ジェスチャーハンドラー =====
  const handleGestureNext = () => {
    // ポインターが活性化している場合はスライド操作を無効化（誤操作防止）
    const POINTER_TIMEOUT = 200;
    const isPointerActive = pointer && (performance.now() - pointerLastUpdateRef.current < POINTER_TIMEOUT);
    
    if (isPointerActive) {
      console.log('Gesture: Next blocked (pointer active)');
      return;
    }
    
    console.log('Gesture: Next slide');
    nextSlide();
  };

  const handleGesturePrev = () => {
    // ポインターが活性化している場合はスライド操作を無効化（誤操作防止）
    const POINTER_TIMEOUT = 200;
    const isPointerActive = pointer && (performance.now() - pointerLastUpdateRef.current < POINTER_TIMEOUT);
    
    if (isPointerActive) {
      console.log('Gesture: Prev blocked (pointer active)');
      return;
    }
    
    console.log('Gesture: Previous slide');
    previousSlide();
  };

  const handlePointerMove = (p: { x: number; y: number }) => {
    setPointer(p);
    pointerLastUpdateRef.current = performance.now();
  };

  // ===== ポインター描画 =====
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスサイズを画面サイズに合わせる
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationFrameId: number;

    // アニメーションループ
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const POINTER_TIMEOUT = 200; // 200ms更新がなければポインターを非表示
      const isPointerActive = pointer && (performance.now() - pointerLastUpdateRef.current < POINTER_TIMEOUT);

      if (isPointerActive) {
        const px = (1 - pointer.x) * canvas.width;
        const py = pointer.y * canvas.height;

        // ポインター描画（最適化）
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [pointer]);

  // ===== キーボード操作 =====
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      switch (e.key) {
        case "ArrowRight":
          nextSlide();
          break;
        case "ArrowLeft":
          previousSlide();
          break;
        case "Enter":
        case "Escape":
          handleEndSlide();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying]);

  // 画面クリックでヘッダー表示／非表示切り替え
  const handleScreenClick = () => {
    if (isPlaying) {
      setShowHeader((prev) => !prev);
    }
  };

  if (!isPlaying || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentSlideIndex];
  const slideTitle = currentSlide?.name.replace(/\.[^/.]+$/, '') || "プレゼンテーション";

  return (
    <div
      className="relative h-screen w-screen bg-white"
      onClick={handleScreenClick}
    >
      {/* ===== ヘッダー ===== */}
      {showHeader && (
        <div className="fixed top-0 left-0 w-full h-[47px] bg-[#232323] flex items-center px-4 z-10">
          {/* 左：終了ボタン */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEndSlide();
            }}
            className="
              px-3 py-1
              border border-white
              text-white text-[14px]
              rounded
              bg-transparent
              hover:opacity-60
              transition
            "
          >
            終了
          </button>

          {/* 中央：タイトル */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-white text-[16px] font-medium whitespace-nowrap">
              {slideTitle}
            </p>
          </div>
        </div>
      )}

      {/* ===== ポインター表示用キャンバス ===== */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 100,
        }}
      />

      {/* ===== ジェスチャー検出（非表示） ===== */}
      <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', visibility: 'hidden' }}>
        <HandDetector
          onNext={handleGestureNext}
          onPrev={handleGesturePrev}
          onPointerMove={handlePointerMove}
          debug={true}
          gestureSettings={{
            swipeThreshold: 0.12,
            swipeCooldown: 800,
            pointerThrottle: 5,
            smoothingAlpha: 0.85,
            frameInterval: 50,
            canvasScale: 1.0,
            pointerMovementThreshold: 0.120,
            requireIndexOnly: true,
            enableThumbDirection: true,
            thumbDirectionThreshold: 0.060,
            thumbCooldown: 800,
            invertHorizontal: true,
            invertActions: false,
          }}
        />
      </div>

      {/* ===== スライド実行画面 ===== */}
      <div className="flex flex-col items-center justify-center h-full w-full">
        <img
          src={currentSlide.imagePath}
          alt={currentSlide.name}
          className="
            w-full
            h-full
            object-contain
          "
        />

        {/* スライド操作コントロール（クリックで表示） */}
        {showHeader && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1 items-center z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                previousSlide();
              }}
              disabled={currentSlideIndex === 0}
              className="bg-[#232323] flex items-center justify-center px-[10px] py-2 rounded-xl disabled:opacity-30 hover:opacity-80 transition"
            >
              <span className="text-white text-[14px]">←</span>
            </button>

            <div className="bg-[#232323] flex items-center justify-center px-[30px] py-2 rounded-xl min-w-[91px]">
              <p className="text-white text-[14px]">
                {currentSlideIndex + 1}/{slides.length}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              disabled={currentSlideIndex === slides.length - 1}
              className="bg-[#232323] flex items-center justify-center px-[10px] py-2 rounded-xl disabled:opacity-30 hover:opacity-80 transition"
            >
              <span className="text-white text-[14px]">→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
