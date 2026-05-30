import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
}

interface CalendarDay {
  date: number | null;
  isCurrentMonth: boolean;
}

const DAYS_OF_WEEK = ['月', '火', '水', '木', '金', '土', '日'];
const MONTHS = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月'
];

export const Calendar: React.FC<CalendarProps> = ({ onDateSelect }) => {
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

    // 前月の日付を追加（日本では月曜日が0）
    // JavaScript の getDay() は日曜日が0なので調整
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      days.push({
        date: previousMonthDays - i,
        isCurrentMonth: false,
      });
    }

    // 当月の日付を追加
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
      });
    }

    // 次月の日付を追加（6行または7列を埋めるため）
    const remainingDays = 42 - days.length; // 6行 × 7列 = 42
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
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

  return (
    <View style={styles.container}>
      {/* Header */}
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

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        {/* Day headers */}
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

        {/* Calendar grid */}
        <View style={styles.daysGrid}>
          {calendarDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dayCell}
              onPress={() => handleDatePress(day.date)}
              activeOpacity={day.isCurrentMonth ? 0.7 : 1}
            >
              <Text
                style={[
                  styles.dayText,
                  !day.isCurrentMonth && styles.otherMonthText,
                  // Check if it's Sunday (index % 7 === 6)
                  (index % 7 === 5 || index % 7 === 6) && styles.weekendDayText,
                ]}
              >
                {day.date}
              </Text>
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
    width: '14.285%', // 7 columns
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
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
});
