import type { Persistence } from 'firebase/auth';

// Firebase's package.json puts "types" before "react-native" in exports, so TypeScript
// resolves to auth-public.d.ts which omits getReactNativePersistence. The RN Metro
// bundler correctly uses the react-native bundle at runtime, so we just need the types.
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
