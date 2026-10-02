function esHojaReporteScc_(nombreHoja) {
  return [
    'RESUMEN',
    'RANKING',
    'PRODUCCION_DIARIA',
    'PRODUCCION_LOTES'
  ].indexOf(String(nombreHoja == null ? '' : nombreHoja).trim().toUpperCase()) >= 0;
}

function normalizarTextoReporteScc_(valor, campo) {
  var texto = String(valor == null ? '' : valor).trim();
  if (!texto) throw new Error('Respuesta inválida de ' + campo);
  return texto;
}

function normalizarEnteroReporteScc_(valor, campo) {
  var numero = Number(valor);
  if (!Number.isFinite(numero) || !Number.isInteger(numero) || numero < 0) {
    throw new Error('Respuesta inválida de ' + campo);
  }
  return numero;
}

function normalizarFechaCalendarioReporteScc_(valor, campo) {
  var texto = String(valor == null ? '' : valor).trim();
  var match = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new Error('Respuesta inválida de ' + campo);

  var anio = Number(match[1]);
  var mes = Number(match[2]);
  var dia = Number(match[3]);
  var bisiesto = anio % 4 === 0 && (anio % 100 !== 0 || anio % 400 === 0);
  var dias = [31, bisiesto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (mes < 1 || mes > 12 || dia < 1 || dia > dias[mes - 1]) {
    throw new Error('Respuesta inválida de ' + campo);
  }
  return texto;
}

function normalizarTimestampReporteScc_(valor, campo) {
  if (valor == null || valor === '') return null;
  var texto = String(valor).trim();
  if (!texto || !Number.isFinite(Date.parse(texto))) {
    throw new Error('Respuesta inválida de ' + campo);
  }
  return texto;
}

function convertirFechaCalendarioReporteParaHojaScc_(valor, parsearFecha, zonaHoraria) {
  var iso = normalizarFechaCalendarioReporteScc_(valor, 'fecha calendario');
  if (typeof parsearFecha !== 'function') {
    throw new Error('No se pudo convertir la fecha para Google Sheets');
  }
  return parsearFecha(iso, zonaHoraria, 'yyyy-MM-dd');
}

function convertirTimestampReporteParaHojaScc_(valor, crearFecha) {
  var timestamp = normalizarTimestampReporteScc_(valor, 'timestamp');
  if (timestamp == null) return '';
  if (typeof crearFecha !== 'function') {
    throw new Error('No se pudo convertir el timestamp para Google Sheets');
  }
  var fecha = crearFecha(timestamp);
  if (!fecha || typeof fecha.getTime !== 'function' || isNaN(fecha.getTime())) {
    throw new Error('No se pudo convertir el timestamp para Google Sheets');
  }
  return fecha;
}

function normalizarCampaniaObjetoReporteScc_(campania, requiereFechaInicio) {
  if (!campania || typeof campania !== 'object') {
    throw new Error('Respuesta inválida de campaña');
  }
  var normalizada = {
    id: normalizarTextoReporteScc_(campania.id, 'campaña.id'),
    nombre: normalizarTextoReporteScc_(campania.nombre, 'campaña.nombre')
  };
  if (requiereFechaInicio) {
    normalizada.fechaInicio = normalizarFechaCalendarioReporteScc_(
      campania.fecha_inicio,
      'campaña.fecha_inicio'
    );
  }
  return normalizada;
}

function normalizarResumenReporteScc_(respuesta) {
  if (!respuesta || respuesta.ok !== true || !respuesta.resumen) {
    throw new Error('Respuesta inválida del resumen');
  }
  var resumen = respuesta.resumen;
  return {
    campania: normalizarCampaniaObjetoReporteScc_(respuesta.campania, true),
    zonaHoraria: normalizarTextoReporteScc_(respuesta.zona_horaria, 'zona_horaria'),
    resumen: {
      totalJabas: normalizarEnteroReporteScc_(resumen.total_jabas, 'total_jabas'),
      totalCosechadores: normalizarEnteroReporteScc_(
        resumen.total_cosechadores,
        'total_cosechadores'
      ),
      totalLotes: normalizarEnteroReporteScc_(resumen.total_lotes, 'total_lotes'),
      totalSesiones: normalizarEnteroReporteScc_(resumen.total_sesiones, 'total_sesiones'),
      diasConProduccion: normalizarEnteroReporteScc_(
        resumen.dias_con_produccion,
        'dias_con_produccion'
      ),
      ultimaLectura: normalizarTimestampReporteScc_(resumen.ultima_lectura, 'ultima_lectura')
    }
  };
}

function normalizarRankingReporteScc_(respuesta) {
  if (!respuesta || respuesta.ok !== true || !Array.isArray(respuesta.ranking)) {
    throw new Error('Respuesta inválida del ranking');
  }
  return {
    campania: normalizarTextoReporteScc_(respuesta.campania, 'campaña'),
    ranking: respuesta.ranking.map(function (fila) {
      if (!fila || typeof fila !== 'object') throw new Error('Respuesta inválida del ranking');
      return {
        posicion: normalizarEnteroReporteScc_(fila.posicion, 'posición'),
        cosechadorDni: normalizarTextoReporteScc_(fila.cosechador_dni, 'cosechador_dni'),
        cosechador: String(fila.cosechador == null ? '' : fila.cosechador).trim() || 'ASIGNAR NOMBRE',
        totalJabas: normalizarEnteroReporteScc_(fila.total_jabas, 'total_jabas'),
        ultimaLectura: normalizarTimestampReporteScc_(fila.ultima_lectura, 'ultima_lectura')
      };
    })
  };
}

function normalizarProduccionDiariaReporteScc_(respuesta) {
  if (!respuesta || respuesta.ok !== true || !Array.isArray(respuesta.produccion)) {
    throw new Error('Respuesta inválida de producción diaria');
  }
  return {
    campania: normalizarCampaniaObjetoReporteScc_(respuesta.campania, false),
    zonaHoraria: normalizarTextoReporteScc_(respuesta.zona_horaria, 'zona_horaria'),
    produccion: respuesta.produccion.map(function (fila) {
      if (!fila || typeof fila !== 'object') {
        throw new Error('Respuesta inválida de producción diaria');
      }
      return {
        fecha: normalizarFechaCalendarioReporteScc_(fila.fecha, 'fecha'),
        totalJabas: normalizarEnteroReporteScc_(fila.total_jabas, 'total_jabas'),
        totalCosechadores: normalizarEnteroReporteScc_(
          fila.total_cosechadores,
          'total_cosechadores'
        ),
        totalSesiones: normalizarEnteroReporteScc_(fila.total_sesiones, 'total_sesiones')
      };
    })
  };
}

function normalizarProduccionLotesReporteScc_(respuesta) {
  if (!respuesta || respuesta.ok !== true || !Array.isArray(respuesta.produccion)) {
    throw new Error('Respuesta inválida de producción por lotes');
  }
  return {
    campania: normalizarCampaniaObjetoReporteScc_(respuesta.campania, false),
    produccion: respuesta.produccion.map(function (fila) {
      if (!fila || typeof fila !== 'object') {
        throw new Error('Respuesta inválida de producción por lotes');
      }
      return {
        loteId: normalizarTextoReporteScc_(fila.lote_id, 'lote_id'),
        loteCodigo: normalizarTextoReporteScc_(fila.lote_codigo, 'lote_codigo'),
        loteNombre: fila.lote_nombre == null ? '' : String(fila.lote_nombre).trim(),
        variedad: normalizarTextoReporteScc_(fila.variedad, 'variedad'),
        totalJabas: normalizarEnteroReporteScc_(fila.total_jabas, 'total_jabas'),
        totalCosechadores: normalizarEnteroReporteScc_(
          fila.total_cosechadores,
          'total_cosechadores'
        ),
        totalSesiones: normalizarEnteroReporteScc_(fila.total_sesiones, 'total_sesiones'),
        ultimaLectura: normalizarTimestampReporteScc_(fila.ultima_lectura, 'ultima_lectura')
      };
    })
  };
}

function crearPayloadResumenReporteScc_(zonaHoraria) {
  return { p_zona_horaria: normalizarTextoReporteScc_(zonaHoraria, 'zona horaria') };
}

function crearPayloadProduccionDiariaReporteScc_(zonaHoraria) {
  return { p_zona_horaria: normalizarTextoReporteScc_(zonaHoraria, 'zona horaria') };
}

function ejecutarActualizacionReportesScc_(definiciones) {
  return definiciones.map(function (reporte) {
    try {
      var respuesta = reporte.consultar();
      var normalizado = reporte.normalizar(respuesta);
      reporte.escribir(normalizado);
      return { nombre: reporte.nombre, ok: true, error: '' };
    } catch (error) {
      return {
        nombre: reporte.nombre,
        ok: false,
        error: error && error.message ? error.message : 'Error desconocido'
      };
    }
  });
}

function formatearResultadoActualizacionReportesScc_(resultados) {
  return resultados.map(function (resultado) {
    return resultado.nombre + ': ' + (
      resultado.ok ? 'OK' : 'ERROR - ' + resultado.error
    );
  }).join('\n');
}
