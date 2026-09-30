import './style.css'
import { validarOperador } from './modules/auth'
import { buscarCosechador } from './modules/asignacionTickets'
import { actualizarCacheOperativa } from './modules/cacheOperativa'
import {
  contarLecturasCosechador,
  contarLecturasSesion,
  contarErrores,
  contarPendientes,
  existeTicketPendiente,
  guardarAsignacionOffline,
  registrarJaberoOffline,
  iniciarSesionOffline,
  registrarLecturaOffline,
  finalizarSesionOffline,
  obtenerLotes,
  obtenerTicket,
  obtenerTickets,
  obtenerTrabajador,
  obtenerTrabajadores,
  obtenerLecturasSesion,
  obtenerSesionesActivas,
  obtenerSesionActivaJabero,
  obtenerUltimaLecturaSesion,
  obtenerColaCompleta,
  reintentarOperacion,
  descartarOperacion
} from './offline/db'
import { sincronizarPendientes } from './offline/sync'
import { evaluarDescarteOperacion } from './offline/cola'
import { configurarTecladoManual } from './modules/tecladoManual'
import {
  mostrarContadorCosechador,
  mostrarSesionLecturaEnVista
} from './modules/vistaSesionLectura'
import {
  FILTROS_ASIGNADOS_HOY,
  filtrarAsignacionesHoy,
  formatearHoraAsignacion,
  obtenerBadgeEstadoAsignacion
} from './modules/asignadosHoy'
import {
  FILTROS_JABEROS_CAMPANIA,
  filtrarJaberosCampania,
  obtenerBadgeEstadoJabero
} from './modules/jaberosCampania'
import {
  ORDEN_COSECHADORES_JABAS,
  agruparLecturasPorCosechador,
  buscarCosechadoresJabas,
  formatearHoraUltimaLectura,
  ordenarCosechadoresJabas,
  resumirCosechadoresJabas
} from './modules/cosechadoresJabas'

// VISTAS

const vistaLogin = document.querySelector('#vista-login')
const vistaMenu = document.querySelector('#vista-menu')
const vistaAsignacion = document.querySelector('#vista-asignacion')
const vistaJaberos = document.querySelector('#vista-jaberos')
const vistaLectura = document.querySelector('#vista-lectura')
const vistaSync = document.querySelector('#vista-sync')
const vistaConsulta = document.querySelector('#vista-consulta')
const sesionesRestaurables = document.querySelector('#sesiones-restaurables')
const resumenSync = document.querySelector('#resumen-sync')
const operacionesError = document.querySelector('#operaciones-error')

// LOGIN

const formLogin = document.querySelector('#form-login')
const dniOperadorInput = document.querySelector('#dni-operador')
const loginMensaje = document.querySelector('#login-mensaje')

// MENÚ

const menuOperador = document.querySelector('#menu-operador')
const btnSalirMenu = document.querySelector('#btn-salir-menu')
const btnMenuAsignacion = document.querySelector('#btn-menu-asignacion')
const btnMenuJaberos = document.querySelector('#btn-menu-jaberos')
const btnMenuLectura = document.querySelector('#btn-menu-lectura')
const estadoConexion = document.querySelector('#estado-conexion')

// ASIGNACIÓN

const nombreOperador = document.querySelector('#nombre-operador')
const btnVolverMenu = document.querySelector('#btn-volver-menu')
const formCosechador = document.querySelector('#form-cosechador')
const dniCosechadorInput = document.querySelector('#dni-cosechador')
const infoCosechador = document.querySelector('#info-cosechador')
const nombreCosechador = document.querySelector('#nombre-cosechador')
const campaniaCosechador = document.querySelector('#campania-cosechador')
const cardTicket = document.querySelector('#card-ticket')
const formTicket = document.querySelector('#form-ticket')
const codigoTicketInput = document.querySelector('#codigo-ticket')
const resultado = document.querySelector('#resultado')

// REGISTRO DE JABEROS

const btnVolverMenuJaberos = document.querySelector('#btn-volver-menu-jaberos')
const jaberosOperador = document.querySelector('#jaberos-operador')
const formJabero = document.querySelector('#form-jabero')
const dniJaberoInput = document.querySelector('#dni-jabero')
const resultadoJabero = document.querySelector('#resultado-jabero')

// LECTURA DE TICKETS

const btnVolverMenuLectura = document.querySelector('#btn-volver-menu-lectura')
const lecturaOperador = document.querySelector('#lectura-operador')
const configuracionLectura = document.querySelector('#configuracion-lectura')
const loteLectura = document.querySelector('#lote-lectura')
const formIniciarLectura = document.querySelector('#form-iniciar-lectura')
const dniJaberoLectura = document.querySelector('#dni-jabero-lectura')
const sesionLecturaActiva = document.querySelector('#sesion-lectura-activa')
const sesionJabero = document.querySelector('#sesion-jabero')
const sesionLote = document.querySelector('#sesion-lote')
const sesionVariedad = document.querySelector('#sesion-variedad')
const formLecturaTicket = document.querySelector('#form-lectura-ticket')
const ticketLectura = document.querySelector('#ticket-lectura')
const resultadoLectura = document.querySelector('#resultado-lectura')
const totalSesion = document.querySelector('#total-sesion')
const etiquetaCosechador = document.querySelector('#etiqueta-cosechador')
const totalCosechador = document.querySelector('#total-cosechador')
const btnFinalizarLectura = document.querySelector('#btn-finalizar-lectura')
const mensajeModuloLectura = document.querySelector('#mensaje-modulo-lectura')

// NAVEGACIÓN CONTEXTUAL Y VISTAS DE CONSULTA

const contextOverlay = document.querySelector('#context-overlay')
const contextTitle = document.querySelector('#context-title')
const contextOptions = document.querySelector('#context-options')
const btnCerrarContexto = document.querySelector('#btn-cerrar-contexto')
const btnVolverConsulta = document.querySelector('#btn-volver-consulta')
const tituloConsultaHeader = document.querySelector('#titulo-consulta-header')
const tituloConsulta = document.querySelector('#titulo-consulta')
const descripcionConsulta = document.querySelector('#descripcion-consulta')
const consultaBusqueda = document.querySelector('#consulta-busqueda')
const consultaChips = document.querySelector('#consulta-chips')
const consultaTablaHead = document.querySelector('#consulta-tabla-head')
const consultaTablaBody = document.querySelector('#consulta-tabla-body')
const consultaEmpty = document.querySelector('#consulta-empty')
const consultaEmptyAccion = document.querySelector('#consulta-empty-accion')
const consultaContador = document.querySelector('#consulta-contador')

