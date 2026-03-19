import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

interface KineticTagProps {
  label: string;
  variant?: 'default' | 'venda' | 'aluguel' | 'reservado';
  style?: any;
}

export const KineticTag = ({ label, variant = 'default', style }: KineticTagProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'reservado':
        return {
          backgroundColor: 'rgba(159, 5, 25, 0.8)',
          textColor: '#ffa8a3',
          fontFamily: 'Manrope-Bold',
        };
      case 'venda':
      case 'aluguel':
      default:
        return {
          backgroundColor: 'rgba(38, 38, 38, 0.4)',
          textColor: '#ffffff',
          fontFamily: 'Manrope-Medium',
        };
    }
  };

  const { backgroundColor, textColor, fontFamily } = getVariantStyles();

  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={12} tint="dark" style={[styles.blur, { backgroundColor }]}>
        <Text style={[styles.text, { color: textColor, fontFamily }]}>{label.toUpperCase()}</Text>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  blur: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
