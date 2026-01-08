import { useState } from "react";
import "./App.css";

function App() {
  // スライド画像一覧
  const slides = [
    "/presentations/slide1.jpg",
    "/presentations/slide2.jpg",
    "/presentations/slide3.jpg",
  ];

  const [isRunning, setIsRunning] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // スライド開始
  const startSlide = () => {
    setIsRunning(true);
    setCurrentSlide(0);
  };

  // 次のスライド
  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  // 前のスライド
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // スライド終了
  const endSlide = () => {
    setIsRunning(false);
    setCurrentSlide(0);
  };

  return (
    <div className="relative h-screen w-screen bg-white flex flex-col align-items-center">
      {/* ===== ヘッダー ===== */}
      <div className="absolute h-[47px] left-0 top-0 w-full">
        <div className="absolute bg-[#232323] bottom-0 left-1/2 top-0 -translate-x-1/2 w-full" />
        <p className="absolute font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-normal left-1/2 text-[16px] text-center whitespace-nowrap text-white top-[calc(50%-9.5px)] -translate-x-1/2">
          スライドタイトル
        </p>
        <button
          onClick={endSlide}
          className="absolute font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-normal left-[calc(50%-717px)] text-[16px] whitespace-nowrap text-white top-[calc(50%-424.5px)] hover:opacity-80"
        >
          スライド終了
        </button>
      </div>

      {/* ===== メイン画面 ===== */}
      {!isRunning ? (
        // 開始画面
        <div className="flex items-center justify-center h-full bg-white">
          <button
            onClick={startSlide}
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            スライドを開始
          </button>
        </div>
      ) : (
        // スライド実行画面
        <div className="flex flex-col items-center justify-center flex-1 gap-6">
          <img
            src={slides[currentSlide]}
            alt="slide"
            className="max-h-[80vh] shadow-lg"
          />

          <div className="flex gap-4">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              ←
            </button>

            <button
              onClick={nextSlide}
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