const consultasContextuales = {
  asignacion: {
    titulo: 'Asignación de tickets',
    vistaOperativa: vistaAsignacion,
    opciones: [
      { etiqueta: 'Operar', operativa: true },
      {
        id: 'asignados-hoy',
        etiqueta: 'Asignados hoy',
        titulo: 'Asignados hoy',
        descripcion: 'Tickets asignados durante la jornada.',
        columnas: ['Cosechador', 'Ticket', 'Hora'],
        chips: ['Todos', 'Sincronizados', 'Pendientes', 'Con error'],
        vacio: 'No hay tickets asignados hoy.'
      },
      {
        etiqueta: 'Buscar asignación',
        titulo: 'Buscar asignación',
        descripcion: 'Busque por cosechador o código de ticket.',
        columnas: ['Cosechador', 'Ticket', 'Hora'],
        chips: ['Todos'],
        vacio: 'No hay asignaciones para mostrar.'
      }
    ]
  },
  jaberos: {
    titulo: 'Registro de jaberos',
    vistaOperativa: vistaJaberos,
    opciones: [
      { etiqueta: 'Registrar', operativa: true },
      {
        id: 'jaberos-campania',
        etiqueta: 'Jaberos de campaña',
        titulo: 'Jaberos de campaña',
        descripcion: 'Personal registrado como jabero en la campaña actual.',
        columnas: ['Jabero', 'DNI', 'Estado'],
        chips: ['Todos', 'Pendientes', 'Error'],
        vacio: 'No hay jaberos registrados en esta campaña.'
      },
      {
        etiqueta: 'Buscar',
        titulo: 'Buscar jabero',
        descripcion: 'Busque personal registrado en la campaña.',
        columnas: ['Jabero', 'DNI', 'Estado'],
        chips: ['Todos'],
        vacio: 'No hay jaberos para mostrar.'
      }
    ]
  },
  lectura: {
    titulo: 'Lectura de jabas',
    vistaOperativa: vistaLectura,
    opciones: [
      { etiqueta: 'Escanear', operativa: true },
      {
        id: 'cosechadores-jabas',
        etiqueta: 'Cosechadores y jabas',
        titulo: 'Cosechadores y jabas',
        descripcion: 'Resumen de producción de la sesión.',
        columnas: ['Cosechador', 'Jabas', 'Última'],
        columnasNumericas: ['Jabas'],
        chips: ['Más jabas', 'Recientes', 'A–Z'],
        vacio: 'Aún no se han registrado jabas en esta sesión.'
      },
      {
        etiqueta: 'Sesiones',
        titulo: 'Sesiones',
        descripcion: 'Sesiones de lectura disponibles para consulta.',
        columnas: ['Jabero', 'Lote', 'Estado'],
        chips: ['Todas', 'Activas'],
        vacio: 'No hay sesiones para mostrar.'
      }
    ]
  }
}

let vistaOperativaConsulta = vistaMenu
let consultaActual = null
let ticketsConsultaActual = []
let filtroAsignadosHoy = FILTROS_ASIGNADOS_HOY.TODOS
let trabajadoresConsultaActual = []
let filtroJaberosCampania = FILTROS_JABEROS_CAMPANIA.TODOS
let cosechadoresJabasActual = []
let ordenCosechadoresJabas = ORDEN_COSECHADORES_JABAS.MAS_JABAS

const tecladosManuales = new Map(
  [
    [dniOperadorInput, 'numeric'],
    [dniCosechadorInput, 'numeric'],
    [codigoTicketInput, 'text'],
    [dniJaberoInput, 'numeric'],
    [dniJaberoLectura, 'numeric'],
    [ticketLectura, 'text']
  ].map(([input, modo]) => [
    input,
    configurarTecladoManual(
      input,
      input.parentElement.querySelector('.btn-teclado'),
      modo
    )
  ])
)

function desactivarTecladoManual(...inputs) {
  const campos = inputs.length ? inputs : tecladosManuales.keys()
  for (const input of campos) tecladosManuales.get(input)()
}

// ESTADO

let operador = null
let cosechador = null
let sesionLectura = null

document.querySelectorAll('.btn-contexto').forEach((boton) => {
  boton.addEventListener('click', () => abrirMenuContextual(boton.dataset.contexto))
})

btnCerrarContexto.addEventListener('click', cerrarMenuContextual)
contextOverlay.addEventListener('click', (event) => {
  if (event.target === contextOverlay) cerrarMenuContextual()
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !contextOverlay.classList.contains('oculto')) {
    cerrarMenuContextual()
  }
})

btnVolverConsulta.addEventListener('click', async () => {
  mostrarVista(vistaOperativaConsulta)
  if (vistaOperativaConsulta === vistaLectura) {
    if (sesionLectura) await mostrarSesionLectura()
    else loteLectura.focus()
  }
})

consultaEmptyAccion.addEventListener('click', () => {
  mostrarVista(vistaLectura)
  if (sesionLectura) mostrarSesionLectura().catch(console.error)
  else loteLectura.focus()
})

function abrirMenuContextual(contexto) {
  const configuracion = consultasContextuales[contexto]
  if (!configuracion) return

  vistaOperativaConsulta = configuracion.vistaOperativa
  contextTitle.textContent = configuracion.titulo
  contextOptions.replaceChildren()

  for (const opcion of configuracion.opciones) {
    const boton = document.createElement('button')
    boton.type = 'button'
    boton.className = opcion.operativa
      ? 'bottom-sheet__option bottom-sheet__option--active'
      : 'bottom-sheet__option'
    boton.textContent = opcion.etiqueta
    boton.addEventListener('click', async () => {
      cerrarMenuContextual()
      if (opcion.operativa) {
        mostrarVista(configuracion.vistaOperativa)
        if (contexto === 'lectura') {
          if (sesionLectura) await mostrarSesionLectura()
          else loteLectura.focus()
        }
        return
      }
      await mostrarConsulta(opcion)
    })
    contextOptions.append(boton)
  }

  contextOverlay.classList.remove('oculto')
  contextOverlay.setAttribute('aria-hidden', 'false')
  btnCerrarContexto.focus()
}

function cerrarMenuContextual() {
  contextOverlay.classList.add('oculto')
  contextOverlay.setAttribute('aria-hidden', 'true')
}

