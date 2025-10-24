import { Game } from '@/components/Game';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tres en Linea</Text>
      <Game />
    </View>
  );
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
});