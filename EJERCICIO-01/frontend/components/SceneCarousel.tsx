import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import {
  Carousel,
  CarouselItemAnimation,
  CarouselRenderItem,
} from 'react-native-reanimated-carousel';
import type { Videojuego } from '../types/videojuego';
import {
  getGameCoverUrl,
  getWatermarkWord,
  getGamePalette,
  formatScore,
} from '../utils/videojuegosHelper';

export type { Videojuego };

export interface SceneCarouselProps {
  videojuegos?: Videojuego[];
  data?: Videojuego[];
  onSelectVideojuego?: (videojuego: Videojuego) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SceneCarousel: React.FC<SceneCarouselProps> = ({
  videojuegos,
  data,
  onSelectVideojuego,
}) => {
  const items = useMemo(() => videojuegos || data || [], [videojuegos, data]);
  const width = SCREEN_WIDTH;

  const [activeIndex, setActiveIndex] = useState(0);
  const progress = useSharedValue(0);

  // La card principal es grande y protagonista
  const cardWidth = Math.round(width * 0.76);
  const cardHeight = Math.round(cardWidth * 1.44);
  const itemSize = cardWidth;
  const spacing = width * 0.44;

  const carouselHeight = cardHeight + 80;

  // Paleta de colores de fondo dinámico interpolado
  const bgColors = useMemo(() => {
    if (items.length === 0) return ['#0A0D15'];
    return items.map((item, idx) => getGamePalette(idx, item.titulo).bg);
  }, [items]);

  // Transición suave y continua de color de fondo
  const animatedBackground = useAnimatedStyle(() => {
    if (bgColors.length <= 1) {
      return { backgroundColor: bgColors[0] || '#0A0D15' };
    }
    const len = bgColors.length;
    const p = progress.value;
    const i = Math.floor(p);
    const a = ((i % len) + len) % len;
    const next = (a + 1) % len;
    const fraction = p - i;
    const color = interpolateColor(fraction, [0, 1], [bgColors[a], bgColors[next]]);
    return { backgroundColor: color };
  });

  // Animación física:
  // - Centro en grande (scale 1.0)
  // - Laterales notablemente más pequeños (scale 0.60), inclinados (±14deg) y desplazados hacia abajo
  // - Opacidad al 100% fija (sin reducir la opacidad de la card)
  const itemAnimation = useCallback<CarouselItemAnimation>(
    (value) => {
      'worklet';
      const d = Math.abs(value);
      return {
        transform: [
          { translateX: value * spacing + (width - itemSize) / 2 },
          { translateY: interpolate(d, [0, 1, 2], [0, 0.30 * cardHeight, 0.46 * cardHeight], Extrapolation.CLAMP) },
          { rotateZ: `${value * 14}deg` },
          { scale: interpolate(d, [0, 1, 2], [1, 0.60, 0.42], Extrapolation.CLAMP) },
        ],
        // Opacidad fija en 1 en todo momento
        opacity: 1,
        zIndex: Math.round(100 - d * 10),
      };
    },
    [width, itemSize, spacing, cardHeight],
  );

  const activeGame = items[activeIndex] || items[0];
  const activePalette = getGamePalette(activeIndex, activeGame?.titulo);
  const swapAnim = useSwapIn(activeIndex);

  const renderItem = useCallback<CarouselRenderItem<Videojuego>>(
    ({ item, index, relativeProgress }) => (
      <TiltedGameCard
        item={item}
        index={index}
        width={cardWidth}
        height={cardHeight}
        relativeProgress={relativeProgress}
        onPress={() => onSelectVideojuego?.(item)}
      />
    ),
    [cardWidth, cardHeight, onSelectVideojuego],
  );

  if (!items || items.length === 0) {
    return (
      <View style={[styles.screen, styles.emptyContainer]}>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Catálogo en espera</Text>
          <Text style={styles.emptySubtitle}>
            Conectando con la API para cargar los títulos...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.screen, animatedBackground]}>
      {/* 1. TEXTO DEL FONDO CON TAMAÑO CALIBRADO (para que se lea la mayor parte del título) */}
      <View style={styles.wordsWrapper}>
        {items.map((item, idx) => (
          <MistWord
            key={item.id ?? idx}
            index={idx}
            word={getWatermarkWord(item.titulo)}
            width={width}
            progress={progress}
            count={items.length}
          />
        ))}
      </View>

      {/* 2. REEL DE TARJETAS 3D: Bajadas para dejar ver el texto del fondo */}
      <View style={{ height: carouselHeight, marginTop: 65 }}>
        <Carousel
          loop={items.length > 2}
          data={items}
          itemSize={itemSize}
          style={{ width, height: carouselHeight }}
          progress={progress}
          animation={{
            type: 'timing',
            duration: 480,
            easing: Easing.bezier(0.25, 1, 0.5, 1),
          }}
          itemAnimation={itemAnimation}
          onSnapToItem={(idx) => setActiveIndex(idx)}
          renderItem={renderItem}
        />
      </View>

      {/* 3. PANEL INFERIOR DE DETALLES (Sin botón ni etiquetas de consola redundantes) */}
      {activeGame && (
        <View style={styles.infoContainer}>
          <Animated.View style={swapAnim}>
            <View style={styles.titleRow}>
              <Text style={styles.gameTitle} numberOfLines={2}>
                {activeGame.titulo}
              </Text>
              <View style={[styles.scoreBadge, { borderColor: activePalette.accent }]}>
                <Text style={styles.scoreStar}>⭐</Text>
                <Text style={styles.scoreText}>
                  {formatScore(activeGame.puntuacion)}
                </Text>
              </View>
            </View>

            {activeGame.descripcion ? (
              <Text style={styles.description} numberOfLines={3}>
                {activeGame.descripcion}
              </Text>
            ) : null}
          </Animated.View>
        </View>
      )}
    </Animated.View>
  );
};

