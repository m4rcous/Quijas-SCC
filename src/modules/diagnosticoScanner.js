export const VERSION_LECTOR = 'L3'

// Conservar la estructura del texto y sus controles, nunca los dígitos del DNI
// o del ticket. JSON.stringify distinguirá CR real (\r) de texto literal (\\r).
function ocultarDigitos(valor) {
  return String(valor ?? '').replace(/\p{N}/gu, '#')
}

export function describirValorScanner(valor) {
  const texto = String(valor ?? '')
  const normalizado = texto.trim()
  return {
    caracteres: texto.length,
    digitos: (texto.match(/[0-9]/g) ?? []).length,
    caracteresTrasTrim: normalizado.length,
    dniValido: /^\d{8}$/.test(normalizado),
    muestra: ocultarDigitos(texto).slice(0, 100),
    extras: [...new Set([...texto].filter((letra) => !/[0-9]/.test(letra)))]
      .slice(0, 20)
      .map((letra) => ({
        caracter: ocultarDigitos(letra),
        codigo: `U+${letra.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`
      }))
  }
}

export function crearRegistroScanner(campo, reloj = () => performance.now()) {
  let inicio = reloj()
  let eventos = []
  let ultimaValidacion = null

  return {
    registrar(tipo, valor, event = {}) {
      const entrada = {
        ms: Math.round(reloj() - inicio),
        tipo,
        valor: describirValorScanner(valor)
      }
      if (event.key !== undefined) entrada.key = ocultarDigitos(event.key)
      if (event.code !== undefined) {
        entrada.code = /^(Digit|Numpad)\d$/.test(event.code)
          ? event.code.replace(/\d/g, '#')
          : event.code
      }
      // Los códigos de teclas numéricas también revelan el dígito escaneado.
      if (event.keyCode !== undefined) {
        entrada.keyCode = [0, 13, 229].includes(event.keyCode)
          ? event.keyCode
          : 'omitido'
      }
      if (event.inputType !== undefined) entrada.inputType = event.inputType
      if (event.data !== undefined) {
        entrada.data =
          event.data === null ? null : ocultarDigitos(event.data).slice(0, 100)
      }
      if (event.isComposing !== undefined) entrada.componiendo = event.isComposing
      if (event.repeat !== undefined) entrada.repetido = event.repeat
      eventos.push(entrada)
      eventos = eventos.slice(-80)
      if (tipo === 'procesar') ultimaValidacion = entrada
    },
    obtener() {
      return { version: VERSION_LECTOR, campo, ultimaValidacion, eventos: [...eventos] }
    },
    limpiar() {
      eventos = []
      ultimaValidacion = null
      inicio = reloj()
    }
  }
}

export function configurarDiagnosticoScanner(formulario, input) {
  const registro = crearRegistroScanner(input.id)
  const doc = input.ownerDocument
  // El registro también funciona en pruebas sin DOM.
  if (!doc) return registro

  const detalles = doc.createElement('details')
  detalles.className = 'diagnostico-lector'
  const titulo = doc.createElement('summary')
  titulo.textContent = `Revisar lectura · ${VERSION_LECTOR}`
  const instrucciones = doc.createElement('p')
  instrucciones.textContent =
    'Escanee en el campo de arriba. Si falla, copie este diagnóstico. Los dígitos están ocultos y el registro solo permanece en esta pantalla.'
  const resumen = doc.createElement('p')
  resumen.className = 'diagnostico-lector__resumen'
  const texto = doc.createElement('textarea')
  texto.readOnly = true
  texto.rows = 9
  texto.spellcheck = false
  texto.setAttribute('aria-label', 'Diagnóstico del lector sin dígitos personales')
  const copiar = doc.createElement('button')
  copiar.type = 'button'
  copiar.className = 'btn-secondary btn-compacto'
  copiar.textContent = 'Copiar diagnóstico'
  const estado = doc.createElement('p')
  estado.setAttribute('role', 'status')

  function actualizar() {
    if (!detalles.open) return
    const datos = registro.obtener()
    const valor = datos.ultimaValidacion?.valor
    resumen.textContent = valor
      ? `Al procesar: ${valor.caracteresTrasTrim} caracteres después de trim; ${valor.digitos} dígitos. DNI ${valor.dniValido ? 'válido' : 'inválido'}.`
      : 'Todavía no se recibió un envío. El registro incluye los eventos del campo.'
    texto.value = JSON.stringify(datos, null, 2)
  }

  const registrar = registro.registrar.bind(registro)
  registro.registrar = (...args) => {
    registrar(...args)
    // No modificar el DOM por cada dígito durante el escaneo.
    if (args[0] === 'procesar') actualizar()
  }

  for (const tipo of [
    'focus',
    'blur',
    'keydown',
    'keyup',
    'beforeinput',
    'input',
    'change',
    'compositionstart',
    'compositionend'
  ]) {
    input.addEventListener(tipo, (event) => registrar(tipo, input.value, event), true)
  }
  formulario.addEventListener(
    'submit',
    (event) => registrar('submit', input.value, event),
    true
  )
  detalles.addEventListener('toggle', actualizar)
  copiar.addEventListener('click', async () => {
    actualizar()
    try {
      await doc.defaultView.navigator.clipboard.writeText(texto.value)
      estado.textContent = 'Diagnóstico copiado.'
    } catch {
      texto.focus()
      texto.select()
      estado.textContent = 'Mantenga pulsado el texto seleccionado y elija Copiar.'
    }
  })
  detalles.append(titulo, instrucciones, resumen, texto, copiar, estado)
  formulario.insertAdjacentElement('afterend', detalles)
  return registro
}
