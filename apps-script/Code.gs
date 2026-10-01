function onOpen() {
  crearMenuScc_();
  try {
    configurarHojaTrabajadores_();
  } catch (error) {
    Logger.log('No se pudo configurar TRABAJADORES al abrir: %s', error.message);
  }
  try {
    configurarHojaCampanias_();
  } catch (error) {
    Logger.log('No se pudo configurar CAMPANIAS al abrir: %s', error.message);
  }
  try {
    configurarHojaVariedades_();
  } catch (error) {
    Logger.log('No se pudo configurar VARIEDADES al abrir: %s', error.message);
  }
}

function onEdit(e) {
  marcarEdicionTrabajadores_(e);
  marcarEdicionCampanias_(e);
  marcarEdicionVariedades_(e);
}
