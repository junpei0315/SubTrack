import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { formatPrice } from '@/src/domain/money';

import { type SpendingPeriod, useMonthlySpending } from './useMonthlySpending';

const PERIOD_OPTIONS: { value: SpendingPeriod; label: string }[] = [
  { value: 'month', label: '月間' },
  { value: 'year', label: '年間' },
];

export const MonthlySpending: React.FC = () => {
  const { period, setPeriod, total, isLoading } = useMonthlySpending();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>今月の合計支出</Text>
        <View style={styles.toggle}>
          {PERIOD_OPTIONS.map((option) => {
            const isActive = option.value === period;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.toggleButton, isActive && styles.toggleButtonActive]}
                onPress={() => setPeriod(option.value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, isActive && styles.toggleTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#ffffff" style={styles.amountLoader} />
      ) : (
        <Text style={styles.amount}>{formatPrice(total.amount, total.currency)}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    marginVertical: 16,
    alignSelf: 'stretch',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '500',
  },
  toggle: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 3,
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  toggleButtonActive: {
    backgroundColor: '#DC052D',
  },
  toggleText: {
    fontSize: 13,
    color: '#999999',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
  },
  amountLoader: {
    alignSelf: 'flex-start',
    height: 43,
  },
});
