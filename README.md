# Gesture Presenter

シンプルなジェスチャー操作でスライドを操作するデモアプリです。
MediaPipe Hands を利用してカメラ映像から手のランドマークを取得し、以下のジェスチャーを検出します。

- 右スワイプ: 次のスライド
- 左スワイプ: 前のスライド
- 指差し (人差し指): 画面上のポインタを移動

## 必要条件

- Node.js >= 22.12（Vite の要件に合わせています）
- npm（または yarn）
- ブラウザのカメラアクセス許可

開発マシンは macOS での動作確認を行っていますが、一般的なモダンブラウザで動作する想定です。

## セットアップ（ローカル）

1. 依存関係のインストール

```bash
npm install
```

2. 開発サーバの起動

```bash
npm run dev
```

ブラウザで表示されるローカル URL（例: http://localhost:5173）にアクセスし、カメラの使用を許可してください。

## テスト

統合テストとして、ジェスチャー検出ロジック（`useGestureDetector`）に対する簡易テストを用意しています。

依存関係に `vitest` と `@testing-library/*` を追加しているため、テストを実行するには依存関係のインストールが必要です（上の `npm install` を実行してください）。

```bash
# 単体テストを実行
npm run test

# 1つのテストファイルだけ実行したい場合
npx vitest run test/useGestureDetector.integration.test.ts
```

テストは MediaPipe の結果をモックして swipe と pointer の発火を検証します。実機カメラを使う E2E テストではありません。

## 主要ファイル

- `src/components/HandDetector.tsx` — カメラ、MediaPipe Hands を初期化し、canvas に描画して結果を親に渡します。
- `src/hooks/useGestureDetector.ts` — ランドマークを受け取りジェスチャー判定を行うフック。`onNext` / `onPrev` / `onPointerMove` のコールバックを受け取ります。
- `src/components/GestureDebugPanel.tsx` — 開発用に閾値を調整できるデバッグ UI（必要に応じて App に差し込んで使えます）。

## トラブルシュート

- Node のバージョンエラーが出る場合は Node をアップデートしてください（例: Homebrew の `node@22` を利用）。
- カメラが黒画面になる場合はブラウザのカメラ許可設定を確認してください。
- 開発中にパフォーマンスが劣化する場合は、`src/components/HandDetector.tsx` の `hands.setOptions` で `modelComplexity` を下げたり、カメラ解像度を下げることを検討してください。

## 次の改善案

- Zoom 機能を復活させる場合は、`useGestureDetector` の Zoom 検出を再実装し、用途に応じて UI を追加します。
- ブラウザ上での E2E テスト（Puppeteer / Playwright）を追加してカメラ許可と実動作を検証する。
- パフォーマンス改善（video element + overlay canvas、フレームスロットル、canvas の内部解像度低減）を feature ブランチで実験し、安全な切り戻しを用意する。

---
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
