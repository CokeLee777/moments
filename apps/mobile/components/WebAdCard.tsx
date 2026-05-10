import { useEffect, useRef } from 'react';
import { View } from 'react-native';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function WebAdCard() {
  const ref = useRef<View>(null);

  useEffect(() => {
    const el = ref.current as unknown as HTMLElement | null;
    if (!el) return;

    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.dataset.adClient = process.env.EXPO_PUBLIC_ADSENSE_ID ?? '';
    ins.dataset.adSlot = process.env.EXPO_PUBLIC_ADSENSE_SLOT ?? '';
    ins.dataset.adFormat = 'auto';
    ins.dataset.fullWidthResponsive = 'true';
    el.appendChild(ins);

    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
  }, []);

  return (
    <View
      ref={ref}
      style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        minHeight: 100,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.045)',
        overflow: 'hidden',
      }}
    />
  );
}
