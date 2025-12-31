import React from 'react';

interface Settings {
  swipeThreshold: number;
  swipeCooldown: number;
  pointerThrottle: number;
  smoothingAlpha: number;
  frameInterval: number;
  canvasScale: number;
}

interface Props {
  settings: Settings;
  onChange: (s: Settings) => void;
}

const GestureDebugPanel: React.FC<Props> = ({ settings, onChange }) => {
  const update = (patch: Partial<Settings>) => onChange({ ...settings, ...patch });

  return (
    <div style={{ marginTop: 12 }}>
      <h4 style={{ margin: '0 0 8px 0' }}>Gesture Debug</h4>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', fontSize: 12 }}>Swipe Threshold: {settings.swipeThreshold.toFixed(2)}</label>
        <input
          type="range"
          min={0.02}
          max={0.3}
          step={0.01}
          value={settings.swipeThreshold}
          onChange={e => update({ swipeThreshold: Number(e.target.value) })}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', fontSize: 12 }}>Swipe Cooldown (ms): {settings.swipeCooldown}</label>
        <input
          type="range"
          min={200}
          max={2000}
          step={50}
          value={settings.swipeCooldown}
          onChange={e => update({ swipeCooldown: Number(e.target.value) })}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', fontSize: 12 }}>Pointer Throttle (ms): {settings.pointerThrottle}</label>
        <input
          type="range"
          min={10}
          max={200}
          step={10}
          value={settings.pointerThrottle}
          onChange={e => update({ pointerThrottle: Number(e.target.value) })}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', fontSize: 12 }}>Frame Interval (ms): {settings.frameInterval}</label>
        <input
          type="range"
          min={30}
          max={250}
          step={10}
          value={settings.frameInterval}
          onChange={e => update({ frameInterval: Number(e.target.value) })}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', fontSize: 12 }}>Canvas Scale: {settings.canvasScale.toFixed(2)}</label>
        <input
          type="range"
          min={0.2}
          max={1.0}
          step={0.05}
          value={settings.canvasScale}
          onChange={e => update({ canvasScale: Number(e.target.value) })}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', fontSize: 12 }}>Smoothing α: {settings.smoothingAlpha.toFixed(2)}</label>
        <input
          type="range"
          min={0.1}
          max={0.95}
          step={0.05}
          value={settings.smoothingAlpha}
          onChange={e => update({ smoothingAlpha: Number(e.target.value) })}
        />
      </div>

      <style>{`input[type=range]{width:100%;margin:6px 0 12px 0}`}</style>
    </div>
  );
};

export default GestureDebugPanel;
