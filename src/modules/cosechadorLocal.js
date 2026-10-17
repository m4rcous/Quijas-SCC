import { casosDeUso } from '../application/casosDeUso.js'
export { nombreCosechadorVisible } from '../contexts/workforce/index.js'

export async function buscarCosechadorLocal(dni, opciones) {
  return casosDeUso.buscarCosechadorLocal(dni, opciones)
}
