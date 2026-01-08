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
    <div className="file-upload-container">
      {/* 左側：アップロード領域 */}
      <div className="upload-section">
        <h1>ファイルをアップロード</h1>
        <p className="upload-description">.pptx / .png 対応</p>

        {/* ドラッグアンドドロップ領域 */}
        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`drag-drop-area ${isDragActive ? 'active' : ''}`}
        >
          <input
            ref={fileInputRef}
            id="file-input"
            type="file"
            multiple
            accept=".pptx,.png,.jpg,.jpeg,.gif"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          
          <svg className="upload-icon" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-14-8v16m0 0l-4-4m4 4l4-4" />
          </svg>

          <p className="drag-drop-text">
            {isDragActive ? 'ここにドロップしてください' : 'ドラッグ&ドロップ'}
          </p>
          <p className="drag-drop-subtext">または</p>

          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="upload-button"
          >
            {isUploading ? 'アップロード中...' : 'ファイルを選択'}
          </button>
        </div>
      </div>

      {/* 右側：ファイル一覧 */}
      <div className="file-list-section">
        <h2>アップロード済み</h2>

        {/* ファイルリスト */}
        <div className="file-list">
          {slides.length === 0 ? (
            <div className="file-list-empty">
              <p>まだファイルがアップロードされていません</p>
            </div>
          ) : (
            slides.map((slide, index) => (
              <div key={slide.id} className="file-item">
                <div className="file-info">
                  <div className="file-icon">📄</div>
                  <div className="file-details">
                    <p className="file-name">{slide.name}</p>
                    <p className="file-index">スライド {index + 1}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeSlide(slide.id)}
                  className="file-delete-btn"
                >
                  ×
                </button>

                {/* プログレスバー（アップロード中の場合） */}
                {uploadProgress[slide.id] !== undefined && uploadProgress[slide.id] < 100 && (
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${uploadProgress[slide.id]}%` }}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 再生ボタン */}
        <button
          onClick={handleStartPresentation}
          disabled={slides.length === 0}
          className="play-button"
        >
          <span>▶</span>
          <span>スライドを再生</span>
        </button>
      </div>
    </div>
  );
};
