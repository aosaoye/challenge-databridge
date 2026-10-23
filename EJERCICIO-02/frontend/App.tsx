import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Constants from 'expo-constants';
import type { Pelicula } from './types/pelicula';
import { FavouritesCarousel } from './components/FavouritesCarousel';
import { GalleryCarouselView } from './components/GalleryCarouselView';
import { CarouselSwitch, CarouselMode } from './components/CarouselSwitch';

export default function App() {
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [generoSeleccionado, setGeneroSeleccionado] = useState<string>('Todos');
  const [peliculaSeleccionada, setPeliculaSeleccionada] = useState<Pelicula | null>(null);
  const [carouselMode, setCarouselMode] = useState<CarouselMode>('cards');
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getHostIp = () => {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
      (Constants as any).manifest?.debuggerHost ||
      '';

    if (!hostUri) return 'localhost';
    const clean = hostUri.replace(/^[a-zA-Z]+:\/\//, '');
    const parts = clean.split(':');
    return parts[0] || 'localhost';
  };

  const añadirFavoritos = async (id: number) => {

    try {
      const response = await fetch(`http://${getHostIp()}:3000/api/peliculas/${id}/toggle-favorita`, {
        method: 'PATCH'
      })

      const data = await response.json();

      setPeliculas(prev => prev.map(_p =>
        _p.id === data.id
          ? data
          : _p
      ))

      if(!response.ok) throw new Error('No se pudo agregar a favoritos');
    } catch (error) {
      console.error('Error al agregar a favoritos:', error);
    }
  
  }

  const cargarPeliculas = () => {
    setCargando(true);
    setError(null);
    const hostIp = getHostIp();
    const url = `http://${hostIp}:3000/api/peliculas`;
    console.log('Conectando a API:', url);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Pelicula[]) => {
        setPeliculas(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error('Error al cargar películas:', err);
        setError('No se pudieron conectar las películas desde la API');
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarPeliculas();
  }, []);

  // Géneros reales obtenidos de la API (sin inventar datos ni plataformas externas)
  const generosDisponibles = useMemo(() => {
    const list = Array.from(new Set(peliculas.map((p) => p.genero).filter(Boolean)));
    return ['Todos', ...list];
  }, [peliculas]);

  const peliculasFiltradas = useMemo(() => {
    if (generoSeleccionado === 'Todos') return peliculas;
    return peliculas.filter((p) => p.genero === generoSeleccionado);
  }, [peliculas, generoSeleccionado]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />

        {/* Header con título Favourites */}
        <View style={styles.header}>
          <Text style={styles.title}>Cinebox</Text>
        </View>

        {/* Filtros de género estilo pastilla del diseño */}
        <View style={styles.pillsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsScroll}
          >
            {generosDisponibles.map((genero) => {
              const isActive = genero === generoSeleccionado;
              return (
                <TouchableOpacity
                  key={genero}
                  activeOpacity={0.8}
                  onPress={() => setGeneroSeleccionado(genero)}
                  style={[styles.pill, isActive && styles.pillActive]}
                >
                  <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                    {genero}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Contenedor del Carrusel Activo */}
        <View style={styles.carouselContainer}>
          {cargando ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.loadingText}>Cargando catálogo...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerBox}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={cargarPeliculas}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FavouritesCarousel
              peliculas={peliculasFiltradas}
              onSelectPelicula={setPeliculaSeleccionada}
              onToggleFavourite={añadirFavoritos}
            />
          )}
          
          
        </View>

        {/* Modal para ver la sinopsis real de la API al tocar una tarjeta */}
        <Modal
          visible={!!peliculaSeleccionada}
          animationType="fade"
          transparent
          onRequestClose={() => setPeliculaSeleccionada(null)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setPeliculaSeleccionada(null)}
            />
            <View style={styles.modalContent}>
              <View style={styles.modalIndicator} />

              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{peliculaSeleccionada?.titulo}</Text>
                <View style={styles.ratingBadge}>
                  <View style={styles.ratingStarBox}>
                    <Text style={styles.ratingStarText}>★</Text>
                  </View>
                  <Text style={styles.ratingScore}>
                    {Number(peliculaSeleccionada?.puntuacion || 0).toFixed(1)}
                  </Text>
                </View>
              </View>

              <Text style={styles.modalMeta}>
                {peliculaSeleccionada?.anio}  •  {peliculaSeleccionada?.genero}
              </Text>

              <Text style={styles.modalDescriptionTitle}>Sinopsis</Text>
              <Text style={styles.modalDescription}>
                {peliculaSeleccionada?.descripcion}
              </Text>

              <TouchableOpacity
                style={styles.closeButton}
                activeOpacity={0.8}
                onPress={() => setPeliculaSeleccionada(null)}
              >
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#05100e',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#05100e',
    paddingTop: Platform.OS === 'android' ? 36 : 0,
  },
  ambientGlow: {
    position: 'absolute',
    top: -80,
    left: '15%',
    width: 280,
    height: 240,
    borderRadius: 140,
    backgroundColor: 'rgba(28, 88, 75, 0.28)',
    transform: [{ scaleX: 1.5 }],
  },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  pillsContainer: {
    height: 44,
    marginBottom: 8,
  },
  pillsScroll: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    marginRight: 10,
  },
  pillActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  pillText: {
    color: '#a3b8b3',
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  carouselContainer: {
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
  loadingText: {
    color: '#9db4af',
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    color: '#ff8a8a',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContent: {
    backgroundColor: '#0a1a17',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  modalIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
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
  modalMeta: {
    color: '#8fa59f',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 18,
  },
  modalDescriptionTitle: {
    color: '#cfe0dc',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  modalDescription: {
    color: '#a8bcb7',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 13,
    borderRadius: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