async function mostrarConsulta(configuracion) {
  consultaActual = configuracion
  tituloConsultaHeader.textContent = configuracion.titulo
  tituloConsulta.textContent = configuracion.titulo
  descripcionConsulta.textContent = configuracion.descripcion
  consultaBusqueda.value = ''
  consultaBusqueda.disabled = false
  consultaContador.classList.add('oculto')
  consultaChips.classList.remove('oculto', 'filter-chips--wrap')
  consultaEmptyAccion.classList.add('oculto')

  if (configuracion.id === 'asignados-hoy') {
    await prepararConsultaAsignadosHoy()
    mostrarVista(vistaConsulta)
    consultaBusqueda.focus()
    return
  }

  if (configuracion.id === 'jaberos-campania') {
    await prepararConsultaJaberosCampania()
    mostrarVista(vistaConsulta)
    consultaBusqueda.focus()
    return
  }

  if (configuracion.id === 'cosechadores-jabas') {
    await prepararConsultaCosechadoresJabas()
    mostrarVista(vistaConsulta)
    if (!consultaBusqueda.disabled) consultaBusqueda.focus()
    return
  }

  consultaBusqueda.placeholder = `Buscar en ${configuracion.titulo.toLowerCase()}...`

  consultaChips.replaceChildren()
  configuracion.chips.forEach((chip, indice) => {
    const boton = document.createElement('button')
    boton.type = 'button'
    boton.className = `filter-chip${indice === 0 ? ' selected' : ''}`
    boton.textContent = chip
    boton.setAttribute('aria-pressed', String(indice === 0))
    boton.addEventListener('click', () => {
      consultaChips.querySelectorAll('.filter-chip').forEach((item) => {
        const seleccionado = item === boton
        item.classList.toggle('selected', seleccionado)
        item.setAttribute('aria-pressed', String(seleccionado))
      })
    })
    consultaChips.append(boton)
  })

  consultaTablaHead.replaceChildren()
  const columnasNumericas = configuracion.columnasNumericas ?? []
  configuracion.columnas.forEach((columna) => {
    const th = document.createElement('th')
    th.scope = 'col'
    th.textContent = columna
    if (columnasNumericas.includes(columna)) {
      th.classList.add('industrial-table__numeric')
    }
    consultaTablaHead.append(th)
  })
  consultaTablaBody.replaceChildren()
  consultaEmpty.querySelector('strong').textContent = configuracion.vacio
  consultaEmpty.querySelector('p').textContent =
    'La estructura visual está lista para conectarse cuando exista la consulta de datos.'
  consultaEmpty.classList.remove('oculto')

  mostrarVista(vistaConsulta)
  consultaBusqueda.focus()
}

async function prepararConsultaAsignadosHoy() {
  consultaBusqueda.placeholder = 'Buscar DNI, nombre o ticket...'
  filtroAsignadosHoy = FILTROS_ASIGNADOS_HOY.TODOS
  ticketsConsultaActual = await obtenerTickets()

  const filtros = [
    ['Todos', FILTROS_ASIGNADOS_HOY.TODOS],
    ['Sincronizados', FILTROS_ASIGNADOS_HOY.SINCRONIZADO],
    ['Pendientes', FILTROS_ASIGNADOS_HOY.PENDIENTE],
    ['Con error', FILTROS_ASIGNADOS_HOY.ERROR]
  ]

  consultaChips.replaceChildren()
  filtros.forEach(([etiqueta, valor], indice) => {
    const boton = document.createElement('button')
    boton.type = 'button'
    boton.className = `filter-chip${indice === 0 ? ' selected' : ''}`
    boton.textContent = etiqueta
    boton.dataset.filtro = valor
    boton.setAttribute('aria-pressed', String(indice === 0))
    boton.addEventListener('click', () => {
      filtroAsignadosHoy = valor
      consultaChips.querySelectorAll('.filter-chip').forEach((item) => {
        const seleccionado = item === boton
        item.classList.toggle('selected', seleccionado)
        item.setAttribute('aria-pressed', String(seleccionado))
      })
      renderAsignadosHoy()
    })
    consultaChips.append(boton)
  })

  consultaTablaHead.replaceChildren()
  for (const columna of ['Cosechador', 'Ticket', 'Hora']) {
    const th = document.createElement('th')
    th.scope = 'col'
    th.textContent = columna
    if (columna === 'Hora') th.classList.add('industrial-table__numeric')
    consultaTablaHead.append(th)
  }

  renderAsignadosHoy()
}

function renderAsignadosHoy() {
  const asignacionesDelDia = filtrarAsignacionesHoy(ticketsConsultaActual)
  const asignaciones = filtrarAsignacionesHoy(ticketsConsultaActual, {
    busqueda: consultaBusqueda.value,
    filtro: filtroAsignadosHoy
  })

  consultaTablaBody.replaceChildren()

  for (const ticket of asignaciones) {
    const fila = document.createElement('tr')

    const cosechadorCell = document.createElement('td')
    cosechadorCell.className = 'industrial-table__person'
    const nombre = document.createElement('strong')
    nombre.textContent = ticket.cosechador || 'Sin nombre'
    const dni = document.createElement('span')
    dni.textContent = ticket.cosechador_dni || 'DNI no disponible'
    cosechadorCell.append(nombre, dni)

    const ticketCell = document.createElement('td')
    ticketCell.className = 'industrial-table__ticket'
    const codigo = document.createElement('strong')
    codigo.textContent = ticket.codigo_ticket
    ticketCell.append(codigo)

    const badge = obtenerBadgeEstadoAsignacion(ticket.estado_sync)
    if (badge) {
      const estado = document.createElement('span')
      estado.className = `sync-badge ${badge.clase}`
      estado.textContent = badge.etiqueta
      ticketCell.append(estado)
    }

    const horaCell = document.createElement('td')
    horaCell.className = 'industrial-table__numeric industrial-table__time'
    horaCell.textContent = formatearHoraAsignacion(ticket.fecha_asignacion)

    fila.append(cosechadorCell, ticketCell, horaCell)
    consultaTablaBody.append(fila)
  }

  const total = asignaciones.length
  consultaContador.textContent = `${total} ${total === 1 ? 'asignación' : 'asignaciones'}`
  consultaContador.classList.remove('oculto')

  if (total > 0) {
    consultaEmpty.classList.add('oculto')
    return
  }

  const sinResultados = asignacionesDelDia.length > 0
  consultaEmpty.querySelector('strong').textContent = sinResultados
    ? 'No se encontraron asignaciones.'
    : 'No hay tickets asignados hoy.'
  consultaEmpty.querySelector('p').textContent = sinResultados
    ? 'Pruebe otra búsqueda o cambie el filtro.'
    : 'Las nuevas asignaciones aparecerán aquí, incluso si se crean sin conexión.'
  consultaEmpty.classList.remove('oculto')
}

