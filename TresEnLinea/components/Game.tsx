import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Board } from '@/components/Board';
import { PlayAgainButton } from '@/components/PlayAgainButton';

function calculateWinner(squares: string[], numero: number): string | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}


export function Game({ numero }: { numero: number }) {
  const [squares, setSquares] = React.useState(Array(numero * numero).fill(''));
  const [xIsNext, setXIsNext] = React.useState(true);

  const winner = calculateWinner(squares,numero);
  
  const isDraw = !winner && squares.every(square => square !== '');

  const handleSquareClick = (index: number) => {
    if (winner || squares[index] !== '') return;
    
    const newSquares = [...squares];
    newSquares[index] = xIsNext ? 'X' : 'O';
    setSquares(newSquares);
    setXIsNext(!xIsNext);
  };

  const handleReset = () => {
    setSquares(Array(9).fill(''));
    setXIsNext(true);
  };

  let status;
  if (winner) {
    status = `¡Ganador: ${winner}!`;
  } else if (isDraw) {
    status = '¡Empate!';
  } else {
    status = `Siguiente jugador: ${xIsNext ? 'X' : 'O'}`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.status}>{status}</Text>
      <Board 
        squares={squares} 
        onSquareClick={handleSquareClick} 
      />
      <PlayAgainButton onReset={handleReset} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  status: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
});