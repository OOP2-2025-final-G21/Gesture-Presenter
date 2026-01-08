import { useEffect, useState } from "react";
import "./App.css";

function App() {
  // スライド画像一覧
  const slides = [
    "/presentations/slide1.jpg",
    "/presentations/slide2.jpg",
    "/presentations/slide3.jpg",
  ];

  const slideTitle = "スライドタイトル";

  const [isRunning, setIsRunning] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showHeader, setShowHeader] = useState(false);

  // スライド開始
  const startSlide = () => {
    setIsRunning(true);
    setCurrentSlide(0);
    setShowHeader(false);
  };

  // 次のスライド
  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev < slides.length - 1 ? prev + 1 : prev
    );
  };

  // 前のスライド
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  };

  // スライド終了
  const endSlide = () => {
    setIsRunning(false);
    setCurrentSlide(0);
    setShowHeader(false);
  };

  // ===== キーボード操作 =====
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isRunning) return;

      switch (e.key) {
        case "ArrowRight":
          nextSlide();
          break;
        case "ArrowLeft":
          prevSlide();
          break;
        case "Enter":
          endSlide();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning]);

  // 画面クリックでヘッダー表示／非表示切り替え
  const handleScreenClick = () => {
    if (isRunning) {
      setShowHeader((prev) => !prev);
    }
  };

  return (
    <div
      className="relative h-screen w-screen bg-white"
      onClick={handleScreenClick}
    >
      {/* ===== ヘッダー ===== */}
      {isRunning && showHeader && (
        <div className="fixed top-0 left-0 w-full h-[47px] bg-[#232323] flex items-center px-4 z-10">
          {/* 左：終了ボタン */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              endSlide();
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

      {/* ===== メイン画面 ===== */}
      {!isRunning ? (
        // 開始画面
        <div className="flex items-center justify-center h-full">
          <button
            onClick={startSlide}
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            スライドを開始
          </button>
        </div>
      ) : (
        // スライド実行画面
        <div className="flex flex-col items-center justify-center h-full pt-[47px] gap-6">
          <img
  src={slides[currentSlide]}
  alt="slide"
  className="
    w-full
    h-full
    object-contain
  "
/>


          {/* ボタン操作（保険） */}
          <div className="flex gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              disabled={currentSlide === 0}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              ←
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              disabled={currentSlide === slides.length - 1}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              →
            </button>
          </div>

          <p className="text-sm text-gray-600">
            {currentSlide + 1} / {slides.length}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
