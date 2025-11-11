import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Board } from './Board';
import { PlayAgainButton } from './PlayAgainButton';

type Player = 'X' | 'O';
type Winner = Player | 'DRAW';

interface WinnerInfo {
  winner: Winner;
  line: number[];
}

type RecordType = { X: number; O: number };

interface GameProps {
  numero: number;
  onBack: () => void; 
}

function calculateWinner(squares: string[], n: number): WinnerInfo | null {
  const lines: number[][] = [];

  // filas
  for (let r = 0; r < n; r++) {
    const line: number[] = [];
    for (let c = 0; c < n; c++) line.push(r * n + c);
    lines.push(line);
  }

  // columnas
  for (let c = 0; c < n; c++) {
    const line: number[] = [];
    for (let r = 0; r < n; r++) line.push(r * n + c);
    lines.push(line);
  }

  // diagonal principal
  const diag1: number[] = [];
  for (let i = 0; i < n; i++) diag1.push(i * n + i);
  lines.push(diag1);

  // diagonal secundaria
  const diag2: number[] = [];
  for (let i = 0; i < n; i++) diag2.push(i * n + (n - 1 - i));
  lines.push(diag2);

  for (const line of lines) {
    const first = squares[line[0]];
    if (!first) continue;
    if (line.every((idx) => squares[idx] === first)) return { winner: first as Player, line };
  }

  if (squares.every((cell) => cell)) return { winner: 'DRAW', line: [] };

  return null;
}

export function Game({ numero, onBack }: GameProps) {
  const [squares, setSquares] = useState<string[]>(Array(numero * numero).fill(''));
  const [xIsNext, setXIsNext] = useState(true);
  const [winnerInfo, setWinnerInfo] = useState<WinnerInfo | null>(null);
  const [record, setRecord] = useState<RecordType>({ X: 0, O: 0 });

  const handleSquareClick = (index: number) => {
    if (winnerInfo || squares[index]) return;

    const newSquares = [...squares];
    newSquares[index] = xIsNext ? 'X' : 'O';
    setSquares(newSquares);
    setXIsNext(!xIsNext);

    const result = calculateWinner(newSquares, numero);

    if (result) {
      setWinnerInfo(result);

      if (result.winner === 'X' || result.winner === 'O') {
        const winnerKey: Player = result.winner;
        setRecord((prev) => ({ ...prev, [winnerKey]: prev[winnerKey] + 1 }));
      }
    }
  };

  const handleReset = (midGame = false) => {
    if (midGame && !winnerInfo) {
      const other: Player = xIsNext ? 'O' : 'X';
      setRecord((prev) => ({ ...prev, [other]: prev[other] + 1 }));
    }
    setSquares(Array(numero * numero).fill(''));
    setXIsNext(true);
    setWinnerInfo(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.status}>
        {winnerInfo
          ? winnerInfo.winner === 'DRAW'
            ? '¡Empate!'
            : `¡Ganador: ${winnerInfo.winner}!`
          : `Siguiente jugador: ${xIsNext ? 'X' : 'O'}`}
      </Text>

      <View style={styles.recordContainer}>
        <Text style={styles.recordText}>Victorias X: {record.X}</Text>
        <Text style={styles.recordText}>Victorias O: {record.O}</Text>
      </View>

      <Board
        squares={squares}
        onSquareClick={handleSquareClick}
        boardSize={numero}
        winningLine={winnerInfo?.line || []}
      />

      <PlayAgainButton onReset={() => handleReset(true)} />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: 'orange' }]}
        onPress={() => setRecord({ X: 0, O: 0 })}
        delayPressIn={0}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Reiniciar Estadísticas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: 'blue' }]}
        onPress={onBack}
        delayPressIn={0}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Atrás</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  status: { fontSize: 24, marginBottom: 10 },
  recordContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '60%', marginBottom: 10 },
  recordText: { fontSize: 18, color: '#34495e' },
  button: {
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 15,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});
