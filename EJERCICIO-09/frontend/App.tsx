// EJERCICIO 09 — Event Radar (Material Design 3 & Expo)
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';

type Evento = {
  id: number;
  titulo: string;
  ciudad: string;
  categoria: string;
  fecha: string;
  precio: number | string;
};

const IP = Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost';
const BASE_URL = `http://${IP}:3000/eventos`;

const CIUDADES = ['Todas', 'Zaragoza', 'Madrid', 'Barcelona'];
const CATEGORIAS = ['Todas', 'Tecnología', 'Música', 'Gastronomía', 'Arte'];

export default function App() {
  const [ciudadSel, setCiudadSel] = useState('Todas');
  const [categoriaSel, setCategoriaSel] = useState('Todas');
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(false);
  const [urlActual, setUrlActual] = useState(BASE_URL);

  async function cargarEventos(ciudad = ciudadSel, categoria = categoriaSel) {
    setCargando(true);

    // RETO: Construir Query Params combinando ciudad + categoría
    const params = new URLSearchParams();
    if (ciudad !== 'Todas') params.append('ciudad', ciudad);
    if (categoria !== 'Todas') params.append('categoria', categoria);

    const fullUrl = params.toString() ? `${BASE_URL}?${params.toString()}` : BASE_URL;
    setUrlActual(fullUrl);

    try {
      const res = await fetch(fullUrl);
      const data = await res.json();
      if (Array.isArray(data)) {
        setEventos(data);
      }
    } catch (err) {
      console.log('Error al cargar eventos:', err);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarEventos();
  }, [ciudadSel, categoriaSel]);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Tecnología':
        return { bg: '#E0F2FE', text: '#0369A1' };
      case 'Música':
        return { bg: '#FCE7F3', text: '#BE185D' };
      case 'Gastronomía':
        return { bg: '#FEF3C7', text: '#B45309' };
      default:
        return { bg: '#E0E7FF', text: '#4338CA' };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={cargando}
              onRefresh={() => cargarEventos()}
              colors={['#0F766E']}
            />
          }
        >
          {/* Header MD3 */}
          <View style={styles.header}>
            <Text style={styles.eyebrow}>EVENT RADAR</Text>
            <Text style={styles.title}>Radar de Eventos</Text>
            <Text style={styles.subtitle}>Filtros combinados con Query Params opcionales</Text>
          </View>

          {/* Visualizador de Query Params Activos (Demostración de la API) */}
          <View style={styles.queryBar}>
            <Text style={styles.queryLabel}>GET REQUEST EN TIEMPO REAL:</Text>
            <Text style={styles.queryText} numberOfLines={1}>
              {urlActual}
            </Text>
          </View>

          {/* Filtro 1: Ciudades */}
          <Text style={styles.filterSectionTitle}>📍 Filtrar por Ciudad</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {CIUDADES.map((c) => {
              const active = ciudadSel === c;
              return (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setCiudadSel(c)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Filtro 2: Categorías (Reto: Combinado con Ciudad) */}
          <Text style={styles.filterSectionTitle}>🏷️ Filtrar por Categoría</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {CATEGORIAS.map((cat) => {
              const active = categoriaSel === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setCategoriaSel(cat)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Lista de Resultados */}
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {eventos.length} {eventos.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
            </Text>

            {(ciudadSel !== 'Todas' || categoriaSel !== 'Todas') && (
              <TouchableOpacity
                onPress={() => {
                  setCiudadSel('Todas');
                  setCategoriaSel('Todas');
                }}
              >
                <Text style={styles.resetBtnText}>Limpiar filtros</Text>
              </TouchableOpacity>
            )}
          </View>

          {cargando && eventos.length === 0 ? (
            <ActivityIndicator size="large" color="#0F766E" style={{ marginTop: 24 }} />
          ) : null}

          {eventos.length === 0 && !cargando ? (
            <View style={styles.emptyCard}>
              <Text style={{ fontSize: 32 }}>🎟️</Text>
              <Text style={styles.emptyTitle}>Sin eventos para esta combinación</Text>
              <Text style={styles.emptySub}>
                No hay coincidencias para {ciudadSel} y categoría {categoriaSel}.
              </Text>
            </View>
          ) : null}

          {eventos.map((ev) => {
            const catColor = getCategoryColor(ev.categoria);
            const numPrecio = Number(ev.precio) || 0;

            return (
              <View key={ev.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={[styles.categoryBadge, { backgroundColor: catColor.bg }]}>
                    <Text style={[styles.categoryBadgeText, { color: catColor.text }]}>
                      {ev.categoria}
                    </Text>
                  </View>

                  <Text style={styles.priceTag}>
                    {numPrecio === 0 ? 'Gratis' : `${numPrecio.toFixed(2)} €`}
                  </Text>
                </View>

                <Text style={styles.cardTitle}>{ev.titulo}</Text>

                <View style={styles.cardDetailsRow}>
                  <Text style={styles.cardDetail}>📍 {ev.ciudad}</Text>
                  <Text style={styles.cardDetail}>📅 {ev.fecha}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0FDF4', // Light Teal Surface
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#134E4A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  queryBar: {
    backgroundColor: '#CCFBF1',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#99F6E4',
    marginBottom: 18,
  },
  queryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.8,
  },
  queryText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#115E59',
    marginTop: 2,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  chipsScroll: {
    marginBottom: 14,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#134E4A',
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: 12,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  priceTag: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F766E',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  cardDetail: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#134E4A',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
});
