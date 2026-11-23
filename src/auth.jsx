import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { llamar, esSesionInvalida } from './api.js';

const CLAVE = 'fsm.sesion';
const AuthContext = createContext(null);

function leerSesion() {
  try {
    const texto = localStorage.getItem(CLAVE);
    if (!texto) return null;
    const sesion = JSON.parse(texto);
    if (!sesion.token || new Date(sesion.expires).getTime() <= Date.now()) return null;
    return sesion;
  } catch {
    return null;
  }
}

function guardarSesion(sesion) {
  try {
    if (sesion) localStorage.setItem(CLAVE, JSON.stringify(sesion));
    else localStorage.removeItem(CLAVE);
  } catch {
    // sin almacenamiento: la sesión vive solo en memoria
  }
}

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesion);

  const salir = useCallback(() => {
    guardarSesion(null);
    setSesion(null);
  }, []);

  const entrar = useCallback(async (user_id, password) => {
    const datos = await llamar('usuarios', '/usuarios/login', {
      metodo: 'POST',
      cuerpo: { user_id, password }
    });
    guardarSesion(datos);
    setSesion(datos);
  }, []);

  const pedir = useCallback(
    async (servicio, ruta, opciones = {}) => {
      try {
        return await llamar(servicio, ruta, { ...opciones, token: sesion?.token });
      } catch (error) {
        if (esSesionInvalida(error)) salir();
        throw error;
      }
    },
    [sesion, salir]
  );

  useEffect(() => {
    if (!sesion) return undefined;
    const faltan = new Date(sesion.expires).getTime() - Date.now();
    const temporizador = setTimeout(salir, Math.max(faltan, 0));
    return () => clearTimeout(temporizador);
  }, [sesion, salir]);

  const valor = useMemo(() => ({ sesion, entrar, salir, pedir }), [sesion, entrar, salir, pedir]);
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
