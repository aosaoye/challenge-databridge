import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { CarouselBackdrop } from './CarouselBackdrop';
import { GalleryStackCarousel } from './GalleryStackCarousel';
import type { Pelicula, CarouselItem } from '../types/pelicula';

interface GalleryCarouselViewProps {
  peliculas: Pelicula[];
  onSelectPelicula: (pelicula: Pelicula) => void;
  onToggleFavourite: (id: number) => void;
}

export const GalleryCarouselView: React.FC<GalleryCarouselViewProps> = ({
  peliculas,
  onSelectPelicula,
  onToggleFavourite
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const items: CarouselItem[] = useMemo(() => {
    return peliculas.map((p) => ({
      id: p.id.toString(),
      image: p.imagenUrl,
      backdropImage: p.imagenUrl,
      pelicula: p,
    }));
  }, [peliculas]);

  const activePelicula = peliculas[activeIndex] || peliculas[0];

  if (peliculas.length === 0) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.emptyText}>No hay películas en este género</Text>
      </View>
    );
  }



  return (
    <View style={styles.container}>
     

      <View style={styles.carouselWrapper}>
        <GalleryStackCarousel
          items={items}
          onIndexChange={(idx) => setActiveIndex(idx)}
          onPressItem={(item) => onSelectPelicula(item.pelicula)}
          onToggleFavourite={onToggleFavourite}
        />
      </View>

      {/* Info activa de la película actual */}
      {activePelicula && (
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.activeInfoContainer}
          onPress={() => onSelectPelicula(activePelicula)}
        >
          <Text style={styles.activeTitle} numberOfLines={1}>
            {activePelicula.titulo}
          </Text>

          <View style={styles.activeMetaRow}>
            <Text style={styles.activeMetaText}>
              {activePelicula.anio}  •  {activePelicula.genero}
            </Text>

            <View style={styles.ratingBadge}>
              <View style={styles.ratingStarBox}>
                <Text style={styles.ratingStarText}>★</Text>
              </View>
              <Text style={styles.ratingScore}>
                {Number(activePelicula.puntuacion).toFixed(1)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
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
  carouselWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeInfoContainer: {
    marginTop: 24,
    alignItems: 'center',
    paddingHorizontal: 24,
    maxWidth: 320,
  },
  activeTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  activeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeMetaText: {
    color: '#9db4af',
    fontSize: 13,
    fontWeight: '500',
    marginRight: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3,
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
