import { useState, useRef } from 'react';
import { useSlidesStore } from '../store/slidesStore';

export const FileUploadScreen = () => {
  const { slides, addSlide, startPresentation, removeSlide } = useSlidesStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const dragCounter = useRef(0);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    setIsUploading(true);
    
    // ファイルを処理（複数ファイル対応）
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = `file-${Date.now()}-${i}`;
      
      // ファイル型のバリデーション
      if (!['image/jpeg', 'image/png', 'image/gif', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(file.type) && 
          !file.name.endsWith('.pptx') && !file.name.endsWith('.png')) {
        alert('対応している形式: .pptx, .png');
        continue;
      }

      // ファイルサイズチェック（50MB以下）
      if (file.size > 50 * 1024 * 1024) {
        alert('ファイルサイズは50MB以下にしてください');
        continue;
      }

      // プログレス表示の初期化
      setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

      // FileReaderを使用してプレビュー
      const reader = new FileReader();
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress((prev) => ({ ...prev, [fileId]: progress }));
        }
      };
      
      reader.onload = (e) => {
        const imagePath = e.target?.result as string;
        
        addSlide({
          id: fileId,
          name: file.name,
          imagePath,
          uploadedAt: new Date(),
        });

        // プログレスを100%にして、その後削除
        setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));
        setTimeout(() => {
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        }, 500);
      };
      reader.readAsDataURL(file);
    }

    setIsUploading(false);
    
    // ファイルインプットをリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      setIsDragActive(false);
      dragCounter.current = 0;
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    dragCounter.current = 0;
    const dt = e.dataTransfer;
    handleFiles(dt.files);
  };

  const handleStartPresentation = () => {
    if (slides.length === 0) {
      alert('スライドをアップロードしてください');
      return;
    }
    startPresentation();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-screen">
        
        {/* 左側：アップロード領域 */}
        <div className="flex-1 flex flex-col p-8 border-r border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            ファイルをアップロード
          </h1>
          <p className="text-gray-500 mb-8">
            .pptx / .png 対応
          </p>

          {/* ドラッグアンドドロップ領域 */}
          <div
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex-1 border-2 border-dashed rounded-2xl p-12 text-center transition flex flex-col items-center justify-center cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pptx,.png,.jpg,.jpeg,.gif"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="hidden"
            />
            
            <div className="mb-6">
              <svg
                className={`mx-auto h-20 w-20 transition ${isDragActive ? 'text-blue-400' : 'text-gray-300'}`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-14-8v16m0 0l-4-4m4 4l4-4"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <p className="text-gray-700 font-semibold mb-2 text-lg">
              {isDragActive ? 'ここにドロップしてください' : 'ドラッグ&ドロップ'}
            </p>
            <p className="text-gray-500 text-sm mb-8">
              または
            </p>

            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'アップロード中...' : 'ファイルを選択'}
            </button>
          </div>
        </div>

        {/* 右側：ファイル一覧 */}
        <div className="flex-1 flex flex-col p-8 bg-gray-50">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            アップロード済み
          </h2>

          {/* ファイルリスト */}
          <div className="flex-1 overflow-y-auto space-y-2 mb-6">
            {slides.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                <p>まだファイルがアップロードされていません</p>
              </div>
            ) : (
              slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className="p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-2xl flex-shrink-0">📄</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {slide.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        スライド {index + 1}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeSlide(slide.id)}
                    className="ml-2 text-gray-400 hover:text-red-500 transition font-bold text-lg leading-none flex-shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>

                  {/* プログレスバー（アップロード中の場合） */}
                  {uploadProgress[slide.id] !== undefined && uploadProgress[slide.id] < 100 && (
                    <div className="absolute bottom-0 left-0 right-0 w-full bg-gray-200 rounded-lg h-1">
                      <div
                        className="bg-blue-500 h-1 rounded-lg transition-all duration-300"
                        style={{ width: `${uploadProgress[slide.id]}%` }}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 再生ボタン */}
          {slides.length > 0 && (
            <button
              onClick={handleStartPresentation}
              className="w-full py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-900 transition flex items-center justify-center gap-2"
            >
              <span>▶</span>
              <span>スライドを再生</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
