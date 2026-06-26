import { Platform, type ViewStyle } from 'react-native';

import { AppColors } from '@/constants/colors';

export const VISIBLE_TAB_BAR_STYLE: ViewStyle =
  Platform.OS === 'web'
    ? {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 0,
        overflow: 'visible',
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        elevation: 0,
      }
    : {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: AppColors.backgroundDarker,
        borderTopWidth: 0,
        elevation: 0,
        display: 'flex',
      };

export const HIDDEN_TAB_BAR_STYLE: ViewStyle = { display: 'none' };
