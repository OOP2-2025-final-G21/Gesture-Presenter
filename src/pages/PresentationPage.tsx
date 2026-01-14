import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSlidesStore } from '../store/slidesStore';

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

        {/* ボタン操作（保険） */}
        <div className="absolute bottom-8 flex gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              previousSlide();
            }}
            disabled={currentSlideIndex === 0}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 hover:bg-gray-400 transition"
          >
            ←
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            disabled={currentSlideIndex === slides.length - 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 hover:bg-gray-400 transition"
          >
            →
          </button>
        </div>

        <p className="absolute bottom-2 text-sm text-gray-600">
          {currentSlideIndex + 1} / {slides.length}
        </p>
      </div>
    </div>
  );
};
