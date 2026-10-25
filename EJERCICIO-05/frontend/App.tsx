// EJERCICIO 05 — Travel Book (Material Design 3 & Expo)
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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';

type Viaje = {
  id: number;
  destino: string;
  pais: string;
  fecha: string;
  estado: string;
};

const IP = Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost';
const API_URL = `http://${IP}:3000/viajes`;

const ESTADOS_DISPONIBLES = ['PLANIFICADO', 'RESERVADO', 'COMPLETADO', 'CANCELADO'];

export default function App() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [seleccionado, setSeleccionado] = useState<Viaje | null>(null);
  const [estadoEdit, setEstadoEdit] = useState('RESERVADO');
  const [fechaEdit, setFechaEdit] = useState('2027-04-10');
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null);

  async function cargarViajes() {
    setCargando(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        setViajes(data);
        if (data.length > 0 && !seleccionado) {
          seleccionarViaje(data[0]);
        }
      }
    } catch (err) {
      mostrarMensaje('err', 'No se pudo conectar con el backend');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarViajes();
  }, []);

  function seleccionarViaje(v: Viaje) {
    setSeleccionado(v);
    setEstadoEdit(v.estado);
    setFechaEdit(v.fecha || '2027-04-10');
  }

  function mostrarMensaje(tipo: 'ok' | 'err', texto: string) {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 3500);
  }

  // PATCH /viajes/:id — Modifica estado y fecha (Reto)
  async function actualizarViaje() {
    if (!seleccionado) return;
    setGuardando(true);
    try {
      const res = await fetch(`${API_URL}/${seleccionado.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: estadoEdit,
          fecha: fechaEdit, // Reto
        }),
      });

      if (res.ok) {
        const viajeActualizado: Viaje = await res.json();
        mostrarMensaje('ok', `Viaje a ${viajeActualizado.destino} actualizado ✓`);
        setViajes((prev) =>
          prev.map((v) => (v.id === viajeActualizado.id ? viajeActualizado : v)),
        );
        setSeleccionado(viajeActualizado);
      } else {
        mostrarMensaje('err', 'Error al actualizar el viaje');
      }
    } catch (err) {
      mostrarMensaje('err', 'Error de conexión');
    } finally {
      setGuardando(false);
    }
  }

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'RESERVADO':
        return { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD' };
      case 'COMPLETADO':
        return { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' };
      case 'CANCELADO':
        return { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' };
      default:
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
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
            <RefreshControl refreshing={cargando} onRefresh={cargarViajes} colors={['#006874']} />
          }
        >
          {/* Header MD3 */}
          <View style={styles.header}>
            <Text style={styles.eyebrow}>TRAVEL BOOK</Text>
            <Text style={styles.title}>Gestor de Viajes</Text>
            <Text style={styles.subtitle}>Edita estado y fecha con persistencia PATCH</Text>
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

          {/* Editor MD3 (PATCH) */}
          {seleccionado && (
            <View style={styles.editorCard}>
              <View style={styles.editorHeader}>
                <View>
                  <Text style={styles.editorEyebrow}>EDITAR VIAJE #{seleccionado.id}</Text>
                  <Text style={styles.editorDestination}>
                    ✈️ {seleccionado.destino}, {seleccionado.pais}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: getStatusColor(seleccionado.estado).bg,
                      borderColor: getStatusColor(seleccionado.estado).border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: getStatusColor(seleccionado.estado).text },
                    ]}
                  >
                    {seleccionado.estado}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Selector de Estado */}
              <Text style={styles.fieldLabel}>Estado del Viaje</Text>
              <View style={styles.chipsRow}>
                {ESTADOS_DISPONIBLES.map((st) => {
                  const active = estadoEdit === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setEstadoEdit(st)}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {st}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* RETO: Editor de Fecha */}
              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>
                📅 Fecha del Viaje (Reto)
              </Text>
              <TextInput
                style={styles.input}
                value={fechaEdit}
                onChangeText={setFechaEdit}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#79747E"
              />

              {/* Botón Guardar Cambios con PATCH */}
              <TouchableOpacity
                style={[styles.saveBtn, guardando && styles.saveBtnDisabled]}
                disabled={guardando}
                activeOpacity={0.85}
                onPress={actualizarViaje}
              >
                {guardando ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Guardar cambios (PATCH)</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Lista de Viajes en la Base de Datos */}
          <Text style={styles.sectionTitle}>Tus Destinos en PostgreSQL</Text>

          {viajes.map((v) => {
            const isSelected = seleccionado?.id === v.id;
            const stColor = getStatusColor(v.estado);

            return (
              <TouchableOpacity
                key={v.id}
                style={[styles.tripCard, isSelected && styles.tripCardSelected]}
                activeOpacity={0.8}
                onPress={() => seleccionarViaje(v)}
              >
                <View style={styles.tripCardTop}>
                  <Text style={styles.tripDestination}>✈️ {v.destino}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: stColor.bg, borderColor: stColor.border },
                    ]}
                  >
                    <Text style={[styles.statusBadgeText, { color: stColor.text }]}>
                      {v.estado}
                    </Text>
                  </View>
                </View>

                <View style={styles.tripCardBottom}>
                  <Text style={styles.tripCountry}>{v.pais}</Text>
                  <Text style={styles.tripDate}>📅 {v.fecha || 'Sin fecha'}</Text>
                </View>
              </TouchableOpacity>
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
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 18,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#006874',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
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
  editorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 24,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  editorEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
  },
  editorDestination: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#006874',
    borderColor: '#006874',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  saveBtn: {
    backgroundColor: '#006874',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 18,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  tripCardSelected: {
    borderColor: '#006874',
    borderWidth: 2,
  },
  tripCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripDestination: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  tripCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  tripCountry: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  tripDate: {
    fontSize: 12,
    color: '#006874',
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
