/**
 * Interface Categoria - Coincide con Categoria.php jsonSerialize()
 * Soporta ambos formatos: nuevo (id, nombre) y legacy (categorias_id, categorias_nombre)
 */
export interface Categoria {
  // Formato nuevo
  id: number;
  nombre: string;
  
  // Formato legacy (usado en algunos templates)
  categorias_id?: number;
  categorias_nombre?: string;
  categoria_id?: number;
  categoria_nombre?: string;
}

/**
 * DTO para crear una nueva categoría
 */
export interface CrearCategoriaRequest {
  nombre: string;
}

/**
 * DTO para actualizar una categoría existente
 */
export interface ActualizarCategoriaRequest {
  nombre?: string;
}
