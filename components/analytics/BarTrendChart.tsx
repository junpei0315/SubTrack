import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { AppColors } from '@/constants/colors';

export interface BarTrendPoint {
  key: string;
  label: string;
  amount: number;
  isProjected: boolean;
}

interface BarTrendChartProps {
  points: BarTrendPoint[];
  height?: number;
}

export const BarTrendChart: React.FC<BarTrendChartProps> = ({ points, height = 160 }) => {
  const maxAmount = useMemo(
    () => Math.max(...points.map((point) => point.amount), 1),
    [points]
  );

  const chartWidth = Math.max(points.length * 44, 280);
  const barWidth = 28;
  const gap = 16;
  const chartInnerHeight = height - 28;

  return (
    <View>
      <Svg width={chartWidth} height={height}>
        {points.map((point, index) => {
          const barHeight = (point.amount / maxAmount) * chartInnerHeight;
          const x = index * (barWidth + gap) + gap;
          const y = chartInnerHeight - barHeight + 4;

          return (
            <Rect
              key={point.key}
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barHeight, point.amount > 0 ? 4 : 0)}
              rx={6}
              fill={point.isProjected ? 'rgba(220, 5, 45, 0.35)' : AppColors.accentBrand}
            />
          );
        })}
      </Svg>
      <View className="flex-row" style={{ width: chartWidth, paddingHorizontal: gap }}>
        {points.map((point) => (
          <View
            key={`${point.key}-label`}
            style={{ width: barWidth + gap }}
            className="items-center"
          >
            <Text className="text-[10px] text-subtle" numberOfLines={1}>
              {point.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
