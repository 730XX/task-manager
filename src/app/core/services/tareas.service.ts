import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

// Interfaces de respuesta del backend
export interface ApiResponse<T = any> {
  tipo: number; // 1=success, 2=warning, 3=error
  mensajes: string[];
  data: T;
}

export interface Tarea {
  tareas_id: number;
  tareas_titulo: string;
  tareas_descripcion?: string;
  tareas_prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  tareas_estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA';
  tareas_fecha_programada: string;
  tareas_fecha_completado?: string;
  tareas_reabierta: number; // 0 o 1
  usuarios_id?: number | null;
  categoria_id?: number;
  categoria_nombre?: string | null;
  categoria_color?: string | null;
  actividades_id?: number | null;
  actividad_titulo?: string | null;
  responsable_nombre?: string | null;
  color_prioridad?: string;
  tareas_creado?: string;
}

export interface CrearTareaRequest {
  titulo: string;
  descripcion?: string;
  prioridad?: 'ALTA' | 'MEDIA' | 'BAJA';
  fecha_programada: string;
  categoria_id?: number;
  actividades_id?: number;
  usuarios_id?: number;
}

export interface ActualizarTareaRequest {
  titulo: string;
  descripcion?: string;
  prioridad?: 'ALTA' | 'MEDIA' | 'BAJA';
  fecha_programada: string;
  categoria_id?: number | null;
  usuarios_id?: number | null;
}

export interface ReabrirTareaRequest {
  motivo: 'ERROR_EJECUCION' | 'INFORMACION_INCOMPLETA' | 'CAMBIO_REQUERIMIENTOS' | 'SOLICITUD_CLIENTE' | 'CORRECCION_CALIDAD' | 'OTROS';
  observaciones: string;
  prioridad_nueva?: 'ALTA' | 'MEDIA' | 'BAJA';
  fecha_vencimiento_nueva?: string;
}


@Injectable({
  providedIn: 'root'
})
export class TareasService {
  private apiUrl = environment.tareasApiUrl;

  constructor(private http: HttpClient) {}

  /**
   * GET /tareas/mis-tareas
   * Obtiene las tareas asignadas al usuario autenticado
   */
  getMisTareas(): Observable<ApiResponse<{ tareas: Tarea[] }>> {
    return this.http.get<ApiResponse<{ tareas: Tarea[] }>>(`${this.apiUrl}/mis-tareas`);
  }

  /**
   * GET /tareas/disponibles
   * Obtiene tareas sin asignar (disponibles para tomar)
   */
  getTareasDisponibles(): Observable<ApiResponse<{ tareas: Tarea[] }>> {
    return this.http.get<ApiResponse<{ tareas: Tarea[] }>>(`${this.apiUrl}/disponibles`);
  }

  /**
   * GET /tareas/:id
   * Obtiene el detalle de una tarea por ID
   */
  getTareaPorId(id: number): Observable<ApiResponse<{ tarea: Tarea }>> {
    return this.http.get<ApiResponse<{ tarea: Tarea }>>(`${this.apiUrl}/${id}`);
  }

  /**
   * POST /tareas
   * Crea una nueva tarea
   */
  crearTarea(data: CrearTareaRequest): Observable<ApiResponse<{ id: number }>> {
    return this.http.post<ApiResponse<{ id: number }>>(`${this.apiUrl}`, data);
  }

  /**
   * PUT /tareas/:id/asignar
   * Asigna una tarea disponible al usuario autenticado
   */
  asignarTarea(tareaId: number): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/${tareaId}/asignar`, {});
  }

  /**
   * PUT /tareas/:id/completar
   * Marca una tarea como completada
   */
  completarTarea(tareaId: number): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/${tareaId}/completar`, {});
  }

  /**
   * PUT /tareas/:id
   * Actualiza una tarea existente
   */
  actualizarTarea(tareaId: number, data: ActualizarTareaRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/${tareaId}`, data);
  }

  /**
   * POST /tareas/:id/reapertura
   * Reabre una tarea completada con motivo y observaciones
   */
  reabrirTarea(tareaId: number, data: ReabrirTareaRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/${tareaId}/reapertura`, data);
  }

  /**
   * GET /tareas/catalogo/categorias
   * Obtiene el listado de categorías disponibles
   */
  getCategorias(): Observable<ApiResponse<{ categorias: Categoria[] }>> {
    return this.http.get<ApiResponse<{ categorias: Categoria[] }>>(`${this.apiUrl}/catalogo/categorias`);
  }

  /**
   * GET /tareas/catalogo/usuarios
   * Obtiene el listado de usuarios disponibles
   */
  getUsuarios(): Observable<ApiResponse<{ usuarios: Usuario[] }>> {
    return this.http.get<ApiResponse<{ usuarios: Usuario[] }>>(`${this.apiUrl}/catalogo/usuarios`);
  }
}

export interface Categoria {
  categoria_id: number;
  categoria_nombre: string;
  categoria_color: string;
}

export interface Usuario {
  usuarios_id: number;
  usuarios_login_hash: string;
}
