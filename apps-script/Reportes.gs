var SCC_ENCABEZADOS_RANKING = ['Posición', 'DNI', 'Cosechador', 'Jabas', 'Última lectura'];
var SCC_ENCABEZADOS_PRODUCCION_DIARIA = ['Fecha', 'Jabas', 'Cosechadores', 'Sesiones'];
var SCC_ENCABEZADOS_PRODUCCION_LOTES = [
  'Lote',
  'Nombre',
  'Variedad',
  'Jabas',
  'Cosechadores',
  'Sesiones',
  'Última lectura'
];

function configurarHojasReportes_() {
  configurarHojaResumen_();
  configurarHojaTablaReporte_(
    SCC_CONFIG.hojaRanking,
    SCC_ENCABEZADOS_RANKING,
    [80, 100, 240, 90, 160]
  );
  configurarHojaTablaReporte_(
    SCC_CONFIG.hojaProduccionDiaria,
    SCC_ENCABEZADOS_PRODUCCION_DIARIA,
    [110, 90, 120, 100]
  );
  configurarHojaTablaReporte_(
    SCC_CONFIG.hojaProduccionLotes,
    SCC_ENCABEZADOS_PRODUCCION_LOTES,
    [110, 180, 180, 90, 120, 100, 160]
  );
}

function obtenerOCrearHojaReporte_(nombre) {
  var libro = SpreadsheetApp.getActiveSpreadsheet();
  return libro.getSheetByName(nombre) || libro.insertSheet(nombre);
}

function protegerHojaReporte_(hoja) {
  var descripcion = 'SCC - reporte generado - ' + hoja.getName();
  var proteccion = hoja.getProtections(SpreadsheetApp.ProtectionType.SHEET)
    .filter(function (item) { return item.getDescription() === descripcion; })[0];
  if (!proteccion) {
    proteccion = hoja.protect().setDescription(descripcion);
  }
  if (proteccion.canDomainEdit()) proteccion.setDomainEdit(false);
}

function configurarHojaResumen_() {
  var hoja = obtenerOCrearHojaReporte_(SCC_CONFIG.hojaResumen);
  hoja.getRange('A1').setValue('Resumen de campaña').setFontWeight('bold');
  hoja.setColumnWidth(1, 220);
  hoja.setColumnWidth(2, 220);
  protegerHojaReporte_(hoja);
  return hoja;
}

function configurarHojaTablaReporte_(nombre, encabezados, anchos) {
  var hoja = obtenerOCrearHojaReporte_(nombre);
  hoja.getRange(1, 1, 1, encabezados.length)
    .setValues([encabezados])
    .setFontWeight('bold');
  hoja.setFrozenRows(1);
  anchos.forEach(function (ancho, indice) {
    hoja.setColumnWidth(indice + 1, ancho);
  });
  protegerHojaReporte_(hoja);
  return hoja;
}

function parsearFechaCalendarioReporteDesdePostgres_(valor) {
  var zonaHoraria = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
  return convertirFechaCalendarioReporteParaHojaScc_(
    valor,
    function (texto, zona, formato) {
      return Utilities.parseDate(texto, zona, formato);
    },
    zonaHoraria
  );
}

function parsearTimestampReporteDesdePostgres_(valor) {
  return convertirTimestampReporteParaHojaScc_(valor, function (texto) {
    return new Date(texto);
  });
}

function limpiarContenidoReporte_(hoja) {
  var filtro = hoja.getFilter();
  if (filtro) filtro.remove();
  hoja.getDataRange().clearContent();
}

function escribirResumenReporte_(reporte) {
  var hoja = configurarHojaResumen_();
  limpiarContenidoReporte_(hoja);

  hoja.getRange(1, 1, 13, 2).setValues([
    ['Resumen de campaña', ''],
    ['', ''],
    ['Campaña', reporte.campania.nombre],
    ['Fecha inicio', parsearFechaCalendarioReporteDesdePostgres_(reporte.campania.fechaInicio)],
    ['', ''],
    ['Total de jabas', reporte.resumen.totalJabas],
    ['Cosechadores con producción', reporte.resumen.totalCosechadores],
    ['Lotes con producción', reporte.resumen.totalLotes],
    ['Sesiones', reporte.resumen.totalSesiones],
    ['Días con producción', reporte.resumen.diasConProduccion],
    ['Última actividad', parsearTimestampReporteDesdePostgres_(reporte.resumen.ultimaLectura)],
    ['', ''],
    ['Última actualización', new Date()]
  ]);
  hoja.getRange('A1').setFontWeight('bold');
  hoja.getRange('A3:A13').setFontWeight('bold');
  hoja.getRange('B4').setNumberFormat('dd/MM/yyyy');
  hoja.getRange('B6:B10').setNumberFormat('0');
  hoja.getRange('B11').setNumberFormat('dd/MM/yyyy HH:mm');
  hoja.getRange('B13').setNumberFormat('dd/MM/yyyy HH:mm');
}

