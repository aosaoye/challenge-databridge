import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

function scheduleOnRN<T extends (...args: any[]) => any>(fn: T, ...args: Parameters<T>) {
  'worklet';
  runOnJS(fn)(...args);
}

export interface CarouselBackdropProps {
  images: string[];
  currentIndex: number;
  height?: number;
  backgroundColor?: string;
  blurIntensity?: number;
}

export const CarouselBackdrop: React.FC<CarouselBackdropProps> = ({
  images,
  currentIndex,
  height = 400,
  backgroundColor = '#05100e',
  blurIntensity = 25,
}) => {
  const [displayedIndex, setDisplayedIndex] = useState(currentIndex);
  const [previousIndex, setPreviousIndex] = useState(currentIndex);
  const fadeAnim = useSharedValue(1);

  useEffect(() => {
    if (currentIndex !== displayedIndex) {
      setPreviousIndex(displayedIndex);
      setDisplayedIndex(currentIndex);
      fadeAnim.set(0);
      fadeAnim.set(
        withTiming(1, { duration: 500 }, (finished) => {
          if (finished) {
            scheduleOnRN(setPreviousIndex, currentIndex);
          }
        })
      );
    }
  }, [currentIndex, displayedIndex, fadeAnim]);

  useEffect(() => {
    const urls = [images[currentIndex - 1], images[currentIndex + 1]].filter(
      Boolean
    ) as string[];
    urls.forEach((url) => {
      if (url) Image.prefetch(url);
    });
  }, [currentIndex, images]);

  const foregroundStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.get(),
  }));

  if (!images || images.length === 0) {
    return null;
  }

  const prevImage = images[previousIndex] || images[0];
  const currImage = images[displayedIndex] || images[0];

  return (
    <View style={[styles.backdrop, { height, backgroundColor }]} pointerEvents="none">
      <View style={{ height, width: '100%' }}>
        <Image
          source={{ uri: prevImage }}
          style={[styles.image, { height }]}
          resizeMode="cover"
        />
        <Animated.View style={[StyleSheet.absoluteFill, foregroundStyle]}>
          <Image
            source={{ uri: currImage }}
            style={[styles.image, { height }]}
            resizeMode="cover"
          />
        </Animated.View>
        <LinearGradient
          locations={[0, 0.65, 1]}
          colors={['transparent', 'rgba(5, 16, 14, 0.65)', '#05100e']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <BlurView
        style={[StyleSheet.absoluteFill, { height }]}
        intensity={blurIntensity}
        tint="dark"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
  },
});
