import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from 'react-native';

import { GENRES, type GenreId } from '@/src/domain/genre';

interface GenreSelectorProps {
  selectedId: GenreId;
  onChange: (id: GenreId) => void;
  style?: ViewStyle;
}

export const GenreSelector: React.FC<GenreSelectorProps> = ({ selectedId, onChange, style }) => {
  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {GENRES.map((genre) => {
          const isSelected = genre.id === selectedId;
          return (
            <TouchableOpacity
              key={genre.id}
              activeOpacity={0.8}
              onPress={() => onChange(genre.id)}
              style={[styles.pill, isSelected ? styles.pillSelected : styles.pillUnselected]}
            >
              <Text
                style={[
                  styles.label,
                  isSelected ? styles.labelSelected : styles.labelUnselected,
                ]}
                numberOfLines={1}
              >
                {genre.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillSelected: {
    backgroundColor: '#DC052D',
  },
  pillUnselected: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  labelSelected: {
    color: '#ffffff',
  },
  labelUnselected: {
    color: '#ffffff',
  },
});
