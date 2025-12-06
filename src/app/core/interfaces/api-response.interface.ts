/**
 * Estructura de respuesta estándar del backend PHP
 * Coincide con ResponseHelper.php
 */
export interface ApiResponse<T = any> {
  tipo: TipoRespuesta;
  mensajes: string[];
  data: T;
}

/**
 * Tipos de respuesta del backend
 * TIPO_SUCCESS = 1, TIPO_WARNING = 2, TIPO_ERROR = 3
 */
export enum TipoRespuesta {
  SUCCESS = 1,
  WARNING = 2,
  ERROR = 3
}

/**
 * Helper para verificar si la respuesta fue exitosa
 */
export function isSuccess(response: ApiResponse): boolean {
  return response.tipo === TipoRespuesta.SUCCESS;
}

/**
 * Helper para verificar si la respuesta fue una advertencia
 */
export function isWarning(response: ApiResponse): boolean {
  return response.tipo === TipoRespuesta.WARNING;
}

/**
 * Helper para verificar si la respuesta fue un error
 */
export function isError(response: ApiResponse): boolean {
  return response.tipo === TipoRespuesta.ERROR;
}
