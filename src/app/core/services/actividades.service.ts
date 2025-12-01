import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

export interface Actividad {
  actividades_id: number;
  actividades_titulo: string;
  actividades_descripcion?: string;
  actividades_sucursal?: string;
  actividades_estado: 'ACTIVA' | 'PAUSADA' | 'COMPLETADA' | 'PENDIENTE' | 'EN_PROGRESO';
  actividades_fecha_programada?: string;
  actividades_hora_inicio?: string;
  actividades_hora_fin?: string;
  usuarios_id?: number;
  actividades_creado: string;
  actividades_activo: number;
  total_tareas?: number;
  tareas_completadas?: number;
  tareas_pendientes?: number;
  tareas_en_progreso?: number;
  progreso_porcentaje?: number;
  responsable_nombre?: string;
}

export interface CrearActividadRequest {
  titulo: string;
  descripcion?: string;
  sucursal?: string;
  fecha_programada?: string;
  hora_inicio?: string;
  hora_fin?: string;
  estado?: 'ACTIVA' | 'PAUSADA' | 'COMPLETADA' | 'PENDIENTE' | 'EN_PROGRESO';
}

export interface ApiResponse<T = any> {
  tipo: number;
  mensajes: string[];
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ActividadesService {
  private apiUrl = environment.actividadesApiUrl;

  constructor(private http: HttpClient) {}

  /**
   * GET /actividades
   * Obtiene todas las actividades
   */
  getActividades(): Observable<ApiResponse<{ actividades: Actividad[] }>> {
    return this.http.get<ApiResponse<{ actividades: Actividad[] }>>(`${this.apiUrl}/`);
  }

  /**
   * GET /actividades/mis-actividades
   * Obtiene las actividades del usuario autenticado
   */
  getMisActividades(): Observable<ApiResponse<{ actividades: Actividad[] }>> {
    return this.http.get<ApiResponse<{ actividades: Actividad[] }>>(`${this.apiUrl}/mis-actividades`);
  }

  /**
   * GET /actividades/:id
   * Obtiene el detalle de una actividad
   */
  getActividadPorId(id: number): Observable<ApiResponse<{ actividad: Actividad }>> {
    return this.http.get<ApiResponse<{ actividad: Actividad }>>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /actividades/:id/tareas
   * Obtiene las tareas de una actividad
   */
  getTareasDeActividad(id: number): Observable<ApiResponse<{ tareas: any[] }>> {
    return this.http.get<ApiResponse<{ tareas: any[] }>>(`${this.apiUrl}/${id}/tareas`);
  }

  /**
   * POST /actividades
   * Crea una nueva actividad
   */
  crearActividad(data: CrearActividadRequest): Observable<ApiResponse<{ id: number }>> {
    return this.http.post<ApiResponse<{ id: number }>>(`${this.apiUrl}/`, data);
  }

  /**
   * PUT /actividades/:id
   * Actualiza una actividad
   */
  actualizarActividad(id: number, data: CrearActividadRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * DELETE /actividades/:id
   * Elimina una actividad
   */
  eliminarActividad(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`);
  }
}
