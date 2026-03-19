/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#ff9066',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#ff9066',
    surface: '#ffffff',
    primary: '#ff9066',
    onPrimary: '#581a00',
    surfaceContainerLow: '#f7f5f8',
    surfaceContainerHighest: '#f0f0f0',
  },
  dark: {
    text: '#ffffff',
    background: '#0e0e0e',
    tint: '#ff9066',
    icon: '#ababab',
    tabIconDefault: '#ababab',
    tabIconSelected: '#ff9066',
    surface: '#0e0e0e',
    primary: '#ff9066',
    onPrimary: '#581a00',
    surfaceContainerLow: '#131313',
    surfaceContainerHighest: '#262626',
    surfaceVariant: 'rgba(38, 38, 38, 0.6)',
    outlineVariant: 'rgba(72, 72, 72, 0.15)',
  },
};

export const Fonts = {
  jakarta: {
    regular: 'PlusJakartaSans-Regular',
    medium: 'PlusJakartaSans-Medium',
    semiBold: 'PlusJakartaSans-SemiBold',
    bold: 'PlusJakartaSans-Bold',
  },
  manrope: {
    regular: 'Manrope-Regular',
    medium: 'Manrope-Medium',
    semiBold: 'Manrope-SemiBold',
    bold: 'Manrope-Bold',
  }
};
