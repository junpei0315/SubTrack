import React from 'react';
import { View, type ViewProps } from 'react-native';

import { AppColors } from '@/constants/colors';

interface AnalyticsCardProps extends ViewProps {
  variant?: 'default' | 'accent';
  children: React.ReactNode;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  variant = 'default',
  children,
  className,
  style,
  ...props
}) => {
  const isAccent = variant === 'accent';

  return (
    <View
      className={`rounded-3xl bg-card px-4 py-4 ${className ?? ''}`}
      style={[
        isAccent
          ? {
              borderWidth: 1,
              borderColor: 'rgba(220, 5, 45, 0.35)',
              shadowColor: AppColors.accent,
              shadowOpacity: 0.18,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 4 },
            }
          : {
              borderWidth: 1,
              borderColor: AppColors.divider,
            },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};
