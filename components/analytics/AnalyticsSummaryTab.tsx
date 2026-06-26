import React, { useMemo } from 'react';
import { View } from 'react-native';

import { AnalyticsMetricCard } from '@/components/analytics/AnalyticsMetricCard';
import { SavingsPotentialSection } from '@/components/analytics/SavingsPotentialSection';
import { UnusedAlertsSection } from '@/components/analytics/UnusedAlertsSection';
import { useExchangeRates } from '@/components/currency/ExchangeRateProvider';
import { formatPrice } from '@/src/domain/money';
import { computeSavingsInsight } from '@/src/domain/savingsInsight';
import type { GenreSpendingBreakdown } from '@/src/domain/spendingByGenre';
import type { UnusedSubscriptionAlert } from '@/src/domain/unusedSubscriptions';

interface AnalyticsSummaryTabProps {
  genreBreakdown: GenreSpendingBreakdown | null;
  unusedAlerts: UnusedSubscriptionAlert[];
  hasUsageLogs: boolean;
}

export const AnalyticsSummaryTab: React.FC<AnalyticsSummaryTabProps> = ({
  genreBreakdown,
  unusedAlerts,
  hasUsageLogs,
}) => {
  const { rates } = useExchangeRates();

  const insight = useMemo(() => {
    if (!rates) {
      return null;
    }
    return computeSavingsInsight(unusedAlerts, rates);
  }, [unusedAlerts, rates]);

  const monthlyTotalLabel =
    genreBreakdown != null
      ? formatPrice(genreBreakdown.totalMonthlyAmount, genreBreakdown.currency)
      : '—';

  const monthlySavingsLabel =
    insight != null ? formatPrice(insight.monthlyAmountJpy, 'JPY') : '—';

  return (
    <View className="gap-6">
      <View className="flex-row gap-3">
        <AnalyticsMetricCard label="月額換算合計" value={monthlyTotalLabel} />
        <AnalyticsMetricCard
          label="浮きそうな金額"
          value={monthlySavingsLabel}
          valueClassName={
            insight != null && insight.monthlyAmountJpy > 0
              ? 'text-accent-brand'
              : 'text-foreground'
          }
        />
      </View>

      <SavingsPotentialSection
        unusedAlerts={unusedAlerts}
        hasUsageLogs={hasUsageLogs}
        layout="summary"
      />

      <UnusedAlertsSection
        alerts={unusedAlerts}
        title="見直し推奨"
        badge={
          unusedAlerts.length > 0 ? `${unusedAlerts.length}件 未利用` : undefined
        }
      />
    </View>
  );
};
