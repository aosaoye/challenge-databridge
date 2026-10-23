import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Constants from 'expo-constants'

type Mascota = {
  id: number;
  nombre: string;
  raza: string;
  edad: number;
  ciudad: string;
};

const IP = Constants.expoConfig?.hostUri?.split(":")[0] || "localhost";
const API_URL = 'http://' + IP + ':3000/mascotas';

export default function App() {
  const [mascota, setMascota] = useState<Mascota | null>(null);
  const [idMascota, setIdMascota] = useState<number>(1);


  const buscarMascota = async () => {
    try {
      const response = await fetch(`${API_URL}/${idMascota}`)
      const data:Mascota = await response.json();
      setMascota(data);
      setIdMascota(idMascota);
      console.log(data)
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    buscarMascota();
  }, []);

  if (!mascota) return <Text>Cargando...</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <TextInput 
        value={idMascota.toString()}
        onChangeText={(text) => setIdMascota(Number(text))}
        keyboardType="number-pad"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 100,
          padding: 12,
          fontSize: 16,
          marginBottom: 16,
          paddingVertical:15,
          backgroundColor: '#e6e6e6',
          color: '#333',
          fontWeight: '700',
          textAlign: 'center',
          
        }}
      />
      <TouchableOpacity>
        <Text style={{
          backgroundColor: '#007AFF',
          color: '#FFF',
          padding: 12,
          borderRadius: 100,
          fontSize: 16,
          fontWeight: '700',
          textAlign: 'center',
          marginBottom:10
        }} onPress={buscarMascota}>Buscar</Text>
      </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.emoji}>🐶</Text>
        <Text style={styles.title}>{mascota.nombre}</Text>
        <Text>{mascota.raza}</Text>
        <Text>{mascota.edad} años · {mascota.ciudad}</Text>
      </View>
    </SafeAreaView>
  );
}
const styles=StyleSheet.create({
 container:{flex:1,justifyContent:'center',padding:24,backgroundColor:'#EEF6FF'},
 card:{backgroundColor:'#FFF',padding:28,borderRadius:24,alignItems:'center'},
 emoji:{fontSize:56},title:{fontSize:28,fontWeight:'800'}
});