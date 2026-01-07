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
  
  // スライド操作
  addSlide: (slide: Slide) => void;
  removeSlide: (id: string) => void;
  removeAllSlides: () => void;
  
  // 再生制御
  startPresentation: () => void;
  endPresentation: () => void;
  nextSlide: () => void;
  previousSlide: () => void;
  goToSlide: (index: number) => void;
  
  // ゲッター
  getCurrentSlide: () => Slide | undefined;
}

export const useSlidesStore = create<SlidesStore>((set, get) => ({
  slides: [],
  currentSlideIndex: 0,
  isPlaying: false,

  addSlide: (slide: Slide) => set((state) => ({
    slides: [...state.slides, slide],
  })),

  removeSlide: (id: string) => set((state) => ({
    slides: state.slides.filter((slide) => slide.id !== id),
  })),

  removeAllSlides: () => set({
    slides: [],
    currentSlideIndex: 0,
    isPlaying: false,
  }),

  startPresentation: () => set({
    isPlaying: true,
    currentSlideIndex: 0,
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
}));
