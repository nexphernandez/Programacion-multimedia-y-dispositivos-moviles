
const url: string = "http://127.0.0.1:5000/"

interface Stats{
  wins : string;
  losses : string;
  ratio : string;
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

export async function fetchDevice() {
    try {
        const res = await fetch(`${url}devices`);
        if (!res.ok) {
            throw new Error(res.status === 404 ? "Dispositivo no encontrado" : "Error en la solicitud");
        }
        const data = await res.json();
        console.log('Respuesta', data);
    } catch (error) {
        console.error('Error', error);
    }
}

export async function fetchAddDevice() {
    try {
        const res = await fetch(`${url}devices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        const data = await res.json();
        console.log(data.device_id);
        console.log('Respuesta', data)
        return data.device_id;
    } catch (error) {
        console.log('Error', error);
    }
}

export async function fetchStats(id: string): Promise<Stats> {
    try {
        const response = await fetch(`${url}devices/${id}/info`)
        if (!response.ok) {
            throw new Error(response.status === 404 ? "Dispositivo no encontrado" : "Error en la solicitud");
        }
        const data: Stats = await response.json();
        console.log('Respuesta', data);
        return data ;
    } catch (error) {
        console.error('Error', error);
        throw error;
    }
}

export async function fetchSearchMatch(device_id: string, boardSize: number){

    try {
        const response = await fetch(`${url}matches`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                device_id: device_id,
                sixe: boardSize
            })
        });
            
        if (!response.ok) {
            throw new Error('Error al buscar la partia')
        }

        const data = await response.json();
        console.log('Partida encontrada:', data);
        return data;

    } catch (error) {
        console.log('Error en fetchSearchMatch:', error);
        throw error;
    }
}


export async function fetchWaitingStatus(id: string) {
  try {
    const res = await fetch(`${url}matches/waiting-status?device_id=${id}`);
    
    if (!res.ok) {
      throw new Error(res.status === 404 ? "Dispositivo no encontrado" : "Error en la solicitud");
    }
    
    const data = await res.json();
    console.log('Waiting status:', data);
    return data;
    
  } catch (error) {
    console.error('Error en fetchWaitingStatus:', error);
    throw error;
  }
}

export async function fetchMatchStatus(matchId: string): Promise<MatchStatus> {
  try {
    const res = await fetch(`${url}matches/${matchId}`);
    
    if (!res.ok) {
      throw new Error(res.status === 404 ? "Partida no encontrada" : "Error en la solicitud");
    }
    
    const data: MatchStatus = await res.json();
    console.log('Match status:', data);
    return data;
    
  } catch (error) {
    console.error('Error en fetchMatchStatus:', error);
    throw error;
  }
}

export async function fetchMakeMove(matchId: string, deviceId: string, x: number, y: number) {
  const payload = {
    device_id: deviceId,
    x: x,
    y: y
  };
  
  const fullUrl = `${url}matches/${matchId}/moves`;
  
  console.log('=== MAKING MOVE ===');
  console.log('Payload:', JSON.stringify(payload, null, 2));
  
  try {
    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Error:', errorText);
      throw new Error(`Error ${res.status}`);
    }

    const data = await res.json();
    console.log('✓ Success');
    return data;

  } catch (error) {
    console.error('❌ Fetch error:', error);
    throw error;
  }
}
