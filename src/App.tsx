import { useState } from "react";
import "./App.css";

function App() {
  // スライド画像一覧
  const slides = [
    "/presentations/slide1.jpg",
    "/presentations/slide2.jpg",
    "/presentations/slide3.jpg",
  ];

  // スライド実行中かどうか
  const [isRunning, setIsRunning] = useState(false);

  // 現在のスライド番号
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

  // ---------- 開始画面 ----------
  if (!isRunning) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 bg-gray-100">
        <h1 className="text-2xl font-bold">Gesture Presenter</h1>
        <button
          onClick={startSlide}
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          スライドを開始
        </button>
      </div>
    );
  }

  // ---------- スライド実行画面 ----------
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 bg-gray-100">
      {/* スライド表示 */}
      <img
        src={slides[currentSlide]}
        alt="slide"
        className="max-h-[80vh] shadow-lg"
      />

      {/* 操作ボタン */}
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

        <button
          onClick={endSlide}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          終了
        </button>
      </div>

      {/* スライド番号 */}
      <p className="text-sm text-gray-600">
        {currentSlide + 1} / {slides.length}
      </p>
    </div>
  );
}

export default App;