// Texto en el fondo emergiendo de la niebla, calibrado en escala para leer buena parte del título
const MistWord = React.memo(function MistWord({
  index,
  word,
  width,
  progress,
  count,
}: {
  index: number;
  word: string;
  width: number;
  progress: SharedValue<number>;
  count: number;
}) {
  // Escala balanceada para que quepa y se lea bien sin desbordar violentamente
  const size = Math.min(width * 0.15, (width * 1.35) / Math.max(word.length, 6));

  const style = useAnimatedStyle(() => {
    if (count <= 1) {
      return { opacity: 0.35, transform: [{ translateX: 0 }] };
    }
    const rel = ((((index - progress.value + count / 2) % count) + count) % count) - count / 2;
    return {
      opacity: Math.max(0, 1 - Math.abs(rel) * 1.0) * 0.35,
      transform: [
        { translateX: rel * width * 0.85 },
        { scale: interpolate(Math.abs(rel), [0, 1], [1, 0.9], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <Animated.Text
      numberOfLines={1}
      style={[
        styles.mistText,
        {
          fontSize: size,
          lineHeight: size * 1.18,
        },
        style,
      ]}
    >
      {word}
    </Animated.Text>
  );
});

// Tarjeta limpia: arte de portada puro, sin títulos repetidos ni etiquetas de consola
interface TiltedGameCardProps {
  item: Videojuego;
  index: number;
  width: number;
  height: number;
  relativeProgress: SharedValue<number>;
  onPress?: () => void;
}

const TiltedGameCard = React.memo<TiltedGameCardProps>(
  ({ item, width, height, relativeProgress, onPress }) => {
    const coverUrl = getGameCoverUrl(item);
    const [imageUri, setImageUri] = useState(coverUrl);

    useEffect(() => {
      setImageUri(coverUrl);
    }, [coverUrl]);

    const cardAnimatedStyle = useAnimatedStyle(() => {
      const dist = Math.abs(relativeProgress.value);
      return {
        borderColor: dist < 0.4 ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.12)',
      };
    });

    return (
      <View style={styles.cardCenter}>
        <Animated.View style={[styles.card, { width, height }, cardAnimatedStyle]}>
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={onPress}
            style={StyleSheet.absoluteFill}
          >
            <Image
              source={{ uri: imageUri }}
              onError={() => {
                const fallback = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80';
                if (imageUri !== fallback) {
                  setImageUri(fallback);
                }
              }}
              style={styles.coverImage}
              resizeMode="cover"
            />
            {/* Brillo especular superior sutil */}
            <View style={styles.specularShine} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  },
);

// Transición suave hacia arriba al cambiar de juego activo
function useSwapIn(key: number) {
  const t = useSharedValue(1);
  const shown = useRef(key);

  useEffect(() => {
    if (shown.current === key) return;
    shown.current = key;
    t.value = 0;
    t.value = withTiming(1, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
  }, [key, t]);

  return useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ translateY: (1 - t.value) * 6 }],
  }));
}

export default SceneCarousel;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  emptyContainer: {
    backgroundColor: '#0A0C14',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyBox: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#12141F',
    borderRadius: 8,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F1F3F7',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8E95A5',
    marginTop: 4,
    textAlign: 'center',
  },
  wordsWrapper: {
    position: 'absolute',
    top: 18,
    left: 0,
    right: 0,
    height: 75,
    pointerEvents: 'none',
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mistText: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 18,
    backgroundColor: '#141724',
    overflow: 'hidden',
    borderWidth: 1.5,
    marginBottom: 16
  },
  coverImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#141724',
  },
  specularShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  infoContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  gameTitle: {
    flex: 1,
    fontSize: 25,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  scoreStar: {
    fontSize: 13,
    marginRight: 4,
  },
  scoreText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 20,
    marginTop: 8,
  },
});