async function prepararConsultaJaberosCampania() {
  consultaBusqueda.placeholder = 'Buscar nombre o DNI...'
  filtroJaberosCampania = FILTROS_JABEROS_CAMPANIA.TODOS
  trabajadoresConsultaActual = await obtenerTrabajadores()

  const filtros = [
    ['Todos', FILTROS_JABEROS_CAMPANIA.TODOS],
    ['Pendientes', FILTROS_JABEROS_CAMPANIA.PENDIENTE],
    ['Error', FILTROS_JABEROS_CAMPANIA.ERROR]
  ]

  consultaChips.replaceChildren()
  filtros.forEach(([etiqueta, valor], indice) => {
    const boton = document.createElement('button')
    boton.type = 'button'
    boton.className = `filter-chip${indice === 0 ? ' selected' : ''}`
    boton.textContent = etiqueta
    boton.dataset.filtro = valor
    boton.setAttribute('aria-pressed', String(indice === 0))
    boton.addEventListener('click', () => {
      filtroJaberosCampania = valor
      consultaChips.querySelectorAll('.filter-chip').forEach((item) => {
        const seleccionado = item === boton
        item.classList.toggle('selected', seleccionado)
        item.setAttribute('aria-pressed', String(seleccionado))
      })
      renderJaberosCampania()
    })
    consultaChips.append(boton)
  })

  consultaTablaHead.replaceChildren()
  for (const columna of ['Jabero', 'DNI', 'Estado']) {
    const th = document.createElement('th')
    th.scope = 'col'
    th.textContent = columna
    consultaTablaHead.append(th)
  }

  renderJaberosCampania()
}

function renderJaberosCampania() {
  const jaberosDisponibles = filtrarJaberosCampania(trabajadoresConsultaActual)
  const jaberos = filtrarJaberosCampania(trabajadoresConsultaActual, {
    busqueda: consultaBusqueda.value,
    filtro: filtroJaberosCampania
  })

  consultaTablaBody.replaceChildren()

  for (const trabajador of jaberos) {
    const fila = document.createElement('tr')

    const nombreCell = document.createElement('td')
    nombreCell.className = 'industrial-table__person'
    const nombre = document.createElement('strong')
    nombre.textContent = trabajador.nombre || 'Sin nombre'
    nombreCell.append(nombre)

    const dniCell = document.createElement('td')
    dniCell.textContent = trabajador.dni || '—'

    const estadoCell = document.createElement('td')
    const badge = obtenerBadgeEstadoJabero(trabajador.estado_sync_jabero)
    if (badge) {
      const estado = document.createElement('span')
      estado.className = `sync-badge ${badge.clase}`
      estado.textContent = badge.etiqueta
      estadoCell.append(estado)
    } else {
      estadoCell.textContent = '—'
    }

    fila.append(nombreCell, dniCell, estadoCell)
    consultaTablaBody.append(fila)
  }

  const total = jaberos.length
  consultaContador.textContent = `${total} ${total === 1 ? 'jabero' : 'jaberos'}`
  consultaContador.classList.remove('oculto')

  if (total > 0) {
    consultaEmpty.classList.add('oculto')
    return
  }

  const hayBusqueda = consultaBusqueda.value.trim().length > 0
  let titulo = 'No hay jaberos registrados en esta campaña.'
  let detalle = 'Los registros sincronizados y pendientes aparecerán aquí.'

  if (hayBusqueda) {
    titulo = 'No se encontraron jaberos.'
    detalle = 'Pruebe con otro nombre o DNI.'
  } else if (jaberosDisponibles.length > 0) {
    if (filtroJaberosCampania === FILTROS_JABEROS_CAMPANIA.PENDIENTE) {
      titulo = 'No hay jaberos pendientes de sincronización.'
      detalle = 'No existen registros locales pendientes en este momento.'
    } else if (filtroJaberosCampania === FILTROS_JABEROS_CAMPANIA.ERROR) {
      titulo = 'No hay registros de jabero con error.'
      detalle = 'No existen intentos fallidos de registro en este momento.'
    }
  }

  consultaEmpty.querySelector('strong').textContent = titulo
  consultaEmpty.querySelector('p').textContent = detalle
  consultaEmpty.classList.remove('oculto')
}

async function prepararConsultaCosechadoresJabas() {
  consultaBusqueda.placeholder = 'Buscar nombre o DNI...'
  consultaChips.classList.add('filter-chips--wrap')
  ordenCosechadoresJabas = ORDEN_COSECHADORES_JABAS.MAS_JABAS

  const filtros = [
    ['Más jabas', ORDEN_COSECHADORES_JABAS.MAS_JABAS],
    ['Recientes', ORDEN_COSECHADORES_JABAS.RECIENTES],
    ['A–Z', ORDEN_COSECHADORES_JABAS.AZ]
  ]

  consultaChips.replaceChildren()
  filtros.forEach(([etiqueta, valor], indice) => {
    const boton = document.createElement('button')
    boton.type = 'button'
    boton.className = `filter-chip${indice === 0 ? ' selected' : ''}`
    boton.textContent = etiqueta
    boton.dataset.orden = valor
    boton.setAttribute('aria-pressed', String(indice === 0))
    boton.addEventListener('click', () => {
      ordenCosechadoresJabas = valor
      consultaChips.querySelectorAll('.filter-chip').forEach((item) => {
        const seleccionado = item === boton
        item.classList.toggle('selected', seleccionado)
        item.setAttribute('aria-pressed', String(seleccionado))
      })
      renderCosechadoresJabas()
    })
    consultaChips.append(boton)
  })

  consultaTablaHead.replaceChildren()
  for (const columna of ['Cosechador', 'Jabas', 'Última']) {
    const th = document.createElement('th')
    th.scope = 'col'
    th.textContent = columna
    if (columna !== 'Cosechador') th.classList.add('industrial-table__numeric')
    consultaTablaHead.append(th)
  }

  if (!sesionLectura?.sesion_id) {
    cosechadoresJabasActual = []
    renderCosechadoresJabas()
    return
  }

  const [lecturas, trabajadores] = await Promise.all([
    obtenerLecturasSesion(sesionLectura.sesion_id),
    obtenerTrabajadores()
  ])
  cosechadoresJabasActual = agruparLecturasPorCosechador(lecturas, trabajadores)
  renderCosechadoresJabas()
}

