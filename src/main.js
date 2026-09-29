import './style.css'
import { validarOperador } from './modules/auth'
import { buscarCosechador } from './modules/asignacionTickets'
import { actualizarCacheOperativa } from './modules/cacheOperativa'
import {
  agregarOperacion,
  agregarRolTrabajador,
  cerrarSesionLocal,
  contarLecturasCosechador,
  contarLecturasSesion,
  contarErrores,
  contarPendientes,
  existeTicketPendiente,
  guardarLecturaLocal,
  guardarSesionLocal,
  guardarTicketLocal,
  obtenerLotes,
  obtenerTicket,
  obtenerTrabajador
} from './offline/db'
import { sincronizarPendientes } from './offline/sync'

// VISTAS

const vistaLogin = document.querySelector('#vista-login')
const vistaMenu = document.querySelector('#vista-menu')
const vistaAsignacion = document.querySelector('#vista-asignacion')
const vistaJaberos = document.querySelector('#vista-jaberos')
const vistaLectura = document.querySelector('#vista-lectura')

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
const totalCosechador = document.querySelector('#total-cosechador')
const btnFinalizarLectura = document.querySelector('#btn-finalizar-lectura')
const mensajeModuloLectura = document.querySelector('#mensaje-modulo-lectura')

// ESTADO

let operador = null
let cosechador = null
let sesionLectura = null

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
    mostrarMenu()
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
  loteLectura.focus()
})

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

    const operacion = await agregarOperacion('ASIGNAR_TICKET', {
      dniOperador: operador.dni,
      dniCosechador: cosechador.dni,
      codigoTicket
    })

    await guardarTicketLocal({
      codigoTicket,
      cosechadorDni: cosechador.dni,
      cosechador: cosechador.nombre,
      operacionId: operacion.id
    })
  } catch (error) {
    mostrarResultado(error.message, 'error')
    codigoTicketInput.disabled = false
    codigoTicketInput.select()
    return
  }

  mostrarResultado(
    navigator.onLine
      ? `✓ Ticket ${codigoTicket} registrado`
      : `✓ Ticket ${codigoTicket} guardado sin conexión`,
    'exito'
  )
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

    await agregarRolTrabajador(dni, 'JABERO')
    await agregarOperacion('REGISTRAR_JABERO', {
      dniOperador: operador.dni,
      dniTrabajador: dni
    })

    mostrarResultadoJabero(`✓ ${trabajador.nombre} registrado como jabero`, 'exito')
    dniJaberoInput.value = ''
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
  vistaLogin.classList.add('oculto')
  vistaMenu.classList.add('oculto')
  vistaAsignacion.classList.add('oculto')
  vistaJaberos.classList.add('oculto')
  vistaLectura.classList.add('oculto')
  vista.classList.remove('oculto')
}

function mostrarMenu() {
  mostrarVista(vistaMenu)
  menuOperador.textContent = operador.nombre
  actualizarEstadoConexion()
}

// ASIGNACIÓN - UI

function habilitarTicket() {
  cardTicket.classList.remove('deshabilitado')
  codigoTicketInput.disabled = false
  codigoTicketInput.value = ''
  codigoTicketInput.focus()
}

function deshabilitarTicket() {
  cardTicket.classList.add('deshabilitado')
  codigoTicketInput.disabled = true
  codigoTicketInput.value = ''
  infoCosechador.classList.add('oculto')
}

function prepararSiguienteCosechador() {
  cosechador = null
  dniCosechadorInput.value = ''
  infoCosechador.classList.add('oculto')
  deshabilitarTicket()
  dniCosechadorInput.focus()
}

function limpiarAsignacion() {
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
        ? '● Sin conexión'
        : `● Sin conexión · ${pendientes} pendientes`
    estadoConexion.className = 'estado-conexion offline'
    return
  }

  if (errores > 0) {
    estadoConexion.textContent = `⚠ ${errores} errores de sincronización`
    estadoConexion.className = 'estado-conexion error-sync'
    return
  }

  estadoConexion.textContent =
    pendientes > 0 ? `● En línea · ${pendientes} pendientes` : '● En línea'
  estadoConexion.className = 'estado-conexion online'
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
      estado: 'ACTIVA',
      fecha_inicio: new Date().toISOString()
    }

    await guardarSesionLocal({ id: sesionId, ...sesion })
    await agregarOperacion('INICIAR_SESION', {
      dniOperador: operador.dni,
      dniJabero: dni,
      loteId,
      sesionId
    })

    sesionLectura = sesion
    mostrarSesionLectura()
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
    const ticket = await obtenerTicket(codigo)
    if (!ticket) {
      throw new Error('El ticket no está asignado a ningún cosechador.')
    }
    if (ticket.estado_sync === 'ERROR') {
      throw new Error('Este ticket presenta un error de sincronización.')
    }

    const lecturaId = crypto.randomUUID()
    const fechaHora = new Date().toISOString()
    await guardarLecturaLocal({
      id: lecturaId,
      sesion_id: sesionLectura.sesion_id,
      codigo_ticket: codigo,
      cosechador_dni: ticket.cosechador_dni,
      cosechador: ticket.cosechador,
      fecha_hora: fechaHora,
      estado_sync: 'PENDIENTE'
    })
    await agregarOperacion('REGISTRAR_JABA', {
      dniOperador: operador.dni,
      sesionId: sesionLectura.sesion_id,
      codigoTicket: codigo,
      lecturaId,
      fechaHora
    })

    const total = await contarLecturasSesion(sesionLectura.sesion_id)
    const totalPersona = await contarLecturasCosechador(
      sesionLectura.sesion_id,
      ticket.cosechador_dni
    )
    resultadoLectura.textContent = `✓ +1 jaba — ${ticket.cosechador}`
    resultadoLectura.className = 'resultado exito'
    totalSesion.textContent = total
    totalCosechador.textContent = totalPersona
    ticketLectura.value = ''
    ticketLectura.disabled = false
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
  await cerrarSesionLocal(sesionId)
  await agregarOperacion('CERRAR_SESION', {
    dniOperador: operador.dni,
    sesionId
  })

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

function mostrarSesionLectura() {
  configuracionLectura.classList.add('oculto')
  sesionLecturaActiva.classList.remove('oculto')
  sesionJabero.textContent = sesionLectura.jabero
  sesionLote.textContent = sesionLectura.lote_codigo
  sesionVariedad.textContent = sesionLectura.variedad
  totalSesion.textContent = '0'
  totalCosechador.textContent = '0'
  ticketLectura.value = ''
  ticketLectura.focus()
}

function mostrarMensajeLectura(mensaje, tipo) {
  mensajeModuloLectura.textContent = mensaje
  mensajeModuloLectura.className = `resultado ${tipo}`
}

function limpiarModuloLectura() {
  sesionLectura = null
  configuracionLectura.classList.remove('oculto')
  sesionLecturaActiva.classList.add('oculto')
  dniJaberoLectura.value = ''
  ticketLectura.value = ''
  resultadoLectura.className = 'resultado oculto'
  mensajeModuloLectura.className = 'resultado oculto'
  totalSesion.textContent = '0'
  totalCosechador.textContent = '0'
}
