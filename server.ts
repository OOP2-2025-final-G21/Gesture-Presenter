import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 静的ファイルの提供（画像アクセス用）
app.use('/presentations', express.static(path.join(__dirname, 'public', 'presentations')));

// 初期化：public/presentations ディレクトリと config.json を作成
const initializeStorage = async () => {
  const presentationsDir = path.join(__dirname, 'public', 'presentations');
  const configPath = path.join(presentationsDir, 'config.json');

  try {
    // ディレクトリを作成（既に存在する場合はスキップ）
    await fs.mkdir(presentationsDir, { recursive: true });
    
    // config.json が存在しない場合は作成
    try {
      await fs.access(configPath);
    } catch {
      const initialConfig = {
        title: 'プレゼンテーション',
        slides: []
      };
      await fs.writeFile(configPath, JSON.stringify(initialConfig, null, 2), 'utf-8');
      console.log('初期config.jsonを作成しました');
    }
  } catch (error) {
    console.error('初期化エラー:', error);
  }
};

// サーバー起動時に初期化
initializeStorage();

// アップロード先のディレクトリ設定
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'public', 'presentations');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('ディレクトリ作成エラー:', error);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // ファイル名をユニークにする
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `slide-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.pptx')) {
      cb(null, true);
    } else {
      cb(new Error('対応していないファイル形式です'));
    }
  }
});

// ファイルアップロードエンドポイント
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'ファイルがありません' });
    }

    const configPath = path.join(__dirname, 'public', 'presentations', 'config.json');
    
    // config.jsonの読み込み（存在しない場合は新規作成）
    let config;
    try {
      const configData = await fs.readFile(configPath, 'utf-8');
      config = JSON.parse(configData);
    } catch {
      config = {
        title: 'プレゼンテーション',
        slides: []
      };
    }

    // 新しいスライドを追加
    const slideId = `slide-${Date.now()}`;
    const newSlide = {
      id: slideId,
      title: req.body.title || path.basename(req.file.originalname, path.extname(req.file.originalname)),
      image: req.file.filename
    };

    config.slides.push(newSlide);

    // config.jsonを更新
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');

    res.json({
      success: true,
      slide: {
        id: slideId,
        name: newSlide.title,
        imagePath: `http://localhost:${PORT}/presentations/${req.file.filename}`,
        uploadedAt: new Date()
      }
    });
  } catch (error) {
    console.error('アップロードエラー:', error);
    res.status(500).json({ error: 'アップロードに失敗しました' });
  }
});

// スライド削除エンドポイント
app.delete('/api/slides/:id', async (req, res) => {
  try {
    const slideId = req.params.id;
    console.log(`削除リクエスト受信: slideId=${slideId}`);
    
    const configPath = path.join(__dirname, 'public', 'presentations', 'config.json');
    console.log(`config.jsonのパス: ${configPath}`);
    
    // config.jsonを読み込み
    const configData = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configData);
    console.log(`現在のスライド数: ${config.slides.length}`);

    // スライドを検索
    const slideIndex = config.slides.findIndex((s: any) => s.id === slideId);
    console.log(`スライドのインデックス: ${slideIndex}`);
    
    if (slideIndex === -1) {
      console.error(`スライドが見つかりません: ${slideId}`);
      console.log('利用可能なスライドID:', config.slides.map((s: any) => s.id));
      return res.status(404).json({ error: 'スライドが見つかりません' });
    }

    const slide = config.slides[slideIndex];
    console.log(`削除するスライド: ${slide.title}, 画像: ${slide.image}`);
    
    // 画像ファイルを削除
    try {
      const imagePath = path.join(__dirname, 'public', 'presentations', slide.image);
      console.log(`画像ファイルのパス: ${imagePath}`);
      await fs.unlink(imagePath);
      console.log('画像ファイルを削除しました');
    } catch (error) {
      console.error('画像削除エラー:', error);
      // 画像がなくても続行
    }

    // config.jsonから削除
    config.slides.splice(slideIndex, 1);
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    console.log('config.jsonを更新しました。残りのスライド数:', config.slides.length);

    res.json({ success: true });
  } catch (error) {
    console.error('削除エラー詳細:', error);
    res.status(500).json({ 
      error: '削除に失敗しました',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// スライドの順番を更新するエンドポイント
app.put('/api/slides/reorder', async (req, res) => {
  try {
    console.log('並び替えリクエストを受信:', req.body);
    const { slideIds } = req.body;
    
    if (!Array.isArray(slideIds)) {
      console.error('slideIdsが配列ではありません:', slideIds);
      return res.status(400).json({ error: '不正なリクエストです' });
    }

    const configPath = path.join(__dirname, 'public', 'presentations', 'config.json');
    console.log('config.jsonのパス:', configPath);
    
    // config.jsonを読み込み
    const configData = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configData);
    console.log('現在のスライド:', config.slides.map((s: any) => s.id));

    // 新しい順番でスライドを並び替え
    const reorderedSlides = slideIds
      .map(id => config.slides.find((s: any) => s.id === id))
      .filter(Boolean); // 存在するスライドのみ

    console.log('並び替え後のスライド数:', reorderedSlides.length);
    config.slides = reorderedSlides;

    // config.jsonを更新
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    console.log('config.jsonを更新しました');

    res.json({ success: true });
  } catch (error) {
    console.error('並び替えエラー詳細:', error);
    res.status(500).json({ error: '並び替えに失敗しました: ' + (error instanceof Error ? error.message : String(error)) });
  }
});

// スライドを全削除するエンドポイント
app.delete('/api/slides', async (req, res) => {
  try {
    const configPath = path.join(__dirname, 'public', 'presentations', 'config.json');
    const presentationsDir = path.join(__dirname, 'public', 'presentations');
    
    // config.jsonを読み込み
    const configData = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configData);

    // すべての画像ファイルを削除
    for (const slide of config.slides) {
      try {
        const imagePath = path.join(presentationsDir, slide.image);
        await fs.unlink(imagePath);
        console.log(`画像を削除しました: ${slide.image}`);
      } catch (error) {
        console.error(`画像削除エラー: ${slide.image}`, error);
      }
    }

    // config.jsonを初期化
    config.slides = [];
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    console.log('すべてのスライドを削除しました');

    res.json({ success: true });
  } catch (error) {
    console.error('全削除エラー詳細:', error);
    res.status(500).json({ error: '全削除に失敗しました: ' + (error instanceof Error ? error.message : String(error)) });
  }
});

app.listen(PORT, () => {
  console.log(`APIサーバーが起動しました: http://localhost:${PORT}`);
});
