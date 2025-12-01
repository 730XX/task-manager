// Interfaces para tipado
export interface TareaAdmin {
  id: string;
  titulo: string;
  estado: 'Pendiente' | 'En progreso' | 'Completada';
  fechaAsignacion: string;
  horaprogramada: string;
  Categoria: string;
  horainicio: string;
  horafin: string;
  sucursal: string;
  Tarea?: Tarea[]; // Array de subtareas
  // Propiedades calculadas automáticamente
  totalSubtareas: number;
  subtareasCompletadas: number;
}

// Clase que implementa la lógica de tareaadmin
export class TareaAdminClass implements TareaAdmin {
  id: string;
  titulo: string;
  estado: 'Pendiente' | 'En progreso' | 'Completada';
  fechaAsignacion: string;
  horaprogramada: string;
  Categoria: string;
  horainicio: string;
  horafin: string;
  sucursal: string;
  Tarea?: Tarea[];

  constructor(data: Partial<TareaAdmin>) {
    this.id = data.id || '';
    this.titulo = data.titulo || '';
    this.estado = data.estado || 'Pendiente';
    this.fechaAsignacion = data.fechaAsignacion || '';
    this.horaprogramada = data.horaprogramada || '';
    this.Categoria = data.Categoria || '';
    this.horainicio = data.horainicio || '';
    this.horafin = data.horafin || '';
    this.sucursal = data.sucursal || '';
    this.Tarea = data.Tarea || [];
  }

  get totalSubtareas(): number {
    return this.Tarea ? this.Tarea.length : 0;
  }

  get subtareasCompletadas(): number {
    return this.Tarea ? this.Tarea.filter(t => t.estado === 'Completada').length : 0;
  }

  get porcentajeProgreso(): number {
    if (!this.Tarea || this.Tarea.length === 0) return 0;
    return Math.round((this.subtareasCompletadas / this.totalSubtareas) * 100);
  }
}

export interface Tarea {
  id: string;
  titulo: string;
  completada: boolean;
  progreso: number; // 0-100
  estado: 'Pendiente' | 'En progreso' | 'Completada' | 'Cerrada' | 'Activo' | 'Inactiva';
  estadodetarea: 'Activo' | 'Inactiva';
  totalSubtareas: number;
  subtareasCompletadas: number;
  fechaAsignacion: string;
  fechaAsignacionTimestamp?: number; // Timestamp para ordenamiento
  fechaVencimiento?: string;
  Categoria: string;
  horainicio: string;
  horafin: string;
  Prioridad?: 'Baja' | 'Media' | 'Alta';
  descripcion: string;
  usuarioasignado?: string;
}

export interface ResumenTareas {
  totalTareas: number;
  tareasCompletadas: number;
  tareasEnProgreso: number;
  porcentajeAvance: number;
}

export interface DiaSemana {
  fecha: Date;
  habilitado: boolean;
}

export interface FiltrosTareas {
  categoria?: string;
  prioridad?: string;
  estado?: string;
  fechaInicio?: string;
  fechaFin?: string;
}