function renderCosechadoresJabas() {
  consultaTablaBody.replaceChildren()

  if (!sesionLectura?.sesion_id) {
    consultaBusqueda.disabled = true
    consultaChips.classList.add('oculto')
    consultaContador.classList.add('oculto')
    consultaEmpty.querySelector('strong').textContent =
      'No hay una sesión de lectura activa.'
    consultaEmpty.querySelector('p').textContent =
      'Vuelva a lectura para iniciar o restaurar una sesión.'
    consultaEmptyAccion.classList.remove('oculto')
    consultaEmpty.classList.remove('oculto')
    return
  }

  consultaBusqueda.disabled = false
  consultaChips.classList.remove('oculto')
  consultaEmptyAccion.classList.add('oculto')

  const resumen = resumirCosechadoresJabas(cosechadoresJabasActual)
  consultaContador.textContent = `${resumen.cosechadores} ${
    resumen.cosechadores === 1 ? 'cosechador' : 'cosechadores'
  } · ${resumen.jabas} ${resumen.jabas === 1 ? 'jaba' : 'jabas'}`
  consultaContador.classList.remove('oculto')

  const cosechadores = ordenarCosechadoresJabas(
    buscarCosechadoresJabas(cosechadoresJabasActual, consultaBusqueda.value),
    ordenCosechadoresJabas
  )

  for (const cosechador of cosechadores) {
    const fila = document.createElement('tr')

    const personaCell = document.createElement('td')
    personaCell.className = 'industrial-table__person'
    const nombre = document.createElement('strong')
    nombre.textContent = cosechador.nombre || cosechador.dni || 'Sin identificar'
    const dni = document.createElement('span')
    dni.textContent = cosechador.dni || 'DNI no disponible'
    personaCell.append(nombre, dni)

    const jabasCell = document.createElement('td')
    jabasCell.className = 'industrial-table__numeric industrial-table__count'
    jabasCell.textContent = cosechador.jabas

    const ultimaCell = document.createElement('td')
    ultimaCell.className = 'industrial-table__numeric industrial-table__time'
    ultimaCell.textContent = formatearHoraUltimaLectura(cosechador.ultimaLectura)

    fila.append(personaCell, jabasCell, ultimaCell)
    consultaTablaBody.append(fila)
  }

  if (cosechadores.length > 0) {
    consultaEmpty.classList.add('oculto')
    return
  }

  const hayBusqueda = consultaBusqueda.value.trim().length > 0
  consultaEmpty.querySelector('strong').textContent = hayBusqueda
    ? 'No se encontraron cosechadores.'
    : 'Aún no se han registrado jabas en esta sesión.'
  consultaEmpty.querySelector('p').textContent = hayBusqueda
    ? 'Pruebe con otro nombre o DNI.'
    : 'Las nuevas lecturas aparecerán aquí al volver desde Escanear.'
  consultaEmpty.classList.remove('oculto')
}

consultaBusqueda.addEventListener('input', () => {
  if (consultaActual?.id === 'asignados-hoy') renderAsignadosHoy()
  if (consultaActual?.id === 'jaberos-campania') renderJaberosCampania()
  if (consultaActual?.id === 'cosechadores-jabas') renderCosechadoresJabas()
})

window.addEventListener('online', async () => {
  console.log('Conexión recuperada')

  try {
    await sincronizarPendientes()
  } catch (error) {
    console.error('No se pudieron sincronizar las operaciones pendientes:', error)
  }

  await actualizarEstadoConexion()
})

window.addEventListener('offline', actualizarEstadoConexion)
window.addEventListener('focus', () => {
  if (navigator.onLine)
    sincronizarPendientes().then(actualizarEstadoConexion).catch(console.error)
})
setInterval(() => {
  if (navigator.onLine)
    sincronizarPendientes().then(actualizarEstadoConexion).catch(console.error)
}, 30000)

// LOGIN

formLogin.addEventListener('submit', async (event) => {
  event.preventDefault()
  limpiarMensajeLogin()
  const dni = dniOperadorInput.value.trim()
  if (!/^\d{8}$/.test(dni)) {
    mostrarErrorLogin('El DNI debe contener 8 dígitos.')
    dniOperadorInput.select()
    return
  }
  try {
    operador = await validarOperador(dni)
    sessionStorage.setItem('operador_dni', operador.dni)
    if (!operador.offline) {
      try {
        await actualizarCacheOperativa(operador.dni)
      } catch (error) {
        console.error('No se pudo actualizar el caché:', error)
      }
    }
    desactivarTecladoManual(dniOperadorInput)
    mostrarMenu()
    if (navigator.onLine)
      sincronizarPendientes().then(actualizarEstadoConexion).catch(console.error)
  } catch (error) {
    mostrarErrorLogin(error.message)
    dniOperadorInput.select()
  }
})

// MENÚ

btnMenuAsignacion.addEventListener('click', () => {
  limpiarAsignacion()
  mostrarVista(vistaAsignacion)
  nombreOperador.textContent = operador.nombre
  dniCosechadorInput.focus()
})

btnMenuJaberos.addEventListener('click', () => {
  limpiarRegistroJabero()
  jaberosOperador.textContent = operador.nombre
  mostrarVista(vistaJaberos)
  dniJaberoInput.focus()
})

btnMenuLectura.addEventListener('click', async () => {
  limpiarModuloLectura()
  lecturaOperador.textContent = operador.nombre
  mostrarVista(vistaLectura)
  await cargarLotes()
  await mostrarSesionesActivas()
  if (!sesionLectura) loteLectura.focus()
})

estadoConexion.addEventListener('click', mostrarEstadoSync)
document.querySelector('#btn-volver-sync').addEventListener('click', mostrarMenu)

async function mostrarEstadoSync() {
  mostrarVista(vistaSync)
  await actualizarVistaSync()
}

async function actualizarVistaSync() {
  const operaciones = (await obtenerColaCompleta()).sort((a, b) =>
    a.creado_en.localeCompare(b.creado_en)
  )
  const pendientes = operaciones.filter((item) => item.estado === 'PENDIENTE')
  const errores = operaciones.filter((item) => item.estado === 'ERROR')
  resumenSync.textContent = `${pendientes.length} pendientes · ${errores.length} errores`
  operacionesError.replaceChildren()
  if (!errores.length) {
    operacionesError.textContent = 'No hay operaciones con error.'
    return
  }
  for (const operacion of errores) {
    const card = document.createElement('article')
    card.className = 'card sync-error-card'
    const titulo = document.createElement('h2')
    titulo.textContent = operacion.tipo.replaceAll('_', ' ')
    const detalle = document.createElement('p')
    detalle.className = 'detalle-sync'
    const payload = operacion.payload
    const dato =
      payload.codigoTicket ??
      payload.sesionId ??
      (payload.dniTrabajador
        ? `DNI terminado en ${payload.dniTrabajador.slice(-4)}`
        : '')
    const mensaje = String(operacion.error ?? 'Error sin detalle')
      .replace(/\b\d{8}\b/g, '********')
      .replace(/Bearer\s+\S+/gi, 'Bearer [oculto]')
    detalle.textContent = `${new Date(operacion.creado_en).toLocaleString()} · ${dato} · ${mensaje}`
    const acciones = document.createElement('div')
    acciones.className = 'acciones-sync'
    const reintentar = document.createElement('button')
    reintentar.className = 'btn-primary'
    reintentar.textContent = 'Reintentar'
    reintentar.addEventListener('click', async () => {
      await reintentarOperacion(operacion.id)
      if (navigator.onLine) await sincronizarPendientes()
      await actualizarVistaSync()
      await actualizarEstadoConexion()
    })
    acciones.append(reintentar)
    const descarte = evaluarDescarteOperacion(operacion, operaciones)
    if (descarte.permitido) {
      const descartar = document.createElement('button')
      descartar.className = 'btn-danger'
      descartar.textContent = 'Descartar'
      descartar.addEventListener('click', async () => {
        if (await descartarOperacion(operacion.id)) {
          await actualizarVistaSync()
          await actualizarEstadoConexion()
        }
      })
      acciones.append(descartar)
    } else {
      const motivo = document.createElement('p')
      motivo.className = 'detalle-sync'
      motivo.textContent = descarte.dependientes
        ? `Esta operación tiene ${descarte.dependientes} ${descarte.dependientes === 1 ? 'operación dependiente' : 'operaciones dependientes'} y no puede descartarse.`
        : 'Esta operación no admite descarte.'
      acciones.append(motivo)
    }
    card.append(titulo, detalle, acciones)
    operacionesError.append(card)
  }
}

