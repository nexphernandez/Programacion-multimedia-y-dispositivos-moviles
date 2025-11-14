
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
