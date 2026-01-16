import { create } from 'zustand';

export interface Slide {
  id: string;
  name: string;
  imagePath: string;
  uploadedAt: Date;
}

interface SlidesStore {
  slides: Slide[];
  currentSlideIndex: number;
  isPlaying: boolean;
  presentationTitle: string;
  
  // スライド操作
  addSlide: (slide: Slide) => void;
  updateSlide: (id: string, updates: Partial<Slide>) => void;
  removeSlide: (id: string) => void;
  removeAllSlides: () => void;
  reorderSlides: (startIndex: number, endIndex: number) => void;
  setSlides: (slides: Slide[]) => void;
  
  // 再生制御
  startPresentation: (startIndex?: number) => void;
  endPresentation: () => void;
  nextSlide: () => void;
  previousSlide: () => void;
  goToSlide: (index: number) => void;
  
  // ゲッター
  getCurrentSlide: () => Slide | undefined;
  
  // config.json読み込み
  loadFromConfig: () => Promise<void>;
}

export const useSlidesStore = create<SlidesStore>((set, get) => ({
  slides: [],
  currentSlideIndex: 0,
  isPlaying: false,
  presentationTitle: '',

  addSlide: (slide: Slide) => set((state) => ({
    slides: [...state.slides, slide],
  })),

  updateSlide: (id: string, updates: Partial<Slide>) => set((state) => ({
    slides: state.slides.map((slide) =>
      slide.id === id ? { ...slide, ...updates } : slide
    ),
  })),

  removeSlide: (id: string) => set((state) => ({
    slides: state.slides.filter((slide) => slide.id !== id),
  })),

  removeAllSlides: () => set({
    slides: [],
    currentSlideIndex: 0,
    isPlaying: false,
  }),

  reorderSlides: (startIndex: number, endIndex: number) => set((state) => {
    const newSlides = [...state.slides];
    const [removed] = newSlides.splice(startIndex, 1);
    newSlides.splice(endIndex, 0, removed);
    return { slides: newSlides };
  }),

  setSlides: (slides: Slide[]) => set({ slides }),

  startPresentation: (startIndex = 0) => set({
    isPlaying: true,
    currentSlideIndex: 0,  // 常に最初のスライド（0番目）から開始
  }),

  endPresentation: () => set({
    isPlaying: false,
    currentSlideIndex: 0,
  }),

  nextSlide: () => set((state) => {
    const nextIndex = state.currentSlideIndex + 1;
    if (nextIndex < state.slides.length) {
      return { currentSlideIndex: nextIndex };
    }
    return state;
  }),

  previousSlide: () => set((state) => {
    const prevIndex = state.currentSlideIndex - 1;
    if (prevIndex >= 0) {
      return { currentSlideIndex: prevIndex };
    }
    return state;
  }),

  goToSlide: (index: number) => set((state) => {
    if (index >= 0 && index < state.slides.length) {
      return { currentSlideIndex: index };
    }
    return state;
  }),

  getCurrentSlide: () => {
    const state = get();
    return state.slides[state.currentSlideIndex];
  },

  loadFromConfig: async () => {
    try {
      const response = await fetch('/presentations/config.json');
      if (!response.ok) {
        // config.jsonが存在しない場合は空の状態で初期化
        console.warn('config.jsonが見つかりません。空の状態で開始します。');
        set({
          slides: [],
          presentationTitle: 'プレゼンテーション',
          currentSlideIndex: 0,
          isPlaying: false,
        });
        return;
      }
      
      const config = await response.json();
      
      const loadedSlides: Slide[] = config.slides.map((slide: any) => ({
        id: slide.id,
        name: slide.title,
        imagePath: `/presentations/${slide.image}`,  // 相対パスに修正
        uploadedAt: new Date(),
      }));

      // 既存のisPlayingとcurrentSlideIndexを保持
      const currentState = get();
      set({
        slides: loadedSlides,
        presentationTitle: config.title || 'プレゼンテーション',
        // isPlayingとcurrentSlideIndexは保持（プレゼンテーション中に呼ばれても影響なし）
      });

      console.log('config.jsonからスライドを読み込みました:', loadedSlides);
      console.log('プレゼンテーションタイトル:', config.title);
    } catch (error) {
      console.error('config.jsonの読み込みエラー:', error);
      // エラー時も空の状態で初期化
      set({
        slides: [],
        presentationTitle: 'プレゼンテーション',
        currentSlideIndex: 0,
        isPlaying: false,
      });
    }
  },
}));