async function mostrarSesionesActivas() {
  const sesiones = await obtenerSesionesActivas(operador.dni)
  sesionesRestaurables.replaceChildren()
  sesionesRestaurables.classList.toggle('oculto', !sesiones.length)
  if (!sesiones.length) return
  const titulo = document.createElement('h2')
  titulo.textContent = 'Sesiones de lectura activas'
  sesionesRestaurables.append(titulo)
  for (const sesion of sesiones) {
    const fila = document.createElement('div')
    fila.className = 'card sesion-restaurable'
    const descripcion = document.createElement('p')
    descripcion.textContent = `${sesion.jabero} · ${sesion.lote_codigo} · ${sesion.variedad}`
    const total = document.createElement('p')
    total.textContent = `${await contarLecturasSesion(sesion.id)} jabas locales`
    const continuar = document.createElement('button')
    continuar.className = 'btn-primary'
    continuar.textContent = 'Continuar lectura'
    continuar.addEventListener('click', async () => {
      sesionLectura = sesion
      mostrarVista(vistaLectura)
      await mostrarSesionLectura()
    })
    const finalizar = document.createElement('button')
    finalizar.className = 'btn-secondary'
    finalizar.textContent = 'Finalizar sesión'
    finalizar.addEventListener('click', async () => {
      if (!window.confirm('¿Finalizar la sesión de lectura?')) return
      sesionLectura = sesion
      await finalizarSesionLectura()
    })
    fila.append(descripcion, total, continuar, finalizar)
    sesionesRestaurables.append(fila)
  }
}

// CERRAR SESIÓN

btnSalirMenu.addEventListener('click', cerrarSesion)

function cerrarSesion() {
  operador = null
  cosechador = null
  sessionStorage.removeItem('operador_dni')
  dniOperadorInput.value = ''
  mostrarVista(vistaLogin)
  dniOperadorInput.focus()
}

// VOLVER AL MENÚ

btnVolverMenu.addEventListener('click', () => {
  limpiarAsignacion()
  mostrarMenu()
})

btnVolverMenuJaberos.addEventListener('click', () => {
  limpiarRegistroJabero()
  mostrarMenu()
})

// VALIDAR COSECHADOR

formCosechador.addEventListener('submit', async (event) => {
  event.preventDefault()
  limpiarResultado()
  const dni = dniCosechadorInput.value.trim()
  if (!/^\d{8}$/.test(dni)) {
    mostrarResultado('El DNI debe contener 8 dígitos.', 'error')
    dniCosechadorInput.select()
    return
  }
  try {
    cosechador = await buscarCosechador(dni)
    nombreCosechador.textContent = cosechador.nombre
    campaniaCosechador.textContent = cosechador.campania
    infoCosechador.classList.remove('oculto')
    desactivarTecladoManual(dniCosechadorInput)
    habilitarTicket()
  } catch (error) {
    cosechador = null
    deshabilitarTicket()
    mostrarResultado(error.message, 'error')
    dniCosechadorInput.select()
  }
})

// ASIGNAR TICKET

formTicket.addEventListener('submit', async (event) => {
  event.preventDefault()
  limpiarResultado()
  if (!operador || !cosechador) {
    return
  }
  const codigoTicket = codigoTicketInput.value.trim()
  if (!codigoTicket) {
    mostrarResultado('Escanee un ticket.', 'error')
    codigoTicketInput.focus()
    return
  }
  codigoTicketInput.disabled = true
  try {
    const ticketExistente = await obtenerTicket(codigoTicket)
    const ticketPendiente = await existeTicketPendiente(codigoTicket)

    if (ticketExistente || ticketPendiente) {
      mostrarResultado('El ticket ya fue asignado.', 'error')
      codigoTicketInput.disabled = false
      codigoTicketInput.select()
      return
    }

    await guardarAsignacionOffline({
      codigoTicket,
      cosechadorDni: cosechador.dni,
      cosechador: cosechador.nombre,
      dniOperador: operador.dni
    })
  } catch (error) {
    mostrarResultado(error.message, 'error')
    codigoTicketInput.disabled = false
    codigoTicketInput.select()
    return
  }

  mostrarResultado(
    navigator.onLine
      ? `✓ Ticket ${codigoTicket} guardado · sincronización pendiente`
      : `✓ Ticket ${codigoTicket} guardado sin conexión`,
    'exito'
  )
  desactivarTecladoManual(codigoTicketInput)
  setTimeout(prepararSiguienteCosechador, 1200)
  await actualizarEstadoConexion()

  if (navigator.onLine) {
    try {
      await sincronizarPendientes()
    } catch (error) {
      console.error('No se pudo sincronizar el ticket guardado:', error)
    }
    await actualizarEstadoConexion()
  }
})

// REGISTRO DE JABEROS

