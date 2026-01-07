import { useState, useRef } from 'react';
import { useSlidesStore } from '../store/slidesStore';

export const FileUploadScreen = () => {
  const { slides, addSlide, startPresentation, removeSlide } = useSlidesStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* ツーカラムレイアウト */}
        <div className="grid grid-cols-2 gap-8 h-screen">
          
          {/* 左側：アップロード領域 */}
          <div className="flex flex-col">
            <div className="flex-1 flex flex-col">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                ファイルをアップロード
              </h2>
              <p className="text-gray-600 mb-6">
                .pptx .pngに対応しています
              </p>

              {/* ドラッグアンドドロップ領域 */}
              <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-white hover:bg-gray-50 transition flex flex-col items-center justify-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pptx,.png,.jpg,.jpeg,.gif"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="hidden"
                />
                
                <div className="mb-4">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400"
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

                <p className="text-gray-700 font-semibold mb-2">
                  ここにドラッグ&ドロップ
                </p>

                <button
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className="mt-8 px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'アップロード中...' : 'ファイルを選択'}
                </button>
              </div>
            </div>
          </div>

          {/* 右側：ファイル一覧 */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                アップロード済み
              </h2>
              {slides.length > 0 && (
                <button
                  onClick={handleStartPresentation}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition flex items-center gap-2"
                >
                  <span>▶</span>
                  <span>スライドを再生</span>
                </button>
              )}
            </div>

            {/* ファイルリスト */}
            <div className="flex-1 overflow-y-auto space-y-3 bg-white rounded-lg p-4">
              {slides.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p>まだファイルがアップロードされていません</p>
                </div>
              ) : (
                slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-2xl">📄</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">
                            {slide.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            スライド {index + 1}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeSlide(slide.id)}
                        className="text-gray-400 hover:text-red-500 transition font-bold text-xl leading-none"
                      >
                        ×
                      </button>
                    </div>

                    {/* プログレスバー（アップロード中の場合） */}
                    {uploadProgress[slide.id] !== undefined && uploadProgress[slide.id] < 100 && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress[slide.id]}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
