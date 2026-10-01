var SCC_CONFIG = Object.freeze({
  hojaTrabajadores: 'TRABAJADORES',
  hojaCampanias: 'CAMPANIAS',
  filaEncabezado: 1,
  columnas: Object.freeze({
    dni: 1,
    nombres: 2,
    apellidos: 3,
    activo: 4,
    estadoSync: 5,
    observacion: 6,
    idSistema: 7,
    ultimaSincronizacion: 8
  }),
  columnasCampanias: Object.freeze({
    codigo: 1,
    nombre: 2,
    fechaInicio: 3,
    fechaFin: 4,
    estado: 5,
    estadoSync: 6,
    observacion: 7,
    idSistema: 8,
    ultimaSincronizacion: 9
  }),
  estados: Object.freeze({
    pendiente: 'PENDIENTE',
    sincronizado: 'SINCRONIZADO',
    error: 'ERROR'
  }),
  propiedades: Object.freeze({
    supabaseUrl: 'SUPABASE_URL',
    publishableKey: 'SUPABASE_PUBLISHABLE_KEY',
    integrationEmail: 'SUPABASE_INTEGRATION_EMAIL',
    integrationPassword: 'SUPABASE_INTEGRATION_PASSWORD'
  })
});

var SCC_ENCABEZADOS_TRABAJADORES = [
  'DNI',
  'Nombres',
  'Apellidos',
  'Activo',
  'Estado Sync',
  'Observación',
  'ID Sistema',
  'Última sincronización'
];

var SCC_ENCABEZADOS_CAMPANIAS = [
  'Código',
  'Nombre',
  'Fecha inicio',
  'Fecha fin',
  'Estado',
  'Estado Sync',
  'Observación',
  'ID Sistema',
  'Última sincronización'
];
