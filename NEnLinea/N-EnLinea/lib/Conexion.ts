/**
 * CONFIGURACIÓN DE CONEXIÓN AL BACKEND
 * 
 * Cambia la URL según tu entorno:
 * - Desarrollo local (mismo dispositivo): "http://127.0.0.1:5000/"
 * - Desarrollo en red local: "http://TU_IP_LOCAL:5000/"  (ej: "http://192.168.1.100:5000/")
 * - Producción: "https://tu-servidor.com/"
 * 
 * Para encontrar tu IP local:
 * - Windows: cmd → ipconfig
 * - Mac/Linux: terminal → ifconfig o ip addr
 */

const url: string = "http://127.0.0.1:5000/";

// Timeout para las peticiones (en milisegundos)
const FETCH_TIMEOUT = 10000;

// ========== INTERFACES ==========

interface Stats {
  wins: string;
  losses: string;
  ratio: string;
}

interface MatchStatus {
  board: string[][];
  turn: string;
  winner: string | null;
  size: number;
  players: {
    [deviceId: string]: string;
  };
}

interface WaitingStatusResponse {
  status: 'waiting' | 'matched' | 'idle';
  match_id?: string;
  players?: { [key: string]: string };
  board_size?: number;
}

interface SearchMatchResponse {
  match_id?: string;
  players?: { [key: string]: string };
  board_size?: number;
  message?: string;
}

interface DeviceResponse {
  device_id: string;
}

interface DevicesListResponse {
  connected_devices: string[];
}

// ========== UTILIDADES ==========

/**
 * Wrapper para fetch con timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = FETCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('La petición tardó demasiado tiempo');
    }
    throw error;
  }
}

/**
 * Maneja errores de respuesta HTTP
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Error ${response.status}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = await response.text() || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
}

// ========== FUNCIONES DE API ==========

/**
 * Obtiene la lista de dispositivos conectados
 */
export async function fetchDevice(): Promise<DevicesListResponse> {
  try {
    console.log('📡 Obteniendo dispositivos conectados...');
    const res = await fetchWithTimeout(`${url}devices`);
    const data = await handleResponse<DevicesListResponse>(res);
    console.log('✓ Dispositivos:', data.connected_devices.length);
    return data;
  } catch (error: any) {
    console.error('❌ Error en fetchDevice:', error.message);
    throw new Error(`No se pudo obtener la lista de dispositivos: ${error.message}`);
  }
}

/**
 * Registra un nuevo dispositivo y retorna su ID único
 */
export async function fetchAddDevice(): Promise<string> {
  try {
    console.log('📡 Registrando nuevo dispositivo...');
    const res = await fetchWithTimeout(`${url}devices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const data = await handleResponse<DeviceResponse>(res);
    console.log('✓ Device ID obtenido:', data.device_id);
    return data.device_id;
  } catch (error: any) {
    console.error('❌ Error en fetchAddDevice:', error.message);
    throw new Error(`No se pudo registrar el dispositivo: ${error.message}`);
  }
}

/**
 * Obtiene las estadísticas de un dispositivo
 */
export async function fetchStats(id: string): Promise<Stats> {
  try {
    console.log('📡 Obteniendo estadísticas...');
    const response = await fetchWithTimeout(`${url}devices/${id}/info`);
    const data = await handleResponse<Stats>(response);
    console.log('✓ Estadísticas obtenidas');
    return data;
  } catch (error: any) {
    console.error('❌ Error en fetchStats:', error.message);
    throw new Error(`No se pudieron obtener las estadísticas: ${error.message}`);
  }
}

/**
 * Busca o crea una partida para el tamaño de tablero especificado
 */
export async function fetchSearchMatch(device_id: string, boardSize: number): Promise<SearchMatchResponse> {
  try {
    console.log(`📡 Buscando partida ${boardSize}x${boardSize}...`);
    const response = await fetchWithTimeout(`${url}matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        device_id: device_id,
        size: boardSize
      })
    });

    const data = await handleResponse<SearchMatchResponse>(response);
    
    if (data.match_id) {
      console.log('✓ Partida encontrada:', data.match_id);
    } else {
      console.log('⏳ En espera de oponente...');
    }
    
    return data;

  } catch (error: any) {
    console.error('❌ Error en fetchSearchMatch:', error.message);
    throw new Error(`No se pudo buscar la partida: ${error.message}`);
  }
}

/**
 * Verifica el estado de espera de un dispositivo
 */
export async function fetchWaitingStatus(id: string): Promise<WaitingStatusResponse> {
  try {
    const res = await fetchWithTimeout(`${url}matches/waiting-status?device_id=${id}`);
    const data = await handleResponse<WaitingStatusResponse>(res);
    
    if (data.status === 'matched') {
      console.log('✓ Oponente encontrado!');
    }
    
    return data;

  } catch (error: any) {
    console.error('❌ Error en fetchWaitingStatus:', error.message);
    throw new Error(`No se pudo verificar el estado: ${error.message}`);
  }
}

/**
 * Obtiene el estado actual de una partida
 */
export async function fetchMatchStatus(matchId: string): Promise<MatchStatus> {
  try {
    const res = await fetchWithTimeout(`${url}matches/${matchId}`);
    const data = await handleResponse<MatchStatus>(res);
    return data;

  } catch (error: any) {
    console.error('❌ Error en fetchMatchStatus:', error.message);
    throw new Error(`No se pudo obtener el estado de la partida: ${error.message}`);
  }
}

/**
 * Realiza un movimiento en la partida
 */
export async function fetchMakeMove(
  matchId: string, 
  deviceId: string, 
  x: number, 
  y: number
): Promise<any> {
  const payload = {
    device_id: deviceId,
    x: x,
    y: y
  };

  const fullUrl = `${url}matches/${matchId}/moves`;

  console.log(`📡 Movimiento: (${x}, ${y})`);

  try {
    const res = await fetchWithTimeout(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await handleResponse<any>(res);
    console.log('✓ Movimiento realizado');
    return data;

  } catch (error: any) {
    console.error('❌ Error en fetchMakeMove:', error.message);
    
    // Errores específicos
    if (error.message.includes('403')) {
      throw new Error('No es tu turno');
    } else if (error.message.includes('400')) {
      throw new Error('Movimiento inválido');
    } else if (error.message.includes('404')) {
      throw new Error('Partida no encontrada');
    }
    
    throw error;
  }
}

/**
 * Rendirse en una partida
 */
export async function fetchSurrender(matchId: string, deviceId: string): Promise<any> {
  const payload = {
    device_id: deviceId
  };

  const fullUrl = `${url}matches/${matchId}/surrender`;

  console.log('🏳️ Rindiéndose...');

  try {
    const res = await fetchWithTimeout(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await handleResponse<any>(res);
    console.log('✓ Rendición registrada');
    return data;

  } catch (error: any) {
    console.error('❌ Error en fetchSurrender:', error.message);
    throw error;
  }
}

// ========== FUNCIONES DE UTILIDAD ==========

/**
 * Verifica si el servidor está disponible
 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(`${url}devices`, { method: 'GET' }, 5000);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Obtiene la URL base del servidor (útil para debugging)
 */
export function getServerUrl(): string {
  return url;
}