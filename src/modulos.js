// Roles que pueden gestionar (las APIs también lo validan y devuelven 403)
export const GESTION = ['admin', 'despachador'];

const ESTADOS_ACTIVO = [
  { valor: 'activo', texto: 'Activo' },
  { valor: 'inactivo', texto: 'Inactivo' }
];

const FUENTE_CLIENTES = {
  servicio: 'clientes',
  ruta: '/clientes',
  coleccion: 'clientes',
  id: 'cliente_id',
  etiqueta: ['nombre']
};

const FUENTE_SITIOS_DEL_CLIENTE = {
  servicio: 'clientes',
  ruta: '/clientes/{cliente_id}/sitios',
  coleccion: 'sitios',
  id: 'sitio_id',
  etiqueta: ['nombre', 'direccion']
};

const FUENTE_TECNICOS = {
  servicio: 'tecnicos',
  ruta: '/tecnicos',
  coleccion: 'registros',
  id: 'tecnico_id',
  etiqueta: ['nombre', 'apellido']
};

const FUENTE_REPUESTOS = {
  servicio: 'repuestos',
  ruta: '/repuestos',
  coleccion: 'items',
  id: 'repuesto_id',
  etiqueta: ['nombre']
};

const CAMPOS_CLIENTE = [
  { name: 'nombre', label: 'Nombre', requerido: true },
  { name: 'documento', label: 'Documento (RUC/DNI)' },
  { name: 'correo', label: 'Correo', tipo: 'email' },
  { name: 'telefono', label: 'Teléfono' },
  { name: 'direccion_facturacion', label: 'Dirección de facturación' },
  { name: 'estado', label: 'Estado', tipo: 'select', opciones: ESTADOS_ACTIVO, defecto: 'activo' }
];

const CAMPOS_SITIO = [
  { name: 'cliente_id', label: 'Cliente', tipo: 'ref', fuente: FUENTE_CLIENTES, requerido: true, soloCrear: true },
  { name: 'nombre', label: 'Nombre del sitio', requerido: true },
  { name: 'direccion', label: 'Dirección', requerido: true },
  { name: 'zona', label: 'Zona', requerido: true },
  { name: 'contacto_nombre', label: 'Contacto' },
  { name: 'contacto_telefono', label: 'Teléfono de contacto' },
  { name: 'instrucciones_acceso', label: 'Instrucciones de acceso', tipo: 'textarea' },
  { name: 'estado', label: 'Estado', tipo: 'select', opciones: ESTADOS_ACTIVO, defecto: 'activo' }
];

const CAMPOS_TECNICO = [
  { name: 'nombre', label: 'Nombre', requerido: true },
  { name: 'apellido', label: 'Apellido', requerido: true },
  { name: 'correo', label: 'Correo', tipo: 'email', requerido: true },
  { name: 'telefono', label: 'Teléfono' },
  { name: 'especialidad', label: 'Especialidad', requerido: true },
  { name: 'zona', label: 'Zona' },
  {
    name: 'estado',
    label: 'Estado',
    tipo: 'select',
    defecto: 'disponible',
    opciones: [
      { valor: 'disponible', texto: 'Disponible' },
      { valor: 'ocupado', texto: 'Ocupado' },
      { valor: 'inactivo', texto: 'Inactivo' },
      { valor: 'vacaciones', texto: 'Vacaciones' }
    ]
  }
];