function escribirRankingReporte_(reporte) {
  var hoja = configurarHojaTablaReporte_(
    SCC_CONFIG.hojaRanking,
    SCC_ENCABEZADOS_RANKING,
    [80, 100, 240, 90, 160]
  );
  limpiarContenidoReporte_(hoja);
  hoja.getRange(1, 1, 1, SCC_ENCABEZADOS_RANKING.length)
    .setValues([SCC_ENCABEZADOS_RANKING])
    .setFontWeight('bold');

  if (!reporte.ranking.length) {
    hoja.getRange(2, 1).setValue('Sin producción registrada');
    return;
  }

  var valores = reporte.ranking.map(function (fila) {
    return [
      fila.posicion,
      fila.cosechadorDni,
      fila.cosechador,
      fila.totalJabas,
      parsearTimestampReporteDesdePostgres_(fila.ultimaLectura)
    ];
  });
  hoja.getRange(2, 1, valores.length, 5).setValues(valores);
  hoja.getRange(2, 1, valores.length, 1).setNumberFormat('0');
  hoja.getRange(2, 4, valores.length, 1).setNumberFormat('0');
  hoja.getRange(2, 5, valores.length, 1).setNumberFormat('dd/MM/yyyy HH:mm');
  hoja.getRange(1, 1, valores.length + 1, 5).createFilter();
}

function escribirProduccionDiariaReporte_(reporte) {
  var hoja = configurarHojaTablaReporte_(
    SCC_CONFIG.hojaProduccionDiaria,
    SCC_ENCABEZADOS_PRODUCCION_DIARIA,
    [110, 90, 120, 100]
  );
  limpiarContenidoReporte_(hoja);
  hoja.getRange(1, 1, 1, SCC_ENCABEZADOS_PRODUCCION_DIARIA.length)
    .setValues([SCC_ENCABEZADOS_PRODUCCION_DIARIA])
    .setFontWeight('bold');

  if (!reporte.produccion.length) return;

  var valores = reporte.produccion.map(function (fila) {
    return [
      parsearFechaCalendarioReporteDesdePostgres_(fila.fecha),
      fila.totalJabas,
      fila.totalCosechadores,
      fila.totalSesiones
    ];
  });
  hoja.getRange(2, 1, valores.length, 4).setValues(valores);
  hoja.getRange(2, 1, valores.length, 1).setNumberFormat('dd/MM/yyyy');
  hoja.getRange(2, 2, valores.length, 3).setNumberFormat('0');
  hoja.getRange(1, 1, valores.length + 1, 4).createFilter();
}

function escribirProduccionLotesReporte_(reporte) {
  var hoja = configurarHojaTablaReporte_(
    SCC_CONFIG.hojaProduccionLotes,
    SCC_ENCABEZADOS_PRODUCCION_LOTES,
    [110, 180, 180, 90, 120, 100, 160]
  );
  limpiarContenidoReporte_(hoja);
  hoja.getRange(1, 1, 1, SCC_ENCABEZADOS_PRODUCCION_LOTES.length)
    .setValues([SCC_ENCABEZADOS_PRODUCCION_LOTES])
    .setFontWeight('bold');

  if (!reporte.produccion.length) return;

  var valores = reporte.produccion.map(function (fila) {
    return [
      fila.loteCodigo,
      fila.loteNombre,
      fila.variedad,
      fila.totalJabas,
      fila.totalCosechadores,
      fila.totalSesiones,
      parsearTimestampReporteDesdePostgres_(fila.ultimaLectura)
    ];
  });
  hoja.getRange(2, 1, valores.length, 7).setValues(valores);
  hoja.getRange(2, 4, valores.length, 3).setNumberFormat('0');
  hoja.getRange(2, 7, valores.length, 1).setNumberFormat('dd/MM/yyyy HH:mm');
  hoja.getRange(1, 1, valores.length + 1, 7).createFilter();
}

function actualizarReportes_() {
  var zonaHoraria = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
  return ejecutarActualizacionReportesScc_([
    {
      nombre: 'RESUMEN',
      consultar: function () {
        return llamarRpcSupabase_(
          'admin_obtener_resumen_campania',
          crearPayloadResumenReporteScc_(zonaHoraria)
        );
      },
      normalizar: normalizarResumenReporteScc_,
      escribir: escribirResumenReporte_
    },
    {
      nombre: 'RANKING',
      consultar: function () {
        return llamarRpcSupabase_('admin_obtener_ranking_cosechadores', {});
      },
      normalizar: normalizarRankingReporteScc_,
      escribir: escribirRankingReporte_
    },
    {
      nombre: 'PRODUCCION_DIARIA',
      consultar: function () {
        return llamarRpcSupabase_(
          'admin_obtener_produccion_diaria',
          crearPayloadProduccionDiariaReporteScc_(zonaHoraria)
        );
      },
      normalizar: normalizarProduccionDiariaReporteScc_,
      escribir: escribirProduccionDiariaReporte_
    },
    {
      nombre: 'PRODUCCION_LOTES',
      consultar: function () {
        return llamarRpcSupabase_('admin_obtener_produccion_lotes', {});
      },
      normalizar: normalizarProduccionLotesReporteScc_,
      escribir: escribirProduccionLotesReporte_
    }
  ]);
}
