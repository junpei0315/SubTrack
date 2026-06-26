import { Text, View } from 'react-native';

import { AppColors } from '@/constants/colors';

import { ProductTourAnchor } from './ProductTourAnchor';

const DEMO_WEEKS = 12;
const DEMO_ROWS = 7;

/** ツアー用: サブスク詳細の使用頻度ヒートマップ（草）のイメージ。 */
export function ProductTourUsagePreview() {
  return (
    <ProductTourAnchor id="usage-heatmap">
      <View className="mx-4 mb-2 rounded-xl border border-white/10 bg-card-alt p-4">
        <Text className="mb-3 text-sm font-semibold text-foreground">使用頻度</Text>
        <View className="flex-row gap-1">
          {Array.from({ length: DEMO_WEEKS }, (_, week) => (
            <View key={week} className="gap-1">
              {Array.from({ length: DEMO_ROWS }, (_, day) => {
                const used = (week + day) % 3 !== 0;
                return (
                  <View
                    key={day}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      backgroundColor: used
                        ? AppColors.accentBrand
                        : 'rgba(255, 255, 255, 0.08)',
                    }}
                  />
                );
              })}
            </View>
          ))}
        </View>
        <Text className="mt-3 text-xs text-muted">使った日が色付きで記録されます</Text>
      </View>
    </ProductTourAnchor>
  );
}
