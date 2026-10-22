import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { SceneCarousel } from './components/SceneCarousel';
import type { Videojuego } from './types/videojuego';

export default function App() {
  const [videojuegos, setVideojuegos] = useState<Videojuego[]>([]);
  const IP = Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost';

  useEffect(() => {
    fetch(`http://${IP}:3000/api/videojuegos`)
      .then((res) => {
        console.log('Respuesta API videojuegos status:', res.status);
        return res.json();
      })
      .then((data: Videojuego[]) => {
        setVideojuegos(data);
      })
      .catch((error) => console.error('Error al obtener videojuegos:', error));
  }, [IP]);

  const handleSelectVideojuego = (juego: Videojuego) => {
    console.log('Videojuego seleccionado:', juego.titulo);
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="light" />
          <View style={styles.container}>
            <SceneCarousel
              videojuegos={videojuegos}
              onSelectVideojuego={handleSelectVideojuego}
            />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#090A0F',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#090A0F',
  },
  container: {
    flex: 1,
  },
});
