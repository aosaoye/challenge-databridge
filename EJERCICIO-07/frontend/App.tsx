// EJERCICIO 07 — Sneaker Vault (Material Design 3 & Expo)
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

type Sneaker = {
  id: number;
  modelo: string;
  marca: string;
  precio: number | string;
  stock: number;
};

const IP = Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost';
const API_URL = `http://${IP}:3000/sneakers`;

export default function App() {
  const [sneakers, setSneakers] = useState<Sneaker[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [modelo, setModelo] = useState('');
  const [marca, setMarca] = useState('');
  const [precio, setPrecio] = useState('129.99');
  const [stock, setStock] = useState('4');

  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null);

  async function cargarSneakers() {
    setCargando(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSneakers(data);
      }
    } catch (err) {
      mostrarNotificacion('err', 'Error al conectar con la API');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarSneakers();
  }, []);

  function mostrarNotificacion(tipo: 'ok' | 'err', texto: string) {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 3500);
  }

  // CREATE (POST)
  async function agregarSneaker() {
    if (!modelo.trim() || !marca.trim()) {
      mostrarNotificacion('err', 'Completa modelo y marca');
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelo: modelo.trim(),
          marca: marca.trim(),
          precio: parseFloat(precio) || 99.99,
          stock: Math.max(0, parseInt(stock, 10) || 0),
        }),
      });

      if (res.ok) {
        const nueva: Sneaker = await res.json();
        setSneakers((prev) => [...prev, nueva]);
        setModelo('');
        setMarca('');
        setPrecio('129.99');
        setStock('4');
        setMostrarForm(false);
        mostrarNotificacion('ok', `"${nueva.modelo}" guardada exitosamente ✓`);
      } else {
        mostrarNotificacion('err', 'Error al crear la sneaker');
      }
    } catch (err) {
      mostrarNotificacion('err', 'Error de conexión');
    } finally {
      setGuardando(false);
    }
  }

  // UPDATE (PATCH) — Ajustar stock en tiempo real
  async function cambiarStock(id: number, delta: number) {
    const s = sneakers.find((item) => item.id === id);
    if (!s) return;
    const nuevoStock = Math.max(0, s.stock + delta);

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: nuevoStock }),
      });

      if (res.ok) {
        const updated: Sneaker = await res.json();
        setSneakers((prev) => prev.map((item) => (item.id === id ? updated : item)));
      }
    } catch (err) {
      mostrarNotificacion('err', 'Error al actualizar stock');
    }
  }

  // DELETE
  function confirmarEliminar(s: Sneaker) {
    Alert.alert('Eliminar Sneaker', `¿Seguro que deseas eliminar "${s.modelo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${API_URL}/${s.id}`, { method: 'DELETE' });
            if (res.ok) {
              setSneakers((prev) => prev.filter((item) => item.id !== s.id));
              mostrarNotificacion('ok', `"${s.modelo}" eliminada de PostgreSQL`);
            }
          } catch (err) {
            mostrarNotificacion('err', 'Error al eliminar');
          }
        },
      },
    ]);
  }

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
              onRefresh={cargarSneakers}
              colors={['#8F4C38']}
            />
          }
        >
          {/* Header MD3 */}
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>SNEAKER VAULT</Text>
              <Text style={styles.title}>Inventario CRUD</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggleBtn, mostrarForm && styles.toggleBtnActive]}
              activeOpacity={0.8}
              onPress={() => setMostrarForm(!mostrarForm)}
            >
              <Text style={[styles.toggleBtnText, mostrarForm && styles.toggleBtnTextActive]}>
                {mostrarForm ? '✕ Cancelar' : '+ Nueva'}
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

          {/* Formulario de Alta (POST) */}
          {mostrarForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Registrar Nueva Sneaker</Text>

              <Text style={styles.inputLabel}>Modelo *</Text>
              <TextInput
                style={styles.input}
                placeholder="ej. Air Jordan 1 Low"
                placeholderTextColor="#79747E"
                value={modelo}
                onChangeText={setModelo}
              />

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Marca *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ej. Nike, Adidas"
                    placeholderTextColor="#79747E"
                    value={marca}
                    onChangeText={setMarca}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Precio (€) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ej. 149.99"
                    placeholderTextColor="#79747E"
                    keyboardType="decimal-pad"
                    value={precio}
                    onChangeText={setPrecio}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Stock Inicial *</Text>
              <TextInput
                style={styles.input}
                placeholder="ej. 4"
                placeholderTextColor="#79747E"
                keyboardType="number-pad"
                value={stock}
                onChangeText={setStock}
              />

              <TouchableOpacity
                style={styles.submitBtn}
                disabled={guardando}
                activeOpacity={0.85}
                onPress={agregarSneaker}
              >
                {guardando ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Guardar Sneaker (POST)</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Lista de Sneakers */}
          <Text style={styles.sectionTitle}>
            Modelos en Stock ({sneakers.length})
          </Text>

          {sneakers.map((s) => {
            const isAgotado = Number(s.stock) === 0;

            return (
              <View key={s.id} style={styles.sneakerCard}>
                <View style={styles.sneakerTop}>
                  <View style={styles.sneakerIcon}>
                    <Text style={{ fontSize: 24 }}>👟</Text>
                  </View>

                  <View style={styles.sneakerInfo}>
                    <Text style={styles.sneakerModel}>{s.modelo}</Text>
                    <Text style={styles.sneakerBrand}>
                      {s.marca} • {Number(s.precio).toFixed(2)} €
                    </Text>
                  </View>

                  {/* RETO: Regla visual derivada de stock: AGOTADO si stock === 0 */}
                  <View
                    style={[
                      styles.stockBadge,
                      isAgotado ? styles.badgeAgotado : styles.badgeAvailable,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stockBadgeText,
                        isAgotado ? styles.badgeTextAgotado : styles.badgeTextAvailable,
                      ]}
                    >
                      {isAgotado ? 'AGOTADO' : `Stock ${s.stock}`}
                    </Text>
                  </View>
                </View>

                {/* Controles CRUD: Stepper de Stock (PATCH) y Eliminar (DELETE) */}
                <View style={styles.sneakerActions}>
                  <View style={styles.stepperContainer}>
                    <Text style={styles.stepperLabel}>Stock:</Text>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => cambiarStock(s.id, -1)}
                      disabled={s.stock <= 0}
                    >
                      <Text style={styles.stepperBtnText}>-</Text>
                    </TouchableOpacity>

                    <Text style={styles.stepperValue}>{s.stock}</Text>

                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => cambiarStock(s.id, 1)}
                    >
                      <Text style={styles.stepperBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => confirmarEliminar(s)}
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
    backgroundColor: '#FCF8F8',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8F4C38',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#201A19',
  },
  toggleBtn: {
    backgroundColor: '#8F4C38',
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
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F5DDD7',
    marginBottom: 20,
    elevation: 3,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#201A19',
    marginBottom: 14,
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#53433F',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FCF8F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8C2BC',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#201A19',
    marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: '#8F4C38',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#201A19',
    marginBottom: 12,
  },
  sneakerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F5DDD7',
    marginBottom: 12,
    elevation: 2,
  },
  sneakerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sneakerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F5DDD7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sneakerInfo: {
    flex: 1,
  },
  sneakerModel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#201A19',
  },
  sneakerBrand: {
    fontSize: 13,
    color: '#705B56',
    marginTop: 2,
  },
  stockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeAvailable: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
  },
  badgeAgotado: {
    backgroundColor: '#FFEBEE',
    borderColor: '#EF9A9A',
  },
  stockBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  badgeTextAvailable: {
    color: '#2E7D32',
  },
  badgeTextAgotado: {
    color: '#C62828',
  },
  sneakerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5DDD7',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#705B56',
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5DDD7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8F4C38',
  },
  stepperValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#201A19',
    minWidth: 20,
    textAlign: 'center',
  },
  deleteBtn: {
    padding: 8,
  },
  deleteBtnText: {
    fontSize: 18,
  },
});
