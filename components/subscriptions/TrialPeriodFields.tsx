import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { SubscriptionStartDateField } from '@/components/subscriptions/SubscriptionStartDateField';
import {
  calcTrialEndsOn,
  formatTrialEndsOnLabel,
  TRIAL_DURATION_OPTIONS,
  type TrialDurationDays,
} from '@/src/domain/trialPeriod';

export interface TrialPeriodValue {
  enabled: boolean;
  trialEndsOn: Date | null;
}

interface TrialPeriodFieldsProps {
  startDate: Date;
  value: TrialPeriodValue;
  onChange: (value: TrialPeriodValue) => void;
  defaultTrialDays?: number;
  disabled?: boolean;
}

function resolveDefaultDays(defaultTrialDays?: number): TrialDurationDays {
  if (
    defaultTrialDays != null &&
    TRIAL_DURATION_OPTIONS.includes(defaultTrialDays as TrialDurationDays)
  ) {
    return defaultTrialDays as TrialDurationDays;
  }
  return 30;
}

export function createInitialTrialPeriodValue(
  startDate: Date,
  defaultTrialDays?: number
): TrialPeriodValue {
  if (defaultTrialDays == null || defaultTrialDays <= 0) {
    return { enabled: false, trialEndsOn: null };
  }
  return {
    enabled: true,
    trialEndsOn: calcTrialEndsOn(startDate, defaultTrialDays),
  };
}

export const TrialPeriodFields: React.FC<TrialPeriodFieldsProps> = ({
  startDate,
  value,
  onChange,
  defaultTrialDays,
  disabled = false,
}) => {
  const [selectedDays, setSelectedDays] = useState<TrialDurationDays | 'custom'>(() =>
    resolveDefaultDays(defaultTrialDays)
  );

  useEffect(() => {
    if (!value.enabled || selectedDays === 'custom') {
      return;
    }
    const nextTrialEndsOn = calcTrialEndsOn(startDate, selectedDays);
    if (value.trialEndsOn?.getTime() !== nextTrialEndsOn.getTime()) {
      onChange({ enabled: true, trialEndsOn: nextTrialEndsOn });
    }
  }, [startDate, selectedDays, value.enabled, value.trialEndsOn, onChange]);

  const handleToggle = () => {
    if (value.enabled) {
      onChange({ enabled: false, trialEndsOn: null });
      return;
    }

    const days = resolveDefaultDays(
      defaultTrialDays ?? (selectedDays === 'custom' ? 30 : selectedDays)
    );
    if (selectedDays !== 'custom') {
      setSelectedDays(days);
    }
    onChange({
      enabled: true,
      trialEndsOn: calcTrialEndsOn(startDate, days),
    });
  };

  const handleSelectDays = (days: TrialDurationDays) => {
    setSelectedDays(days);
    onChange({
      enabled: true,
      trialEndsOn: calcTrialEndsOn(startDate, days),
    });
  };

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 gap-0.5">
          <Text className="text-base font-bold text-foreground">お試し期間中</Text>
          <Text className="text-[13px] text-subtle">終了前にリマインドします</Text>
        </View>
        <Pressable
          onPress={handleToggle}
          disabled={disabled}
          accessibilityRole="switch"
          accessibilityState={{ checked: value.enabled, disabled }}
          className={`h-8 w-14 rounded-full p-1 ${value.enabled ? 'bg-accent-brand' : 'bg-surface'}`}
        >
          <View
            className={`h-6 w-6 rounded-full bg-foreground ${value.enabled ? 'self-end' : 'self-start'}`}
          />
        </Pressable>
      </View>

      {value.enabled ? (
        <>
          <View className="flex-row flex-wrap gap-2">
            {TRIAL_DURATION_OPTIONS.map((days) => {
              const isActive = selectedDays === days;
              return (
                <Pressable
                  key={days}
                  onPress={() => handleSelectDays(days)}
                  disabled={disabled}
                  className={`rounded-full px-4 py-2 ${isActive ? 'bg-accent-brand' : 'bg-surface'}`}
                >
                  <Text
                    className={`text-sm font-semibold ${isActive ? 'text-foreground' : 'text-subtle'}`}
                  >
                    {days}日
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => setSelectedDays('custom')}
              disabled={disabled}
              className={`rounded-full px-4 py-2 ${selectedDays === 'custom' ? 'bg-accent-brand' : 'bg-surface'}`}
            >
              <Text
                className={`text-sm font-semibold ${selectedDays === 'custom' ? 'text-foreground' : 'text-subtle'}`}
              >
                日付指定
              </Text>
            </Pressable>
          </View>

          {selectedDays === 'custom' ? (
            <SubscriptionStartDateField
              label="お試し終了日"
              value={value.trialEndsOn ?? calcTrialEndsOn(startDate, 30)}
              onChange={(trialEndsOn) => onChange({ enabled: true, trialEndsOn })}
              disabled={disabled}
            />
          ) : (
            <Text className="text-sm text-subtle">
              お試し終了予定:{' '}
              {value.trialEndsOn ? formatTrialEndsOnLabel(value.trialEndsOn) : '—'}
            </Text>
          )}
        </>
      ) : null}
    </View>
  );
};
