import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getBillingCycleLabel } from '@/src/domain/billingCycle';
import { formatPrice } from '@/src/domain/money';
import { getRepresentativeMonthlyPlan, type PresetService } from '@/src/domain/preset';

import { resolveServiceLogo } from './serviceLogos';

interface PresetListItemProps {
  preset: PresetService;
  onPress?: (preset: PresetService) => void;
}

const CYCLE_SUFFIX: Record<string, string> = {
  monthly: '月',
  yearly: '年',
  weekly: '週',
};

export const PresetListItem: React.FC<PresetListItemProps> = ({ preset, onPress }) => {
  const plan = getRepresentativeMonthlyPlan(preset);
  const logoSource = resolveServiceLogo(preset.logoKey, preset.logoUri);
  const initial = preset.name.charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => onPress?.(preset)}
    >
      <View style={styles.logoWrapper}>
        {logoSource ? (
          <Image source={logoSource} style={styles.logo} contentFit="cover" />
        ) : (
          <View style={styles.logoFallback}>
            <Text style={styles.logoFallbackText}>{initial}</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.serviceName} numberOfLines={1}>
          {preset.name}
        </Text>
        <Text style={styles.genre} numberOfLines={1}>
          {preset.genre}
        </Text>
      </View>

      {plan ? (
        <Text style={styles.price}>
          {formatPrice(plan.price, plan.currency)}
          <Text style={styles.cycle}> / {CYCLE_SUFFIX[plan.cycle] ?? getBillingCycleLabel(plan.cycle)}</Text>
        </Text>
      ) : null}
    </TouchableOpacity>
  );
};

const ACCENT_COLOR = '#ff3a5e';
const TEXT_COLOR = '#ffffff';
const SUBTLE_COLOR = '#9aa0a6';
const CARD_BG = '#1c1c1e';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    gap: 14,
  },
  logoWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  logoFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2c2c2e',
  },
  logoFallbackText: {
    color: TEXT_COLOR,
    fontSize: 18,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  serviceName: {
    color: TEXT_COLOR,
    fontSize: 16,
    fontWeight: '700',
  },
  genre: {
    color: SUBTLE_COLOR,
    fontSize: 13,
  },
  price: {
    color: ACCENT_COLOR,
    fontSize: 15,
    fontWeight: '700',
  },
  cycle: {
    color: ACCENT_COLOR,
    fontSize: 13,
    fontWeight: '600',
  },
});
