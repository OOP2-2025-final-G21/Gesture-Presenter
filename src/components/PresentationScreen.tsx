import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSlidesStore } from '../store/slidesStore';
import { HandDetector } from './HandDetector';

export const PresentationScreen = () => {
  const navigate = useNavigate();
  const {
    slides,
    currentSlideIndex,
    isPlaying,
    endPresentation,
    nextSlide,
    previousSlide,
    presentationTitle,
    loadFromConfig,
  } = useSlidesStore();

  const [showHeader, setShowHeader] = useState(true);  // 初期状態でヘッダーを表示
  const [showGestureOverlay, setShowGestureOverlay] = useState(false);

  // プレゼンテーション画面を開いた時にconfig.jsonを読み込む
  useEffect(() => {
    loadFromConfig();
  }, []);

  // デバッグ用：presentationTitleの値を確認
  useEffect(() => {
    console.log('現在のpresentationTitle:', presentationTitle);
  }, [presentationTitle]);

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

  // ジェスチャーオーバーレイの切り替え（Gキー）
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'g') {
        setShowGestureOverlay((prev) => !prev);
      }
    };
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, []);

  if (!isPlaying || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentSlideIndex];

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
              {presentationTitle || "プレゼンテーション"}
            </p>
            {/* デバッグ用 */}
            <p className="text-xs text-gray-400 ml-2">
              (デバッグ: "{presentationTitle}")
            </p>
          </div>
        </div>
      )}

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

        {/* ジェスチャー検出オーバーレイ */}
        {showGestureOverlay && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <HandDetector
              onNext={nextSlide}
              onPrev={previousSlide}
              gestureOptions={{
                enableThumbDirection: true,
                thumbDirectionThreshold: 0.08,
                thumbCooldown: 600,
                invertHorizontal: false,
                invertActions: false,
                requireIndexOnly: false,
              }}
              debug={false}
            />
          </div>
        )}

        {/* ジェスチャー操作ヒント */}
        {showGestureOverlay && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm pointer-events-none">
            👍 親指を左右に動かしてスライドを操作 | G キーで切り替え
          </div>
        )}


        <p className="absolute bottom-2 text-sm text-gray-600">
          {currentSlideIndex + 1} / {slides.length}
        </p>
      </div>
    </div>
  );
};
