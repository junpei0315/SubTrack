import { MaterialIcons } from '@expo/vector-icons';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { AppColors } from '@/constants/colors';
import { formatBillingDate } from '@/src/domain/billingCycle';

import { MiniDatePicker } from './MiniDatePicker';

interface SubscriptionStartDateFieldProps {
  value: Date;
  onChange: (date: Date) => void;
  disabled?: boolean;
  label?: string;
}

export const SubscriptionStartDateField: React.FC<SubscriptionStartDateFieldProps> = ({
  value,
  onChange,
  disabled = false,
  label = '支払い開始日',
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  return (
    <>
      <Text className="pb-3 pt-7 text-base font-bold text-foreground">{label}</Text>
      <View className="rounded-2xl bg-card">
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={disabled}
          onPress={() => setIsCalendarOpen((prev) => !prev)}
          className="flex-row items-center justify-between p-4"
        >
          <View className="flex-row items-center gap-3">
            <CalendarIcon size={20} color={AppColors.accent} />
            <Text className="text-[15px] font-bold text-foreground">{formatBillingDate(value)}</Text>
          </View>
          <MaterialIcons
            name={isCalendarOpen ? 'expand-less' : 'expand-more'}
            size={24}
            color={AppColors.subtle}
          />
        </TouchableOpacity>
        {isCalendarOpen ? (
          <View className="border-t border-border px-4 pb-4 pt-3">
            <MiniDatePicker
              value={value}
              onChange={(date) => {
                onChange(date);
                setIsCalendarOpen(false);
              }}
            />
          </View>
        ) : null}
      </View>
    </>
  );
};