const CAMPOS_REPUESTO = [
  { name: 'nombre', label: 'Nombre', requerido: true },
  { name: 'categoria', label: 'Categoría' },
  { name: 'precio_unitario', label: 'Precio unitario (S/)', tipo: 'number', paso: '0.01', requerido: true },
  { name: 'stock', label: 'Stock', tipo: 'number', paso: '1', defecto: 0 }
];

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
    columnas: ['orden_id', 'cliente_id', 'sitio_id', 'prioridad', 'estado', 'fecha_creacion'],
    crear: {
      titulo: 'Nueva orden',
      roles: GESTION,
      ruta: '/ordenes',
      campos: [
        { name: 'cliente_id', label: 'Cliente', tipo: 'ref', fuente: FUENTE_CLIENTES, requerido: true },
        {
          name: 'sitio_id',
          label: 'Sitio',
          tipo: 'ref',
          fuente: FUENTE_SITIOS_DEL_CLIENTE,
          depende: 'cliente_id',
          requerido: true
        },
        {
          name: 'prioridad',
          label: 'Prioridad',
          tipo: 'select',
          defecto: 'media',
          opciones: [
            { valor: 'baja', texto: 'Baja' },
            { valor: 'media', texto: 'Media' },
            { valor: 'alta', texto: 'Alta' }
          ]
        },
        { name: 'descripcion', label: 'Descripción del trabajo', tipo: 'textarea' }
      ],
      exito: (r) => `Orden ${r?.orden_id || ''} creada. La visita pendiente se genera sola por el evento orden.creada.`
    }
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
    columnas: ['visita_id', 'orden_id', 'tecnico_id', 'estado', 'fecha_inicio', 'prioridad'],
    acciones: [
      {
        clave: 'asignar',
        texto: 'Asignar técnico',
        titulo: 'Asignar técnico y horario',
        roles: GESTION,
        visible: (f) => ['pendiente', 'programada'].includes(f.estado),
        metodo: 'PUT',
        ruta: '/visitas/{visita_id}',
        aviso: 'Las horas se envían en UTC.',
        campos: [
          { name: 'tecnico_id', label: 'Técnico', tipo: 'ref', fuente: FUENTE_TECNICOS, requerido: true },
          { name: 'fecha_inicio', label: 'Inicio', tipo: 'datetime', requerido: true },
          { name: 'fecha_fin', label: 'Fin', tipo: 'datetime', requerido: true }
        ],
        exito: () => 'Visita programada.'
      },
      {
        clave: 'iniciar',
        texto: 'Iniciar',
        titulo: 'Iniciar visita',
        visible: (f) => f.estado === 'programada',
        metodo: 'PUT',
        ruta: '/visitas/{visita_id}',
        cuerpoFijo: { estado: 'en_curso' },
        confirmar: () => 'La visita pasará a estado en curso.',
        exito: () => 'Visita en curso.'
      },
      {
        clave: 'completar',
        texto: 'Completar',
        titulo: 'Completar visita',
        visible: (f) => ['programada', 'en_curso'].includes(f.estado),
        metodo: 'POST',
        ruta: '/visitas/{visita_id}/completar',
        aviso: 'Al completar se publica visita.completada y se genera la factura.',
        campos: [
          { name: 'observaciones', label: 'Observaciones', tipo: 'textarea' },
          { name: 'repuestos_usados', label: 'Repuestos usados', tipo: 'repuestos', fuente: FUENTE_REPUESTOS }
        ],
        exito: () => 'Visita completada. La factura se genera en unos segundos (menú Facturas).'
      },
      {
        clave: 'cancelar',
        texto: 'Cancelar',
        titulo: 'Cancelar visita',
        roles: GESTION,
        peligro: true,
        visible: (f) => ['pendiente', 'programada', 'en_curso'].includes(f.estado),
        metodo: 'POST',
        ruta: '/visitas/{visita_id}/cancelar',
        cuerpoFijo: {},
        confirmar: (f) => `¿Cancelar la visita ${f.visita_id}?`,
        exito: () => 'Visita cancelada.'
      }
    ]
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
    columnas: ['cliente_id', 'nombre', 'documento', 'correo', 'telefono', 'estado'],
    crear: { titulo: 'Nuevo cliente', roles: GESTION, ruta: '/clientes', campos: CAMPOS_CLIENTE, exito: () => 'Cliente creado.' },
    editar: { titulo: 'Editar cliente', roles: GESTION, ruta: '/clientes/{cliente_id}', campos: CAMPOS_CLIENTE, exito: () => 'Cliente actualizado.' },
    eliminar: {
      roles: GESTION,
      ruta: '/clientes/{cliente_id}',
      confirmar: (f) => `¿Eliminar al cliente ${f.nombre || f.cliente_id}? No se puede si tiene sitios.`,
      exito: () => 'Cliente eliminado.'
    }
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
    columnas: ['sitio_id', 'cliente_id', 'nombre', 'direccion', 'zona', 'estado'],
    crear: { titulo: 'Nuevo sitio', roles: GESTION, ruta: '/sitios', campos: CAMPOS_SITIO, exito: () => 'Sitio creado.' },
    editar: { titulo: 'Editar sitio', roles: GESTION, ruta: '/sitios/{sitio_id}', campos: CAMPOS_SITIO, exito: () => 'Sitio actualizado.' },
    eliminar: {
      roles: GESTION,
      ruta: '/sitios/{sitio_id}',
      confirmar: (f) => `¿Eliminar el sitio ${f.nombre || f.sitio_id}?`,
      exito: () => 'Sitio eliminado.'
    }
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
    columnas: null,
    crear: { titulo: 'Nuevo técnico', roles: GESTION, ruta: '/tecnicos', campos: CAMPOS_TECNICO, exito: () => 'Técnico creado.' },
    editar: { titulo: 'Editar técnico', roles: GESTION, ruta: '/tecnicos/{tecnico_id}', campos: CAMPOS_TECNICO, exito: () => 'Técnico actualizado.' },
    eliminar: {
      roles: GESTION,
      ruta: '/tecnicos/{tecnico_id}',
      confirmar: (f) => `¿Eliminar al técnico ${f.nombre || ''} ${f.apellido || ''}?`,
      exito: () => 'Técnico eliminado.'
    }
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
    columnas: ['repuesto_id', 'nombre', 'categoria', 'precio_unitario', 'stock'],
    crear: { titulo: 'Nuevo repuesto', roles: GESTION, ruta: '/repuestos', campos: CAMPOS_REPUESTO, exito: () => 'Repuesto creado.' },
    editar: { titulo: 'Editar repuesto', roles: GESTION, ruta: '/repuestos/{repuesto_id}', campos: CAMPOS_REPUESTO, exito: () => 'Repuesto actualizado.' },
    eliminar: {
      roles: GESTION,
      ruta: '/repuestos/{repuesto_id}',
      confirmar: (f) => `¿Eliminar el repuesto ${f.nombre || f.repuesto_id}?`,
      exito: () => 'Repuesto eliminado.'
    }
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
