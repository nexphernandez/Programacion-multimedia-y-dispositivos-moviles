import React from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View, ViewStyle, DimensionValue, TextStyle, Platform } from 'react-native';

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
    // Propiedades específicas para web
    ...(Platform.OS === 'web' && {
      // @ts-ignore
      touchAction: 'manipulation',
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
      cursor: 'pointer',
    }),
  };

  const textStyle: TextStyle = {
    ...styles.squareText,
    // Propiedades específicas para web
    ...(Platform.OS === 'web' && {
      // @ts-ignore
      userSelect: 'none',
      pointerEvents: 'none',
    }),
  };

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={squareStyle}>
        <Text style={textStyle}>{val || ''}</Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  squareText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  } as TextStyle,
});