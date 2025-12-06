/**
 * Interface Subcategoria - Coincide con Subcategoria.php jsonSerialize()
 */
export interface Subcategoria {
  id: number;
  categoria_id: number;
  nombre: string;
}

/**
 * DTO para crear una nueva subcategoría
 */
export interface CrearSubcategoriaRequest {
  categoria_id: number;
  nombre: string;
}
