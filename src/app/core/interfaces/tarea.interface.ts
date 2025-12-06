/**
 * Interface Tarea (Task) - Coincide con Task.php jsonSerialize()
 */
export interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  prioridad: PrioridadTarea;
  actividad_id: number;
  categoria_id: number;
  subcategoria_id: number | null;
  creado_por_usuario_id: number;
  fecha_inicio_programada: string;
  fecha_fin_programada: string;
  estado: EstadoTarea;
  created_at: string;
  updated_at: string;
}

/**
 * Estados posibles de una tarea (backend)
 */
export type EstadoTarea = 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';

/**
 * Prioridades de tarea (backend usa minúsculas)
 */
export type PrioridadTarea = 'baja' | 'media' | 'alta' | 'urgente' | 'BAJA' | 'MEDIA' | 'ALTA';

/**
 * DTO para crear una nueva tarea
 */
export interface CrearTareaRequest {
  titulo: string;
  descripcion?: string;
  prioridad?: PrioridadTarea;
  actividad_id?: number;
  categoria_id?: number;
  subcategoria_id?: number;
  fecha_inicio_programada?: string;
  fecha_fin_programada?: string;
  // Campos alternativos usados por el frontend
  fecha_programada?: string;
  usuarios_id?: number;
  actividades_id?: number;
}

/**
 * DTO para actualizar una tarea existente
 */
export interface ActualizarTareaRequest {
  titulo?: string;
  descripcion?: string;
  prioridad?: PrioridadTarea;
  actividad_id?: number;
  categoria_id?: number;
  subcategoria_id?: number;
  fecha_inicio_programada?: string;
  fecha_fin_programada?: string;
  estado?: EstadoTarea;
}

/**
 * Resumen de tareas para dashboard
 */
export interface ResumenTareas {
  total: number;
  pendientes: number;
  en_progreso: number;
  completadas: number;
  canceladas: number;
}

// ============================================
// INTERFACES DE UI - Para uso en componentes
// ============================================

/**
 * Estados de UI para mostrar en la interfaz
 */
export type EstadoTareaUI = 'Pendiente' | 'En progreso' | 'Pausada' | 'Completada' | 'Cerrada' | 'Activo' | 'Inactiva';

/**
 * Prioridades de UI
 */
export type PrioridadTareaUI = 'Baja' | 'Media' | 'Alta';

/**
 * Tarea adaptada para mostrar en UI
 */
export interface TareaUI {
  id: string;
  titulo: string;
  descripcion: string;
  completada: boolean;
  progreso: number;
  estado: EstadoTareaUI;
  estadodetarea: 'Activo' | 'Inactiva';
  totalSubtareas: number;
  subtareasCompletadas: number;
  fechaAsignacion: string;
  fechaAsignacionTimestamp?: number;
  fechaVencimiento?: string;
  Categoria: string;
  Subcategoria?: string;
  horainicio: string;
  horafin: string;
  Prioridad?: PrioridadTareaUI;
  usuarioasignado?: string;
  // IDs originales para referencia
  categoria_id?: number;
  subcategoria_id?: number;
}

/**
 * Resumen de tareas para UI
 */
export interface ResumenTareasUI {
  totalTareas: number;
  tareasCompletadas: number;
  tareasEnProgreso: number;
  porcentajeAvance: number;
}

/**
 * Filtros de tareas para UI
 */
