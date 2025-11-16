import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Board } from './Board';
import { 
  fetchSearchMatch, 
  fetchWaitingStatus, 
  fetchMatchStatus, 
  fetchMakeMove,
  fetchSurrender
} from '@/lib/Conexion';

type Player = 'X' | 'O';
type Winner = Player | 'DRAW';

interface WinnerInfo {
  winner: Winner;
  line: number[];
}

type GameStatus = 'searching' | 'waiting' | 'playing' | 'finished';

interface OnlineGameProps {
  numero: number;
  deviceId: string;
  onBack: () => void;
}

export function OnlineGame({ numero, deviceId, onBack }: OnlineGameProps) {
  const [status, setStatus] = useState<GameStatus>('searching');
  const [matchId, setMatchId] = useState<string | null>(null);
  const [board, setBoard] = useState<string[][]>([]);
  const [mySymbol, setMySymbol] = useState<string>('');
  const [currentTurn, setCurrentTurn] = useState<string>('');
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [players, setPlayers] = useState<{ [key: string]: string }>({});
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [onlineStats, setOnlineStats] = useState<{wins: number, losses: number}>({ wins: 0, losses: 0 });

  // Refs para los intervalos
  const waitingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Buscar partida al montar
  useEffect(() => {
    searchForMatch();
    return () => {
      clearAllIntervals();
    };
  }, []);

  // Polling para verificar si se encontró oponente
  useEffect(() => {
    if (status === 'waiting' && !matchId) {
      waitingIntervalRef.current = setInterval(() => {
        checkWaitingStatus();
      }, 2000);

      return () => {
        if (waitingIntervalRef.current) {
          clearInterval(waitingIntervalRef.current);
        }
      };
    }
  }, [status, matchId]);

  // Polling para sincronizar estado del juego
  useEffect(() => {
    if (status === 'playing' && matchId && !winner) {
      gameIntervalRef.current = setInterval(() => {
        syncGameState();
      }, 2000);

      return () => {
        if (gameIntervalRef.current) {
          clearInterval(gameIntervalRef.current);
        }
      };
    }
  }, [status, matchId, winner]);

  // Actualizar si es mi turno
  useEffect(() => {
    setIsMyTurn(currentTurn === deviceId && !winner);
  }, [currentTurn, deviceId, winner]);

  const clearAllIntervals = () => {
    if (waitingIntervalRef.current) {
      clearInterval(waitingIntervalRef.current);
      waitingIntervalRef.current = null;
    }
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }
  };

  const calculateWinner = (squares: string[][], n: number): WinnerInfo | null => {
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

    // Convertir tablero 2D a 1D para verificar
    const flatSquares = squares.flat();

    for (const line of lines) {
      const first = flatSquares[line[0]];
      if (!first || first === '') continue;
      if (line.every((idx) => flatSquares[idx] === first)) {
        return { winner: first as Player, line };
      }
    }

    if (flatSquares.every((cell) => cell && cell !== '')) {
      return { winner: 'DRAW', line: [] };
    }

    return null;
  };

  const searchForMatch = async () => {
    try {
      setStatus('searching');
      setErrorMsg('');
      console.log('🔍 Buscando partida...');
      
      const result = await fetchSearchMatch(deviceId, numero);
      
      if (result.match_id && result.players && result.board_size) {
        console.log('✓ Partida encontrada inmediatamente');
        initializeMatch(result.match_id, result.players, result.board_size);
      } else {
        console.log('⏳ Esperando oponente...');
        setStatus('waiting');
      }
    } catch (error: any) {
      console.error('Error buscando partida:', error);
      setErrorMsg('Error al conectar con el servidor');
      Alert.alert(
        'Error de Conexión',
        'No se pudo buscar una partida. Verifica tu conexión.',
        [
          { text: 'Reintentar', onPress: () => searchForMatch() },
          { text: 'Volver', onPress: onBack }
        ]
      );
    }
  };

  const checkWaitingStatus = async () => {
    try {
      const result = await fetchWaitingStatus(deviceId);
      
      if (result.status === 'matched' && result.match_id && result.players && result.board_size) {
        console.log('✓ Oponente encontrado!');
        clearAllIntervals();
        initializeMatch(result.match_id, result.players, result.board_size);
      }
    } catch (error) {
      console.error('Error verificando estado:', error);
    }
  };

  const initializeMatch = (id: string, playersData: any, size: number) => {
    setMatchId(id);
    setPlayers(playersData);
    setMySymbol(playersData[deviceId]);
    setStatus('playing');
    setMoveCount(0);
    setWinningLine([]);
    
    // Inicializar tablero vacío
    const emptyBoard = Array(size).fill(null).map(() => Array(size).fill(''));
    setBoard(emptyBoard);
    
    console.log(`🎮 Partida iniciada - Eres: ${playersData[deviceId]}`);
    
    // Sincronizar estado inmediatamente
    setTimeout(() => syncGameState(id), 500);
  };

  const syncGameState = async (id?: string) => {
    const currentMatchId = id || matchId;
    if (!currentMatchId) return;

    try {
      const matchData = await fetchMatchStatus(currentMatchId);
      
      setBoard(matchData.board);
      setCurrentTurn(matchData.turn);
      setWinner(matchData.winner);
      
      // Contar movimientos realizados
      const moves = matchData.board.flat().filter(cell => cell !== '').length;
      setMoveCount(moves);
      
      // Calcular línea ganadora localmente
      if (matchData.winner && matchData.winner !== 'Draw') {
        const winnerInfo = calculateWinner(matchData.board, matchData.board.length);
        if (winnerInfo) {
          setWinningLine(winnerInfo.line);
        }
      } else {
        setWinningLine([]);
      }
      
      if (matchData.winner) {
        console.log(`🏆 Partida terminada - Ganador: ${matchData.winner}`);
        setStatus('finished');
        clearAllIntervals();
        
        // Mostrar resultado
        setTimeout(() => {
          showGameResult(matchData.winner!);
        }, 500);
      }
    } catch (error) {
      console.error('Error sincronizando estado:', error);
    }
  };

  const showGameResult = (winnerSymbol: string) => {
    let title = '';
    let message = '';
    
    if (winnerSymbol === 'Draw') {
      title = '🤝 Empate';
      message = '¡Fue un empate! Ambos jugaron bien.';
    } else if (winnerSymbol === mySymbol) {
      title = '🎉 ¡Victoria!';
      message = '¡Felicidades! Has ganado la partida.';
      setOnlineStats(prev => ({ ...prev, wins: prev.wins + 1 }));
    } else {
      title = '😔 Derrota';
      message = 'Has perdido. ¡Mejor suerte la próxima vez!';
      setOnlineStats(prev => ({ ...prev, losses: prev.losses + 1 }));
    }
    
    Alert.alert(title, message, [
      { text: 'OK', style: 'default' }
    ]);
  };

  const handleSquareClick = async (index: number) => {
    if (status !== 'playing' || !matchId) return;
    
    if (!isMyTurn) {
      setErrorMsg('⏳ Espera tu turno');
      setTimeout(() => setErrorMsg(''), 2000);
      return;
    }
    
    if (winner) return;

    const size = board.length;
    const x = Math.floor(index / size);
    const y = index % size;

    if (board[x][y] !== '') {
      setErrorMsg('❌ Casilla ocupada');
      setTimeout(() => setErrorMsg(''), 2000);
      return;
    }

    try {
      setErrorMsg('');
      console.log(`📍 Movimiento: (${x}, ${y})`);
      
      // Realizar movimiento
      await fetchMakeMove(matchId, deviceId, x, y);
      
      // Actualizar tablero localmente para feedback inmediato
      const newBoard = board.map(row => [...row]);
      newBoard[x][y] = mySymbol;
      setBoard(newBoard);
      
      // Sincronizar con el servidor
      setTimeout(() => syncGameState(), 300);
      
    } catch (error: any) {
      console.error('Error al hacer movimiento:', error);
      
      if (error.message.includes('403')) {
        setErrorMsg('⏳ No es tu turno');
      } else if (error.message.includes('400')) {
        setErrorMsg('❌ Movimiento inválido');
      } else {
        setErrorMsg('⚠️ Error de conexión');
      }
      
      setTimeout(() => setErrorMsg(''), 2000);
      
      // Resincronizar
      syncGameState();
    }
  };

  const flattenBoard = (): (string | null)[] => {
    if (board.length === 0) return [];
    return board.flat().map(cell => cell === '' ? null : cell);
  };

  const getStatusMessage = () => {
    if (status === 'searching') return '🔍 Buscando partida...';
    if (status === 'waiting') return '⏳ Esperando oponente...';
    
    if (winner) {
      if (winner === 'Draw') return '🤝 ¡Empate!';
      if (winner === mySymbol) return '🎉 ¡Ganaste!';
      return '😔 Perdiste';
    }
    
    if (isMyTurn) return '✋ Tu turno';
    return '⏳ Turno del oponente';
  };

  const getOpponentSymbol = () => {
    return mySymbol === 'X' ? 'O' : 'X';
  };

  const handleNewMatch = () => {
    // Resetear estado
    setMatchId(null);
    setBoard([]);
    setWinner(null);
    setWinningLine([]);
    setCurrentTurn('');
    setErrorMsg('');
    setMoveCount(0);
    clearAllIntervals();
    
    // Buscar nueva partida
    searchForMatch();
  };

  const handleSurrender = async () => {
    if (!matchId) return;
    
    try {
      // Notificar al servidor que nos rendimos
      await fetchSurrender(matchId, deviceId);
      
      setOnlineStats(prev => ({ ...prev, losses: prev.losses + 1 }));
      setStatus('finished');
      setWinner(getOpponentSymbol());
      clearAllIntervals();
      
      setTimeout(() => {
        Alert.alert('🏳️ Rendición', 'Te has rendido. Esto cuenta como una derrota.');
      }, 300);
    } catch (error) {
      console.error('Error al rendirse:', error);
      Alert.alert('Error', 'No se pudo registrar la rendición');
    }
  };

  const handleResetStats = () => {
    setOnlineStats({ wins: 0, losses: 0 });
  };

  // Pantallas de búsqueda y espera
  if (status === 'searching' || status === 'waiting') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🌐 Modo Online</Text>
        
        <View style={styles.searchContainer}>
          <ActivityIndicator size="large" color="#3498db" style={styles.loader} />
          <Text style={styles.statusText}>{getStatusMessage()}</Text>
          <Text style={styles.infoText}>Tamaño: {numero}x{numero}</Text>
          <Text style={styles.symbolText}>Serás: {status === 'waiting' ? 'X' : '?'}</Text>
        </View>

        {errorMsg !== '' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={onBack}
        >
          <Text style={styles.buttonText}>❌ Cancelar Búsqueda</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Pantalla de juego
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎮 Partida Online</Text>
      
      <View style={styles.statsBar}>
        <Text style={styles.statsBarText}>✓ {onlineStats.wins}</Text>
        <Text style={styles.statsBarText}>✗ {onlineStats.losses}</Text>
      </View>

      <View style={styles.playerInfoContainer}>
        <View style={[styles.playerCard, isMyTurn && styles.playerCardActive]}>
          <Text style={styles.playerLabel}>TÚ</Text>
          <Text style={styles.playerSymbol}>{mySymbol}</Text>
          {isMyTurn && <Text style={styles.turnIndicator}>▼</Text>}
        </View>
        
        <Text style={styles.vsText}>VS</Text>
        
        <View style={[styles.playerCard, !isMyTurn && !winner && styles.playerCardActive]}>
          <Text style={styles.playerLabel}>RIVAL</Text>
          <Text style={styles.playerSymbol}>{getOpponentSymbol()}</Text>
          {!isMyTurn && !winner && <Text style={styles.turnIndicator}>▼</Text>}
        </View>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusBig}>{getStatusMessage()}</Text>
        <Text style={styles.moveCounter}>Movimientos: {moveCount}</Text>
      </View>

      {errorMsg !== '' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {board.length > 0 && (
        <View style={styles.boardWrapper}>
          <Board
            squares={flattenBoard()}
            onSquareClick={handleSquareClick}
            boardSize={numero}
            winningLine={winningLine}
          />
        </View>
      )}

      {status === 'finished' && (
        <View style={styles.finishedButtons}>
          <TouchableOpacity 
            style={styles.newMatchButton} 
            onPress={handleNewMatch}
          >
            <Text style={styles.buttonText}>🔄 Nueva Partida</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === 'playing' && !winner && (
        <TouchableOpacity 
          style={styles.surrenderButton} 
          onPress={handleSurrender}
        >
          <Text style={styles.buttonText}>🏳️ Rendirse</Text>
        </TouchableOpacity>
      )}

      <View style={styles.bottomButtons}>
        <TouchableOpacity 
          style={styles.resetStatsButton} 
          onPress={handleResetStats}
        >
          <Text style={styles.buttonText}>🔄 Reiniciar Stats</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBack}
        >
          <Text style={styles.buttonText}>🏠 Menú</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 10,
  },
  title: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#2c3e50', 
    marginBottom: 8,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsBarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2c3e50',
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  playerInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  playerCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  playerCardActive: {
    borderColor: '#3498db',
    backgroundColor: '#e8f4fd',
  },
  playerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7f8c8d',
    marginBottom: 4,
  },
  playerSymbol: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2c3e50',
  },
  turnIndicator: {
    fontSize: 16,
    color: '#3498db',
    marginTop: 3,
  },
  vsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#95a5a6',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statusBig: { 
    fontSize: 18, 
    fontWeight: '700',
    color: '#2c3e50',
  },
  statusText: {
    fontSize: 16,
    color: '#3498db',
    marginTop: 15,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 8,
  },
  symbolText: {
    fontSize: 16,
    color: '#2c3e50',
    marginTop: 8,
    fontWeight: '700',
  },
  moveCounter: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  errorText: {
    fontSize: 13,
    color: '#c0392b',
    fontWeight: '600',
  },
  loader: {
    marginBottom: 12,
  },
  boardWrapper: {
    width: '50%',
    maxWidth: 300,
    aspectRatio: 1,
    marginVertical: 10,
    alignSelf: 'center',
  },
  finishedButtons: {
    marginTop: 12,
    width: '100%',
    alignItems: 'center',
  },
  newMatchButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    minWidth: 180,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  surrenderButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    minWidth: 180,
    alignItems: 'center',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  resetStatsButton: {
    backgroundColor: '#f39c12',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#95a5a6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 180,
    alignItems: 'center',
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
});