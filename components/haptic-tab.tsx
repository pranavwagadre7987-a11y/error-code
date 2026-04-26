import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import * as Haptics from 'expo-haptics';

export function HapticTab({ onPress, ...props }: TouchableOpacityProps) {
  return (
    <TouchableOpacity
      onPress={e => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress?.(e); }}
      activeOpacity={0.7}
      {...props}
    />
  );
}