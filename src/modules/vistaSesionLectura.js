export function mostrarContadorCosechador(
  nombre,
  cantidad,
  { etiquetaCosechador, totalCosechador }
) {
  etiquetaCosechador.textContent = nombre || 'Cosechador actual'
  totalCosechador.textContent = cantidad
    ? `${cantidad} ${cantidad === 1 ? 'jaba' : 'jabas'}`
    : '0'
}

export async function mostrarSesionLecturaEnVista(
  sesion,
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
) {
  const total = await contarLecturasSesion(sesion.sesion_id)
  const ultima = await obtenerUltimaLecturaSesion(sesion.sesion_id)
  const cantidad = ultima
    ? await contarLecturasCosechador(sesion.sesion_id, ultima.cosechador_dni)
    : 0
  const nombre = ultima
    ? ultima.cosechador ||
      (ultima.codigo_ticket &&
        (await obtenerTicket(ultima.codigo_ticket))?.cosechador) ||
      (await obtenerTrabajador(ultima.cosechador_dni))?.nombre
    : null

  configuracionLectura.classList.add('oculto')
  sesionLecturaActiva.classList.remove('oculto')
  sesionJabero.textContent = sesion.jabero
  sesionLote.textContent = sesion.lote_codigo
  sesionVariedad.textContent = sesion.variedad
  totalSesion.textContent = total
  mostrarContadorCosechador(nombre, cantidad, {
    etiquetaCosechador,
    totalCosechador
  })
  mensajeModuloLectura.textContent = ''
  mensajeModuloLectura.className = 'resultado oculto'
  ticketLectura.value = ''
  ticketLectura.focus()
}
