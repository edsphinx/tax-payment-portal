/**
 * Third-party library type declarations
 */

declare module "signature_pad" {
  export default class SignaturePad {
    constructor(canvas: HTMLCanvasElement, options?: SignaturePadOptions);
    clear(): void;
    isEmpty(): boolean;
    fromDataURL(dataUrl: string, options?: FromDataURLOptions): Promise<void>;
    toDataURL(type?: string, encoderOptions?: number): string;
    toData(): PointGroup[];
    fromData(pointGroups: PointGroup[], options?: FromDataOptions): void;
    on(): void;
    off(): void;
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
  }

  export interface SignaturePadOptions {
    dotSize?: number | (() => number);
    minWidth?: number;
    maxWidth?: number;
    throttle?: number;
    minDistance?: number;
    backgroundColor?: string;
    penColor?: string;
    velocityFilterWeight?: number;
  }

  export interface Point {
    x: number;
    y: number;
    pressure: number;
    time: number;
  }

  export interface PointGroup {
    color: string;
    points: Point[];
  }

  export interface FromDataURLOptions {
    ratio?: number;
    width?: number;
    height?: number;
    xOffset?: number;
    yOffset?: number;
  }

  export interface FromDataOptions {
    clear?: boolean;
  }
}
