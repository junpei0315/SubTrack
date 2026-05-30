import type { Subscription } from '@/src/domain/subscription';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CalendarProps {
  subscriptions?: Subscription[];
  onDateSelect?: (date: Date) => void;
}

interface CalendarDay {
  date: number | null;
  isCurrentMonth: boolean;
  subscriptions: Subscription[];
}

const DAYS_OF_WEEK = ['月', '火', '水', '木', '金', '土', '日'];

export const Calendar: React.FC<CalendarProps> = ({ subscriptions = [], onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

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
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const daySubscriptions = subscriptions.filter((sub) => {
        const billingDateString = sub.nextBillingDate
          .toISOString()
          .split('T')[0];
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

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>お支払いカレンダー</Text>
        <View style={styles.monthNavigation}>
          <TouchableOpacity onPress={handlePrevMonth}>
            <Text style={styles.navButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {year}年 {month + 1}月
          </Text>
          <TouchableOpacity onPress={handleNextMonth}>
            <Text style={styles.navButton}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.calendarContainer}>
        <View style={styles.dayHeaderRow}>
          {DAYS_OF_WEEK.map((day, index) => (
            <View key={day} style={styles.dayHeaderCell}>
              <Text
                style={[
                  styles.dayHeaderText,
                  (index === 5 || index === 6) && styles.weekendText,
                ]}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {calendarDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dayCell}
              onPress={() => handleDatePress(day.date)}
              activeOpacity={day.isCurrentMonth ? 0.7 : 1}
            >
              <View style={styles.dayCellContent}>
                <Text
                  style={[
                    styles.dayText,
                    !day.isCurrentMonth && styles.otherMonthText,
                    (index % 7 === 5 || index % 7 === 6) && styles.weekendDayText,
                  ]}
                >
                  {day.date}
                </Text>
                {day.subscriptions.length > 0 && (
                  <View style={styles.iconsContainer}>
                    {day.subscriptions.slice(0, 2).map((sub, idx) => (
                      <MaterialIcons
                        key={`${sub.id}-${idx}`}
                        name={getIconName(sub.service.name)}
                        size={12}
                        color="#ff3a5e"
                        style={styles.icon}
                      />
                    ))}
                    {day.subscriptions.length > 2 && (
                      <Text style={styles.moreText}>+{day.subscriptions.length - 2}</Text>
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
    marginHorizontal: 0,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff3a5e',
  },
  navButton: {
    fontSize: 20,
    color: '#ff3a5e',
    padding: 8,
  },
  calendarContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  dayHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#0f0f0f',
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
    color: '#ff3a5e',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#0f0f0f',
    paddingVertical: 8,
  },
  dayCell: {
    width: '14.285%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayCellContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#ff3a5e',
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
    color: '#ff3a5e',
    marginLeft: 2,
  },
});
