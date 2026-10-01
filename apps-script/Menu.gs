function crearMenuScc_() {
  SpreadsheetApp.getUi()
    .createMenu('SCC')
    .addItem('Sincronizar datos', 'menuSincronizarDatos')
    .addItem('Actualizar desde sistema', 'menuActualizarDesdeSistema')
    .addToUi();
}

function menuSincronizarDatos() {
  var ui = SpreadsheetApp.getUi();
  try {
    var resultado = sincronizarTrabajadores_();
    ui.alert(
      resultado.errores
        ? 'Se procesaron ' + resultado.procesadas + ' filas; ' + resultado.errores + ' quedaron con error.'
        : 'Sincronización completada. Filas procesadas: ' + resultado.procesadas + '.'
    );
  } catch (error) {
    ui.alert(error.message || 'No se pudo sincronizar la hoja.');
  }
}

function menuActualizarDesdeSistema() {
  var ui = SpreadsheetApp.getUi();
  try {
    var total = actualizarTrabajadoresDesdeSistema_();
    ui.alert('TRABAJADORES actualizado desde el sistema. Registros: ' + total + '.');
  } catch (error) {
    ui.alert(error.message || 'No se pudo actualizar desde el sistema.');
  }
}
