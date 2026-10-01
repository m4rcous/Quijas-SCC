var SCC_CONFIG = Object.freeze({
  hojaTrabajadores: 'TRABAJADORES',
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
