import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export function PlayAgainButton({ onReset }: { onReset: () => void }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onReset}>
      <Text style={styles.buttonText}>Reiniciar Juego</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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