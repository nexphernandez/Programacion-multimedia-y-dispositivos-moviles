import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle, DimensionValue, TextStyle } from 'react-native';

interface SquareProps {
  val: string | null | undefined;
  onPress: () => void;
  numerito: number;
  isWinning?: boolean;
}

export function Square({ val, onPress, numerito, isWinning = false }: SquareProps) {
  const widthPercentage = `${100 / numerito}%` as DimensionValue;

  const squareStyle: ViewStyle = {
    width: widthPercentage,
    height: widthPercentage,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isWinning ? 'lightgreen' : '#fff',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  };

  // Usamos StyleSheet para el estilo de texto
  const textStyle: TextStyle = styles.squareText;

  return (
    <TouchableOpacity style={squareStyle} onPress={onPress} activeOpacity={0.7}>
      <Text style={textStyle}>{val || ''}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  squareText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  } as TextStyle, // aseguramos que TypeScript lo acepte
});