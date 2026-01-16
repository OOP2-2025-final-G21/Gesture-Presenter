declare module '@mediapipe/hands' {
  export interface HandsConfig {
    locateFile: (file: string) => string;
  }

  export interface HandsOptions {
    maxNumHands?: number;
    modelComplexity?: number;
    minDetectionConfidence?: number;
    minTrackingConfidence?: number;
  }

  export interface Landmark {
    x: number;
    y: number;
    z?: number;
    visibility?: number;
  }

  export interface Results {
    multiHandLandmarks?: Landmark[][];
    image?: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement;
  }

  export class Hands {
    constructor(config: HandsConfig);
    setOptions(options: HandsOptions): void;
    onResults(callback: (results: Results) => void): void;
    send(inputs: { image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement }): Promise<void>;
    close(): void;
  }
}

declare module '@mediapipe/camera_utils' {
  export interface CameraOptions {
    onFrame: () => Promise<void> | void;
    width: number;
    height: number;
  }

  export class Camera {
    constructor(videoElement: HTMLVideoElement, options: CameraOptions);
    start(): Promise<void>;
    stop(): void;
  }
}
