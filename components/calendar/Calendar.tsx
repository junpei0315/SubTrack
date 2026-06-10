import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { AppColors } from '@/constants/colors';
import { formatLocalDate } from '@/src/domain/localDate';
import type { Subscription } from '@/src/domain/subscription';

import { useCalendarSubscriptions } from './useCalendarSubscriptions';

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
}

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  subscriptions: Subscription[];
}

// 日曜始まり
const DAYS_OF_WEEK = ['日', '月', '火', '水', '木', '金', '土'];

export const Calendar: React.FC<CalendarProps> = ({ onDateSelect }) => {
  const {
    currentDate,
    selectedDate,
    isExpanded,
    subscriptions,
    goToPrev,
    goToNext,
    selectDate,
    toggleExpanded,
  } = useCalendarSubscriptions();

  const buildDay = (date: Date): CalendarDay => {
    const dateString = formatLocalDate(date);
    const daySubscriptions = subscriptions.filter(
      (sub) => sub.status === 'active' && formatLocalDate(sub.nextBillingDate) === dateString
    );
    return {
      date,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === currentDate.getMonth(),
      subscriptions: daySubscriptions,
    };
  };

  // 選択日を含む週（日曜〜土曜）
  const getWeekDays = (anchor: Date): CalendarDay[] => {
    const start = new Date(
      anchor.getFullYear(),
      anchor.getMonth(),
      anchor.getDate() - anchor.getDay()
    );
    return Array.from({ length: 7 }, (_, i) =>
      buildDay(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
    );
  };

  // 当月を含む6週間（日曜始まり）
  const getMonthWeeks = (): CalendarDay[][] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOffset = new Date(year, month, 1).getDay();
    const gridStart = new Date(year, month, 1 - firstDayOffset);

    const weeks: CalendarDay[][] = [];
    for (let w = 0; w < 6; w++) {
      const week: CalendarDay[] = [];
      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(
          gridStart.getFullYear(),
          gridStart.getMonth(),
          gridStart.getDate() + w * 7 + d
        );
        week.push(buildDay(cellDate));
      }
      weeks.push(week);
    }
    return weeks;
  };

  const handleDatePress = (day: CalendarDay) => {
    selectDate(day.date);
    onDateSelect?.(day.date);
  };

  const weeksToRender = isExpanded ? getMonthWeeks() : [getWeekDays(selectedDate)];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const selectedDateString = formatLocalDate(selectedDate);

  const getIconName = (serviceName: string): keyof typeof MaterialIcons.glyphMap => {
    const iconMap: Record<string, keyof typeof MaterialIcons.glyphMap> = {
      Netflix: 'play-circle',
      Spotify: 'music-note',
      'Adobe Creative Cloud': 'palette',
      'ChatGPT Plus': 'chat-bubble-outline',
    };
    return iconMap[serviceName] || 'shopping-cart';
  };

  return (
    <View className="my-4 rounded-2xl bg-surface p-4">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-foreground">お支払いカレンダー</Text>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={goToPrev} hitSlop={8}>
            <Text className="px-1 text-lg text-accent">←</Text>
          </TouchableOpacity>
          <Text className="text-base font-semibold text-accent">
            {year}年 {month + 1}月
          </Text>
          <TouchableOpacity onPress={goToNext} hitSlop={8}>
            <Text className="px-1 text-lg text-accent">→</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleExpanded} hitSlop={8} className="ml-1">
            <MaterialIcons
              name={isExpanded ? 'expand-less' : 'expand-more'}
              size={24}
              color={AppColors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View className="overflow-hidden rounded-xl">
        <View className="flex-row bg-card py-3">
          {DAYS_OF_WEEK.map((day, index) => (
            <View key={day} className="flex-1 items-center">
              <Text
                className={`text-sm font-medium ${index === 0 || index === 6 ? 'text-weekend' : 'text-muted'}`}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        <View className="bg-card py-2">
          {weeksToRender.map((week, weekIndex) => (
            <View key={weekIndex} className="flex-row">
              {week.map((day, dayIndex) => {
                const isSelected = formatLocalDate(day.date) === selectedDateString;
                const isWeekend = dayIndex === 0 || dayIndex === 6;
                return (
                  <TouchableOpacity
                    key={dayIndex}
                    className="aspect-square flex-1 items-center justify-center py-1"
                    onPress={() => handleDatePress(day)}
                    activeOpacity={0.7}
                  >
                    <View
                      className={`h-full w-full items-center justify-center rounded-xl ${
                        isSelected ? 'bg-accent' : ''
                      }`}
                    >
                      <Text
                        className={`text-base ${isSelected ? 'font-bold' : 'font-medium'} ${
                          isSelected
                            ? 'text-foreground'
                            : !day.isCurrentMonth
                              ? 'text-border-muted opacity-50'
                              : isWeekend
                                ? 'text-weekend'
                                : 'text-foreground'
                        }`}
                      >
                        {day.day}
                      </Text>
                      {day.subscriptions.length > 0 && (
                        <View className="mt-0.5 flex-row items-center gap-0.5">
                          {day.subscriptions.slice(0, 2).map((sub, idx) => (
                            <MaterialIcons
                              key={`${sub.id}-${idx}`}
                              name={getIconName(sub.service.name)}
                              size={12}
                              color={isSelected ? AppColors.text : AppColors.accent}
                            />
                          ))}
                          {day.subscriptions.length > 2 && (
                            <Text
                              className={`ml-0.5 text-[8px] ${isSelected ? 'text-foreground' : 'text-accent'}`}
                            >
                              +{day.subscriptions.length - 2}
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
