export function normalizarValorScanner(valor) {
  return String(valor ?? '').trim()
}

export function esDniValido(dni) {
  return /^\d{8}$/.test(dni)
}

export function configurarEnvioScanner(formulario, input, procesar) {
  let pendiente = false
  let operacionActual = null

  function enviar(event) {
    event.preventDefault()
    if (pendiente || operacionActual || input.disabled) return
    pendiente = true
    // Dejar que el PDA complete los eventos de escritura antes de leer el DOM.
    setTimeout(async () => {
      pendiente = false
      if (input.disabled) return
      const operacion = {}
      operacionActual = operacion
      // Algunos flujos permiten otro escaneo después del guardado local,
      // mientras la sincronización anterior continúa en segundo plano.
      const liberar = () => {
        if (operacionActual === operacion) operacionActual = null
      }
      try {
        await procesar(normalizarValorScanner(input.value), liberar)
      } finally {
        liberar()
      }
    }, 0)
  }

  input.addEventListener('keydown', (event) => {
    // Enter es el terminador habitual del keyboard wedge; CR/LF son variantes
    // explícitas para lectores que los exponen como event.key.
    if (!['Enter', '\r', '\n'].includes(event.key) || event.isComposing) return
    event.preventDefault()
    if (!event.repeat) enviar(event)
  })
  formulario.addEventListener('submit', enviar)
}
