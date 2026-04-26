import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';

export function HelloWave() {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotation, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(rotation, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      { iterations: 3 }
    ).start();
  }, []);

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '20deg'] });

  return (
    <Animated.Text style={{ fontSize: 28, transform: [{ rotate }] }}>👋</Animated.Text>
  );
}