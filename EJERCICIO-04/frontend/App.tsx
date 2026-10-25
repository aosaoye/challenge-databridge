// App.tsx — Minimalist, Clean & Modern Restaurant Guide
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const IP = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
const API_URL = `http://${IP}:3000`;

type Restaurante = {
  id: number;
  nombre: string;
  tipo: string;
  ciudad: string;
  puntuacion: number | string;
};

// Categorías rápidas para filtrado y registro
const CATEGORIAS_RAPIDAS = [
  'Todos',
  'Italiano',
  'Japonés',
  'Chino',
  'Mexicano',
  'Hamburguesa',
  'Cafetería',
];

// Curated high-resolution culinary photography
const getFoodImageUri = (tipo: string): string => {
  const t = (tipo || '').toLowerCase();
  if (t.includes('ital') || t.includes('pizz') || t.includes('pasta')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80';
  }
  if (t.includes('japon') || t.includes('sush')) {
    return 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80';
  }
  if (t.includes('chin') || t.includes('wok') || t.includes('asia') || t.includes('ramen')) {
    return 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80';
  }
  if (t.includes('mexic') || t.includes('taco')) {
    return 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80';
  }
  if (t.includes('cafe') || t.includes('café') || t.includes('postr') || t.includes('bakery')) {
    return 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80';
  }
  if (t.includes('burg') || t.includes('fast')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80';
};

const getPuntuacionLabel = (val: number): string => {
  if (val >= 9.5) return 'Excepcional';
  if (val >= 9.0) return 'Excelente';
  if (val >= 8.0) return 'Muy bueno';
  if (val >= 7.0) return 'Bueno';
  return 'Aceptable';
};

export default function App() {
  // Form state
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [puntuacion, setPuntuacion] = useState(9);
  const [mostrarForm, setMostrarForm] = useState(false);

  // Search & Filter state
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');

  // Data & Feedback state
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  // Cargar lista desde la API
  async function cargarRestaurantes() {
    setCargando(true);
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
      console.log('Error al conectar:', error);
      mostrarNotificacion('error', 'No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarRestaurantes();
  }, []);

  function mostrarNotificacion(tipo: 'ok' | 'error', texto: string) {
    setMensaje({ tipo, texto });
    setTimeout(() => {
      setMensaje(null);
    }, 3800);
  }

  // Guardar nuevo restaurante
  async function guardarRestaurante() {
    if (!nombre.trim() || !tipo.trim() || !ciudad.trim()) {
      mostrarNotificacion('error', 'Por favor completa todos los campos requeridos.');
      return;
    }

    if (nombre.trim().length < 3) {
      mostrarNotificacion('error', 'El nombre debe tener al menos 3 caracteres.');
      return;
    }

    setGuardando(true);
    try {
      const respuesta = await fetch(API_URL + '/restaurantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          tipo: tipo.trim(),
          ciudad: ciudad.trim(),
          puntuacion: Math.round(puntuacion),
        }),
      });

      if (respuesta.ok) {
        mostrarNotificacion('ok', 'Restaurante guardado exitosamente');
        setNombre('');
        setTipo('');
        setCiudad('');
        setPuntuacion(9);
        setMostrarForm(false);
        await cargarRestaurantes();
      } else {
        const errData = await respuesta.json().catch(() => null);
        const errMsg = errData?.message
          ? Array.isArray(errData.message)
            ? errData.message.join(', ')
            : errData.message
          : 'Error al registrar el restaurante';
        mostrarNotificacion('error', errMsg);
      }
    } catch (error) {
      console.log(error);
      mostrarNotificacion('error', 'Error de conexión con el backend.');
    } finally {
      setGuardando(false);
    }
  }

  // Filtrado reactivo por término y categoría
  const restaurantesFiltrados = restaurantes.filter((item) => {
    const q = busqueda.trim().toLowerCase();
    const cumpleTexto =
      !q ||
      item.nombre.toLowerCase().includes(q) ||
      item.tipo.toLowerCase().includes(q) ||
      item.ciudad.toLowerCase().includes(q);

    const cumpleCategoria =
      categoriaSeleccionada === 'Todos' ||
      item.tipo.toLowerCase().includes(categoriaSeleccionada.toLowerCase());

    return cumpleTexto && cumpleCategoria;
  });

  // Estadísticas minimalistas
  const totalRestaurantes = restaurantes.length;
  const promedioPuntuacion =
    totalRestaurantes > 0
      ? (
          restaurantes.reduce((acc, curr) => acc + (Number(curr.puntuacion) || 0), 0) /
          totalRestaurantes
        ).toFixed(1)
      : '0.0';

  const ciudadesUnicas = new Set(restaurantes.map((r) => r.ciudad.trim().toLowerCase())).size;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={cargando}
              onRefresh={cargarRestaurantes}
              colors={['#0F172A']}
              tintColor="#0F172A"
            />
          }
        >
          {/* Header Superior Minimalista */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerEyebrow}>GUÍA GASTRONÓMICA</Text>
              <Text style={styles.headerTitle}>Restaurantes</Text>
            </View>

            <TouchableOpacity
              style={[styles.addButton, mostrarForm && styles.addButtonActive]}
              activeOpacity={0.8}
              onPress={() => setMostrarForm(!mostrarForm)}
            >
              <Text style={[styles.addButtonText, mostrarForm && styles.addButtonTextActive]}>
                {mostrarForm ? '✕ Cancelar' : '+ Añadir'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Notificación Toast limpia */}
          {mensaje ? (
            <View
              style={[
                styles.toast,
                mensaje.tipo === 'ok' ? styles.toastOk : styles.toastError,
              ]}
            >
              <Text style={styles.toastIcon}>
                {mensaje.tipo === 'ok' ? '✓' : '⚠️'}
              </Text>
              <Text style={styles.toastText}>{mensaje.texto}</Text>
            </View>
          ) : null}

          {/* Formulario Limpio de Registro (Añadir) */}
          {mostrarForm && (
            <View style={styles.formContainer}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Registrar Restaurante</Text>
                <Text style={styles.formSubtitle}>
                  Ingresa los detalles para agregarlo a la lista
                </Text>
              </View>

              {/* Campo Nombre */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre del Local *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ej. Osteria Francescana"
                  placeholderTextColor="#94A3B8"
                  value={nombre}
                  onChangeText={setNombre}
                />
              </View>

              {/* Campo Tipo / Cocina */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tipo de Cocina *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ej. Italiano, Sushi, Gourmet"
                  placeholderTextColor="#94A3B8"
                  value={tipo}
                  onChangeText={setTipo}
                />
                {/* Sugerencias rápidas en chips */}
                <View style={styles.chipSuggestionsRow}>
                  {CATEGORIAS_RAPIDAS.filter((c) => c !== 'Todos').slice(0, 4).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.chipSuggestion,
                        tipo.toLowerCase() === cat.toLowerCase() && styles.chipSuggestionActive,
                      ]}
                      onPress={() => setTipo(cat)}
                    >
                      <Text
                        style={[
                          styles.chipSuggestionText,
                          tipo.toLowerCase() === cat.toLowerCase() &&
                            styles.chipSuggestionTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Campo Ciudad */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ciudad *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ej. Madrid, Barcelona, Valencia"
                  placeholderTextColor="#94A3B8"
                  value={ciudad}
                  onChangeText={setCiudad}
                />
              </View>

              {/* Selector de Puntuación */}
              <View style={styles.inputGroup}>
                <View style={styles.scoreHeaderRow}>
                  <Text style={styles.inputLabel}>Puntuación (1 a 10)</Text>
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreBadgeText}>★ {puntuacion}/10</Text>
                  </View>
                </View>
                <View style={styles.scoreButtonsRow}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <TouchableOpacity
                      key={score}
                      style={[
                        styles.scoreBtn,
                        puntuacion === score && styles.scoreBtnSelected,
                      ]}
                      onPress={() => setPuntuacion(score)}
                    >
                      <Text
                        style={[
                          styles.scoreBtnText,
                          puntuacion === score && styles.scoreBtnTextSelected,
                        ]}
                      >
                        {score}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Botón Guardar */}
              <TouchableOpacity
                style={[styles.submitButton, guardando && styles.submitButtonDisabled]}
                disabled={guardando}
                activeOpacity={0.85}
                onPress={guardarRestaurante}
              >
                <Text style={styles.submitButtonText}>
                  {guardando ? 'Guardando...' : 'Guardar Restaurante'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Barra de Búsqueda Minimalista */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre, cocina o ciudad..."
              placeholderTextColor="#94A3B8"
              value={busqueda}
              onChangeText={setBusqueda}
            />
            {busqueda.length > 0 && (
              <TouchableOpacity onPress={() => setBusqueda('')} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Selector Horizontal de Categorías */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIAS_RAPIDAS.map((cat) => {
              const isSelected = categoriaSeleccionada === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                  activeOpacity={0.75}
                  onPress={() => setCategoriaSeleccionada(cat)}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      isSelected && styles.categoryPillTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Tarjetas de Métricas Resumen */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{totalRestaurantes}</Text>
              <Text style={styles.metricLabel}>Registrados</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>★ {promedioPuntuacion}</Text>
              <Text style={styles.metricLabel}>Promedio</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{ciudadesUnicas}</Text>
              <Text style={styles.metricLabel}>Ciudades</Text>
            </View>
          </View>

          {/* Encabezado de la Sección de Lista */}
          <View style={styles.listSectionHeader}>
            <Text style={styles.listSectionTitle}>
              {categoriaSeleccionada === 'Todos'
                ? 'Todos los Locales'
                : `Cocina ${categoriaSeleccionada}`}
            </Text>
            <Text style={styles.listCountBadge}>
              {restaurantesFiltrados.length}{' '}
              {restaurantesFiltrados.length === 1 ? 'resultado' : 'resultados'}
            </Text>
          </View>

          {/* Lista de Restaurantes Minimalista */}
          {restaurantesFiltrados.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Text style={styles.emptyIconText}>🍽️</Text>
              </View>
              <Text style={styles.emptyTitle}>No hay restaurantes</Text>
              <Text style={styles.emptyDescription}>
                {busqueda || categoriaSeleccionada !== 'Todos'
                  ? 'No se encontraron resultados para los filtros seleccionados.'
                  : 'Aún no tienes restaurantes registrados en tu guía.'}
              </Text>
              {(busqueda || categoriaSeleccionada !== 'Todos') && (
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => {
                    setBusqueda('');
                    setCategoriaSeleccionada('Todos');
                  }}
                >
                  <Text style={styles.emptyActionBtnText}>Restablecer filtros</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.cardsContainer}>
              {restaurantesFiltrados.map((item) => {
                const numPuntuacion = Number(item.puntuacion) || 0;
                const imageUri = getFoodImageUri(item.tipo);

                return (
                  <View key={item.id} style={styles.card}>
                    {/* Imagen de cabecera con Badge de Puntuación */}
                    <View style={styles.cardImageContainer}>
                      <Image
                        source={{ uri: imageUri }}
                        style={styles.cardImage}
                        resizeMode="cover"
                      />
                      <View style={styles.ratingBadge}>
                        <Text style={styles.ratingStar}>★</Text>
                        <Text style={styles.ratingNumber}>
                          {numPuntuacion.toFixed(1)}
                        </Text>
                      </View>
                    </View>

                    {/* Contenido de la Tarjeta */}
                    <View style={styles.cardBody}>
                      <View style={styles.cardTagsRow}>
                        <View style={styles.tagPill}>
                          <Text style={styles.tagPillText}>{item.tipo}</Text>
                        </View>
                        <View style={styles.cityRow}>
                          <Text style={styles.cityPin}>📍</Text>
                          <Text style={styles.cityText}>{item.ciudad}</Text>
                        </View>
                      </View>

                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.nombre}
                      </Text>

                      <View style={styles.cardFooter}>
                        <Text style={styles.cardQualityLabel}>
                          {getPuntuacionLabel(numPuntuacion)}
                        </Text>
                        <Text style={styles.cardIdLabel}>#{item.id}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Espaciado inferior */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Slate 50 ultra limpio
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  // Header Minimalista
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B', // Slate 500
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A', // Slate 900
    letterSpacing: -0.5,
  },
  addButton: {
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  addButtonActive: {
    backgroundColor: '#E2E8F0',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  addButtonTextActive: {
    color: '#334155',
  },

  // Toast / Notificación
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 16,
    gap: 10,
  },
  toastOk: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  toastError: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  toastIcon: {
    fontSize: 15,
    fontWeight: '700',
  },
  toastText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },

  // Formulario Limpio (Añadir)
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  formHeader: {
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  formSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
  },
  chipSuggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  chipSuggestion: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipSuggestionActive: {
    backgroundColor: '#0F172A',
  },
  chipSuggestionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  chipSuggestionTextActive: {
    color: '#FFFFFF',
  },
  scoreHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  scoreBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  scoreBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  scoreButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  scoreBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBtnSelected: {
    backgroundColor: '#0F172A',
  },
  scoreBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  scoreBtnTextSelected: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Barra de Búsqueda
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  clearBtn: {
    padding: 6,
  },
  clearBtnText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '700',
  },

  // Categorías Horizontales
  categoryScroll: {
    paddingBottom: 16,
    gap: 8,
  },
  categoryPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Fila de Métricas
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricCard: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },

  // Encabezado de la Sección de Lista
  listSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  listSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  listCountBadge: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },

  // Contenedor de Tarjetas
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingStar: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '900',
  },
  ratingNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  cardBody: {
    padding: 16,
  },
  cardTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tagPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  cityPin: {
    fontSize: 11,
  },
  cityText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cardQualityLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669', // Emerald 600
  },
  cardIdLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },

  // Estado Vacío
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyIconText: {
    fontSize: 28,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptyDescription: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyActionBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  emptyActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
});