import { Image } from 'expo-image';
import React from 'react';
import { Text, View } from 'react-native';

import { resolveServiceLogo } from '@/components/subscriptions/serviceLogos';

const SIZE_CLASSES = {
  sm: 'h-8 w-8 rounded-lg',
  md: 'h-11 w-11 rounded-xl',
  lg: 'h-14 w-14 rounded-2xl',
} as const;

const TEXT_SIZE_CLASSES = {
  sm: 'text-xs',
  md: 'text-base',
  lg: 'text-lg',
} as const;

interface ServiceLogoBadgeProps {
  name: string;
  logoKey?: string | null;
  logoUri?: string | null;
  size?: keyof typeof SIZE_CLASSES;
}

export const ServiceLogoBadge: React.FC<ServiceLogoBadgeProps> = ({
  name,
  logoKey,
  logoUri,
  size = 'md',
}) => {
  const logoSource = resolveServiceLogo(logoKey ?? undefined, logoUri ?? undefined);
  const initial = name.charAt(0).toUpperCase();

  return (
    <View className={`overflow-hidden bg-surface ${SIZE_CLASSES[size]}`}>
      {logoSource ? (
        <Image source={logoSource} className="h-full w-full" contentFit="cover" />
      ) : (
        <View className="h-full w-full items-center justify-center">
          <Text className={`font-bold text-foreground ${TEXT_SIZE_CLASSES[size]}`}>{initial}</Text>
        </View>
      )}
    </View>
  );
};
