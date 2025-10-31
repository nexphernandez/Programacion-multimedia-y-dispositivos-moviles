import { Game } from '@/components/Game';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { serializableMappingCache } from 'react-native-worklets';

export default function App() {
  var [button, setButton] = React.useState(false);
  var [numero, setNumero] = React.useState(0);
  function cambiarButton (numero: number):void{
    setNumero(numero);
    setButton(!button);
  }
  if (button == false) {
    return(
      <View style={styles.container}>
        <Text style={styles.title}>Tic Tac Toe</Text>
        <TouchableOpacity style={styles.button} onPress={()=>cambiarButton(3)}>
          <Text style={styles.buttonText}>Tres en linea</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={()=>cambiarButton(4)}>
          <Text style={styles.buttonText}>Cuatro en linea</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={()=>cambiarButton(5)}>
          <Text style={styles.buttonText}>Cinco en linea</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={()=>cambiarButton(6)}>
          <Text style={styles.buttonText}>Seis en linea</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={()=>cambiarButton(7)}>
          <Text style={styles.buttonText}>Siete en linea</Text>
        </TouchableOpacity>
      </View>
    );
  }else{
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Tic Tac Toe</Text>
        <Game numero = {numero}/>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 40,
  },
  footer: {
    marginTop: 40,
    fontSize: 16,
    color: '#7f8c8d',
  },
  button: {
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});