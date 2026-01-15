import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { useSlidesStore } from '../store/slidesStore';

export const FileUploadPage = () => {
  const navigate = useNavigate();
  const { slides, addSlide, updateSlide, startPresentation, removeSlide, removeAllSlides, setSlides, loadFromConfig } = useSlidesStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [orderedSlides, setOrderedSlides] = useState(slides);
  const dragCounter = useRef(0);

  // slidesが変更されたらorderedSlidesも更新
  useEffect(() => {
    setOrderedSlides(slides);
  }, [slides]);

  // 初回マウント時にconfig.jsonから読み込む
  useEffect(() => {
    loadFromConfig();
  }, []); // loadFromConfigは安定しているので空配列で良い

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    setIsUploading(true);
    
    // ファイルを処理（複数ファイル対応）
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tempId = `temp-${Date.now()}-${i}`;
      
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

      // ローディング状態のスライドを追加
      addSlide({
        id: tempId,
        name: file.name,
        imagePath: '',
        uploadedAt: new Date(),
      });

      // ローディング状態を設定
      setUploadProgress((prev) => ({ ...prev, [tempId]: 0 }));

      try {
        // FormDataを作成してAPIにアップロード
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

        // プログレスを更新
        setUploadProgress((prev) => ({ ...prev, [tempId]: 50 }));

        // APIにアップロード
        const response = await fetch('http://localhost:3001/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('アップロードに失敗しました');
        }

        const data = await response.json();

        // プログレスを100%に
        setUploadProgress((prev) => ({ ...prev, [tempId]: 100 }));

        // 古いスライド（tempId）を削除して、新しいスライドを追加
        removeSlide(tempId);
        addSlide(data.slide);

        // 最初のファイルを自動的に選択
        if (!selectedSlideId) {
          setSelectedSlideId(data.slide.id);
        }

        // ローディング状態を削除
        setTimeout(() => {
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[tempId];
            return newProgress;
          });
        }, 500);

      } catch (error) {
        console.error('アップロードエラー:', error);
        alert('ファイルのアップロードに失敗しました');
        
        // エラー時はスライドを削除
        removeSlide(tempId);
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[tempId];
          return newProgress;
        });
      }
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

  // Reorderでスライドの順番を変更
  const handleReorder = async (newOrder: typeof slides) => {
    setOrderedSlides(newOrder);
    setSlides(newOrder);

    // config.jsonも更新
    try {
      const slideIds = newOrder.map(slide => slide.id);
      console.log('並び替えリクエスト:', slideIds);
      
      const response = await fetch('http://localhost:3001/api/slides/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slideIds }),
      });

      const result = await response.json();
      console.log('サーバーレスポンス:', result);

      if (!response.ok) {
        throw new Error(result.error || '並び替えの保存に失敗しました');
      }

      console.log('並び替えを保存しました');
    } catch (error) {
      console.error('並び替えエラー詳細:', error);
      // エラーが発生してもUI上は変更を保持
      // alert('スライドの順番の保存に失敗しました: ' + (error instanceof Error ? error.message : String(error)));
    }
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
          <p className="upload-description">画像ファイルのみ対応しております。</p>
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
          {orderedSlides.length === 0 ? (
            <div className="file-list-empty">
              <p>まだファイルがアップロードされていません</p>
            </div>
          ) : (
            <Reorder.Group 
              axis="y" 
              values={orderedSlides} 
              onReorder={handleReorder}
              className="file-list"
            >
              {orderedSlides.map((slide) => {
                const isLoading = uploadProgress[slide.id] !== undefined;
                return (
                  <Reorder.Item
                    key={slide.id}
                    value={slide}
                    drag={!isLoading}
                    dragListener={!isLoading}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileDrag={{
                      scale: 1.02,
                      zIndex: 10,
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                    }}
                    transition={{
                      layout: {
                        type: 'spring',
                        stiffness: 300,
                        damping: 30
                      }
                    }}
                    style={{
                      cursor: isLoading ? 'default' : 'grab',
                      position: 'relative',
                      marginBottom: '6px',
                      listStyle: 'none'
                    }}
                  >
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
                        <div className="file-type-badge">
                          <img 
                            src={slide.imagePath} 
                            alt={slide.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                          />
                        </div>
                        <div className="file-info">
                          <div className="file-details">
                            <p className="file-name">{slide.name.replace(/\.[^/.]+$/, '')}</p>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              // APIでスライドを削除
                              const response = await fetch(`/api/slides/${slide.id}`, {
                                method: 'DELETE',
                              });

                              if (!response.ok) {
                                const errorData = await response.json().catch(() => ({}));
                                throw new Error(errorData.error || '削除に失敗しました');
                              }

                              // ストアからも削除
                              removeSlide(slide.id);
                              if (selectedSlideId === slide.id) {
                                setSelectedSlideId(null);
                              }
                            } catch (error) {
                              console.error('削除エラー:', error);
                              alert(`スライドの削除に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
                            }
                          }}
                          className="file-delete-btn"
                        >
                          ×
                        </button>
                        </div>
                      </div>
                    )}
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          )}
        </div>

        {/* ボタンエリア */}
        <div className="button-container">
          {/* 全削除ボタン */}
          <button
            onClick={async () => {
              if (slides.length === 0) return;
              
              if (!confirm('すべてのスライドを削除しますか？')) {
                return;
              }

              try {
                // 全削除APIを呼び出す
                console.log('全削除リクエストを送信します...');
                const response = await fetch('/api/slides', {
                  method: 'DELETE',
                });

                console.log('レスポンスステータス:', response.status);
                const result = await response.json();
                console.log('レスポンス内容:', result);

                if (!response.ok) {
                  throw new Error(result.error || result.details || '全削除に失敗しました');
                }

                // ストアからも全削除
                removeAllSlides();
                setSelectedSlideId(null);
                console.log('全削除が完了しました');
              } catch (error) {
                console.error('全削除エラー詳細:', error);
                alert(`スライドの削除に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
              }
            }}
            disabled={slides.length === 0}
            className="delete-all-button"
          >
            <img src="/trash.svg" alt="削除" className="trash-icon" />
          </button>

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
    </div>
  );
};
