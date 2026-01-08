import { useSlidesStore } from '../store/slidesStore';

export const PresentationScreen = () => {
  const {
    slides,
    currentSlideIndex,
    isPlaying,
    endPresentation,
    nextSlide,
    previousSlide,
  } = useSlidesStore();

  if (!isPlaying || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      {/* スライド表示エリア */}
      <div className="w-full h-full flex items-center justify-center p-8 bg-white">
        {currentSlide && (
          <img
            src={currentSlide.imagePath}
            alt={currentSlide.name}
            className="max-w-full max-h-full object-contain"
          />
        )}
      </div>

      {/* コントロールパネル */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 flex items-center justify-between">
        {/* スライド情報 */}
        <div className="text-lg font-semibold text-gray-800">
          スライド {currentSlideIndex + 1} / {slides.length}
        </div>

        {/* ナビゲーションボタン */}
        <div className="flex gap-4">
          <button
            onClick={previousSlide}
            disabled={currentSlideIndex === 0}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← 前へ
          </button>

          <button
            onClick={nextSlide}
            disabled={currentSlideIndex === slides.length - 1}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            次へ →
          </button>

          <button
            onClick={endPresentation}
            className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition"
          >
            終了
          </button>
        </div>
      </div>
    </div>
  );
};
