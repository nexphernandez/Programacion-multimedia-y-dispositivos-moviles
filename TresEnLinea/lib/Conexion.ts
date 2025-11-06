
const url: string = "http://127.0.0.1:5000/"

export async function fetchDevice() {
    try {
        const res = await fetch(`${url}devices`);
        if (!res.ok) {
            throw new Error(res.status === 404 ? "Dispositivo no encontrado" : "Error en la solicitud");
        }
        const data = await res.json();
        console.log('Respuesta',data);
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
        console.log('Respuesta',data)
        return data.device_id;
    } catch (error) {
        console.log('Error',error);
    }
}