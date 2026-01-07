// ...existing code...
import { useState, useRef } from 'react';
import viteLogo from '/vite.svg';
import reactLogo from './assets/react.svg';
import HandDetector from './components/HandDetector';

function App() {
  const [lastAction, setLastAction] = useState<string>('');
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleNext = () => {
    setLastAction('Next slide');
    console.log('onNext');
  };

  const handlePrev = () => {
    setLastAction('Prev slide');
    console.log('onPrev');
  };

  const handlePointerMove = (p: { x: number; y: number }) => {
    setPointer(p);
    setLastAction('Pointer');
    // console.log('pointer', p);
  };

  const clearStatus = () => {
    setLastAction('');
    setPointer(null);
  };

  return (
    <div style={{ padding: 20 }}>
      <header style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <h1 style={{ marginLeft: 12 }}>Gesture Presenter — HandDetector Demo</h1>
      </header>

      <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
        <div style={{ flex: 1, position: 'relative' }} ref={containerRef}>
          <HandDetector
            debug={true}
            onNext={handleNext}
            onPrev={handlePrev}
            onPointerMove={handlePointerMove}
          />

          {/* pointer overlay inside detector container (maps normalized coords to container) */}
          {pointer && (
            <div
              style={{
                position: 'absolute',
                left: `${Math.min(Math.max(pointer.x, 0), 1) * 100}%`,
                top: `${Math.min(Math.max(pointer.y, 0), 1) * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: 14,
                height: 14,
                borderRadius: 7,
                background: 'rgba(255,0,0,0.9)',
                pointerEvents: 'none',
                boxShadow: '0 0 6px rgba(255,0,0,0.6)',
                zIndex: 20,
              }}
            />
          )}
        </div>

        <aside style={{ width: 300 }}>
          <div style={{ marginBottom: 12 }}>
            <h3 style={{ margin: '0 0 8px 0' }}>Status</h3>
            <div style={{ fontSize: 14, marginBottom: 6 }}>Last action: <strong>{lastAction || '—'}</strong></div>
            <div style={{ fontSize: 14 }}>
              Pointer: {pointer ? `${(pointer.x * 100).toFixed(1)}%, ${(pointer.y * 100).toFixed(1)}%` : '—'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handlePrev}>Prev (simulate)</button>
            <button onClick={handleNext}>Next (simulate)</button>
            <button onClick={clearStatus}>Clear</button>
          </div>

          <div style={{ marginTop: 16, fontSize: 13, color: '#555' }}>
            <p style={{ margin: '6px 0' }}><strong>確認手順</strong></p>
            <ol style={{ margin: '6px 0 0 18px' }}>
              <li>ブラウザでページを開き、カメラ許可を与える。</li>
              <li>手を右/左に払って Last action が更新されるか確認。</li>
              <li>人差し指で指差しをして Pointer の値と赤いドットの追従を確認。</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
// ...existing code...