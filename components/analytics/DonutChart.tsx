import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { getChartColor } from './chartColors';

export interface DonutSegment {
  key: string;
  value: number;
  percentage: number;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  size = 168,
  strokeWidth = 28,
}) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {segments.map((segment, index) => {
          const dash = segment.percentage * circumference;
          const offset = circumference * (1 - cumulative);
          cumulative += segment.percentage;

          return (
            <Circle
              key={segment.key}
              cx={center}
              cy={center}
              r={radius}
              stroke={getChartColor(index)}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${dash} ${Math.max(circumference - dash, 0)}`}
              strokeDashoffset={offset}
              rotation={-90}
              origin={`${center}, ${center}`}
            />
          );
        })}
      </Svg>
    </View>
  );
};