formJabero.addEventListener('submit', async (event) => {
  event.preventDefault()
  limpiarResultadoJabero()
  const dni = dniJaberoInput.value.trim()
  if (!/^\d{8}$/.test(dni)) {
    mostrarResultadoJabero('El DNI debe contener 8 dígitos.', 'error')
    dniJaberoInput.select()
    return
  }
  try {
    const trabajador = await obtenerTrabajador(dni)

    if (!trabajador) {
      throw new Error('El trabajador no está disponible en la campaña actual.')
    }

    if (trabajador.roles?.includes('JABERO')) {
      throw new Error('El trabajador ya está registrado como jabero.')
    }

    await registrarJaberoOffline(operador.dni, dni)

    mostrarResultadoJabero(
      `✓ ${trabajador.nombre} guardado como jabero · sincronización pendiente`,
      'exito'
    )
    dniJaberoInput.value = ''
    desactivarTecladoManual(dniJaberoInput)
    dniJaberoInput.focus()
  } catch (error) {
    mostrarResultadoJabero(error.message, 'error')
    dniJaberoInput.select()
    return
  }

  if (navigator.onLine) {
    try {
      await sincronizarPendientes()
    } catch (error) {
      console.error('No se pudo sincronizar el registro de jabero:', error)
    }
  }
  await actualizarEstadoConexion()
})

// NAVEGACIÓN

function mostrarVista(vista) {
  desactivarTecladoManual()
  cerrarMenuContextual()
  vistaLogin.classList.add('oculto')
  vistaMenu.classList.add('oculto')
  vistaAsignacion.classList.add('oculto')
  vistaJaberos.classList.add('oculto')
  vistaLectura.classList.add('oculto')
  vistaSync.classList.add('oculto')
  vistaConsulta.classList.add('oculto')
  vista.classList.remove('oculto')
}

function mostrarMenu() {
  mostrarVista(vistaMenu)
  menuOperador.textContent = operador.nombre
  actualizarEstadoConexion()
  mostrarSesionesActivas().catch(console.error)
}

// ASIGNACIÓN - UI

function habilitarTicket() {
  cardTicket.classList.remove('deshabilitado')
  codigoTicketInput.disabled = false
  codigoTicketInput.parentElement.querySelector('.btn-teclado').disabled = false
  codigoTicketInput.value = ''
  codigoTicketInput.focus()
}

function deshabilitarTicket() {
  desactivarTecladoManual(codigoTicketInput)
  cardTicket.classList.add('deshabilitado')
  codigoTicketInput.disabled = true
  codigoTicketInput.parentElement.querySelector('.btn-teclado').disabled = true
  codigoTicketInput.value = ''
  infoCosechador.classList.add('oculto')
}

function prepararSiguienteCosechador() {
  desactivarTecladoManual()
  cosechador = null
  dniCosechadorInput.value = ''
  infoCosechador.classList.add('oculto')
  deshabilitarTicket()
  dniCosechadorInput.focus()
}

function limpiarAsignacion() {
  desactivarTecladoManual()
  cosechador = null
  dniCosechadorInput.value = ''
  codigoTicketInput.value = ''
  infoCosechador.classList.add('oculto')
  deshabilitarTicket()
  limpiarResultado()
}

// MENSAJES

function mostrarResultado(mensaje, tipo) {
  resultado.textContent = mensaje
  resultado.className = `resultado ${tipo}`
  resultado.classList.remove('oculto')
}

function limpiarResultado() {
  resultado.textContent = ''
  resultado.className = 'resultado oculto'
}

function mostrarErrorLogin(mensaje) {
  loginMensaje.textContent = mensaje
  loginMensaje.className = 'mensaje error'
}

function limpiarMensajeLogin() {
  loginMensaje.textContent = ''
  loginMensaje.className = 'mensaje'
}

async function actualizarEstadoConexion() {
  let pendientes
  let errores
  try {
    pendientes = await contarPendientes()
    errores = await contarErrores()
  } catch (error) {
    console.error('No se pudo consultar la cola de sincronización:', error)
  }

  if (!navigator.onLine) {
    estadoConexion.textContent =
      pendientes === undefined
        ? 'Sin conexión'
        : `Sin conexión · ${pendientes} pendientes`
    estadoConexion.className = 'estado-conexion offline'
    return
  }

  if (errores > 0) {
    estadoConexion.textContent = `${errores} ${errores === 1 ? 'error de sincronización' : 'errores de sincronización'}`
    estadoConexion.className = 'estado-conexion error-sync'
    return
  }

  if (pendientes > 0) {
    estadoConexion.textContent = `${pendientes} ${pendientes === 1 ? 'registro pendiente' : 'registros pendientes'}`
    estadoConexion.className = 'estado-conexion warning-sync'
    return
  }

  estadoConexion.textContent = ''
  estadoConexion.className = 'estado-conexion oculto'
}

// RESTAURAR SESIÓN AL RECARGAR

async function restaurarSesion() {
  const dni = sessionStorage.getItem('operador_dni')
  if (!dni) {
    return
  }
  try {
    operador = await validarOperador(dni)
    mostrarMenu()
    if (navigator.onLine)
      sincronizarPendientes().then(actualizarEstadoConexion).catch(console.error)
  } catch {
    sessionStorage.removeItem('operador_dni')
  }
}

restaurarSesion()

function mostrarResultadoJabero(mensaje, tipo) {
  resultadoJabero.textContent = mensaje
  resultadoJabero.className = `resultado ${tipo}`
  resultadoJabero.classList.remove('oculto')
}

function limpiarResultadoJabero() {
  resultadoJabero.textContent = ''
  resultadoJabero.className = 'resultado oculto'
}

function limpiarRegistroJabero() {
  desactivarTecladoManual(dniJaberoInput)
  dniJaberoInput.value = ''
  limpiarResultadoJabero()
}

async function cargarLotes() {
  loteLectura.disabled = true
  loteLectura.innerHTML = '<option value="">Cargando lotes...</option>'
  try {
    const lotes = await obtenerLotes()
    loteLectura.innerHTML = '<option value="">Seleccione un lote</option>'
    for (const lote of lotes) {
      const option = document.createElement('option')
      option.value = lote.lote_id
      option.textContent = `${lote.codigo} — ${lote.variedad}`
      loteLectura.appendChild(option)
    }
    loteLectura.disabled = false
  } catch (error) {
    mostrarMensajeLectura(error.message, 'error')
  }
}

