import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Game } from '../components/Game';
import { fetchDevice, fetchAddDevice } from "@/lib/Conexion";

export default function Index() {
  const [numero, setNumero] = useState<number | null>(null);

  const [id,setId] = React.useState(false);

  useEffect(() =>{
    if (id) return;
    const fetchData = async () => {

      const deviceId = await fetchAddDevice();
      setId(deviceId);
    };

    fetchData();
  });

  if (numero !== null) {
    return <Game numero={numero} onBack={() => setNumero(null)} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tic Tac Toe</Text>

      <TouchableOpacity style={styles.button} onPress={() => setNumero(3)}>
        <Text style={styles.buttonText}>Tres en línea</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => setNumero(4)}>
        <Text style={styles.buttonText}>Cuatro en línea</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => setNumero(5)}>
        <Text style={styles.buttonText}>Cinco en línea</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => setNumero(6)}>
        <Text style={styles.buttonText}>Seis en línea</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => setNumero(7)}>
        <Text style={styles.buttonText}>Siete en línea</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10 },
  title: { fontSize: 32, fontWeight: '800', color: '#2c3e50', marginBottom: 40 },
  button: { backgroundColor: 'green', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
