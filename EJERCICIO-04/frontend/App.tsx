// App.tsx — Goodfood Fast Food Banner & Restaurant Carousel
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Constants from 'expo-constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(360, Math.round(SCREEN_WIDTH * 0.85));
const CARD_SPACING = 14;
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;
const SIDE_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2;

const BURGER_IMG = require('./assets/goodfood_burger.jpg');

const IP = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
const API_URL = `http://${IP}:3000`;

type Restaurante = {
  id: number;
  nombre: string;
  tipo: string;
  ciudad: string;
  puntuacion: number;
};

// Imagen según categoría culinaria
const getFoodImageUri = (tipo: string): string => {
  const t = tipo.toLowerCase();
  if (t.includes('ital') || t.includes('pizz') || t.includes('pasta')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80';
  }
  if (t.includes('chin') || t.includes('wok') || t.includes('asia') || t.includes('ramen')) {
    return 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80';
  }
  if (t.includes('japon') || t.includes('sush')) {
    return 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=80';
  }
  if (t.includes('mexic') || t.includes('taco')) {
    return 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=80';
  }
  if (t.includes('cafe') || t.includes('café') || t.includes('postr')) {
    return 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80';
  }
  return ''; // Usará la hamburguesa por defecto
};

export default function App() {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [puntuacion, setPuntuacion] = useState('9');
  const [filtroUbicacion, setFiltroUbicacion] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);

  const scrollX = useRef(new Animated.Value(0)).current;

  async function guardar() {
    if (!nombre.trim() || !tipo.trim() || !ciudad.trim()) {
      setMensaje('⚠️ Por favor completa los campos');
      return;
    }

    try {
      const parsedPuntuacion = Math.max(1, Math.min(10, parseInt(puntuacion, 10) || 9));

      const respuesta = await fetch(API_URL + '/restaurantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          tipo: tipo.trim(),
          ciudad: ciudad.trim(),
          puntuacion: parsedPuntuacion,
        }),
      });

      if (respuesta.ok) {
        setMensaje('✅ ¡Restaurante guardado en Goodfood!');
        setNombre('');
        setTipo('');
        setCiudad('');
        setPuntuacion('9');
        setMostrarForm(false);
        await mostrar();
      } else {
        setMensaje('❌ Error al guardar');
      }
    } catch (error) {
      console.log(error);
      setMensaje('❌ Error de conexión al guardar');
    }
  }

  async function mostrar() {
    try {
      const respuesta = await fetch(API_URL + '/restaurantes', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await respuesta.json();
      if (Array.isArray(data)) {
        setRestaurantes(data);
      }
    } catch (error) {
      console.log(error);
      setMensaje('Error al obtener restaurantes');
    }
  }

  useEffect(() => {
    mostrar();
  }, []);

  const restaurantesFiltrados = restaurantes.filter((r) => {
    if (!filtroUbicacion.trim()) return true;
    const q = filtroUbicacion.toLowerCase();
    return (
      r.ciudad.toLowerCase().includes(q) ||
      r.nombre.toLowerCase().includes(q) ||
      r.tipo.toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={styles.outerBackground}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Superior del Banner Template */}
          <View style={styles.topHeaderTitleContainer}>
            <Text style={styles.topHeaderTitle}>BANNER TEMPLATE</Text>
            <Text style={styles.topHeaderSubtitle}>FAST FOOD</Text>
          </View>

          {/* MAIN HERO BANNER - GOODFOOD */}
          <View style={styles.heroBannerCard}>
            {/* Formas orgánicas de fondo */}
            <View style={styles.bgOrganicShapeGreen} />
            <View style={styles.bgOrganicCircleYellow} />
            <View style={styles.bgOrganicDotRed} />

            {/* Navbar interna de Goodfood */}
            <View style={styles.goodfoodNavbar}>
              <Text style={styles.logoText}>Goodfood</Text>

              <View style={styles.navMenuRow}>
                <Text style={[styles.navItem, styles.navItemActive]}>HOME</Text>
                <Text style={styles.navItem}>MENU</Text>
                <Text style={styles.navItem}>ORDER</Text>
                <Text style={styles.navItem}>DELIVERY</Text>
              </View>

              <TouchableOpacity
                onPress={() => setMostrarForm(!mostrarForm)}
                style={styles.hamburgerBtn}
              >
                <Text style={styles.hamburgerIcon}>☰</Text>
              </TouchableOpacity>
            </View>

            {/* Contenido Hero Split */}
            <View style={styles.heroSplit}>
              {/* Lado Izquierdo: Textos y Buscador */}
              <View style={styles.heroLeft}>
                <Text style={styles.eyebrowText}>BEST IN THE TOWN</Text>
                <Text style={styles.mainHeading}>
                  TRY A BETTER &{'\n'}FASTER EATING{'\n'}EXPERIENCE
                </Text>

                {/* Input estilo ubicación */}
                <View style={styles.locationInputContainer}>
                  <Text style={styles.pinIcon}>📍</Text>
                  <TextInput
                    style={styles.locationTextInput}
                    placeholder="Enter your location"
                    placeholderTextColor="#94A3B8"
                    value={filtroUbicacion}
                    onChangeText={setFiltroUbicacion}
                  />
                  <TouchableOpacity style={styles.searchCircleBtn}>
                    <Text style={styles.searchIconText}>🔍</Text>
                  </TouchableOpacity>
                </View>

                {/* Redes sociales */}
                <View style={styles.socialRow}>
                  <View style={styles.socialDot}>
                    <Text style={styles.socialDotText}>f</Text>
                  </View>
                  <View style={styles.socialDot}>
                    <Text style={styles.socialDotText}>📷</Text>
                  </View>
                  <View style={styles.socialDot}>
                    <Text style={styles.socialDotText}>🐦</Text>
                  </View>
                  <View style={styles.socialDot}>
                    <Text style={styles.socialDotText}>▶</Text>
                  </View>
                </View>
              </View>

              {/* Lado Derecho: Hamburguesa Explotada y Badge 30% OFF */}
              <View style={styles.heroRight}>
                <Image
                  source={BURGER_IMG}
                  style={styles.heroBurgerImage}
                  resizeMode="contain"
                />

                {/* Badge 30% OFF circular */}
                <View style={styles.badgeDiscount}>
                  <Text style={styles.badgeDiscountPercent}>30%</Text>
                  <Text style={styles.badgeDiscountText}>OFF</Text>
                </View>

                {/* Líneas onduladas decorativas */}
                <View style={styles.wavyDecorContainer}>
                  <Text style={styles.wavyDecorText}>〰〰〰</Text>
                  <Text style={styles.wavyDecorText}>〰〰〰</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Botón para alternar formulario de registro */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.toggleFormButton}
              activeOpacity={0.85}
              onPress={() => setMostrarForm(!mostrarForm)}
            >
              <Text style={styles.toggleFormButtonText}>
                {mostrarForm ? '✕ Cerrar Formulario' : '+ Agregar Nuevo Restaurante'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Formulario estilizado en Goodfood */}
          {mostrarForm ? (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>REGISTRAR NUEVO SPOT 🍔</Text>

              <TextInput
                style={styles.inputPill}
                placeholder="Nombre del restaurante (ej. Burger Station)"
                placeholderTextColor="#94A3B8"
                value={nombre}
                onChangeText={setNombre}
              />

              <View style={styles.rowInputs}>
                <TextInput
                  style={[styles.inputPill, { flex: 1, marginRight: 8 }]}
                  placeholder="Tipo (ej. Fast Food, Burger)"
                  placeholderTextColor="#94A3B8"
                  value={tipo}
                  onChangeText={setTipo}
                />
                <TextInput
                  style={[styles.inputPill, { flex: 1 }]}
                  placeholder="Ciudad (ej. Madrid)"
                  placeholderTextColor="#94A3B8"
                  value={ciudad}
                  onChangeText={setCiudad}
                />
              </View>

              <TextInput
                style={styles.inputPill}
                placeholder="Puntuación (1 - 10)"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                value={puntuacion}
                onChangeText={setPuntuacion}
              />

              <TouchableOpacity
                style={styles.saveSubmitButton}
                activeOpacity={0.85}
                onPress={guardar}
              >
                <Text style={styles.saveSubmitButtonText}>GUARDAR SPOT</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {mensaje ? (
            <View style={styles.messageToast}>
              <Text style={styles.messageToastText}>{mensaje}</Text>
            </View>
          ) : null}

          {/* SECCIÓN DEL CARRUSEL GOODFOOD */}
          <View style={styles.carouselSection}>
            <View style={styles.carouselHeader}>
              <View>
                <Text style={styles.carouselPreTitle}>RECOMENDADOS HOY</Text>
                <Text style={styles.carouselMainTitle}>Food Spots Populares</Text>
              </View>
              <View style={styles.counterBadge}>
                <Text style={styles.counterBadgeText}>
                  {restaurantesFiltrados.length} SPOTS
                </Text>
              </View>
            </View>

            {restaurantesFiltrados.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>🍔</Text>
                <Text style={styles.emptyText}>No se encontraron restaurantes</Text>
                <Text style={styles.emptySubtext}>
                  {filtroUbicacion
                    ? `No hay coincidencias para "${filtroUbicacion}"`
                    : 'Agrega tu primer restaurante con el botón de arriba'}
                </Text>
              </View>
            ) : (
              <>
                <Animated.FlatList
                  data={restaurantesFiltrados}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={SNAP_INTERVAL}
                  snapToAlignment="start"
                  decelerationRate="fast"
                  bounces={true}
                  contentContainerStyle={styles.carouselContent}
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
                      outputRange: [0.94, 1, 0.94],
                      extrapolate: 'clamp',
                    });

                    const opacity = scrollX.interpolate({
                      inputRange,
                      outputRange: [0.8, 1, 0.8],
                      extrapolate: 'clamp',
                    });

                    const customImageUri = getFoodImageUri(item.tipo);
                    const numRating = Number(item.puntuacion) || 9;

                    return (
                      <Animated.View
                        style={[
                          styles.carouselCardContainer,
                          {
                            transform: [{ scale }],
                            opacity,
                          },
                        ]}
                      >
                        <View style={styles.goodfoodCard}>
                          {/* Fondo curvo decorativo */}
                          <View style={styles.cardPastelCurve} />

                          {/* Cuerpo de la tarjeta split */}
                          <View style={styles.cardContentRow}>
                            {/* Información izquierda */}
                            <View style={styles.cardInfoCol}>
                              <Text style={styles.cardEyebrow}>
                                BEST IN {item.ciudad.toUpperCase()}
                              </Text>

                              <Text style={styles.cardRestaurantName} numberOfLines={2}>
                                {item.nombre}
                              </Text>

                              <View style={styles.cardTagsRow}>
                                <View style={styles.categoryPill}>
                                  <Text style={styles.categoryPillText}>{item.tipo}</Text>
                                </View>
                                <View style={styles.cityPill}>
                                  <Text style={styles.cityPillText}>📍 {item.ciudad}</Text>
                                </View>
                              </View>

                              <TouchableOpacity style={styles.orderNowBtn} activeOpacity={0.85}>
                                <Text style={styles.orderNowBtnText}>ORDENAR</Text>
                              </TouchableOpacity>
                            </View>

                            {/* Imagen derecha con badge de descuento/rating */}
                            <View style={styles.cardMediaCol}>
                              <Image
                                source={
                                  customImageUri ? { uri: customImageUri } : BURGER_IMG
                                }
                                style={styles.cardFoodImage}
                                resizeMode="contain"
                              />

                              {/* Badge estilo 30% OFF */}
                              <View style={styles.cardBadgeScore}>
                                <Text style={styles.cardBadgeScoreNum}>
                                  {numRating >= 8.5 ? '30%' : `★ ${numRating.toFixed(0)}`}
                                </Text>
                                <Text style={styles.cardBadgeScoreLabel}>
                                  {numRating >= 8.5 ? 'OFF' : 'TOP'}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      </Animated.View>
                    );
                  }}
                />

                {/* Dots indicadores estilo Goodfood */}
                <View style={styles.paginationDotsContainer}>
                  {restaurantesFiltrados.map((_, i) => {
                    const dotInputRange = [
                      (i - 1) * SNAP_INTERVAL,
                      i * SNAP_INTERVAL,
                      (i + 1) * SNAP_INTERVAL,
                    ];

                    const dotWidth = scrollX.interpolate({
                      inputRange: dotInputRange,
                      outputRange: [8, 24, 8],
                      extrapolate: 'clamp',
                    });

                    const dotOpacity = scrollX.interpolate({
                      inputRange: dotInputRange,
                      outputRange: [0.35, 1, 0.35],
                      extrapolate: 'clamp',
                    });

                    return (
                      <Animated.View
                        key={i}
                        style={[
                          styles.dot,
                          {
                            width: dotWidth,
                            opacity: dotOpacity,
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Fondo mostaza / dorado idéntico a la plantilla
  outerBackground: {
    flex: 1,
    backgroundColor: '#E7A419',
  },
  scrollContent: {
    paddingBottom: 50,
  },

  // Título superior de la plantilla
  topHeaderTitleContainer: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  topHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  topHeaderSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },

  // Banner Principal Goodfood
  heroBannerCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 18,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },

  // Formas de fondo orgánicas de la plantilla
  bgOrganicShapeGreen: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '58%',
    height: '100%',
    backgroundColor: '#EBF1E4', // Sage pálido del banner
    borderBottomLeftRadius: 180,
    borderTopLeftRadius: 120,
    zIndex: 0,
  },
  bgOrganicCircleYellow: {
    position: 'absolute',
    top: '32%',
    right: '48%',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDE047',
    opacity: 0.8,
    zIndex: 0,
  },
  bgOrganicDotRed: {
    position: 'absolute',
    bottom: 12,
    right: '34%',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EA580C',
    zIndex: 0,
  },

  // Navbar Goodfood
  goodfoodNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
    marginBottom: 12,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#D92323', // Rojo Goodfood
    letterSpacing: -0.5,
  },
  navMenuRow: {
    flexDirection: 'row',
    gap: 12,
    display: SCREEN_WIDTH < 380 ? 'none' : 'flex',
  },
  navItem: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    letterSpacing: 0.5,
  },
  navItemActive: {
    color: '#D92323',
    fontWeight: '900',
  },
  hamburgerBtn: {
    padding: 6,
  },
  hamburgerIcon: {
    fontSize: 20,
    fontWeight: '900',
    color: '#D92323',
  },

  // Hero Split
  heroSplit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
    marginTop: 4,
  },
  heroLeft: {
    flex: 1.15,
    paddingRight: 6,
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  mainHeading: {
    fontSize: SCREEN_WIDTH < 380 ? 18 : 21,
    fontWeight: '900',
    color: '#111827',
    lineHeight: SCREEN_WIDTH < 380 ? 22 : 26,
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2F6',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pinIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  locationTextInput: {
    flex: 1,
    fontSize: 12,
    color: '#1E293B',
    paddingVertical: 2,
  },
  searchCircleBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIconText: {
    fontSize: 11,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  socialDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#D92323',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialDotText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  // Hero Lado Derecho
  heroRight: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 190,
  },
  heroBurgerImage: {
    width: 170,
    height: 170,
    zIndex: 1,
  },
  badgeDiscount: {
    position: 'absolute',
    top: 4,
    right: 0,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#D92323',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D92323',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 3,
  },
  badgeDiscountPercent: {
    fontSize: 16,
    fontWeight: '900',
    color: '#D92323',
    lineHeight: 18,
  },
  badgeDiscountText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#D92323',
  },
  wavyDecorContainer: {
    position: 'absolute',
    bottom: -4,
    right: 4,
    opacity: 0.6,
  },
  wavyDecorText: {
    color: '#EF4444',
    fontSize: 10,
    letterSpacing: -2,
    fontWeight: '900',
  },

  // Botón de alternar formulario
  actionRow: {
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 6,
  },
  toggleFormButton: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  toggleFormButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Formulario Goodfood
  formCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: '#FDE047',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  inputPill: {
    backgroundColor: '#EEF2F6',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 13,
    color: '#1E293B',
    marginBottom: 10,
  },
  saveSubmitButton: {
    backgroundColor: '#D92323',
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: '#D92323',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 2,
  },
  saveSubmitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  messageToast: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D92323',
  },
  messageToastText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D92323',
  },

  // Carrusel
  carouselSection: {
    marginTop: 20,
  },
  carouselHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  carouselPreTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  carouselMainTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  counterBadge: {
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  counterBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  carouselContent: {
    paddingHorizontal: SIDE_PADDING,
    paddingVertical: 8,
  },

  // Tarjeta de Carrusel Goodfood
  carouselCardContainer: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
  },
  goodfoodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 6,
    height: 205,
    justifyContent: 'center',
  },
  cardPastelCurve: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '45%',
    height: '100%',
    backgroundColor: '#EBF1E4',
    borderBottomLeftRadius: 120,
    borderTopLeftRadius: 90,
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  cardInfoCol: {
    flex: 1.25,
    paddingRight: 6,
  },
  cardEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D92323',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  cardRestaurantName: {
    fontSize: 19,
    fontWeight: '900',
    color: '#111827',
    lineHeight: 22,
    marginBottom: 8,
  },
  cardTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 12,
  },
  categoryPill: {
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  categoryPillText: {
    color: '#E11D48',
    fontSize: 11,
    fontWeight: '800',
  },
  cityPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  cityPillText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
  },
  orderNowBtn: {
    backgroundColor: '#D92323',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignSelf: 'flex-start',
    shadowColor: '#D92323',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  orderNowBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  // Columna Derecha de la Tarjeta
  cardMediaCol: {
    flex: 0.95,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 140,
  },
  cardFoodImage: {
    width: 125,
    height: 125,
    borderRadius: 14,
  },
  cardBadgeScore: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D92323',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D92323',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  cardBadgeScoreNum: {
    fontSize: 12,
    fontWeight: '900',
    color: '#D92323',
    lineHeight: 13,
  },
  cardBadgeScoreLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#D92323',
  },

  // Paginación
  paginationDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },

  // Estado vacío
  emptyCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 26,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
});