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
        imagePath: `/presentations/${req.file.filename}`,
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
    const configPath = path.join(__dirname, 'public', 'presentations', 'config.json');
    
    // config.jsonを読み込み
    const configData = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configData);

    // スライドを検索
    const slideIndex = config.slides.findIndex((s: any) => s.id === slideId);
    if (slideIndex === -1) {
      return res.status(404).json({ error: 'スライドが見つかりません' });
    }

    const slide = config.slides[slideIndex];
    
    // 画像ファイルを削除
    try {
      const imagePath = path.join(__dirname, 'public', 'presentations', slide.image);
      await fs.unlink(imagePath);
    } catch (error) {
      console.error('画像削除エラー:', error);
    }

    // config.jsonから削除
    config.slides.splice(slideIndex, 1);
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');

    res.json({ success: true });
  } catch (error) {
    console.error('削除エラー:', error);
    res.status(500).json({ error: '削除に失敗しました' });
  }
});

app.listen(PORT, () => {
  console.log(`APIサーバーが起動しました: http://localhost:${PORT}`);
});