formIniciarLectura.addEventListener('submit', async (event) => {
  event.preventDefault()
  const loteId = loteLectura.value
  const dni = dniJaberoLectura.value.trim()
  if (!loteId) {
    mostrarMensajeLectura('Seleccione un lote.', 'error')
    return
  }
  if (!/^\d{8}$/.test(dni)) {
    mostrarMensajeLectura('El DNI debe contener 8 dígitos.', 'error')
    dniJaberoLectura.select()
    return
  }
  try {
    const trabajador = await obtenerTrabajador(dni)
    if (!trabajador) {
      throw new Error('El trabajador no está disponible localmente.')
    }
    if (!trabajador.roles?.includes('JABERO')) {
      throw new Error('El trabajador no está registrado como jabero.')
    }
    if (trabajador.estado_sync_jabero === 'ERROR') {
      throw new Error(
        'El registro de este jabero fue rechazado. Revise sincronización.'
      )
    }
    const existente = await obtenerSesionActivaJabero(dni)
    if (existente) {
      throw new Error('El jabero ya tiene una sesión activa. Continúe esa sesión.')
    }

    const lotes = await obtenerLotes()
    const lote = lotes.find((item) => item.lote_id === loteId)
    if (!lote) {
      throw new Error('El lote seleccionado no está disponible.')
    }

    const sesionId = crypto.randomUUID()
    const sesion = {
      sesion_id: sesionId,
      jabero: trabajador.nombre,
      lote_id: lote.lote_id,
      lote_codigo: lote.codigo,
      variedad: lote.variedad,
      dni_jabero: dni,
      dni_operador: operador.dni,
      estado: 'ACTIVA',
      fecha_inicio: new Date().toISOString()
    }

    await iniciarSesionOffline({ id: sesionId, ...sesion }, operador.dni)

    sesionLectura = sesion
    desactivarTecladoManual(dniJaberoLectura)
    await mostrarSesionLectura()
  } catch (error) {
    mostrarMensajeLectura(error.message, 'error')
    dniJaberoLectura.select()
    return
  }

  if (navigator.onLine) {
    try {
      await sincronizarPendientes()
    } catch (error) {
      console.error('No se pudo sincronizar el inicio de lectura:', error)
    }
  }
  await actualizarEstadoConexion()
})

formLecturaTicket.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!sesionLectura) {
    return
  }
  const codigo = ticketLectura.value.trim()
  if (!codigo) {
    return
  }
  ticketLectura.disabled = true
  try {
    const jabero = await obtenerTrabajador(sesionLectura.dni_jabero)
    if (jabero?.estado_sync_jabero === 'ERROR') {
      throw new Error(
        'El registro de este jabero fue rechazado. Revise sincronización.'
      )
    }
    const operacionesSesion = await obtenerColaCompleta()
    if (
      operacionesSesion.some(
        (item) =>
          item.tipo === 'INICIAR_SESION' &&
          item.payload.sesionId === sesionLectura.sesion_id &&
          item.estado === 'ERROR'
      )
    ) {
      throw new Error('El inicio de esta sesión fue rechazado. Revise sincronización.')
    }
    const ticket = await obtenerTicket(codigo)
    if (!ticket) {
      throw new Error('El ticket no está asignado a ningún cosechador.')
    }
    if (ticket.estado_sync === 'ERROR') {
      throw new Error('Este ticket presenta un error de sincronización.')
    }

    const lecturaId = crypto.randomUUID()
    const fechaHora = new Date().toISOString()
    await registrarLecturaOffline(
      {
        id: lecturaId,
        sesion_id: sesionLectura.sesion_id,
        codigo_ticket: codigo,
        cosechador_dni: ticket.cosechador_dni,
        cosechador: ticket.cosechador,
        fecha_hora: fechaHora,
        estado_sync: 'PENDIENTE'
      },
      operador.dni
    )

    const total = await contarLecturasSesion(sesionLectura.sesion_id)
    const totalPersona = await contarLecturasCosechador(
      sesionLectura.sesion_id,
      ticket.cosechador_dni
    )
    resultadoLectura.textContent = `✓ +1 jaba — ${ticket.cosechador}`
    resultadoLectura.className = 'resultado exito'
    totalSesion.textContent = total
    mostrarContadorCosechador(ticket.cosechador, totalPersona, {
      etiquetaCosechador,
      totalCosechador
    })
    ticketLectura.value = ''
    ticketLectura.disabled = false
    desactivarTecladoManual(ticketLectura)
    ticketLectura.focus()
  } catch (error) {
    resultadoLectura.textContent = error.message
    resultadoLectura.className = 'resultado error'
    ticketLectura.disabled = false
    ticketLectura.select()
    return
  }

  if (navigator.onLine) {
    try {
      await sincronizarPendientes()
    } catch (error) {
      console.error('No se pudo sincronizar la lectura de jaba:', error)
    }
  }
  await actualizarEstadoConexion()
})

btnFinalizarLectura.addEventListener('click', async () => {
  if (!sesionLectura) {
    return
  }
  const confirmar = window.confirm('¿Finalizar la sesión de lectura?')
  if (!confirmar) {
    return
  }
  try {
    await finalizarSesionLectura()
  } catch (error) {
    mostrarMensajeLectura(error.message, 'error')
  }
})

btnVolverMenuLectura.addEventListener('click', async () => {
  if (!sesionLectura) {
    mostrarMenu()
    return
  }
  const confirmar = window.confirm(
    'Hay una sesión activa. ¿Desea finalizarla y volver al menú?'
  )
  if (!confirmar) {
    return
  }
  try {
    await finalizarSesionLectura()
  } catch (error) {
    mostrarMensajeLectura(error.message, 'error')
  }
})

async function finalizarSesionLectura() {
  const sesionId = sesionLectura.sesion_id
  await finalizarSesionOffline(sesionId, operador.dni)

  sesionLectura = null
  mostrarMenu()

  if (navigator.onLine) {
    try {
      await sincronizarPendientes()
    } catch (error) {
      console.error('No se pudo sincronizar el cierre de lectura:', error)
    }
  }
  await actualizarEstadoConexion()
}

async function mostrarSesionLectura() {
  desactivarTecladoManual()
  await mostrarSesionLecturaEnVista(
    sesionLectura,
    {
      configuracionLectura,
      sesionLecturaActiva,
      sesionJabero,
      sesionLote,
      sesionVariedad,
      totalSesion,
      etiquetaCosechador,
      totalCosechador,
      mensajeModuloLectura,
      ticketLectura
    },
    {
      contarLecturasSesion,
      obtenerUltimaLecturaSesion,
      contarLecturasCosechador,
      obtenerTicket,
      obtenerTrabajador
    }
  )
}

function mostrarMensajeLectura(mensaje, tipo) {
  mensajeModuloLectura.textContent = mensaje
  mensajeModuloLectura.className = `resultado ${tipo}`
}

function limpiarModuloLectura() {
  desactivarTecladoManual()
  sesionLectura = null
  configuracionLectura.classList.remove('oculto')
  sesionLecturaActiva.classList.add('oculto')
  dniJaberoLectura.value = ''
  ticketLectura.value = ''
  resultadoLectura.className = 'resultado oculto'
  mensajeModuloLectura.textContent = ''
  mensajeModuloLectura.className = 'resultado oculto'
  totalSesion.textContent = '0'
  mostrarContadorCosechador(null, 0, { etiquetaCosechador, totalCosechador })
}
