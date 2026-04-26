import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import * as Haptics from 'expo-haptics';

export function HapticTab({ onPress, ...props }: TouchableOpacityProps) {
  const handlePress = (e: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };
  return <TouchableOpacity onPress={handlePress} activeOpacity={0.7} {...props} />;
}