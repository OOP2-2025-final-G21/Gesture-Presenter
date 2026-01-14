import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSlidesStore } from '../store/slidesStore';

export const FileUploadScreen = () => {
  const navigate = useNavigate();
  const { slides, addSlide, startPresentation, removeSlide } = useSlidesStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const dragCounter = useRef(0);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    setIsUploading(true);
    
    // ファイルを処理（複数ファイル対応）
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = `file-${Date.now()}-${i}`;
      
      // ファイル型のバリデーション（画像ファイルとpptxのみ）
      const isImage = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
      const isPptx = file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || file.name.endsWith('.pptx');
      
      if (!isImage && !isPptx) {
        alert('対応している形式: .pptx, .png, .jpg, .jpeg');
        continue;
      }

      // ファイルサイズチェック（50MB以下）
      if (file.size > 50 * 1024 * 1024) {
        alert('ファイルサイズは50MB以下にしてください');
        continue;
      }

      // ローディング状態を設定（プログレスを0に設定してスケルトンを表示）
      setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

      // スライドをローディング状態で追加
      addSlide({
        id: fileId,
        name: file.name,
        imagePath: '', // 一時的に空の画像パス
        uploadedAt: new Date(),
      });

      // 最初のファイルを自動的に選択
      if (!selectedSlideId) {
        setSelectedSlideId(fileId);
      }

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
        
        // スライドの画像パスを更新
        const slide = slides.find((s) => s.id === fileId);
        if (slide) {
          slide.imagePath = imagePath;
        }

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
    // スライドが選択されていない場合は最初のスライドから再生
    const indexToStart = selectedSlideId 
      ? slides.findIndex((slide) => slide.id === selectedSlideId)
      : 0;
    const finalIndex = indexToStart === -1 ? 0 : indexToStart;
    startPresentation(finalIndex);
    // プレゼンテーション画面に遷移
    navigate('/presentation');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload-container">
      {/* 左側：アップロード領域 */}
      <div className="upload-section">
        <div className="upload-header">
          <div className="icon-powerpoint-container">
            <img src="/pptx.png" alt="PowerPoint" className="icon-powerpoint" />
          </div>
          <div className="upload-title-container">
            <h1>ファイルをアップロード</h1>
            <p className="upload-description">.pptx .pngに対応しています</p>
          </div>
          <div className="icon-image-container">
            <img src="/photo.png" alt="Image" className="icon-image" />
          </div>
        </div>

        {/* ドラッグアンドドロップ領域 */}
        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
          className={`drag-drop-area ${isDragActive ? 'active' : ''}`}
        >
          <input
            ref={fileInputRef}
            id="file-input"
            type="file"
            multiple
            accept=".pptx,.png,.jpg,.jpeg,image/png,image/jpeg,image/jpg,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            onChange={handleFileSelect}
            disabled={isUploading}
          />

          <svg className="upload-icon" viewBox="0 0 64 64" fill="none">
            <path d="M32 20v24m0-24l-8 8m8-8l8 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 44v4a4 4 0 004 4h24a4 4 0 004-4v-4" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>

          <p className="drag-drop-text">
            {isDragActive ? 'ここにドロップ' : 'ここにドラッグ&ドロップ'}
          </p>
          <p className="drag-drop-subtext-visible">
            またはクリックしてファイルを選択
          </p>
        </div>
      </div>

      {/* 右側：ファイル一覧 */}
      <div className="file-list-section">
        {/* ファイルリスト */}
        <div className="file-list-container">
          <div className="file-list">
            {slides.length === 0 ? (
              <div className="file-list-empty">
                <p>まだファイルがアップロードされていません</p>
              </div>
            ) : (
              slides.map((slide, index) => {
                const isLoading = uploadProgress[slide.id] !== undefined;
                
                return (
                  <div key={slide.id}>
                    {isLoading ? (
                      // スケルトンローディングUI
                      <div className="file-skeleton">
                        <div className="skeleton-badge"></div>
                        <div className="skeleton-content">
                          <div className="skeleton-title"></div>
                          <div className="skeleton-subtitle"></div>
                        </div>
                      </div>
                    ) : (
                      // 通常のファイルカード
                      <div className="file-item">
                        <div className="file-item-content">
                          <div className="file-type-badge">.pptx</div>
                          <div className="file-info">
                            <div className="file-details">
                              <p className="file-name">{slide.name.replace(/\.[^/.]+$/, '')}</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              removeSlide(slide.id);
                              if (selectedSlideId === slide.id) {
                                setSelectedSlideId(null);
                              }
                            }}
                            className="file-delete-btn"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
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
