import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

export type CarouselMode = 'cards' | 'stack';

interface CarouselSwitchProps {
  mode: CarouselMode;
  onChangeMode: (mode: CarouselMode) => void;
}

export const CarouselSwitch: React.FC<CarouselSwitchProps> = ({
  mode,
  onChangeMode,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.switchTrack}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onChangeMode('cards')}
          style={[styles.switchOption, mode === 'cards' && styles.switchOptionActive]}
        >
          <Text
            style={[
              styles.switchText,
              mode === 'cards' && styles.switchTextActive,
            ]}
          >
            Poster Cards
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onChangeMode('stack')}
          style={[styles.switchOption, mode === 'stack' && styles.switchOptionActive]}
        >
          <Text
            style={[
              styles.switchText,
              mode === 'stack' && styles.switchTextActive,
            ]}
          >
            Gallery Stack
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 12,
  },
  switchTrack: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  switchOption: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 17,
  },
  switchOptionActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  switchText: {
    color: '#8fa59f',
    fontSize: 12,
    fontWeight: '600',
  },
  switchTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
