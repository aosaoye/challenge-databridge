// EJERCICIO 03 — Pet Profile (Material Design 3 & Nivel de Energía)
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';

type Mascota = {
  id: number;
  nombre: string;
  raza: string;
  edad: number;
  ciudad: string;
  nivelEnergia?: string;
};

const IP = Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost';
const API_URL = `http://${IP}:3000/mascotas`;

export default function App() {
  const [mascota, setMascota] = useState<Mascota | null>(null);
  const [idInput, setIdInput] = useState<string>('1');
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const buscarMascota = async (idToSearch?: number) => {
    const id = idToSearch ?? parseInt(idInput, 10);
    if (isNaN(id) || id <= 0) {
      setError('Introduce un ID válido');
      return;
    }

    setCargando(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) {
        throw new Error(`Mascota #${id} no encontrada`);
      }
      const data: Mascota = await response.json();
      setMascota(data);
    } catch (err: any) {
      setError(err.message || 'Error al conectar con la API');
      setMascota(null);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    buscarMascota(1);
  }, []);

  const getEnergyColor = (level?: string) => {
    const l = (level || '').toUpperCase();
    if (l === 'ALTO') return { bg: '#FFD8E4', text: '#7D003E', border: '#FFB1C8' };
    if (l === 'MEDIO') return { bg: '#E8DEF8', text: '#4A4458', border: '#CCC2DC' };
    return { bg: '#D0E4FF', text: '#004A77', border: '#9ECAFF' };
  };

  const energyStyle = getEnergyColor(mascota?.nivelEnergia);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Header MD3 */}
          <View style={styles.header}>
            <Text style={styles.headerEyebrow}>PET PROFILE</Text>
            <Text style={styles.headerTitle}>Ficha de Mascota</Text>
          </View>

          {/* Selector de ID estilo MD3 Filled TextField */}
          <View style={styles.searchCard}>
            <Text style={styles.inputLabel}>Buscar por ID de Mascota</Text>
            <View style={styles.inputRow}>
              <TextInput
                value={idInput}
                onChangeText={setIdInput}
                keyboardType="number-pad"
                placeholder="ej. 1"
                placeholderTextColor="#79747E"
                style={styles.input}
              />
              <TouchableOpacity
                style={styles.searchBtn}
                activeOpacity={0.8}
                onPress={() => buscarMascota()}
              >
                <Text style={styles.searchBtnText}>Buscar</Text>
              </TouchableOpacity>
            </View>

            {/* Selector rápido 1..4 */}
            <View style={styles.quickIdRow}>
              {[1, 2, 3, 4].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[styles.quickIdBtn, idInput === String(n) && styles.quickIdBtnActive]}
                  onPress={() => {
                    setIdInput(String(n));
                    buscarMascota(n);
                  }}
                >
                  <Text
                    style={[
                      styles.quickIdText,
                      idInput === String(n) && styles.quickIdTextActive,
                    ]}
                  >
                    #{n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Feedback de carga o error */}
          {cargando && (
            <View style={styles.feedbackContainer}>
              <ActivityIndicator size="large" color="#6750A4" />
              <Text style={styles.feedbackText}>Consultando en PostgreSQL...</Text>
            </View>
          )}

          {error && !cargando && (
            <View style={styles.errorCard}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Ficha Mascota estilo MD3 Elevated Card */}
          {mascota && !cargando && (
            <View style={styles.petCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarEmoji}>🐶</Text>
              </View>

              <Text style={styles.petName}>{mascota.nombre}</Text>
              <Text style={styles.petBreed}>{mascota.raza}</Text>

              <View style={styles.divider} />

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>EDAD</Text>
                  <Text style={styles.metaValue}>{mascota.edad} años</Text>
                </View>

                <View style={styles.metaDivider} />

                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>CIUDAD</Text>
                  <Text style={styles.metaValue}>{mascota.ciudad}</Text>
                </View>
              </View>

              {/* RETO: Nivel de Energía con Badge MD3 */}
              <View
                style={[
                  styles.energyBadge,
                  { backgroundColor: energyStyle.bg, borderColor: energyStyle.border },
                ]}
              >
                <Text style={styles.energyIcon}>⚡</Text>
                <Text style={[styles.energyText, { color: energyStyle.text }]}>
                  Nivel de energía: {mascota.nivelEnergia || 'ALTO'}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FEF7FF', // MD3 Surface
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 20,
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6750A4', // MD3 Primary
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1D1B20', // MD3 OnSurface
  },
  searchCard: {
    backgroundColor: '#ECE6F0', // MD3 Surface Container
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#49454F',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#FEF7FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#79747E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1D1B20',
  },
  searchBtn: {
    backgroundColor: '#6750A4',
    paddingHorizontal: 20,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  quickIdRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  quickIdBtn: {
    backgroundColor: '#FEF7FF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#CAC4D0',
  },
  quickIdBtnActive: {
    backgroundColor: '#6750A4',
    borderColor: '#6750A4',
  },
  quickIdText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#49454F',
  },
  quickIdTextActive: {
    color: '#FFFFFF',
  },
  feedbackContainer: {
    padding: 30,
    alignItems: 'center',
  },
  feedbackText: {
    marginTop: 12,
    fontSize: 14,
    color: '#49454F',
  },
  errorCard: {
    backgroundColor: '#FFDAD6',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 20,
  },
  errorText: {
    color: '#BA1A1A',
    fontWeight: '600',
    fontSize: 14,
  },
  petCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7E0EC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EADDFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarEmoji: {
    fontSize: 42,
  },
  petName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1D1B20',
  },
  petBreed: {
    fontSize: 14,
    color: '#49454F',
    marginTop: 2,
    fontWeight: '500',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E7E0EC',
    marginVertical: 18,
  },
  metaRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#79747E',
    letterSpacing: 1,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1D1B20',
    marginTop: 4,
  },
  metaDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E7E0EC',
  },
  energyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  energyIcon: {
    fontSize: 16,
  },
  energyText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});