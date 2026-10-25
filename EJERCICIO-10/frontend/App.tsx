// EJERCICIO 10 — Wander: Full Stack Challenge (Material Design 3 & Expo)
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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';

type Destino = {
  id: number;
  nombre: string;
  pais: string;
  continente: string;
  prioridad: string;
  presupuesto: number | string;
  visitado: boolean;
};

const IP = Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost';
const API_URL = `http://${IP}:3000/destinos`;

const FILTROS_ESTADO = ['Todos', 'Pendientes', 'Visitados'];
const PRIORIDADES = ['ALTA', 'MEDIA', 'BAJA'];

export default function App() {
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [mostrarForm, setMostrarForm] = useState(false);

  // Form State
  const [nombre, setNombre] = useState('');
  const [pais, setPais] = useState('');
  const [continente, setContinente] = useState('Europa');
  const [prioridad, setPrioridad] = useState('ALTA');
  const [presupuesto, setPresupuesto] = useState('1200');

  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null);

  async function cargarDestinos() {
    setCargando(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        setDestinos(data);
      }
    } catch (err) {
      mostrarNotificacion('err', 'Error al conectar con la API de Destinos');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDestinos();
  }, []);

  function mostrarNotificacion(tipo: 'ok' | 'err', texto: string) {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 3500);
  }

  // CREATE (POST)
  async function agregarDestino() {
    if (!nombre.trim() || !pais.trim()) {
      mostrarNotificacion('err', 'Introduce el nombre y país');
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          pais: pais.trim(),
          continente: continente.trim(),
          prioridad,
          presupuesto: parseFloat(presupuesto) || 1000,
          visitado: false,
        }),
      });

      if (res.ok) {
        const nuevo: Destino = await res.json();
        setDestinos((prev) => [...prev, nuevo]);
        setNombre('');
        setPais('');
        setPresupuesto('1200');
        setMostrarForm(false);
        mostrarNotificacion('ok', `"${nuevo.nombre}" guardado en Wander ✓`);
      } else {
        mostrarNotificacion('err', 'No se pudo crear el destino');
      }
    } catch (err) {
      mostrarNotificacion('err', 'Error de conexión');
    } finally {
      setGuardando(false);
    }
  }

  // RETO: Mejora propia coherente (Toggle Visitado mediante PATCH)
  async function toggleVisitado(id: number) {
    try {
      const res = await fetch(`${API_URL}/${id}/toggle-visitado`, {
        method: 'PATCH',
      });

      if (res.ok) {
        const actualizado: Destino = await res.json();
        setDestinos((prev) =>
          prev.map((d) => (d.id === id ? actualizado : d)),
        );
        mostrarNotificacion(
          'ok',
          actualizado.visitado
            ? `¡Has visitado ${actualizado.nombre}! 🌍✓`
            : `${actualizado.nombre} marcado como pendiente`,
        );
      }
    } catch (err) {
      mostrarNotificacion('err', 'Error al cambiar estado visitado');
    }
  }

  // DELETE
  function confirmarEliminar(d: Destino) {
    Alert.alert('Eliminar Destino', `¿Deseas borrar "${d.nombre}" de tu lista?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${API_URL}/${d.id}`, { method: 'DELETE' });
            if (res.ok) {
              setDestinos((prev) => prev.filter((item) => item.id !== d.id));
              mostrarNotificacion('ok', `"${d.nombre}" eliminado`);
            }
          } catch (err) {
            mostrarNotificacion('err', 'Error al eliminar');
          }
        },
      },
    ]);
  }

  // Filtrado
  const destinosFiltrados = destinos.filter((d) => {
    if (filtroEstado === 'Visitados') return d.visitado;
    if (filtroEstado === 'Pendientes') return !d.visitado;
    return true;
  });

  const totalPresupuesto = destinosFiltrados.reduce(
    (acc, curr) => acc + (Number(curr.presupuesto) || 0),
    0,
  );

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'ALTA':
        return { bg: '#FFD8E4', text: '#7D003E' };
      case 'MEDIA':
        return { bg: '#FEF3C7', text: '#B45309' };
      default:
        return { bg: '#E0F2FE', text: '#0369A1' };
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
              onRefresh={cargarDestinos}
              colors={['#6D48A5']}
            />
          }
        >
          {/* Header MD3 */}
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>WANDER · FULL STACK</Text>
              <Text style={styles.title}>Destinos Soñados</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggleBtn, mostrarForm && styles.toggleBtnActive]}
              activeOpacity={0.8}
              onPress={() => setMostrarForm(!mostrarForm)}
            >
              <Text style={[styles.toggleBtnText, mostrarForm && styles.toggleBtnTextActive]}>
                {mostrarForm ? '✕ Cancelar' : '+ Destino'}
              </Text>
            </TouchableOpacity>
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

          {/* Tarjeta de Métricas / Presupuesto Total */}
          <View style={styles.statsCard}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{destinos.length}</Text>
              <Text style={styles.statLab}>Total Lugares</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#166534' }]}>
                {destinos.filter((d) => d.visitado).length}
              </Text>
              <Text style={styles.statLab}>Visitados ✓</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{totalPresupuesto.toFixed(0)} €</Text>
              <Text style={styles.statLab}>Presupuesto</Text>
            </View>
          </View>

          {/* Formulario (POST) */}
          {mostrarForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Registrar Nuevo Destino</Text>

              <Text style={styles.label}>Nombre de la Ciudad o Región *</Text>
              <TextInput
                style={styles.input}
                placeholder="ej. Reikiavik, Kioto, Banff"
                placeholderTextColor="#79747E"
                value={nombre}
                onChangeText={setNombre}
              />

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>País *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ej. Islandia"
                    placeholderTextColor="#79747E"
                    value={pais}
                    onChangeText={setPais}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Presupuesto (€)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1400"
                    placeholderTextColor="#79747E"
                    keyboardType="number-pad"
                    value={presupuesto}
                    onChangeText={setPresupuesto}
                  />
                </View>
              </View>

              <Text style={styles.label}>Prioridad</Text>
              <View style={styles.priorityRow}>
                {PRIORIDADES.map((p) => {
                  const active = prioridad === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[styles.priorityChip, active && styles.priorityChipActive]}
                      onPress={() => setPrioridad(p)}
                    >
                      <Text
                        style={[
                          styles.priorityChipText,
                          active && styles.priorityChipTextActive,
                        ]}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                disabled={guardando}
                activeOpacity={0.85}
                onPress={agregarDestino}
              >
                {guardando ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Guardar Destino (POST)</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Filtros de Estado */}
          <View style={styles.filterTabs}>
            {FILTROS_ESTADO.map((f) => {
              const active = filtroEstado === f;
              return (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterTab, active && styles.filterTabActive]}
                  onPress={() => setFiltroEstado(f)}
                >
                  <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Lista de Destinos */}
          {destinosFiltrados.map((d) => {
            const prioStyle = getPriorityStyle(d.prioridad);

            return (
              <View key={d.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardDestino}>🌍 {d.nombre}</Text>
                    <Text style={styles.cardPais}>
                      {d.pais} • {Number(d.presupuesto).toFixed(0)} €
                    </Text>
                  </View>

                  <View style={[styles.prioBadge, { backgroundColor: prioStyle.bg }]}>
                    <Text style={[styles.prioBadgeText, { color: prioStyle.text }]}>
                      {d.prioridad}
                    </Text>
                  </View>
                </View>

                {/* Acciones MD3: Toggle Visitado (Reto PATCH) + Eliminar (DELETE) */}
                <View style={styles.cardBottom}>
                  <TouchableOpacity
                    style={[styles.visitBtn, d.visitado && styles.visitBtnDone]}
                    activeOpacity={0.8}
                    onPress={() => toggleVisitado(d.id)}
                  >
                    <Text
                      style={[styles.visitBtnText, d.visitado && styles.visitBtnTextDone]}
                    >
                      {d.visitado ? '✓ Visitado' : '✈️ Marcar Visitado'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => confirmarEliminar(d)}
                  >
                    <Text style={styles.deleteBtnText}>🗑️</Text>
                  </TouchableOpacity>
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
    backgroundColor: '#FCF8FD',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6D48A5',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1D1A22',
  },
  toggleBtn: {
    backgroundColor: '#6D48A5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  toggleBtnActive: {
    backgroundColor: '#E7E0EC',
  },
  toggleBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  toggleBtnTextActive: {
    color: '#49454F',
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
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8DEF8',
    marginBottom: 18,
    elevation: 2,
  },
  statBox: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6D48A5',
  },
  statLab: {
    fontSize: 11,
    fontWeight: '600',
    color: '#79747E',
    marginTop: 2,
  },
  statDiv: {
    width: 1,
    height: 28,
    backgroundColor: '#E8DEF8',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8DEF8',
    marginBottom: 20,
    elevation: 3,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1A22',
    marginBottom: 12,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#49454F',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FCF8FD',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CAC4D0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1D1A22',
    marginBottom: 12,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F4EFF4',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7E0EC',
  },
  priorityChipActive: {
    backgroundColor: '#6D48A5',
    borderColor: '#6D48A5',
  },
  priorityChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#49454F',
  },
  priorityChipTextActive: {
    color: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: '#6D48A5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8DEF8',
  },
  filterTabActive: {
    backgroundColor: '#6D48A5',
    borderColor: '#6D48A5',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#49454F',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8DEF8',
    marginBottom: 12,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardDestino: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1D1A22',
  },
  cardPais: {
    fontSize: 13,
    color: '#79747E',
    marginTop: 2,
  },
  prioBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  prioBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F4EFF4',
  },
  visitBtn: {
    backgroundColor: '#F4EFF4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7E0EC',
  },
  visitBtnDone: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  visitBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#49454F',
  },
  visitBtnTextDone: {
    color: '#15803D',
  },
  deleteBtn: {
    padding: 8,
  },
  deleteBtnText: {
    fontSize: 18,
  },
});
