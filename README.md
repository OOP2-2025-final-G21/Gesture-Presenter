# プロモーション動画
https://youtu.be/YMAnNdMtwL0

# figmaリンク
https://www.figma.com/design/XX9u44SLqC7UbhfjjQDAvv/%E3%82%AA%E3%83%96%E3%82%B7%E3%82%B3%E6%9C%80%E7%B5%82%E8%AA%B2%E9%A1%8C?node-id=0-1&t=goYKsPyLQZVb60zf-1

# 概要画像
<img width="2940" height="1850" alt="image" src="https://github.com/user-attachments/assets/b38513cd-d1f1-44e6-9ad7-b29b1670c571" />
<img width="2940" height="1856" alt="image" src="https://github.com/user-attachments/assets/10b65936-8fab-4426-9153-701f8b9f848b" />
<img width="2942" height="4824" alt="image" src="https://github.com/user-attachments/assets/ac21165e-af0a-4aaa-b1ab-46ffdb198416" />

# AirSwipe

シンプルなジェスチャー操作でスライドを操作するデモアプリです。
MediaPipe Hands を利用してカメラ映像から手のランドマークを取得し、以下のジェスチャーを検出します。

- 親指を立てて右: 次のスライド
- 親指を立てて左: 前のスライド
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

## 役割担当
| 担当者          | 作業内容                   | 備考                            
- K24025 牛島羽琉 | ジェスチャー判定処理 　　　　　| MediaPipe Hands を用いたジェスチャー認識、右スワイプ・左スワイプ，指差しポインタの判定を実装予定。                      
- K24108 中島颯太 |  スライド管理・実行画面作成   | スライド実行画面のUI作成、左右ボタンによるスライド操作（右スワイプ／左スワイプ相当）、スライド終了ボタン、一括削除機能を担当。  
- K24138 水野堪太 |  ファイルアップロード機能　   | ファイルアップロード画面の作成、アップロード処理の実装、スライド再生ボタンの作成を担当。  
- K24014 石丸竜也 |  画像変換・システム連携   　　|pptxファイルを画像へ変換する処理、フロントエンドとバックエンドの連携、デバッグ用カメラ描画、手のランドマーク取得を担当。
# React + TypeScript + Vite
