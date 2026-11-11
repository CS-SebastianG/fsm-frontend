import { API } from './config.js';

export class ErrorApi extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

export function normalizar(httpStatus, datos) {
  if (datos && typeof datos === 'object' && typeof datos.statusCode === 'number' && 'body' in datos) {
    let cuerpo = datos.body;
    if (typeof cuerpo === 'string') {
      try {
        cuerpo = JSON.parse(cuerpo);
      } catch {
        // se deja el texto tal cual
      }
    }
    return { status: datos.statusCode, cuerpo };
  }
  return { status: httpStatus, cuerpo: datos };
}

export function mensajeDeError(cuerpo, status) {
  if (cuerpo && typeof cuerpo === 'object') {
    if (cuerpo.error) return String(cuerpo.error);
    if (cuerpo.message) return String(cuerpo.message);
  }
  if (typeof cuerpo === 'string' && cuerpo) return cuerpo;
  return `Error ${status}`;
}

export async function llamar(servicio, ruta, { metodo = 'GET', cuerpo, token, params } = {}) {
  const base = API[servicio];
  if (!base) throw new Error(`Servicio desconocido: ${servicio}`);

  let url = base + ruta;
  if (params) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, v);
    });
    const texto = q.toString();
    if (texto) url += '?' + texto;
  }

  const headers = {};
  if (cuerpo !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let respuesta;
  try {
    respuesta = await fetch(url, {
      method: metodo,
      headers,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined
    });
  } catch {
    throw new ErrorApi(0, 'No se pudo conectar con el servidor');
  }

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    datos = null;
  }

  const { status, cuerpo: resultado } = normalizar(respuesta.status, datos);
  if (status >= 400 || status === 0) throw new ErrorApi(status, mensajeDeError(resultado, status));
  return resultado;
}

export function esSesionInvalida(error) {
  if (!(error instanceof ErrorApi)) return false;
  if (error.status === 401) return true;
  return error.status === 403 && /token/i.test(error.message);
}
