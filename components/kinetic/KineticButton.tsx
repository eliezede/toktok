import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface KineticButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const KineticButton = ({ title, onPress, variant = 'primary', style, textStyle }: KineticButtonProps) => {
  if (variant === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.container, style]}>
        <LinearGradient
          colors={['#ff743b', '#ff9066']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Text style={[styles.primaryText, textStyle]}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.container, style]}>
      <BlurView intensity={20} tint="light" style={styles.glass}>
        <Text style={[styles.secondaryText, textStyle]}>{title}</Text>
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    minHeight: 48,
    justifyContent: 'center',
  },
  gradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glass: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(38, 38, 38, 0.6)',
  },
  primaryText: {
    color: '#581a00',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  secondaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
});
