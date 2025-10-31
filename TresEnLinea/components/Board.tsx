import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Square } from './Square';

export function Board({ 
  squares, 
  onSquareClick,
  boardSize
}: { 
  squares: string[]; 
  onSquareClick: (index: number) => void;
  boardSize: number;
}) {
  return (
    <View style={styles.boardContainer}>
      {squares.map((value, index) => (
        <Square 
          key={index} 
          val={value} 
          onPress={() => onSquareClick(index)}
          numerito={boardSize}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  boardContainer: {
    width: '100%',       
    aspectRatio: 1,       
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#fff',
  },
});