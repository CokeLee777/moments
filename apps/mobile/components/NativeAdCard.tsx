import { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { NativeAd, NativeAdView } from 'react-native-google-mobile-ads';
import { NATIVE_AD_UNIT_ID } from '../lib/adUnits';

export function NativeAdCard() {
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);
  const adRef = useRef<NativeAd | null>(null);

  useEffect(() => {
    NativeAd.createForAdRequest(NATIVE_AD_UNIT_ID)
      .then((ad) => {
        adRef.current = ad;
        setNativeAd(ad);
      })
      .catch(() => {});

    return () => {
      adRef.current?.destroy();
    };
  }, []);

  if (!nativeAd) return null;

  return (
    <NativeAdView
      nativeAd={nativeAd}
      style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 9,
        paddingHorizontal: 11,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.045)',
        gap: 4,
      }}
    >
      {/* 광고 배지 + 헤드라인 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ backgroundColor: '#eff6ff', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 }}>
          <Text style={{ fontSize: 8, fontWeight: '700', color: '#3b82f6' }}>광고</Text>
        </View>
        {nativeAd.headline ? (
          <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#1e293b', flex: 1 }} numberOfLines={1}>
            {nativeAd.headline}
          </Text>
        ) : null}
      </View>

      {/* 본문 */}
      {nativeAd.body ? (
        <Text style={{ fontSize: 8.5, color: '#64748b', lineHeight: 13 }} numberOfLines={2}>
          {nativeAd.body}
        </Text>
      ) : null}

      {/* CTA 버튼 */}
      {nativeAd.callToAction ? (
        <TouchableOpacity
          style={{
            alignSelf: 'flex-end',
            backgroundColor: '#eff6ff',
            borderRadius: 99,
            paddingHorizontal: 10,
            paddingVertical: 4,
            marginTop: 2,
          }}
        >
          <Text style={{ fontSize: 8.5, fontWeight: '700', color: '#3b82f6' }}>
            {nativeAd.callToAction}
          </Text>
        </TouchableOpacity>
      ) : null}
    </NativeAdView>
  );
}
