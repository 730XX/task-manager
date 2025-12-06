/**
 * Interface Actividad - Coincide con Actividad.php jsonSerialize()
 * Soporta ambos formatos: el nuevo (id, nombre) y el legacy (actividades_id, actividades_titulo)
 */
export interface Actividad {
  // Formato nuevo (Actividad.php jsonSerialize)
  id: number;
  nombre: string;
  sucursal_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string;
  
  // Formato legacy del backend (usado en templates existentes)
  actividades_id?: number;
  actividades_titulo?: string;
  actividades_descripcion?: string;
  actividades_estado?: string;
  actividades_creado?: string;
  actividades_sucursal?: number;
  actividades_fecha_programada?: string;
  actividades_hora_inicio?: string;
  actividades_hora_fin?: string;
  
  // Campos adicionales para filtros (nombre de sucursal y categoría como string)
  sucursal?: string;
  categoria?: string;
  
  // Campos adicionales calculados (pueden venir del backend en queries con JOINs)
  total_tareas?: number;
  tareas_completadas?: number;
  tareas_pendientes?: number;
  progreso_porcentaje?: number;
}

/**
 * DTO para crear una nueva actividad
 */
export interface CrearActividadRequest {
  nombre: string;
  sucursal_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion?: string;
  // Campos adicionales usados por el frontend (pueden no existir en el backend aún)
  titulo?: string;
  estado?: 'ACTIVA' | 'PAUSADA' | 'COMPLETADA' | 'PENDIENTE' | 'EN_PROGRESO';
  sucursal?: string;
  fecha_programada?: string;
  hora_inicio?: string;
  hora_fin?: string;
}

/**
 * DTO para actualizar una actividad existente
 */
export interface ActualizarActividadRequest {
  nombre?: string;
  sucursal_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  descripcion?: string;
}
