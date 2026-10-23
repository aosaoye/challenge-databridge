import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Pelicula } from '../types/pelicula';
import {Heart} from 'lucide-react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.76);
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.48);
const SPACING = 16;
const SNAP_INTERVAL = CARD_WIDTH + SPACING;
const SIDE_INSET = (SCREEN_WIDTH - CARD_WIDTH) / 2;

interface FavouritesCarouselProps {
  peliculas: Pelicula[];
  onSelectPelicula: (pelicula: Pelicula) => void;
  onToggleFavourite: (id: number) => void;
}

export const FavouritesCarousel: React.FC<FavouritesCarouselProps> = ({
  peliculas,
  onSelectPelicula,
  onToggleFavourite,
}) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<Animated.FlatList<Pelicula>>(null);

  if (peliculas.length === 0) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.emptyText}>No hay películas en este género</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={peliculas}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        bounces={false}
        contentContainerStyle={styles.flatListContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * SNAP_INTERVAL,
            index * SNAP_INTERVAL,
            (index + 1) * SNAP_INTERVAL,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.92, 1, 0.92],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.65, 1, 0.65],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              style={[
                styles.cardWrapper,
                {
                  transform: [{ scale }],
                  opacity,
                },
              ]}
            >
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  zIndex: 10,
                }}
                onPress={() => {
                  onToggleFavourite(item.id)
                  console.log('hola', item.id)
                }}>
                <Heart
                  size={32}
                  color={'white'}
                  strokeWidth={1.2}
                  fill={item.favorita ? 'white' : 'none'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.92}
                style={styles.card}
                onPress={() => onSelectPelicula(item)}
              >
                <Image
                  source={{ uri: item.imagenUrl }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />

                <LinearGradient
                  colors={['transparent', 'rgba(4, 14, 12, 0.55)', 'rgba(3, 9, 8, 0.96)']}
                  locations={[0.3, 0.65, 1]}
                  style={styles.cardGradient}
                >
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.titulo}
                  </Text>

                  <View style={styles.cardMetaRow}>
                    <Text style={styles.cardMetaText}>
                      {item.anio}  •  {item.genero}
                    </Text>

                    <View style={styles.ratingBadge}>
                      <View style={styles.ratingStarBox}>
                        <Text style={styles.ratingStarText}>★</Text>
                      </View>
                      <Text style={styles.ratingScore}>
                        {Number(item.puntuacion).toFixed(1)}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    color: '#9db4af',
    fontSize: 14,
  },
  flatListContent: {
    paddingHorizontal: SIDE_INSET,
    alignItems: 'center',
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginRight: SPACING,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#0a1614',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 10,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardMetaText: {
    color: '#9db4af',
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
    marginRight: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  ratingStarBox: {
    backgroundColor: '#e5a00d',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginRight: 6,
  },
  ratingStarText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
  },
  ratingScore: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
