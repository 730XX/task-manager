/**
 * Interface Cargo - Coincide con Cargo.php jsonSerialize()
 */
export interface Cargo {
  id: number;
  nombre: string;
}

/**
 * DTO para crear un nuevo cargo
 */
export interface CrearCargoRequest {
  nombre: string;
}

/**
 * DTO para actualizar un cargo existente
 */
export interface ActualizarCargoRequest {
  nombre?: string;
}
