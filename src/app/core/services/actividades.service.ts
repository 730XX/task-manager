import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { 
  ApiResponse 
} from '../interfaces/api-response.interface';
import { 
  Actividad, 
  CrearActividadRequest, 
  ActualizarActividadRequest 
} from '../interfaces/actividad.interface';
import { Tarea } from '../interfaces/tarea.interface';

// Re-exportar tipos para compatibilidad
export type { Actividad, CrearActividadRequest, ActualizarActividadRequest };

@Injectable({
  providedIn: 'root'
})
export class ActividadesService {
  private readonly API_URL = `${environment.apiUrl}/actividades`;

  constructor(private http: HttpClient) {}

  /**
   * GET /actividades/listar-actividades
   * Obtiene todas las actividades (requiere auth)
   */
  obtenerTodas(): Observable<ApiResponse<Actividad[]>> {
    return this.http.get<ApiResponse<Actividad[]>>(`${this.API_URL}/listar-actividades`);
  }

  /**
   * GET /actividades/obtener-actividad/:id
   * Obtiene una actividad por ID (requiere auth)
   */
  obtenerPorId(id: number): Observable<ApiResponse<Actividad>> {
    return this.http.get<ApiResponse<Actividad>>(`${this.API_URL}/obtener-actividad/${id}`);
  }

  /**
   * GET /actividades/tareas/:id
   * Obtiene las tareas de una actividad por ID
   */
  obtenerTareasDeActividad(id: number): Observable<ApiResponse<Tarea[]>> {
    return this.http.get<ApiResponse<Tarea[]>>(`${this.API_URL}/tareas/${id}`);
  }

  /**
   * POST /actividades/crear-actividad
   * Crea una nueva actividad (requiere auth)
   */
  crear(actividad: CrearActividadRequest): Observable<ApiResponse<Actividad>> {
    return this.http.post<ApiResponse<Actividad>>(`${this.API_URL}/crear-actividad`, actividad);
  }

  /**
   * PUT /actividades/actividades/:id
   * Actualiza una actividad existente (requiere auth)
   */
  actualizar(id: number, actividad: ActualizarActividadRequest): Observable<ApiResponse<Actividad>> {
    return this.http.put<ApiResponse<Actividad>>(`${this.API_URL}/actividades/${id}`, actividad);
  }
}
