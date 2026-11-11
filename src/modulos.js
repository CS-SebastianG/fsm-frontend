export const MODULOS = [
  {
    ruta: 'ordenes',
    titulo: 'Órdenes de trabajo',
    descripcion: 'Solicitudes de trabajo del tenant',
    servicio: 'ordenes',
    endpoint: '/ordenes',
    coleccion: 'items',
    paramLimite: 'limit',
    paramSiguiente: 'nextToken',
    claveSiguiente: 'nextToken',
    columnas: ['orden_id', 'cliente_id', 'sitio_id', 'prioridad', 'estado', 'fecha_creacion']
  },
  {
    ruta: 'visitas',
    titulo: 'Visitas y agenda',
    descripcion: 'Visitas programadas, en curso y completadas',
    servicio: 'visitas',
    endpoint: '/visitas',
    coleccion: 'visitas',
    paramLimite: 'limite',
    paramSiguiente: 'siguiente',
    claveSiguiente: 'siguiente',
    columnas: ['visita_id', 'orden_id', 'tecnico_id', 'estado', 'fecha_inicio', 'prioridad']
  },
  {
    ruta: 'clientes',
    titulo: 'Clientes',
    descripcion: 'Clientes de la empresa',
    servicio: 'clientes',
    endpoint: '/clientes',
    coleccion: 'clientes',
    paramLimite: 'limite',
    paramSiguiente: 'siguiente',
    claveSiguiente: 'siguiente',
    columnas: ['cliente_id', 'nombre', 'documento', 'correo', 'telefono', 'estado']
  },
  {
    ruta: 'sitios',
    titulo: 'Sitios',
    descripcion: 'Direcciones donde se hacen las visitas',
    servicio: 'clientes',
    endpoint: '/sitios',
    coleccion: 'sitios',
    paramLimite: 'limite',
    paramSiguiente: 'siguiente',
    claveSiguiente: 'siguiente',
    columnas: ['sitio_id', 'cliente_id', 'nombre', 'direccion', 'zona', 'estado']
  },
  {
    ruta: 'tecnicos',
    titulo: 'Técnicos',
    descripcion: 'Personal que realiza las visitas',
    servicio: 'tecnicos',
    endpoint: '/tecnicos',
    coleccion: 'registros',
    paramLimite: 'limite',
    paramSiguiente: 'siguiente',
    claveSiguiente: 'siguiente',
    columnas: null
  },
  {
    ruta: 'repuestos',
    titulo: 'Repuestos',
    descripcion: 'Catálogo de repuestos',
    servicio: 'repuestos',
    endpoint: '/repuestos',
    coleccion: 'items',
    paramLimite: 'limite',
    paramSiguiente: 'siguiente',
    claveSiguiente: 'siguiente',
    columnas: ['repuesto_id', 'nombre', 'categoria', 'precio_unitario', 'stock']
  },
  {
    ruta: 'facturas',
    titulo: 'Facturas',
    descripcion: 'Facturas generadas por visitas completadas',
    servicio: 'repuestos',
    endpoint: '/facturas',
    coleccion: 'items',
    paramLimite: 'limite',
    paramSiguiente: 'siguiente',
    claveSiguiente: 'siguiente',
    columnas: ['factura_id', 'visita_id', 'cliente_id', 'total', 'estado', 'fecha_emision'],
    pdf: true
  }
];

export const DINERO = ['precio_unitario', 'total', 'subtotal', 'igv'];
