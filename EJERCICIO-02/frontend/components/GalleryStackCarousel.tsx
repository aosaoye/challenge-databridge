import React from 'react';
import { StyleSheet, View, Dimensions, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withSpring,
  SharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { CarouselItem } from '../types/pelicula';

function scheduleOnRN<T extends (...args: any[]) => any>(fn: T, ...args: Parameters<T>) {
  'worklet';
  runOnJS(fn)(...args);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH * 0.75;
const ITEM_HEIGHT = Math.round(ITEM_WIDTH * 1.5);
const ITEM_SPACING = 8;
const LEFT_MARGIN = 12;
const VISIBLE_STACK_COUNT = 6;
const STACK_OFFSET = (SCREEN_WIDTH - LEFT_MARGIN - ITEM_WIDTH) / (VISIBLE_STACK_COUNT - 1);

interface GalleryCardProps {
  item: CarouselItem;
  index: number;
  activeIndex: SharedValue<number>;
  totalItems: number;
  onPressItem?: (item: CarouselItem, index: number) => void;
}

const GalleryCard: React.FC<GalleryCardProps> = ({
  item,
  index,
  activeIndex,
  totalItems,
  onPressItem,
}) => {
  const pressScale = useSharedValue(1);

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      pressScale.set(withSpring(0.95));
    })
    .onEnd(() => {
      pressScale.set(withSpring(1));
      if (onPressItem) scheduleOnRN(onPressItem, item, index);
    })
    .onFinalize(() => {
      pressScale.set(withSpring(1));
    });

  const animatedStyle = useAnimatedStyle(() => {
    const diff = index - activeIndex.get();
    const galleryFactor = interpolate(
      activeIndex.get(),
      [0, 1],
      [1, 0],
      Extrapolation.CLAMP
    );

    const stackX = LEFT_MARGIN + index * STACK_OFFSET;
    const stackScale = Math.max(0.6, 1 - index * 0.06);

    const centeredX =
      SCREEN_WIDTH / 2 - ITEM_WIDTH / 2 + diff * (ITEM_WIDTH + ITEM_SPACING);
    const centeredScale = interpolate(
      Math.abs(diff),
      [0, 1],
      [1, 0.85],
      Extrapolation.CLAMP
    );

    const translateX = galleryFactor * stackX + (1 - galleryFactor) * centeredX;
    const scale =
      (galleryFactor * stackScale + (1 - galleryFactor) * centeredScale) *
      pressScale.get();

    return {
      transform: [{ translateX }, { scale }],
      zIndex: totalItems - index,
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    const diff = index - activeIndex.get();
    const absDiff = Math.abs(diff);
    const galleryFactor = interpolate(
      activeIndex.get(),
      [0, 1],
      [1, 0],
      Extrapolation.CLAMP
    );

    const carouselDarkness = interpolate(
      absDiff,
      [0, 1, 2, 3],
      [0, 0.5, 0.7, 0.85],
      Extrapolation.CLAMP
    );

    const stackDarkness = index === 0 ? 0 : 0.5;

    return {
      opacity: interpolate(
        galleryFactor,
        [0, 1],
        [carouselDarkness, stackDarkness],
        Extrapolation.CLAMP
      ),
    };
  });

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Image
          source={{ uri: item.image }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: '#000' },
            overlayStyle,
          ]}
        />
      </Animated.View>
    </GestureDetector>
  );
};

export interface GalleryStackCarouselProps {
  items: CarouselItem[];
  onIndexChange?: (index: number) => void;
  onPressItem?: (item: CarouselItem, index: number) => void;
  onToggleFavourite?: (id: number) => void;
}

export const GalleryStackCarousel: React.FC<GalleryStackCarouselProps> = ({
  items,
  onIndexChange,
  onPressItem,
}) => {
  const activeIndex = useSharedValue(0);
  const startIndex = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onStart(() => {
      startIndex.set(activeIndex.get());
    })
    .onUpdate((e) => {
      const nextIndex =
        startIndex.get() - e.translationX / (ITEM_WIDTH + ITEM_SPACING);
      activeIndex.set(Math.max(0, Math.min(items.length - 1, nextIndex)));
    })
    .onEnd((e) => {
      const projected = activeIndex.get() - e.velocityX / 1000;
      const target = Math.max(
        0,
        Math.min(items.length - 1, Math.round(projected))
      );
      activeIndex.set(withSpring(target));
      if (onIndexChange) scheduleOnRN(onIndexChange, target);
    });

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <GestureDetector gesture={panGesture}>
      <View style={{ height: ITEM_HEIGHT, width: SCREEN_WIDTH }}>
        {items.map((item, index) => (
          <GalleryCard
            key={item.id}
            item={item}
            index={index}
            activeIndex={activeIndex}
            totalItems={items.length}
            onPressItem={onPressItem}
          />
        ))}
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 8,
    borderCurve: 'continuous',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
