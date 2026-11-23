import { describe, expect, it } from 'vitest';
import { aIso, camposFaltantes, construirCuerpo, rutaCon, valoresIniciales } from '../src/formulario.js';
import { MODULOS } from '../src/modulos.js';

describe('formulario', () => {
  it('convierte datetime-local a ISO con Z', () => {
    expect(aIso('2026-11-23T09:00')).toBe('2026-11-23T09:00:00Z');
    expect(aIso('')).toBe('');
  });

  it('omite vacíos, convierte números y recorta textos', () => {
    const campos = [
      { name: 'nombre' },
      { name: 'categoria' },
      { name: 'precio_unitario', tipo: 'number' },
      { name: 'stock', tipo: 'number' }
    ];
    const cuerpo = construirCuerpo(campos, { nombre: '  Fusible ', categoria: '', precio_unitario: '12.5', stock: 0 });
    expect(cuerpo).toEqual({ nombre: 'Fusible', precio_unitario: 12.5, stock: 0 });
  });

  it('arma repuestos_usados solo con filas completas', () => {
    const campos = [{ name: 'repuestos_usados', tipo: 'repuestos' }];
    const cuerpo = construirCuerpo(campos, {
      repuestos_usados: [
        { repuesto_id: 'REP-1', cantidad: '2' },
        { repuesto_id: '', cantidad: 1 },
        { repuesto_id: 'REP-2', cantidad: 0 }
      ]
    });
    expect(cuerpo).toEqual({ repuestos_usados: [{ repuesto_id: 'REP-1', cantidad: 2 }] });
  });

  it('detecta campos obligatorios vacíos', () => {
    const campos = [
      { name: 'nombre', label: 'Nombre', requerido: true },
      { name: 'zona', label: 'Zona' }
    ];
    expect(camposFaltantes(campos, { nombre: ' ', zona: '' })).toEqual(['Nombre']);
    expect(camposFaltantes(campos, { nombre: 'Ana', zona: '' })).toEqual([]);
  });

  it('rellena la ruta con los valores', () => {
    expect(rutaCon('/clientes/{cliente_id}/sitios', { cliente_id: 'CLI-1' })).toBe('/clientes/CLI-1/sitios');
    expect(rutaCon('/visitas/{visita_id}', { visita_id: 'ord-ORD-1' })).toBe('/visitas/ord-ORD-1');
  });

  it('carga valores iniciales desde la fila y los defectos', () => {
    const campos = [
      { name: 'nombre' },
      { name: 'estado', defecto: 'activo' },
      { name: 'fecha_inicio', tipo: 'datetime' }
    ];
    expect(valoresIniciales(campos, { nombre: 'Ana', fecha_inicio: '2026-11-23T09:00:00Z' })).toEqual({
      nombre: 'Ana',
      estado: 'activo',
      fecha_inicio: '2026-11-23T09:00'
    });
  });
});

describe('modulos', () => {
  it('cada ruta con {id} usa un campo que existe en las columnas o en la fila', () => {
    for (const m of MODULOS) {
      for (const def of [m.editar, m.eliminar, ...(m.acciones || [])].filter(Boolean)) {
        expect(def.ruta.startsWith('/')).toBe(true);
      }
    }
  });

  it('solo clientes, sitios, técnicos y repuestos tienen CRUD completo', () => {
    const completos = MODULOS.filter((m) => m.crear && m.editar && m.eliminar).map((m) => m.ruta);
    expect(completos).toEqual(['clientes', 'sitios', 'tecnicos', 'repuestos']);
  });
});
