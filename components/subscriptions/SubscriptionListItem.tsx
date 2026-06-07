import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { formatBillingDate, getBillingCycleLabel } from '@/src/domain/billingCycle';
import { formatPrice } from '@/src/domain/money';
import type { Subscription } from '@/src/domain/subscription';

interface SubscriptionListItemProps {
  subscription: Subscription;
  onPress?: (subscription: Subscription) => void;
}

export const SubscriptionListItem: React.FC<SubscriptionListItemProps> = ({
  subscription,
  onPress,
}) => {
  const { service, plan, nextBillingDate, status } = subscription;
  const isPaused = status === 'paused';
  const initial = service.name.charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      style={[styles.card, isPaused && styles.cardPaused]}
      activeOpacity={0.7}
      onPress={() => onPress?.(subscription)}
    >
      <View style={styles.logoWrapper}>
        {service.logoUri ? (
          <Image source={{ uri: service.logoUri }} style={styles.logo} contentFit="cover" />
        ) : (
          <View style={styles.logoFallback}>
            <Text style={styles.logoFallbackText}>{initial}</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.serviceName} numberOfLines={1}>
          {service.name}
        </Text>
        <Text style={styles.planName} numberOfLines={1}>
          {plan.name}
        </Text>
        <Text style={styles.billingDate}>次回 {formatBillingDate(nextBillingDate)}</Text>
      </View>

      <View style={styles.priceColumn}>
        <Text style={styles.price}>{formatPrice(plan.price, plan.currency)}</Text>
        <Text style={styles.cycle}>{getBillingCycleLabel(plan.cycle)}</Text>
        {isPaused && <Text style={styles.pausedBadge}>停止中</Text>}
      </View>
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
  cardPaused: {
    opacity: 0.5,
  },
  logoWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
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
    fontSize: 20,
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
  planName: {
    color: SUBTLE_COLOR,
    fontSize: 13,
  },
  billingDate: {
    color: SUBTLE_COLOR,
    fontSize: 12,
    marginTop: 2,
  },
  priceColumn: {
    alignItems: 'flex-end',
    gap: 2,
  },
  price: {
    color: TEXT_COLOR,
    fontSize: 16,
    fontWeight: '700',
  },
  cycle: {
    color: ACCENT_COLOR,
    fontSize: 12,
    fontWeight: '600',
  },
  pausedBadge: {
    color: SUBTLE_COLOR,
    fontSize: 11,
    marginTop: 2,
  },
});
