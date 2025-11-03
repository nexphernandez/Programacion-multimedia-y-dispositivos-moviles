import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Square } from './Square';

interface BoardProps {
  squares: (string | null)[];
  onSquareClick: (index: number) => void;
  boardSize: number;
  winningLine?: number[];
}

export function Board({ squares, onSquareClick, boardSize, winningLine = [] }: BoardProps) {
  return (
    <View style={styles.boardContainer} pointerEvents="box-none">
      {squares.map((val, idx) => (
        <Square
          key={idx}
          val={val || ''}
          onPress={() => onSquareClick(idx)}
          numerito={boardSize}
          isWinning={winningLine.includes(idx)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  boardContainer: {
    width: '90%',
    aspectRatio: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#fff',
    touchAction: 'manipulation',
    userSelect: 'none',
  },
});
