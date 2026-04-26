import React, { useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

const HEADER_HEIGHT = 200;

export function ParallaxScrollView({ headerImage, headerBackgroundColor, children }: {
  headerImage?: React.ReactNode;
  headerBackgroundColor?: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  const translateY = scrollY.interpolate({ inputRange: [-HEADER_HEIGHT, 0, HEADER_HEIGHT], outputRange: [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75] });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Animated.View style={[styles.header, { backgroundColor: headerBackgroundColor ?? colors.accentLight, transform: [{ translateY }] }]}>
        {headerImage}
      </Animated.View>
      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT }}
      >
        {children}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { position: 'absolute', top: 0, left: 0, right: 0, height: HEADER_HEIGHT, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});