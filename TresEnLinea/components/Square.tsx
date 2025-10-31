import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle, DimensionValue, LayoutChangeEvent } from 'react-native';

function misEstilos({ numerito }: { numerito: number }): ViewStyle {
  const widthPercentage = `${100 / numerito}%` as DimensionValue;
  
  return {
    width: widthPercentage,
    height: widthPercentage,
    aspectRatio: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  };
}

const styles = StyleSheet.create({
  squareText: {
    fontWeight: 'bold',
    color: '#2c3e50',
  }
});

export function Square({ val, onPress, numerito }: { val: string; onPress: () => void; numerito: number }) {
  const [squareSize, setSquareSize] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setSquareSize(width * 0.6); 
  };

  const dynamicSquareStyle = misEstilos({ numerito: numerito });
  
  const dynamicTextStyle = {
    fontSize: squareSize > 0 ? squareSize : 60, 
  };

  return (
    <TouchableOpacity 
      style={dynamicSquareStyle} 
      onPress={onPress}
      onLayout={onLayout} 
    >
      {/* Combinamos el estilo base con el estilo dinámico del texto */}
      <Text style={[styles.squareText, dynamicTextStyle]}>{val}</Text>
    </TouchableOpacity>
  );
}
