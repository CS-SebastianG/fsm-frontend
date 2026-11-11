import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErrorApi, esSesionInvalida, llamar, normalizar } from '../src/api.js';

function respuestaFetch(status, datos) {
  return Promise.resolve({ status, json: () => Promise.resolve(datos) });
}

afterEach(() => vi.restoreAllMocks());

describe('normalizar', () => {
  it('lee el statusCode interno de las APIs con integration: lambda', () => {
    expect(normalizar(200, { statusCode: 403, body: { error: 'Token expirado' } })).toEqual({
      status: 403,
      cuerpo: { error: 'Token expirado' }
    });
  });

  it('parsea el body cuando viene como texto (proxy)', () => {
    expect(normalizar(200, { statusCode: 201, body: '{"orden_id":"ORD-1"}' })).toEqual({
      status: 201,
      cuerpo: { orden_id: 'ORD-1' }
    });
  });

  it('usa el status HTTP cuando la respuesta no trae statusCode', () => {
    expect(normalizar(201, { orden_id: 'ORD-1' })).toEqual({ status: 201, cuerpo: { orden_id: 'ORD-1' } });
  });
});

describe('llamar', () => {
  it('hace login y devuelve el body', async () => {
    const fetchMock = vi.fn(() =>
      respuestaFetch(200, { statusCode: 200, body: { token: 'abc', tenant_id: 'tenant-1', rol: 'admin' } })
    );
    vi.stubGlobal('fetch', fetchMock);

    const datos = await llamar('usuarios', '/usuarios/login', {
      metodo: 'POST',
      cuerpo: { tenant_id: 'tenant-1', user_id: 'admin1', password: 'x' }
    });

    expect(datos.token).toBe('abc');
    const [url, opciones] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/dev\/usuarios\/login$/);
    expect(opciones.method).toBe('POST');
    expect(opciones.headers['Content-Type']).toBe('application/json');
    expect(opciones.headers.Authorization).toBeUndefined();
  });

  it('manda el token y los parámetros de consulta', async () => {
    const fetchMock = vi.fn(() => respuestaFetch(200, { items: [], nextToken: null }));
    vi.stubGlobal('fetch', fetchMock);

    await llamar('ordenes', '/ordenes', { token: 'tok', params: { limit: 20, nextToken: undefined } });

    const [url, opciones] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/ordenes\?limit=20$/);
    expect(opciones.headers.Authorization).toBe('Bearer tok');
  });

  it('lanza ErrorApi con el mensaje cuando el statusCode interno es de error', async () => {
    vi.stubGlobal('fetch', vi.fn(() => respuestaFetch(200, { statusCode: 403, body: { error: 'Credenciales inválidas' } })));
    await expect(llamar('usuarios', '/usuarios/login', { metodo: 'POST', cuerpo: {} })).rejects.toMatchObject({
      status: 403,
      message: 'Credenciales inválidas'
    });
  });

  it('lanza ErrorApi cuando no hay conexión', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('fallo'))));
    await expect(llamar('ordenes', '/ordenes')).rejects.toMatchObject({ status: 0 });
  });
});

describe('esSesionInvalida', () => {
  it('detecta token vencido o inválido, pero no un rol sin permiso', () => {
    expect(esSesionInvalida(new ErrorApi(401, 'No autorizado'))).toBe(true);
    expect(esSesionInvalida(new ErrorApi(403, 'Token expirado'))).toBe(true);
    expect(esSesionInvalida(new ErrorApi(403, 'Tu rol no puede hacer esta operación'))).toBe(false);
    expect(esSesionInvalida(new Error('otro'))).toBe(false);
  });
});
