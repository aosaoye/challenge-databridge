// EJERCICIO 06 — My Library (Material Design 3 & Expo)
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

type Libro = {
  id: number;
  titulo: string;
  autor: string;
  paginas: number;
  leido: boolean;
};

const IP = Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost';
const API_URL = `http://${IP}:3000/libros`;

export default function App() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null);

  async function cargarLibros() {
    setCargando(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        setLibros(data);
      }
    } catch (err) {
      mostrarNotificacion('err', 'Error al conectar con la API');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarLibros();
  }, []);

  function mostrarNotificacion(tipo: 'ok' | 'err', texto: string) {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 3500);
  }

  // RETO: Marcar como leído utilizando PATCH
  async function toggleLeido(id: number) {
    try {
      const res = await fetch(`${API_URL}/${id}/leido`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const libroActualizado: Libro = await res.json();
        setLibros((prev) =>
          prev.map((l) => (l.id === libroActualizado.id ? libroActualizado : l)),
        );
        mostrarNotificacion(
          'ok',
          libroActualizado.leido
            ? `"${libroActualizado.titulo}" marcado como leído ✓`
            : `"${libroActualizado.titulo}" marcado como pendiente`,
        );
      } else {
        mostrarNotificacion('err', 'No se pudo actualizar el estado de lectura');
      }
    } catch (err) {
      mostrarNotificacion('err', 'Error de conexión');
    }
  }

  // DELETE: Eliminar y sincronizar interfaz
  function confirmarEliminar(libro: Libro) {
    Alert.alert(
      'Eliminar Libro',
      `¿Deseas eliminar "${libro.titulo}" de tu biblioteca en PostgreSQL?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminarLibro(libro.id, libro.titulo),
        },
      ],
    );
  }

  async function eliminarLibro(id: number, titulo: string) {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Sincronizar estado en memoria de React Native
        setLibros((prev) => prev.filter((l) => l.id !== id));
        mostrarNotificacion('ok', `"${titulo}" eliminado de la base de datos.`);
      } else {
        mostrarNotificacion('err', 'No se pudo eliminar el libro');
      }
    } catch (err) {
      mostrarNotificacion('err', 'Error al eliminar');
    }
  }

  const leidosCount = libros.filter((l) => l.leido).length;

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
            <RefreshControl refreshing={cargando} onRefresh={cargarLibros} colors={['#725572']} />
          }
        >
          {/* Header MD3 */}
          <View style={styles.header}>
            <Text style={styles.eyebrow}>MY LIBRARY</Text>
            <Text style={styles.title}>Biblioteca Personal</Text>
            <Text style={styles.subtitle}>Elimina y sincroniza con PostgreSQL en tiempo real</Text>
          </View>

          {/* Estadísticas MD3 */}
          <View style={styles.statsCard}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{libros.length}</Text>
              <Text style={styles.statLabel}>Total Libros</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: '#166534' }]}>{leidosCount}</Text>
              <Text style={styles.statLabel}>Leídos ✓</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: '#B45309' }]}>
                {libros.length - leidosCount}
              </Text>
              <Text style={styles.statLabel}>Pendientes</Text>
            </View>
          </View>

          {/* Feedback Toast */}
          {mensaje && (
            <View
              style={[
                styles.toast,
                mensaje.tipo === 'ok' ? styles.toastOk : styles.toastErr,
              ]}
            >
              <Text style={styles.toastText}>
                {mensaje.tipo === 'ok' ? '✓ ' : '⚠️ '}
                {mensaje.texto}
              </Text>
            </View>
          )}

          {/* Lista de Libros */}
          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>Títulos Disponibles</Text>

            {libros.length === 0 && !cargando ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>📚</Text>
                <Text style={styles.emptyTitle}>Biblioteca vacía</Text>
                <Text style={styles.emptySub}>No quedan libros registrados en PostgreSQL.</Text>
              </View>
            ) : null}

            {libros.map((l) => (
              <View key={l.id} style={styles.bookCard}>
                <View style={styles.bookMainRow}>
                  <View style={styles.bookIconBox}>
                    <Text style={styles.bookIcon}>📖</Text>
                  </View>

                  <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle} numberOfLines={1}>
                      {l.titulo}
                    </Text>
                    <Text style={styles.bookAuthor}>{l.autor}</Text>
                    <Text style={styles.bookPages}>📄 {l.paginas} páginas</Text>
                  </View>

                  {/* Estado Leído Badge */}
                  <View
                    style={[
                      styles.readBadge,
                      l.leido ? styles.readBadgeDone : styles.readBadgePending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.readBadgeText,
                        l.leido ? styles.readBadgeTextDone : styles.readBadgeTextPending,
                      ]}
                    >
                      {l.leido ? 'Leído ✓' : 'Pendiente'}
                    </Text>
                  </View>
                </View>

                {/* Acciones MD3: Marcar como leído (PATCH Reto) + Eliminar (DELETE) */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, l.leido ? styles.btnPending : styles.btnRead]}
                    activeOpacity={0.8}
                    onPress={() => toggleLeido(l.id)}
                  >
                    <Text style={styles.actionBtnText}>
                      {l.leido ? '↩ Marcar Pendiente' : '✓ Marcar Leído (PATCH)'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    activeOpacity={0.8}
                    onPress={() => confirmarEliminar(l)}
                  >
                    <Text style={styles.deleteBtnText}>🗑️ Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF5FF', // MD3 Light Purple Surface
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
    color: '#7E22CE',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginBottom: 20,
    elevation: 2,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#7E22CE',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E9D5FF',
  },
  toast: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  toastOk: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  toastErr: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  toastText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  listSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 4,
  },
  bookCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    elevation: 2,
  },
  bookMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookIcon: {
    fontSize: 22,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  bookAuthor: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  bookPages: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  readBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  readBadgeDone: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  readBadgePending: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  readBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  readBadgeTextDone: {
    color: '#15803D',
  },
  readBadgeTextPending: {
    color: '#B45309',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3E8FF',
  },
  actionBtn: {
    flex: 1.5,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRead: {
    backgroundColor: '#7E22CE',
  },
  btnPending: {
    backgroundColor: '#6B7280',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteBtnText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  emptySub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});
