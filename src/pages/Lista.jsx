import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth.jsx';
import { DINERO } from '../modulos.js';

const LIMITE = 20;

function formato(columna, valor) {
  if (valor === undefined || valor === null || valor === '') return '—';
  if (DINERO.includes(columna) && !Number.isNaN(Number(valor))) return Number(valor).toFixed(2);
  if (typeof valor === 'object') return JSON.stringify(valor);
  return String(valor);
}

function columnasDe(modulo, filas) {
  if (modulo.columnas) return modulo.columnas;
  if (!filas.length) return [];
  return Object.keys(filas[0])
    .filter((k) => k !== 'tenant_id' && typeof filas[0][k] !== 'object')
    .slice(0, 7);
}

export default function Lista({ modulo }) {
  const { pedir } = useAuth();
  const [filas, setFilas] = useState([]);
  const [siguiente, setSiguiente] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('');

  const cargar = useCallback(
    async (desde) => {
      setCargando(true);
      setError('');
      try {
        const params = { [modulo.paramLimite]: LIMITE };
        if (desde) params[modulo.paramSiguiente] = desde;
        const datos = await pedir(modulo.servicio, modulo.endpoint, { params });
        const nuevas = datos?.[modulo.coleccion] || [];
        setFilas((previas) => (desde ? [...previas, ...nuevas] : nuevas));
        setSiguiente(datos?.[modulo.claveSiguiente] || null);
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    },
    [modulo, pedir]
  );

  useEffect(() => {
    setFilas([]);
    setSiguiente(null);
    cargar(null);
    // se recarga solo al cambiar de módulo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modulo.ruta]);

  async function abrirPdf(id) {
    try {
      const datos = await pedir('repuestos', `/facturas/${encodeURIComponent(id)}/pdf`);
      window.open(datos.url, '_blank', 'noopener');
    } catch (e) {
      setError(e.message);
    }
  }

  const columnas = columnasDe(modulo, filas);
  const texto = filtro.trim().toLowerCase();
  const visibles = texto
    ? filas.filter((f) => columnas.some((c) => String(f[c] ?? '').toLowerCase().includes(texto)))
    : filas;

  return (
    <>
      <div className="encabezado">
        <h1>{modulo.titulo}</h1>
        <input
          className="buscar"
          placeholder="Buscar en lo cargado…"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      <div className="tabla-caja">
        <table>
          <thead>
            <tr>
              {columnas.map((c) => (
                <th key={c}>{c.replaceAll('_', ' ')}</th>
              ))}
              {modulo.pdf && <th>PDF</th>}
            </tr>
          </thead>
          <tbody>
            {visibles.map((f, i) => (
              <tr key={i}>
                {columnas.map((c) => (
                  <td key={c}>{formato(c, f[c])}</td>
                ))}
                {modulo.pdf && (
                  <td>
                    <button className="secundario" onClick={() => abrirPdf(f.factura_id)}>
                      Ver PDF
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {!cargando && !visibles.length && !error && (
              <tr>
                <td colSpan={columnas.length + 1} className="vacio">
                  Sin registros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pie">
        <span>{visibles.length} registros mostrados</span>
        {cargando && <span>Cargando…</span>}
        {siguiente && !cargando && <button onClick={() => cargar(siguiente)}>Cargar más</button>}
      </div>
    </>
  );
}
