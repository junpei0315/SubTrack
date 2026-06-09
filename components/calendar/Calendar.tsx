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
  date: number | null;
  isCurrentMonth: boolean;
  subscriptions: Subscription[];
}

const DAYS_OF_WEEK = ['月', '火', '水', '木', '金', '土', '日'];

export const Calendar: React.FC<CalendarProps> = ({ onDateSelect }) => {
  const { currentDate, subscriptions, goToPrevMonth, goToNextMonth } = useCalendarSubscriptions();

  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const previousMonthDays = getDaysInMonth(year, month - 1);

    const days: CalendarDay[] = [];

    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      days.push({
        date: previousMonthDays - i,
        isCurrentMonth: false,
        subscriptions: [],
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(
        2,
        '0'
      )}`;
      const daySubscriptions = subscriptions.filter((sub) => {
        const billingDateString = formatLocalDate(sub.nextBillingDate);
        return billingDateString === dateString && sub.status === 'active';
      });

      days.push({
        date: i,
        isCurrentMonth: true,
        subscriptions: daySubscriptions,
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        subscriptions: [],
      });
    }

    return days;
  };

  const handleDatePress = (date: number | null) => {
    if (date && onDateSelect) {
      onDateSelect(new Date(currentDate.getFullYear(), currentDate.getMonth(), date));
    }
  };

  const calendarDays = generateCalendarDays();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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
    <View className="my-4 rounded-2xl bg-card-alt p-4">
      <View className="mb-5">
        <Text className="mb-2 text-lg font-semibold text-foreground">お支払いカレンダー</Text>
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={goToPrevMonth}>
            <Text className="p-2 text-xl text-accent">←</Text>
          </TouchableOpacity>
          <Text className="text-base font-semibold text-accent">
            {year}年 {month + 1}月
          </Text>
          <TouchableOpacity onPress={goToNextMonth}>
            <Text className="p-2 text-xl text-accent">→</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="overflow-hidden rounded-xl">
        <View className="flex-row bg-background py-3">
          {DAYS_OF_WEEK.map((day, index) => (
            <View key={day} className="flex-1 items-center">
              <Text
                className={`text-sm font-medium ${index === 5 || index === 6 ? 'text-weekend' : 'text-muted'}`}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        <View className="flex-row flex-wrap bg-background py-2">
          {calendarDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              className="aspect-square w-[14.285%] items-center justify-center py-2"
              onPress={() => handleDatePress(day.date)}
              activeOpacity={day.isCurrentMonth ? 0.7 : 1}
            >
              <View className="h-full w-full items-center justify-center">
                <Text
                  className={`text-base font-medium ${
                    !day.isCurrentMonth
                      ? 'text-border-muted opacity-50'
                      : index % 7 === 5 || index % 7 === 6
                        ? 'text-weekend'
                        : 'text-foreground'
                  }`}
                >
                  {day.date}
                </Text>
                {day.subscriptions.length > 0 && (
                  <View className="mt-0.5 flex-row items-center gap-0.5">
                    {day.subscriptions.slice(0, 2).map((sub, idx) => (
                      <MaterialIcons
                        key={`${sub.id}-${idx}`}
                        name={getIconName(sub.service.name)}
                        size={12}
                        color={AppColors.accent}
                        style={{ marginHorizontal: 1 }}
                      />
                    ))}
                    {day.subscriptions.length > 2 && (
                      <Text className="ml-0.5 text-[8px] text-accent">
                        +{day.subscriptions.length - 2}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};
