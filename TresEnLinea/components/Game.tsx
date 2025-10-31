import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Board } from '@/components/Board';
import { PlayAgainButton } from '@/components/PlayAgainButton';

// (Tu función calculateWinner actualizada va aquí)
function calculateWinner(squares: string[], numero: number): string | null {
  // ... (código de calculateWinner dinámico) ...
  // Asegúrate de que tu función calculateWinner esté aquí
  // (La versión dinámica que te proporcioné anteriormente)
  for (let i = 0; i < numero; i++) {
    // Comprobar filas y columnas...
    let winnerInRow = squares[i * numero];
    let rowWin = true;
    if (winnerInRow) {
      for (let j = 1; j < numero; j++) {
        if (squares[i * numero + j] !== winnerInRow) {
          rowWin = false;
          break;
        }
      }
    } else {
      rowWin = false;
    }
    if (rowWin) return winnerInRow;

    // Comprobar columnas...
    let colWinner = squares[i];
    let colWin = true;
    if (colWinner) {
      for (let j = 1; j < numero; j++) {
        if (squares[j * numero + i] !== colWinner) {
          colWin = false;
          break;
        }
      }
    } else {
      colWin = false;
    }
    if (colWin) return colWinner; 
  }

  // Comprobar diagonal principal...
  let mainDiagWinner = squares[0];
  if (mainDiagWinner) {
    let mainDiagWin = true;
    for (let i = 1; i < numero; i++) {
      if (squares[i * numero + i] !== mainDiagWinner) {
        mainDiagWin = false;
        break;
      }
    }
    if (mainDiagWin) return mainDiagWinner;
  }

  // Comprobar anti-diagonal...
  let antiDiagWinner = squares[numero - 1];
  if (antiDiagWinner) {
    let antiDiagWin = true;
    for (let i = 1; i < numero; i++) {
      if (squares[i * numero + (numero - 1 - i)] !== antiDiagWinner) {
        antiDiagWin = false;
        break;
      }
    }
    if (antiDiagWin) return antiDiagWinner;
  }

  return null;
}


export function Game({ numero }: { numero: number }) {
  const [squares, setSquares] = useState(Array(numero * numero).fill(''));
  const [xIsNext, setXIsNext] = useState(true);
  // Estado para el registro de ganadores/perdedores SOLO para la sesión actual
  const [record, setRecord] = useState({ X: 0, O: 0 });

  const winner = calculateWinner(squares, numero);
  const isDraw = !winner && squares.every(square => square !== '');

  // Efecto para detectar el final del juego y actualizar el registro
  useEffect(() => {
    if (winner) {
      // Usamos la forma funcional de setRecord para asegurarnos de tener el valor más reciente
      setRecord(prevRecord => ({
        ...prevRecord,
        [winner]: prevRecord[winner as keyof typeof prevRecord] + 1,
      }));
    }
  }, [winner]); // Solo se ejecuta cuando 'winner' cambia (al final del juego)


  const handleSquareClick = (index: number) => {
    if (winner || squares[index] !== '') return;
    
    const newSquares = [...squares];
    newSquares[index] = xIsNext ? 'X' : 'O';
    setSquares(newSquares);
    setXIsNext(!xIsNext);
  };

  const handleReset = () => {
    setSquares(Array(numero * numero).fill(''));
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
      
      {/* Muestra el registro de ganadores/perdedores de la sesión */}
      <View style={styles.recordContainer}>
        <Text style={styles.recordText}>Victorias X: {record.X}</Text>
        <Text style={styles.recordText}>Victorias O: {record.O}</Text>
      </View>

      <Board 
        squares={squares} 
        onSquareClick={handleSquareClick} 
        boardSize={numero} 
      />
      <PlayAgainButton onReset={handleReset} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // ... estilos
  },
  status: {
    // ... estilos
  },
  recordContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    marginBottom: 10,
  },
  recordText: {
    fontSize: 18,
    color: '#34495e',
  }
});
