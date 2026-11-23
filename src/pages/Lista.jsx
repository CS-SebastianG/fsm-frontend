import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth.jsx';
import { DINERO } from '../modulos.js';
import { rutaCon } from '../formulario.js';
import Formulario from './Formulario.jsx';

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
  const { pedir, sesion } = useAuth();
  const [dialogo, setDialogo] = useState(null);
  const [aviso, setAviso] = useState('');
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

  const puede = (roles) => !roles || roles.includes(sesion.rol);

  // Ejecuta la llamada del diálogo abierto y recarga la lista
  async function ejecutar(def, fila, cuerpo) {
    const ruta = rutaCon(def.ruta, fila || {});
    const resultado = await pedir(def.servicio || modulo.servicio, ruta, {
      metodo: def.metodo,
      cuerpo: def.cuerpoFijo !== undefined ? def.cuerpoFijo : cuerpo
    });
    setDialogo(null);
    setAviso(def.exito ? def.exito(resultado) : 'Listo.');
    cargar(null);
  }

  const hayAcciones = Boolean(modulo.editar || modulo.eliminar || modulo.acciones);
  const columnas = columnasDe(modulo, filas);
  const texto = filtro.trim().toLowerCase();
  const visibles = texto
    ? filas.filter((f) => columnas.some((c) => String(f[c] ?? '').toLowerCase().includes(texto)))
    : filas;

  return (
    <>
      <div className="encabezado">
        <h1>{modulo.titulo}</h1>
        {modulo.crear && puede(modulo.crear.roles) && (
          <button onClick={() => setDialogo({ tipo: 'crear' })}>+ {modulo.crear.titulo}</button>
        )}
        <input
          className="buscar"
          placeholder="Buscar en lo cargado…"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      {aviso && <p className="exito" role="status">{aviso}</p>}
      {error && <p className="error" role="alert">{error}</p>}

      <div className="tabla-caja">
        <table>
          <thead>
            <tr>
              {columnas.map((c) => (
                <th key={c}>{c.replaceAll('_', ' ')}</th>
              ))}
              {modulo.pdf && <th>PDF</th>}
              {hayAcciones && <th>Acciones</th>}
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
                {hayAcciones && (
                  <td className="acciones">
                    {modulo.editar && puede(modulo.editar.roles) && (
                      <button className="secundario" onClick={() => setDialogo({ tipo: 'editar', fila: f })}>
                        Editar
                      </button>
                    )}
                    {modulo.eliminar && puede(modulo.eliminar.roles) && (
                      <button className="secundario peligro-borde" onClick={() => setDialogo({ tipo: 'eliminar', fila: f })}>
                        Eliminar
                      </button>
                    )}
                    {(modulo.acciones || [])
                      .filter((a) => puede(a.roles) && (!a.visible || a.visible(f)))
                      .map((a) => (
                        <button
                          key={a.clave}
                          className={`secundario ${a.peligro ? 'peligro-borde' : ''}`}
                          onClick={() => setDialogo({ tipo: 'accion', accion: a, fila: f })}
                        >
                          {a.texto}
                        </button>
                      ))}
                  </td>
                )}
              </tr>
            ))}
            {!cargando && !visibles.length && !error && (
              <tr>
                <td colSpan={columnas.length + 2} className="vacio">
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
      {dialogo?.tipo === 'crear' && (
        <Formulario
          titulo={modulo.crear.titulo}
          campos={modulo.crear.campos}
          onCancelar={() => setDialogo(null)}
          onGuardar={(cuerpo) => ejecutar({ ...modulo.crear, metodo: 'POST' }, null, cuerpo)}
        />
      )}
      {dialogo?.tipo === 'editar' && (
        <Formulario
          titulo={modulo.editar.titulo}
          campos={modulo.editar.campos.filter((c) => !c.soloCrear)}
          fila={dialogo.fila}
          onCancelar={() => setDialogo(null)}
          onGuardar={(cuerpo) => ejecutar({ ...modulo.editar, metodo: 'PUT' }, dialogo.fila, cuerpo)}
        />
      )}
      {dialogo?.tipo === 'eliminar' && (
        <Formulario
          titulo="Confirmar eliminación"
          mensaje={modulo.eliminar.confirmar(dialogo.fila)}
          textoBoton="Eliminar"
          peligro
          onCancelar={() => setDialogo(null)}
          onGuardar={() => ejecutar({ ...modulo.eliminar, metodo: 'DELETE', cuerpoFijo: undefined }, dialogo.fila)}
        />
      )}
      {dialogo?.tipo === 'accion' && (
        <Formulario
          titulo={dialogo.accion.titulo}
          campos={dialogo.accion.campos || []}
          fila={dialogo.fila}
          mensaje={dialogo.accion.confirmar ? dialogo.accion.confirmar(dialogo.fila) : undefined}
          aviso={dialogo.accion.aviso}
          textoBoton={dialogo.accion.texto}
          peligro={dialogo.accion.peligro}
          onCancelar={() => setDialogo(null)}
          onGuardar={(cuerpo) => ejecutar(dialogo.accion, dialogo.fila, cuerpo)}
        />
      )}
    </>
  );
}
