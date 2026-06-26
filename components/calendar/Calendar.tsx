import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { resolveServiceLogo } from '@/components/subscriptions/serviceLogos';
import { AppColors } from '@/constants/colors';
import { hasBillingOnDate } from '@/src/domain/billingOccurrences';
import { formatLocalDate } from '@/src/domain/localDate';
import type { Subscription } from '@/src/domain/subscription';

import { CalendarDayModal } from './CalendarDayModal';
import { useCalendarSubscriptions } from './useCalendarSubscriptions';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  subscriptions: Subscription[];
}

// 日曜始まり
const DAYS_OF_WEEK = ['日', '月', '火', '水', '木', '金', '土'];

export const Calendar: React.FC = () => {
  const {
    currentDate,
    selectedDate,
    isExpanded,
    subscriptions,
    goToPrev,
    goToNext,
    toggleExpanded,
    selectDate,
  } = useCalendarSubscriptions();
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const [modalSubscriptions, setModalSubscriptions] = useState<Subscription[]>([]);

  const buildDay = (date: Date): CalendarDay => {
    const daySubscriptions = subscriptions.filter((sub) => hasBillingOnDate(sub, date));
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

  // 当月に必要な週数だけ描画（日曜始まり）。固定6週だと末尾に次月の週が余分に出る。
  const getMonthWeeks = (): CalendarDay[][] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOffset = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weeksNeeded = Math.ceil((firstDayOffset + daysInMonth) / 7);
    const gridStart = new Date(year, month, 1 - firstDayOffset);

    const weeks: CalendarDay[][] = [];
    for (let w = 0; w < weeksNeeded; w++) {
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

  const weeksToRender = isExpanded ? getMonthWeeks() : [getWeekDays(selectedDate)];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const todayString = formatLocalDate(new Date());

  const getIconName = (serviceName: string): keyof typeof MaterialIcons.glyphMap => {
    const iconMap: Record<string, keyof typeof MaterialIcons.glyphMap> = {
      Netflix: 'play-circle',
      Spotify: 'music-note',
      'Adobe Creative Cloud': 'palette',
      'ChatGPT Plus': 'chat-bubble-outline',
    };
    return iconMap[serviceName] || 'shopping-cart';
  };

  const handleDayPress = (day: CalendarDay) => {
    if (day.subscriptions.length === 0) {
      return;
    }
    selectDate(day.date);
    setModalDate(day.date);
    setModalSubscriptions(day.subscriptions);
  };

  const closeDayModal = () => {
    setModalDate(null);
    setModalSubscriptions([]);
  };

  return (
    <View className="my-4">
      <View className="mb-2 flex-row items-center justify-between px-1">
        <Text className="text-lg font-semibold text-foreground">お支払いカレンダー</Text>
        <TouchableOpacity
          onPress={toggleExpanded}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isExpanded ? '週表示に切り替え' : '月表示に切り替え'}
        >
          <MaterialIcons
            name={isExpanded ? 'expand-less' : 'expand-more'}
            size={24}
            color={AppColors.text}
          />
        </TouchableOpacity>
      </View>

      <View className="overflow-hidden rounded-2xl bg-card px-2 pb-2">
        <View>
          <View className="flex-row items-center justify-center gap-5 py-3">
            <TouchableOpacity
              onPress={goToPrev}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={isExpanded ? '前の月へ移動' : '前の週へ移動'}
            >
              <Text className="px-1 text-xl text-accent">←</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-accent">
              {year}年 {month + 1}月
            </Text>
            <TouchableOpacity
              onPress={goToNext}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={isExpanded ? '次の月へ移動' : '次の週へ移動'}
            >
              <Text className="px-1 text-xl text-accent">→</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row pb-1">
            {DAYS_OF_WEEK.map((day, index) => (
              <View key={day} className="flex-1 items-center">
                <Text
                  className={`text-sm font-medium ${
                    index === 0
                      ? 'text-weekend'
                      : index === 6
                      ? 'text-[#4a90e2]'
                      : 'text-muted'
                  }`}
                >
                  {day}
                </Text>
              </View>
            ))}
          </View>

          <View>
            {weeksToRender.map((week, weekIndex) => (
              <View key={weekIndex} className="flex-row">
                {week.map((day, dayIndex) => {
                  const isToday = formatLocalDate(day.date) === todayString;
                  const isSelected = formatLocalDate(day.date) === formatLocalDate(selectedDate);
                  const hasBilling = day.subscriptions.length > 0;
                  const isSunday = dayIndex === 0;
                  const isSaturday = dayIndex === 6;
                  return (
                    <View key={dayIndex} className="h-16 flex-1 items-center px-0.5 py-0.5">
                      <TouchableOpacity
                        className={`h-full w-full items-center rounded-lg pt-1.5 ${
                          isToday ? 'bg-accent' : ''
                        } ${isSelected && hasBilling && !isToday ? 'bg-white/[0.06]' : ''}`}
                        activeOpacity={hasBilling ? 0.7 : 1}
                        disabled={!hasBilling}
                        onPress={() => handleDayPress(day)}
                        accessibilityRole="button"
                        accessibilityLabel={
                          hasBilling
                            ? `${day.day}日の支払い ${day.subscriptions.length}件`
                            : `${day.day}日`
                        }
                      >
                        <Text
                          className={`text-base ${isToday ? 'font-bold' : 'font-medium'} ${
                            isToday
                              ? 'text-foreground'
                              : !day.isCurrentMonth
                              ? 'text-border-muted opacity-50'
                              : isSunday
                              ? 'text-weekend'
                              : isSaturday
                              ? 'text-[#4a90e2]'
                              : 'text-foreground'
                          }`}
                        >
                          {day.day}
                        </Text>
                        <View className="mt-1 h-6 flex-row items-center justify-center gap-0.5">
                          {day.subscriptions.slice(0, 2).map((sub, idx) => {
                            const logoSource = resolveServiceLogo(
                              sub.service.logoKey,
                              sub.service.logoUri
                            );
                            return logoSource ? (
                              <Image
                                key={`${sub.id}-${idx}`}
                                source={logoSource}
                                className="h-6 w-6 rounded-md"
                                contentFit="cover"
                              />
                            ) : (
                              <MaterialIcons
                                key={`${sub.id}-${idx}`}
                                name={getIconName(sub.service.name)}
                                size={22}
                                color={isToday ? AppColors.text : AppColors.accent}
                              />
                            );
                          })}
                          {day.subscriptions.length > 2 && (
                            <Text
                              className={`text-[8px] ${
                                isToday ? 'text-foreground' : 'text-accent'
                              }`}
                            >
                              +{day.subscriptions.length - 2}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </View>

      <CalendarDayModal
        date={modalDate}
        subscriptions={modalSubscriptions}
        onClose={closeDayModal}
      />
    </View>
  );
};
