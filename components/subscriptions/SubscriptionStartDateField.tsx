import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { AppColors } from '@/constants/colors';
import { formatBillingDate } from '@/src/domain/billingCycle';

interface SubscriptionStartDateFieldProps {
  value: Date;
  onChange: (date: Date) => void;
  disabled?: boolean;
}

export const SubscriptionStartDateField: React.FC<SubscriptionStartDateFieldProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  return (
    <>
      <Text className="pb-3 pt-7 text-base font-bold text-foreground">支払い開始日</Text>
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

const DAYS_OF_WEEK = ['月', '火', '水', '木', '金', '土', '日'];

interface MiniDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

const MiniDatePicker: React.FC<MiniDatePickerProps> = ({ value, onChange }) => {
  const [viewDate, setViewDate] = useState(() => new Date(value.getFullYear(), value.getMonth(), 1));

  useEffect(() => {
    setViewDate(new Date(value.getFullYear(), value.getMonth(), 1));
  }, [value]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date();

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const cells = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = new Date(year, month, 1).getDay();
    const leading = firstWeekday === 0 ? 6 : firstWeekday - 1;
    const result: (number | null)[] = [];
    for (let i = 0; i < leading; i++) {
      result.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      result.push(d);
    }
    while (result.length % 7 !== 0) {
      result.push(null);
    }
    return result;
  }, [year, month]);

  return (
    <View>
      <View className="mb-2 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => setViewDate(new Date(year, month - 1, 1))}
          hitSlop={8}
          className="px-2 py-1"
        >
          <MaterialIcons name="chevron-left" size={24} color={AppColors.accent} />
        </TouchableOpacity>
        <Text className="text-[15px] font-semibold text-foreground">
          {year}年 {month + 1}月
        </Text>
        <TouchableOpacity
          onPress={() => setViewDate(new Date(year, month + 1, 1))}
          hitSlop={8}
          className="px-2 py-1"
        >
          <MaterialIcons name="chevron-right" size={24} color={AppColors.accent} />
        </TouchableOpacity>
      </View>

      <View className="flex-row">
        {DAYS_OF_WEEK.map((day, index) => (
          <View key={day} className="flex-1 items-center py-1">
            <Text
              className={`text-xs font-medium ${index >= 5 ? 'text-weekend' : 'text-muted'}`}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {cells.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} className="aspect-square w-[14.285%]" />;
          }
          const cellDate = new Date(year, month, day);
          const isSelected = isSameDay(cellDate, value);
          const isToday = isSameDay(cellDate, today);
          return (
            <TouchableOpacity
              key={day}
              activeOpacity={0.7}
              onPress={() => {
                void Haptics.selectionAsync();
                onChange(cellDate);
              }}
              className="aspect-square w-[14.285%] items-center justify-center p-0.5"
            >
              <View
                className={`h-9 w-9 items-center justify-center rounded-full ${
                  isSelected ? 'bg-accent' : ''
                }`}
              >
                <Text
                  className={`text-[15px] ${
                    isSelected
                      ? 'font-bold text-foreground'
                      : isToday
                        ? 'font-bold text-accent'
                        : index % 7 >= 5
                          ? 'text-weekend'
                          : 'text-foreground'
                  }`}
                >
                  {day}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
