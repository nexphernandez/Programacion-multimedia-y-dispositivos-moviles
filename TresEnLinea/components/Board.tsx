import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Square } from './Square';

export function Board({ 
  squares, 
  onSquareClick 
}: { 
  squares: string[]; 
  onSquareClick: (index: number) => void;
}) {
  return (
    <View style={styles.boardContainer}>
      {squares.map((value, index) => (
        <Square 
          key={index} 
          val={value} 
          onPress={() => onSquareClick(index)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  boardContainer: {
    width: 240.5,           
    aspectRatio: 1,       
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#fff',
  },
});