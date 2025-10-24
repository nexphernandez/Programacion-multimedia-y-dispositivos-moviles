import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export function Square({ val, onPress }: { val: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.square} onPress={onPress}>
      <Text style={styles.squareText}>{val}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  square: {
    width: '33.333%',
    height: '33.333%',
    aspectRatio: 1,        
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  squareText: {
    fontSize: 60,          
    fontWeight: 'bold',
    color: '#2c3e50',
  },
});