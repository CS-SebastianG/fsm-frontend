import { useEffect, useState } from 'react';
import { useAuth } from '../auth.jsx';
import { camposFaltantes, construirCuerpo, rutaCon, valoresIniciales } from '../formulario.js';

const LIMITE_OPCIONES = 100;

function etiquetaDe(fila, fuente) {
  const texto = fuente.etiqueta.map((k) => fila[k]).filter(Boolean).join(' · ');
  return texto ? `${fila[fuente.id]} — ${texto}` : fila[fuente.id];
}

// Carga las opciones de un servicio (clientes, sitios, técnicos, repuestos)
function useOpciones(fuente, valores, depende) {
  const { pedir } = useAuth();
  const [opciones, setOpciones] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const clave = depende ? valores[depende] : 'x';

  useEffect(() => {
    let vigente = true;
    setOpciones([]);
    setError('');
    if (depende && !valores[depende]) return undefined;
    setCargando(true);
    pedir(fuente.servicio, rutaCon(fuente.ruta, valores), { params: { limite: LIMITE_OPCIONES } })
      .then((datos) => vigente && setOpciones(datos?.[fuente.coleccion] || []))
      .catch((e) => vigente && setError(e.message))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
    // solo se recarga si cambia el campo del que depende
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  return { opciones, error, cargando };
}

function Referencia({ campo, valores, cambiar }) {
  const { opciones, error, cargando } = useOpciones(campo.fuente, valores, campo.depende);
  const bloqueado = campo.depende && !valores[campo.depende];

  if (error) {
    return (
      <>
        <input value={valores[campo.name]} onChange={(e) => cambiar(campo.name, e.target.value)} placeholder="Escribe el ID" />
        <small className="ayuda">No se pudo cargar la lista ({error}). Escribe el ID a mano.</small>
      </>
    );
  }
  return (
    <>
      <select
        value={valores[campo.name]}
        disabled={bloqueado || cargando}
        onChange={(e) => cambiar(campo.name, e.target.value)}
      >
        <option value="">
          {bloqueado ? 'Primero elige el cliente' : cargando ? 'Cargando…' : 'Selecciona…'}
        </option>
        {opciones.map((o) => (
          <option key={o[campo.fuente.id]} value={o[campo.fuente.id]}>
            {etiquetaDe(o, campo.fuente)}
          </option>
        ))}
      </select>
      {opciones.length >= LIMITE_OPCIONES && <small className="ayuda">Se muestran los primeros {LIMITE_OPCIONES}.</small>}
    </>
  );
}

function Repuestos({ campo, valores, cambiar }) {
  const { opciones, error, cargando } = useOpciones(campo.fuente, valores, null);
  const lista = valores[campo.name];

  function poner(i, parte) {
    cambiar(campo.name, lista.map((r, j) => (j === i ? { ...r, ...parte } : r)));
  }

  return (
    <div className="repuestos">
      {lista.map((r, i) => (
        <div className="fila-repuesto" key={i}>
          <select value={r.repuesto_id} onChange={(e) => poner(i, { repuesto_id: e.target.value })}>
            <option value="">{cargando ? 'Cargando…' : 'Repuesto…'}</option>
            {opciones.map((o) => (
              <option key={o.repuesto_id} value={o.repuesto_id}>
                {etiquetaDe(o, campo.fuente)}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            step="1"
            value={r.cantidad}
            onChange={(e) => poner(i, { cantidad: e.target.value })}
            aria-label="Cantidad"
          />
          <button type="button" className="secundario" onClick={() => cambiar(campo.name, lista.filter((_, j) => j !== i))}>
            Quitar
          </button>
        </div>
      ))}
      <button type="button" className="secundario" onClick={() => cambiar(campo.name, [...lista, { repuesto_id: '', cantidad: 1 }])}>
        + Agregar repuesto
      </button>
      {error && <small className="ayuda">No se pudo cargar el catálogo: {error}</small>}
    </div>
  );
}

function Entrada({ campo, valores, cambiar }) {
  const v = valores[campo.name];
  const alCambiar = (e) => cambiar(campo.name, e.target.value);
  switch (campo.tipo) {
    case 'textarea':
      return <textarea rows={3} value={v} onChange={alCambiar} />;
    case 'select':
      return (
        <select value={v} onChange={alCambiar}>
          {campo.opciones.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.texto}
            </option>
          ))}
        </select>
      );
    case 'ref':
      return <Referencia campo={campo} valores={valores} cambiar={cambiar} />;
    case 'repuestos':
      return <Repuestos campo={campo} valores={valores} cambiar={cambiar} />;
    case 'number':
      return <input type="number" min="0" step={campo.paso || '1'} value={v} onChange={alCambiar} />;
    case 'datetime':
      return <input type="datetime-local" value={v} onChange={alCambiar} />;
    case 'email':
      return <input type="email" value={v} onChange={alCambiar} />;
    default:
      return <input value={v} onChange={alCambiar} />;
  }
}

// Ventana con un formulario; sin campos funciona como confirmación
export default function Formulario({ titulo, campos = [], fila, mensaje, aviso, textoBoton = 'Guardar', peligro, onGuardar, onCancelar }) {
  const [valores, setValores] = useState(() => valoresIniciales(campos, fila));
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  function cambiar(nombre, valor) {
    setValores((previos) => {
      const nuevos = { ...previos, [nombre]: valor };
      // al cambiar el cliente se borra el sitio elegido
      campos.filter((c) => c.depende === nombre).forEach((c) => (nuevos[c.name] = ''));
      return nuevos;
    });
  }

  async function enviar(e) {
    e.preventDefault();
    setError('');
    const faltan = camposFaltantes(campos, valores);
    if (faltan.length) {
      setError(`Completa: ${faltan.join(', ')}`);
      return;
    }
    setEnviando(true);
    try {
      await onGuardar(construirCuerpo(campos, valores));
    } catch (err) {
      setError(err.message || 'No se pudo guardar');
      setEnviando(false);
    }
  }

  return (
    <div className="fondo-modal" role="dialog" aria-modal="true" aria-label={titulo}>
      <form className="modal" onSubmit={enviar}>
        <h2>{titulo}</h2>
        {mensaje && <p className="sub">{mensaje}</p>}
        {aviso && <p className="sub">{aviso}</p>}
        {campos.map((c) => {
          const Contenedor = c.tipo === 'repuestos' ? 'div' : 'label';
          return (
            <Contenedor key={c.name} className="campo">
              <span>
                {c.label}
                {c.requerido ? ' *' : ''}
              </span>
              <Entrada campo={c} valores={valores} cambiar={cambiar} />
            </Contenedor>
          );
        })}
        {error && <p className="error" role="alert">{error}</p>}
        <div className="botones">
          <button type="button" className="secundario" onClick={onCancelar} disabled={enviando}>
            Cancelar
          </button>
          <button type="submit" className={peligro ? 'peligro' : ''} disabled={enviando}>
            {enviando ? 'Enviando…' : textoBoton}
          </button>
        </div>
      </form>
    </div>
  );
}
