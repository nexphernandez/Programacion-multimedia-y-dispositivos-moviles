import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { Game } from '../components/Game';
import { OnlineGame } from '../components/OnlineGame';
import { fetchAddDevice, fetchStats } from "@/lib/Conexion";

export default function Index() {
  const [numero, setNumero] = useState<number | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isOnlineMode, setIsOnlineMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{wins: number, losses: number, ratio: number} | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      const id = await fetchAddDevice();
      setDeviceId(id);
      console.log('✓ Device ID obtenido:', id);
      
      // Intentar cargar estadísticas
      try {
        const statsData = await fetchStats(id);
        setStats({
          wins: parseInt(statsData.wins) || 0,
          losses: parseInt(statsData.losses) || 0,
          ratio: parseFloat(statsData.ratio) || 0
        });
      } catch (error) {
        console.log('No hay estadísticas previas');
      }
      
    } catch (error) {
      console.error('Error al inicializar app:', error);
      Alert.alert(
        'Error de Conexión', 
        'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.',
        [
          { text: 'Reintentar', onPress: () => initializeApp() },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLocalGame = (size: number) => {
    setNumero(size);
    setIsOnlineMode(false);
  };

  const handleOnlineGame = (size: number) => {
    if (!deviceId) {
      Alert.alert('Error', 'No se ha establecido conexión con el servidor');
      return;
    }
    setNumero(size);
    setIsOnlineMode(true);
  };

  const handleBackToMenu = async () => {
    setNumero(null);
    setIsOnlineMode(false);
    
    // Recargar estadísticas al volver
    if (deviceId) {
      try {
        const statsData = await fetchStats(deviceId);
        setStats({
          wins: parseInt(statsData.wins) || 0,
          losses: parseInt(statsData.losses) || 0,
          ratio: parseFloat(statsData.ratio) || 0
        });
      } catch (error) {
        console.log('Error al recargar estadísticas');
      }
    }
  };

  // Si está en juego, mostrar componente correspondiente
  if (numero !== null && deviceId) {
    if (isOnlineMode) {
      return (
        <OnlineGame 
          numero={numero} 
          deviceId={deviceId}
          onBack={handleBackToMenu} 
        />
      );
    } else {
      return <Game numero={numero} onBack={handleBackToMenu} />;
    }
  }

  // Pantalla de carga
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Tic Tac Toe</Text>
        <ActivityIndicator size="large" color="#3498db" style={styles.loader} />
        <Text style={styles.loadingText}>Conectando con el servidor...</Text>
      </View>
    );
  }

  // Menú principal
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎮 Tic Tac Toe</Text>

      {deviceId && (
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceIdText}>ID: {deviceId.substring(0, 8)}...</Text>
        </View>
      )}

      {stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Estadísticas Online</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statsText}>✓ Victorias: {stats.wins}</Text>
            <Text style={styles.statsText}>✗ Derrotas: {stats.losses}</Text>
          </View>
          <Text style={styles.statsText}>Ratio: {(stats.ratio * 100).toFixed(1)}%</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.subtitle}>🏠 Modo Local</Text>
        <Text style={styles.description}>Juega en el mismo dispositivo</Text>
        
        <TouchableOpacity style={styles.buttonLocal} onPress={() => handleLocalGame(3)}>
          <Text style={styles.buttonText}>3x3 - Tres en línea</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonLocal} onPress={() => handleLocalGame(4)}>
          <Text style={styles.buttonText}>4x4 - Cuatro en línea</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonLocal} onPress={() => handleLocalGame(5)}>
          <Text style={styles.buttonText}>5x5 - Cinco en línea</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonLocal} onPress={() => handleLocalGame(6)}>
          <Text style={styles.buttonText}>6x6 - Seis en línea</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonLocal} onPress={() => handleLocalGame(7)}>
          <Text style={styles.buttonText}>7x7 - Siete en línea</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>🌐 Modo Online</Text>
        <Text style={styles.description}>Juega contra otros jugadores</Text>

        <TouchableOpacity 
          style={[styles.buttonOnline, !deviceId && styles.buttonDisabled]} 
          onPress={() => handleOnlineGame(3)}
          disabled={!deviceId}
        >
          <Text style={styles.buttonText}>3x3 - Tres en línea</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.buttonOnline, !deviceId && styles.buttonDisabled]} 
          onPress={() => handleOnlineGame(4)}
          disabled={!deviceId}
        >
          <Text style={styles.buttonText}>4x4 - Cuatro en línea</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.buttonOnline, !deviceId && styles.buttonDisabled]} 
          onPress={() => handleOnlineGame(5)}
          disabled={!deviceId}
        >
          <Text style={styles.buttonText}>5x5 - Cinco en línea</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.buttonOnline, !deviceId && styles.buttonDisabled]} 
          onPress={() => handleOnlineGame(6)}
          disabled={!deviceId}
        >
          <Text style={styles.buttonText}>6x6 - Seis en línea</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.buttonOnline, !deviceId && styles.buttonDisabled]} 
          onPress={() => handleOnlineGame(7)}
          disabled={!deviceId}
        >
          <Text style={styles.buttonText}>7x7 - Siete en línea</Text>
        </TouchableOpacity>
      </View>

      {!deviceId && (
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={initializeApp}
        >
          <Text style={styles.buttonText}>🔄 Reconectar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 10,
    backgroundColor: '#ecf0f1'
  },
  title: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#2c3e50', 
    marginBottom: 10,
    textAlign: 'center',
  },
  deviceInfo: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 10,
  },
  deviceIdText: {
    fontSize: 11,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 4,
  },
  statsText: {
    fontSize: 13,
    color: '#34495e',
    fontWeight: '600',
  },
  section: {
    width: '100%',
    marginBottom: 15,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 10,
  },
  loader: {
    marginVertical: 15,
  },
  buttonLocal: { 
    backgroundColor: '#27ae60', 
    paddingVertical: 10, 
    paddingHorizontal: 25, 
    borderRadius: 8, 
    marginTop: 6,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonOnline: {
    backgroundColor: '#3498db',
    paddingVertical: 10, 
    paddingHorizontal: 25, 
    borderRadius: 8, 
    marginTop: 6,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.6,
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
});