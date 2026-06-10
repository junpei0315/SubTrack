import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

const ACCENT_COLOR = '#DC052D';

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
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - anchor.getDay());
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>お支払いカレンダー</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={goToPrev} hitSlop={8}>
            <Text style={styles.navButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {year}年 {month + 1}月
          </Text>
          <TouchableOpacity onPress={goToNext} hitSlop={8}>
            <Text style={styles.navButton}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleExpanded} hitSlop={8} style={styles.toggleButton}>
            <MaterialIcons
              name={isExpanded ? 'expand-less' : 'expand-more'}
              size={24}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.calendarContainer}>
        <View style={styles.dayHeaderRow}>
          {DAYS_OF_WEEK.map((day, index) => (
            <View key={day} style={styles.dayHeaderCell}>
              <Text
                style={[styles.dayHeaderText, (index === 0 || index === 6) && styles.weekendText]}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {weeksToRender.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {week.map((day, dayIndex) => {
                const isSelected = formatLocalDate(day.date) === selectedDateString;
                const isWeekend = dayIndex === 0 || dayIndex === 6;
                return (
                  <TouchableOpacity
                    key={dayIndex}
                    style={styles.dayCell}
                    onPress={() => handleDatePress(day)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.dayCellContent, isSelected && styles.selectedDay]}>
                      <Text
                        style={[
                          styles.dayText,
                          !day.isCurrentMonth && styles.otherMonthText,
                          isWeekend && styles.weekendDayText,
                          isSelected && styles.selectedDayText,
                        ]}
                      >
                        {day.day}
                      </Text>
                      {day.subscriptions.length > 0 && (
                        <View style={styles.iconsContainer}>
                          {day.subscriptions.slice(0, 2).map((sub, idx) => (
                            <MaterialIcons
                              key={`${sub.id}-${idx}`}
                              name={getIconName(sub.service.name)}
                              size={12}
                              color={isSelected ? '#ffffff' : ACCENT_COLOR}
                              style={styles.icon}
                            />
                          ))}
                          {day.subscriptions.length > 2 && (
                            <Text style={[styles.moreText, isSelected && styles.selectedDayText]}>
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#262626',
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
    marginHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCENT_COLOR,
  },
  navButton: {
    fontSize: 18,
    color: ACCENT_COLOR,
    paddingHorizontal: 4,
  },
  toggleButton: {
    marginLeft: 4,
  },
  calendarContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  dayHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#1c1c1c',
    paddingVertical: 12,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '500',
  },
  weekendText: {
    color: ACCENT_COLOR,
  },
  daysGrid: {
    backgroundColor: '#1c1c1c',
    paddingVertical: 8,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayCellContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  selectedDay: {
    backgroundColor: ACCENT_COLOR,
  },
  dayText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  otherMonthText: {
    color: '#555555',
    opacity: 0.5,
  },
  weekendDayText: {
    color: ACCENT_COLOR,
  },
  selectedDayText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  iconsContainer: {
    flexDirection: 'row',
    marginTop: 2,
    alignItems: 'center',
    gap: 2,
  },
  icon: {
    marginHorizontal: 1,
  },
  moreText: {
    fontSize: 8,
    color: ACCENT_COLOR,
    marginLeft: 2,
  },
});
