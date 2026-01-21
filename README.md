# プロモーション動画
https://youtu.be/YMAnNdMtwL0

# figmaリンク
https://www.figma.com/design/XX9u44SLqC7UbhfjjQDAvv/%E3%82%AA%E3%83%96%E3%82%B7%E3%82%B3%E6%9C%80%E7%B5%82%E8%AA%B2%E9%A1%8C?node-id=0-1&t=goYKsPyLQZVb60zf-1

# 概要画像
<img width="2940" height="1850" alt="image" src="https://github.com/user-attachments/assets/b38513cd-d1f1-44e6-9ad7-b29b1670c571" />
<img width="2940" height="1856" alt="image" src="https://github.com/user-attachments/assets/10b65936-8fab-4426-9153-701f8b9f848b" />
<img width="2942" height="4824" alt="image" src="https://github.com/user-attachments/assets/ac21165e-af0a-4aaa-b1ab-46ffdb198416" />

# AirSwipe

シンプルなジェスチャーでスライドを操作できる、Webベースのプレゼンテーション支援アプリケーションです。 MediaPipe Handsを活用し、カメラ映像から手のランドマークをリアルタイムに取得することで、マウスやキーボードに触れることなく直感的なプレゼンを実現します。


## 特徴・アピールポイント

- ジェスチャー操作のみでスライド操作が可能なプレゼン支援アプリ
- マウスやキーボードに触れずに操作でき、発表中の動作を妨げない
- MediaPipe Hands を用いたリアルタイムな手認識
- デバッグ用 UI により環境に合わせたジェスチャー判定の調整が容易

## 必要条件

- Node.js >= 22.12（Vite の要件に合わせています）
- npm（または yarn）
- ブラウザのカメラアクセス許可

開発マシンは macOS での動作確認を行っていますが、一般的なモダンブラウザで動作する想定です。  



## 使い方
動作にあたっては下記のセットアップを必ず行って下さい．

1. 依存関係のインストール

```bash
npm install
```

2. 開発サーバの起動

```bash
npm run dev:all
```

ブラウザで表示されるローカル URL（例: http://localhost:5173）にアクセスし、カメラの使用を許可してください。

1. アプリを起動し、カメラの使用を許可する
2. スライドを読み込み(jpeg,pngのみ)、再生ボタンを押す
3. 以下のジェスチャーで操作する
   - 親指を立てて右：次のスライド
   - 親指を立てて左：前のスライド
   - 人差し指：ポインタ移動
4. 終了ボタン(return)でスライドを終了する

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



## デバッグ機能

URL の末尾に `/debug` を付与することで、開発者向けのデバッグ画面にアクセスできます。

- ジェスチャー判定の閾値調整
- 手のランドマークや認識状態の可視化

一般利用者には表示されない設計とし、開発効率と安全性を両立しています。

## 主要ディレクトリ構成

```bash
Gesture-Presenter/
├── .git/
├── .gitignore
├── README.md
├── eslint.config.js
├── index.html
├── node_modules/
├── package-lock.json
├── package.json
├── postcss.config.js
├── server.ts
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── public/
│   ├── photo.png
│   ├── pptx.png
│   ├── trash.svg
│   ├── vite.svg
│   └── presentations/
│       ├── config.json
│ 
└── src/
    ├── App.css
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    ├── assets/
    │   └── react.svg
    ├── components/
    │   ├── FileUploadScreen.tsx    #ドラッグ&ドロップでファイルをアップロード
    │   ├── GestureDebugPanel.tsx   #ジェスチャー認識情報のリアルタイム表示
    │   ├── HandDetector.tsx        #MediaPipeで手を検出しカメラ映像を処理
    │   ├── PresentationScreen.tsx  #スライド表示とジェスチャー制御統合
    │   ├── SlideControls.tsx       #前後のスライド移動ボタン
    │   ├── SlideEndButton.tsx
    │   └── SlideViewer.tsx
    ├── hooks/
    │   └── useGestureDetector.ts   #手のランドマークからスワイプとポインター動作を検出
    ├── pages/
    │   ├── DebugPage.tsx           #ジェスチャー認識デバッグページ

    │   ├── FileUploadPage.tsx      #ファイルアップロードページ
    │   └── PresentationPage.tsx    #プレゼンテーション実行ページ
    ├── store/
    │   └── slidesStore.ts
    └── types/
        └── mediapipe.d.ts
```
## トラブルシュート

- Node のバージョンエラーが出る場合は Node をアップデートしてください（例: Homebrew の `node@22` を利用）。
- カメラが黒画面になる場合はブラウザのカメラ許可設定を確認してください。
- 開発中にパフォーマンスが劣化する場合は、`src/components/HandDetector.tsx` の `hands.setOptions` で `modelComplexity` を下げたり、カメラ解像度を下げることを検討してください。
- カメラ環境や照明条件によって認識精度が低下する場合があります。
- 背景に人がたくさんいる環境では、誤認識が起きる可能性があります。



## 開発者問い合わせ先

| 担当者 | 作業内容 | 備考 |
| :--- | :--- | :--- |
| [K24025 牛島羽琉](https://github.com/haru-ushijima) | **ジェスチャー判定処理** | MediaPipe Hands を用いたジェスチャー認識、右スワイプ・左スワイプ、指差しポインタの判定を実装予定。 |
| [K24108 中島颯太](https://github.com/nakashima02405) | **スライド管理・実行画面作成** | UI作成、左右ボタンによるスライド操作、スライド終了ボタン、一括削除機能を担当。 |
| [K24138 水野堪太](https://github.com/kinako1415) | **ファイルアップロード機能** | アップロード画面の作成、アップロード処理の実装、スライド再生ボタンの作成を担当。 |
| [K24014 石丸竜也](https://github.com/maru14000000) | **画像変換・システム連携** | フロントエンドとバックエンドの連携、デバッグ用カメラ描画、手のランドマーク取得を担当。 |


## 改善案
- スライドのZoom 機能を追加する場合は、`useGestureDetector` の Zoom 検出を再実装し、用途に応じて UI を追加します。
- ブラウザ上での E2E テスト（Puppeteer / Playwright）を追加してカメラ許可と実動作を検証する。
- パフォーマンス改善（video element + overlay canvas、フレームスロットル、canvas の内部解像度低減）を feature ブランチで実験し、安全な切り戻しを用意する。
- カメラから離れた時のジェスチャーの読み取りを安定させます。