export interface FiltrosTareas {
  categoria?: string;
  prioridad?: string;
  estado?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

/**
 * Día de la semana para el calendario
 */
export interface DiaSemana {
  fecha: Date;
  habilitado: boolean;
}

// ============================================
// HELPERS DE CONVERSIÓN
// ============================================

/**
 * Convierte el estado del backend al formato de UI
 * El backend puede devolver: 'Pendiente', 'En Progreso', 'Completada', 'pendiente', 'en_progreso', etc.
 */
export function mapearEstadoAUI(estado: string | EstadoTarea): EstadoTareaUI {
  if (!estado) return 'Pendiente';
  
  const estadoNormalizado = estado.toLowerCase().replace(/\s+/g, '_');
  
  const mapa: Record<string, EstadoTareaUI> = {
    'pendiente': 'Pendiente',
    'en_progreso': 'En progreso',
    'en progreso': 'En progreso',
    'pausada': 'Pausada',
    'completada': 'Completada',
    'cancelada': 'Cerrada',
    'cerrada': 'Cerrada'
  };
  return mapa[estadoNormalizado] || 'Pendiente';
}

/**
 * Convierte el estado de UI al formato del backend
 */
export function mapearEstadoABackend(estado: EstadoTareaUI): EstadoTarea {
  const mapa: Record<string, EstadoTarea> = {
    'Pendiente': 'pendiente',
    'En progreso': 'en_progreso',
    'Pausada': 'pendiente', // Pausada se mapea a pendiente en backend (o crear nuevo estado)
    'Completada': 'completada',
    'Cerrada': 'cancelada',
    'Activo': 'pendiente',
    'Inactiva': 'cancelada'
  };
  return mapa[estado] || 'pendiente';
}

/**
 * Convierte hora de 24h a 12h con AM/PM
 */
function formatearHora12h(hora24: string): string {
  if (!hora24) return '';
  const [horaStr, minutos] = hora24.split(':');
  let hora = parseInt(horaStr, 10);
  const periodo = hora >= 12 ? 'PM' : 'AM';
  hora = hora % 12 || 12; // Convierte 0 a 12 y 13-23 a 1-11
  return `${hora}:${minutos} ${periodo}`;
}

/**
 * Formatea fecha corta: "05 Dic 2025"
 */
function formatearFechaCorta(fechaStr: string): string {
  if (!fechaStr) return '';
  
  const mesesCortos = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                       'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  const soloFecha = fechaStr.split(' ')[0];
  const [year, month, day] = soloFecha.split('-');
  
  const mesNombre = mesesCortos[parseInt(month, 10) - 1] || month;
  return `${parseInt(day, 10)} ${mesNombre} ${year}`;
}

/**
 * Formatea fecha completa: "04 de Diciembre, 2025"
 */
function formatearFechaCompleta(fechaStr: string): string {
  if (!fechaStr) return '';
  
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  // Puede venir como "2025-12-04" o "2025-12-04 10:00:00"
  const soloFecha = fechaStr.split(' ')[0];
  const [year, month, day] = soloFecha.split('-');
  
  const mesNombre = meses[parseInt(month, 10) - 1] || month;
  return `${parseInt(day, 10)} de ${mesNombre}, ${year}`;
}

/**
 * Convierte una Tarea del backend a TareaUI para mostrar
 */
export function tareaAUI(tarea: Tarea, categoriaNombre?: string, subcategoriaNombre?: string): TareaUI {
  // Extraer fecha y hora de inicio/fin (formato: "2025-12-04 10:00:00")
  let horaInicio = 'Sin fecha inicio';
  let horaFin = 'Sin fecha fin';
  let fechaFormateada = '';
  
  if (tarea.fecha_inicio_programada) {
    const partes = tarea.fecha_inicio_programada.split(' ');
    const fechaCorta = formatearFechaCorta(tarea.fecha_inicio_programada);
    if (partes.length > 1) {
      const hora12h = formatearHora12h(partes[1].substring(0, 5));
      horaInicio = `${fechaCorta}, ${hora12h}`; // "05 Dic 2025, 10:00 AM"
    } else {
      horaInicio = fechaCorta;
    }
    // Formatear fecha completa para fechaAsignacion
    fechaFormateada = formatearFechaCompleta(tarea.fecha_inicio_programada);
  }
  
  if (tarea.fecha_fin_programada) {
    const partes = tarea.fecha_fin_programada.split(' ');
    const fechaCorta = formatearFechaCorta(tarea.fecha_fin_programada);
    if (partes.length > 1) {
      const hora12h = formatearHora12h(partes[1].substring(0, 5));
      horaFin = `${fechaCorta}, ${hora12h}`; // "05 Dic 2025, 5:00 PM"
    } else {
      horaFin = fechaCorta;
    }
  }

  // Mapear prioridad a formato UI
  let prioridadUI: PrioridadTareaUI | undefined;
  if (tarea.prioridad) {
    const prioridadLower = tarea.prioridad.toLowerCase();
    if (prioridadLower === 'alta' || prioridadLower === 'urgente') {
      prioridadUI = 'Alta';
    } else if (prioridadLower === 'media') {
      prioridadUI = 'Media';
    } else {
      prioridadUI = 'Baja';
    }
  }

  // Normalizar estado para comparación
  const estadoStr = String(tarea.estado || 'Pendiente');
  const estadoLower = estadoStr.toLowerCase();
  const esCompletada = estadoLower === 'completada';
  const esEnProgreso = estadoLower === 'en progreso' || estadoLower === 'en_progreso';
  const esCancelada = estadoLower === 'cancelada' || estadoLower === 'cerrada';

  return {
    id: String(tarea.id),
    titulo: tarea.titulo || '',
    descripcion: tarea.descripcion || '',
    completada: esCompletada,
    progreso: esCompletada ? 100 : (esEnProgreso ? 50 : 0),
    estado: mapearEstadoAUI(estadoStr),
    estadodetarea: esCancelada ? 'Inactiva' : 'Activo',
    totalSubtareas: 0,
    subtareasCompletadas: 0,
    fechaAsignacion: fechaFormateada || tarea.fecha_inicio_programada,
    fechaAsignacionTimestamp: tarea.fecha_inicio_programada ? new Date(tarea.fecha_inicio_programada).getTime() : undefined,
    fechaVencimiento: tarea.fecha_fin_programada,
    Categoria: categoriaNombre || 'Sin categoría',
    Subcategoria: subcategoriaNombre || 'Sin subcategoría',
    horainicio: horaInicio,
    horafin: horaFin,
    Prioridad: prioridadUI,
    usuarioasignado: tarea.creado_por_usuario_id ? `Usuario #${tarea.creado_por_usuario_id}` : undefined,
    categoria_id: tarea.categoria_id,
    subcategoria_id: tarea.subcategoria_id ?? undefined
  };
}

// ============================================
// INTERFACES DE HISTORIAL DE TAREAS
// ============================================

/**
 * Tipos de acción en el historial
 */
export type AccionHistorial = 'CREADA' | 'ASIGNADA' | 'EN_PROGRESO' | 'COMPLETADA' | 'PAUSADA' | 'REABIERTA' | 'EDITADA' | 'COMENTARIO';

/**
 * Registro del historial de una tarea
 */
export interface HistorialTarea {
  id: number;
  tarea_id: number;
  usuario_id: number;
  accion: AccionHistorial;
  comentario: string | null;
  fecha_accion: string;
  usuario_nombre: string;
}

/**
 * Comentario de completado de una tarea
 */
export interface ComentarioCompletado {
  id: number;
  comentario: string | null;
  fecha_accion: string;
  usuario_nombre: string;
}
