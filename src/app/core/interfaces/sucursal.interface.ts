/**
 * Interface Sucursal - Coincide con Sucursal.php jsonSerialize()
 */
export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
}

/**
 * DTO para crear una nueva sucursal
 */
export interface CrearSucursalRequest {
  nombre: string;
  direccion: string;
}

/**
 * DTO para actualizar una sucursal existente
 */
export interface ActualizarSucursalRequest {
  nombre?: string;
  direccion?: string;
}
