import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function HelloWave() {
  const r = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(r, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(r, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]), { iterations: 3 }
    ).start();
  }, []);
  return (
    <Animated.Text style={{ fontSize: 28, transform: [{ rotate: r.interpolate({ inputRange: [0,1], outputRange: ['0deg','20deg'] }) }] }}>
      👋
    </Animated.Text>
  );
}