import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { AppColors } from '@/constants/colors';

const DAYS_OF_WEEK = ['日', '月', '火', '水', '木', '金', '土'];
const SATURDAY_TEXT_CLASS = 'text-[#4a90e2]';

interface MiniDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

/**
 * 月表示のシンプルな日付ピッカー。支払い開始日の選択に使う。
 */
export const MiniDatePicker: React.FC<MiniDatePickerProps> = ({ value, onChange }) => {
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
    const leading = new Date(year, month, 1).getDay();

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

  const getDayTextClass = (dayIndex: number, isSelected: boolean, isToday: boolean) => {
    if (isSelected) {
      return 'font-bold text-foreground';
    }
    if (isToday) {
      return 'font-bold text-accent';
    }
    if (dayIndex === 0) {
      return 'text-weekend';
    }
    if (dayIndex === 6) {
      return SATURDAY_TEXT_CLASS;
    }
    return 'text-foreground';
  };

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
              className={`text-xs font-medium ${
                index === 0 ? 'text-weekend' : index === 6 ? SATURDAY_TEXT_CLASS : 'text-muted'
              }`}
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
          const dayIndex = index % 7;

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
                <Text className={`text-[15px] ${getDayTextClass(dayIndex, isSelected, isToday)}`}>
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
