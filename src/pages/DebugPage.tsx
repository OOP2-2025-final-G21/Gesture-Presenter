import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HandDetector from '../components/HandDetector';
import GestureDebugPanel from '../components/GestureDebugPanel';
import { useSlidesStore } from '../store/slidesStore';

export const DebugPage = () => {
  const navigate = useNavigate();
  const { slides, currentSlideIndex, isPlaying } = useSlidesStore();
  
  const [lastAction, setLastAction] = useState<string>('');
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [currentState, setCurrentState] = useState<'idle' | 'pointer' | 'gesture'>('idle');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointerLastUpdateRef = useRef<number>(0);
  const gestureLastUpdateRef = useRef<number>(0);
  
  const [gestureSettings, setGestureSettings] = useState({
    swipeThreshold: 0.12,
    swipeCooldown: 800,
    pointerThrottle: 5,
    smoothingAlpha: 0.85,
    frameInterval: 50,
    canvasScale: 1.0,
    pointerMovementThreshold: 0.120,
    requireIndexOnly: true,
    enableThumbDirection: true,
    thumbDirectionThreshold: 0.060,
    thumbCooldown: 800,
    invertHorizontal: true,
    invertActions: false,
  });

  const handleNext = () => {
    setLastAction('Next slide');
    setCurrentState('gesture');
    gestureLastUpdateRef.current = performance.now();
    console.log('onNext');
  };

  const handlePrev = () => {
    setLastAction('Prev slide');
    setCurrentState('gesture');
    gestureLastUpdateRef.current = performance.now();
    console.log('onPrev');
  };

  const handlePointerMove = (p: { x: number; y: number }) => {
    setPointer(p);
    setLastAction('Pointer');
    setCurrentState('pointer');
    pointerLastUpdateRef.current = performance.now();
  };

  // 状態の自動更新
  useEffect(() => {
    const interval = setInterval(() => {
      const now = performance.now();
      const TIMEOUT = 500;
      
      const isPointerActive = now - pointerLastUpdateRef.current < TIMEOUT;
      const isGestureActive = now - gestureLastUpdateRef.current < TIMEOUT;
      
      if (isPointerActive) {
        setCurrentState('pointer');
      } else if (isGestureActive) {
        setCurrentState('gesture');
      } else {
        setCurrentState('idle');
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  const clearStatus = () => {
    setLastAction('');
    setPointer(null);
    setCurrentState('idle');
  };

  // 状態の表示情報
  const getStateInfo = () => {
    switch (currentState) {
      case 'pointer':
        return {
          label: '👉 ポインターモード',
          color: '#3b82f6',
          bgColor: '#eff6ff',
          description: '人差し指を立てています - ポインター操作中'
        };
      case 'gesture':
        return {
          label: '🖐️ ジェスチャーモード',
          color: '#f59e0b',
          bgColor: '#fffbeb',
          description: '親指を動かしています - スライド操作中'
        };
      case 'idle':
      default:
        return {
          label: '⏸️ 待機中',
          color: '#6b7280',
          bgColor: '#f9fafb',
          description: '手が検出されていないか、操作待ちです'
        };
    }
  };

  const stateInfo = getStateInfo();

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>🔧 Gesture Presenter - Debug Mode</h1>
        <button
          onClick={() => navigate('/')}
          style={{
            marginLeft: 'auto',
            padding: '8px 16px',
            background: '#232323',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          ← ホームに戻る
        </button>
      </header>

      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1, position: 'relative' }} ref={containerRef}>
          <h2 style={{ marginTop: 0 }}>カメラビュー</h2>
          <HandDetector
            debug={true}
            onNext={handleNext}
            onPrev={handlePrev}
            onPointerMove={handlePointerMove}
            gestureSettings={gestureSettings}
          />
        </div>

        <aside style={{ width: 400, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* 現在の状態表示 */}
          <div style={{ 
            padding: 20, 
            background: stateInfo.bgColor, 
            borderRadius: 8,
            border: `2px solid ${stateInfo.color}`,
            transition: 'all 0.3s ease'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: stateInfo.color, fontSize: 18 }}>
              {stateInfo.label}
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: '#4b5563' }}>
              {stateInfo.description}
            </p>
          </div>

          {/* ステータス表示 */}
          <div style={{ 
            padding: 16, 
            background: '#f9f9f9', 
            borderRadius: 8,
            border: '1px solid #e1e1e1'
          }}>
            <h3 style={{ margin: '0 0 12px 0' }}>📊 ステータス</h3>
            <div style={{ fontSize: 14, marginBottom: 8 }}>
              <strong>最後のアクション:</strong> {lastAction || '—'}
            </div>
            <div style={{ fontSize: 14, marginBottom: 8 }}>
              <strong>ポインター位置:</strong>{' '}
              {pointer ? `X: ${(pointer.x * 100).toFixed(1)}%, Y: ${(pointer.y * 100).toFixed(1)}%` : '—'}
            </div>
            <div style={{ fontSize: 14, marginBottom: 12 }}>
              <strong>スライド状態:</strong>{' '}
              {isPlaying ? `再生中 (${currentSlideIndex + 1}/${slides.length})` : '停止中'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                onClick={handlePrev}
                style={{
                  padding: '6px 12px',
                  background: '#e0e0e0',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                ← Prev
              </button>
              <button 
                onClick={handleNext}
                style={{
                  padding: '6px 12px',
                  background: '#e0e0e0',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Next →
              </button>
              <button 
                onClick={clearStatus}
                style={{
                  padding: '6px 12px',
                  background: '#f5f5f5',
                  border: '1px solid #d0d0d0',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                クリア
              </button>
            </div>
          </div>

          {/* 使用方法 */}
          <div style={{ 
            padding: 16, 
            background: '#f0f9ff', 
            borderRadius: 8,
            border: '1px solid #bfdbfe'
          }}>
            <h3 style={{ margin: '0 0 8px 0' }}>📖 使用方法</h3>
            <ol style={{ margin: '8px 0 0 18px', padding: 0, fontSize: 13, lineHeight: 1.6 }}>
              <li>カメラ許可を与える</li>
              <li>手を左右に動かして「最後のアクション」が更新されるか確認</li>
              <li>人差し指を立てて「ポインター位置」と赤いドットの追従を確認</li>
              <li>下の設定パネルでパラメータを調整可能</li>
            </ol>
          </div>

          {/* ジェスチャー設定パネル */}
          <GestureDebugPanel 
            settings={gestureSettings} 
            onChange={setGestureSettings} 
          />
        </aside>
      </div>
    </div>
  );
};
