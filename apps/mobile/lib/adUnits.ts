import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

const IS_DEV = __DEV__;

export const BANNER_AD_UNIT_ID = IS_DEV
  ? TestIds.ADAPTIVE_BANNER
  : Platform.select({
      android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
      ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
      default: TestIds.ADAPTIVE_BANNER,
    })!;

export const NATIVE_AD_UNIT_ID = IS_DEV
  ? TestIds.NATIVE
  : Platform.select({
      android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
      ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
      default: TestIds.NATIVE,
    })!;
