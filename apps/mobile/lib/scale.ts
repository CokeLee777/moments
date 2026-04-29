import { Dimensions, PixelRatio } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');
const BASE_W = 390; // iPhone 14 Pro
const BASE_H = 844;

/** 가로 기준 스케일 — borderRadius, 고정 width */
export const s = (n: number) =>
  Math.round(PixelRatio.roundToNearestPixel((W / BASE_W) * n));

/** 세로 기준 스케일 — 고정 height */
export const vs = (n: number) =>
  Math.round(PixelRatio.roundToNearestPixel((H / BASE_H) * n));

/**
 * 완만한 스케일 — fontSize 전용.
 * factor=0.45: 작은 기기에서 과하게 작아지지 않도록.
 */
export const ms = (n: number, factor = 0.45) =>
  Math.round(PixelRatio.roundToNearestPixel(n + (s(n) - n) * factor));
