// Utilidades puras de los formularios (se prueban en tests/formulario.test.js)

// Los inputs datetime-local dan "2026-11-23T09:00"; las APIs piden "2026-11-23T09:00:00Z"
export function aIso(valor) {
  if (!valor) return valor;
  return valor.length === 16 ? `${valor}:00Z` : valor;
}

export function aLocal(iso) {
  return typeof iso === 'string' ? iso.slice(0, 16) : '';
}

export function valoresIniciales(campos, fila) {
  const valores = {};
  for (const c of campos) {
    const actual = fila ? fila[c.name] : undefined;
    if (c.tipo === 'repuestos') valores[c.name] = [];
    else if (actual !== undefined && actual !== null) valores[c.name] = c.tipo === 'datetime' ? aLocal(actual) : actual;
    else valores[c.name] = c.defecto ?? '';
  }
  return valores;
}

// Arma el JSON que se envía: omite vacíos, convierte números y fechas
export function construirCuerpo(campos, valores) {
  const cuerpo = {};
  for (const c of campos) {
    let v = valores[c.name];
    if (c.tipo === 'repuestos') {
      cuerpo[c.name] = (v || [])
        .filter((r) => r.repuesto_id && Number(r.cantidad) > 0)
        .map((r) => ({ repuesto_id: r.repuesto_id, cantidad: Number(r.cantidad) }));
      continue;
    }
    if (v === '' || v === undefined || v === null) continue;
    if (c.tipo === 'number') v = Number(v);
    if (c.tipo === 'datetime') v = aIso(v);
    cuerpo[c.name] = typeof v === 'string' ? v.trim() : v;
  }
  return cuerpo;
}

export function camposFaltantes(campos, valores) {
  return campos
    .filter((c) => c.requerido && c.tipo !== 'repuestos' && String(valores[c.name] ?? '').trim() === '')
    .map((c) => c.label);
}

// "/clientes/{cliente_id}/sitios" + valores -> "/clientes/CLI-1/sitios"
export function rutaCon(ruta, valores) {
  return ruta.replace(/\{(\w+)\}/g, (_, clave) => encodeURIComponent(valores?.[clave] ?? ''));
}
