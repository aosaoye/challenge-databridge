// EJERCICIO 08 — My Playlists (Material Design 3 & Expo)
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

type Cancion = {
  id: number;
  titulo: string;
  artista: string;
  duracionSegundos: number;
};

type Playlist = {
  id: number;
  nombre: string;
  descripcion?: string;
  canciones: Cancion[];
};

const IP = Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost';
const API_URL = `http://${IP}:3000/playlists`;

export default function App() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activa, setActiva] = useState<Playlist | null>(null);

  // Form para añadir canción (Reto)
  const [mostrarForm, setMostrarForm] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [artista, setArtista] = useState('');
  const [duracion, setDuracion] = useState('210');

  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null);

  async function cargarPlaylists(playlistIdToSelect?: number) {
    setCargando(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        setPlaylists(data);
        if (data.length > 0) {
          const targetId = playlistIdToSelect ?? activa?.id ?? data[0].id;
          const found = data.find((p) => p.id === targetId) || data[0];
          setActiva(found);
        }
      }
    } catch (err) {
      mostrarNotificacion('err', 'Error al conectar con la API de Playlists');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarPlaylists();
  }, []);

  function mostrarNotificacion(tipo: 'ok' | 'err', texto: string) {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 3500);
  }

  // RETO: Añadir canción a la playlist activa (POST /playlists/:id/canciones)
  async function agregarCancion() {
    if (!activa) return;
    if (!titulo.trim() || !artista.trim()) {
      mostrarNotificacion('err', 'Introduce título y artista');
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch(`${API_URL}/${activa.id}/canciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: titulo.trim(),
          artista: artista.trim(),
          duracionSegundos: parseInt(duracion, 10) || 210,
        }),
      });

      if (res.ok) {
        mostrarNotificacion('ok', `Canción agregada a "${activa.nombre}" ✓`);
        setTitulo('');
        setArtista('');
        setDuracion('210');
        setMostrarForm(false);
        await cargarPlaylists(activa.id);
      } else {
        mostrarNotificacion('err', 'No se pudo guardar la canción');
      }
    } catch (err) {
      mostrarNotificacion('err', 'Error de conexión');
    } finally {
      setGuardando(false);
    }
  }

  const formatDuration = (sec?: number) => {
    if (!sec) return '3:30';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
              onRefresh={() => cargarPlaylists()}
              colors={['#1E40AF']}
            />
          }
        >
          {/* Header MD3 */}
          <View style={styles.header}>
            <Text style={styles.eyebrow}>MY PLAYLISTS</Text>
            <Text style={styles.title}>Reproductor & Listas</Text>
            <Text style={styles.subtitle}>Relaciones OneToMany y ManyToOne persistentes</Text>
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

          {/* Selector Horizontal de Playlists */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.playlistTabs}>
            {playlists.map((p) => {
              const isSelected = activa?.id === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.playlistTab, isSelected && styles.playlistTabActive]}
                  onPress={() => setActiva(p)}
                >
                  <Text
                    style={[
                      styles.playlistTabText,
                      isSelected && styles.playlistTabTextActive,
                    ]}
                  >
                    🎵 {p.nombre} ({p.canciones?.length || 0})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Tarjeta de la Playlist Activa */}
          {activa && (
            <View style={styles.activeCard}>
              <View style={styles.activeHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activeName}>🎵 {activa.nombre}</Text>
                  {activa.descripcion ? (
                    <Text style={styles.activeDesc}>{activa.descripcion}</Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={[styles.addSongBtn, mostrarForm && styles.addSongBtnActive]}
                  activeOpacity={0.8}
                  onPress={() => setMostrarForm(!mostrarForm)}
                >
                  <Text style={[styles.addSongBtnText, mostrarForm && styles.addSongBtnTextActive]}>
                    {mostrarForm ? '✕ Cancelar' : '＋ Canción (Reto)'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Formulario Añadir Canción (Reto) */}
              {mostrarForm && (
                <View style={styles.formContainer}>
                  <Text style={styles.formTitle}>Añadir a "{activa.nombre}"</Text>

                  <Text style={styles.label}>Título de la canción *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ej. Midnight City"
                    placeholderTextColor="#94A3B8"
                    value={titulo}
                    onChangeText={setTitulo}
                  />

                  <View style={styles.rowInputs}>
                    <View style={{ flex: 1.4, marginRight: 8 }}>
                      <Text style={styles.label}>Artista *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="ej. M83"
                        placeholderTextColor="#94A3B8"
                        value={artista}
                        onChangeText={setArtista}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>Segundos</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="244"
                        placeholderTextColor="#94A3B8"
                        keyboardType="number-pad"
                        value={duracion}
                        onChangeText={setDuracion}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.submitSongBtn}
                    disabled={guardando}
                    activeOpacity={0.85}
                    onPress={agregarCancion}
                  >
                    {guardando ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.submitSongBtnText}>Vincular Canción (POST)</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.divider} />

              {/* Lista de Canciones en la Relación */}
              <Text style={styles.tracklistTitle}>
                Canciones en esta Playlist ({activa.canciones?.length || 0})
              </Text>

              {(!activa.canciones || activa.canciones.length === 0) && (
                <Text style={styles.noSongs}>No hay canciones en esta playlist.</Text>
              )}

              {activa.canciones?.map((c, index) => (
                <View key={c.id || index} style={styles.songRow}>
                  <Text style={styles.songIndex}>{(index + 1).toString().padStart(2, '0')}</Text>
                  <View style={styles.songInfo}>
                    <Text style={styles.songTitle} numberOfLines={1}>
                      {c.titulo}
                    </Text>
                    <Text style={styles.songArtist}>{c.artista}</Text>
                  </View>
                  <Text style={styles.songDuration}>
                    ⏱ {formatDuration(c.duracionSegundos)}
                  </Text>
                </View>
              ))}
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
    backgroundColor: '#F8FAFC',
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
    color: '#1E40AF',
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
  playlistTabs: {
    marginBottom: 18,
  },
  playlistTab: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  playlistTabActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  playlistTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  playlistTabTextActive: {
    color: '#FFFFFF',
  },
  activeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  activeName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  activeDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  addSongBtn: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  addSongBtnActive: {
    backgroundColor: '#E2E8F0',
  },
  addSongBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  addSongBtnTextActive: {
    color: '#334155',
  },
  formContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 10,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  submitSongBtn: {
    backgroundColor: '#1E40AF',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  submitSongBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 18,
  },
  tracklistTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  noSongs: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  songIndex: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
    width: 28,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  songArtist: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  songDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
});
