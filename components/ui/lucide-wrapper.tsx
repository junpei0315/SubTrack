import React from 'react';
import { Platform } from 'react-native';

import { LayoutGrid as LayoutGridNative } from 'lucide-react-native';
import { LayoutGrid as LayoutGridWeb } from 'lucide-react';
import { IconSymbol } from '@/components/ui/icon-symbol';

export function LayoutGrid({ size = 24, color }: { size?: number; color?: string }) {
  if (Platform.OS === 'web') {
    // Debug: check which implementation is used in browser console
    // eslint-disable-next-line no-console
    console.log('[lucide-wrapper] Platform=web, LayoutGridWeb=', !!LayoutGridWeb);

    if (LayoutGridWeb) {
      return <LayoutGridWeb size={size} color={color} />;
    }

    // Fallback to IconSymbol (MaterialIcons mapping)
    // eslint-disable-next-line no-console
    console.warn('[lucide-wrapper] LayoutGridWeb not available — falling back to IconSymbol');
    return <IconSymbol size={size} name="house.fill" color={color ?? '#000'} />;
  }

  return <LayoutGridNative size={size} color={color} />;
}

export default LayoutGrid;
