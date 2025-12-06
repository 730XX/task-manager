import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environments';
import { 
  ApiResponse 
} from '../interfaces/api-response.interface';
import { 
  Tarea, 
  CrearTareaRequest, 
  ActualizarTareaRequest,
  HistorialTarea,
  ComentarioCompletado
} from '../interfaces/tarea.interface';

// Re-exportar tipos para compatibilidad
export type { Tarea, CrearTareaRequest, ActualizarTareaRequest, HistorialTarea, ComentarioCompletado };

// Importamos Categoria desde la interfaz centralizada
import { Categoria } from '../interfaces/categoria.interface';
export type { Categoria };

/** Interface para la asignación de una tarea */
export interface AsignacionTarea {
  id: string;
  tarea_id: string;
  usuario_asignado_id: string | null;
  cargo_asignado_id: string | null;
  fecha_asignacion: string;
}

/** Interface para request de reabrir tarea */
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
  private readonly API_URL = `${environment.apiUrl}/tareas`;

  // === Subjects para notificaciones reactivas ===
  
  /** Subject para notificar cambios en tareas/subtareas */
  private tareasActualizadasSubject = new Subject<void>();
  public tareasActualizadas$ = this.tareasActualizadasSubject.asObservable();

  /** Subject para cambios en el título de subtareas */
  private tituloSubtareasSubject = new Subject<string>();
  public tituloSubtareas$ = this.tituloSubtareasSubject.asObservable();

  /** Propiedades auxiliares para compatibilidad */
  public apartadoadmin: boolean = false;
  public usuarioActual: string = '';

  constructor(private http: HttpClient) {}

  // === Métodos de notificación ===

  /** Emite evento cuando las tareas han sido actualizadas */
  notificarActualizacion(): void {
    this.tareasActualizadasSubject.next();
  }

  /** Emite evento con nuevo título de subtareas */
  actualizarTituloSubtareas(titulo: string): void {
    this.tituloSubtareasSubject.next(titulo);
  }

  // === Métodos de Catálogos (GET) ===

  /**
   * GET /categorias/listar-categorias
   * Obtiene todas las categorías
   */
  obtenerCategorias(): Observable<ApiResponse<Categoria[]>> {
    return this.http.get<ApiResponse<Categoria[]>>(`${environment.apiUrl}/categorias/listar-categorias`);
  }

  /**
   * GET /categorias/listar-subcategorias
   * Obtiene todas las subcategorías
   */
  obtenerSubcategorias(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/categorias/listar-subcategorias`);
  }

  /**
   * GET /sucursales/listar-sucursales
   * Obtiene todas las sucursales
   */
  obtenerSucursales(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/sucursales/listar-sucursales`);
  }

  // === Métodos HTTP ===

  /**
   * GET /tareas/listar-tareas
   * Obtiene todas las tareas (requiere auth)
   */
  obtenerTodas(): Observable<ApiResponse<Tarea[]>> {
    return this.http.get<ApiResponse<Tarea[]>>(`${this.API_URL}/listar-tareas`);
  }

  /**
   * GET /tareas/mis-tareas
   * Obtiene las tareas del usuario autenticado (requiere auth)
   */
  obtenerMisTareas(): Observable<ApiResponse<Tarea[]>> {
    return this.http.get<ApiResponse<Tarea[]>>(`${this.API_URL}/mis-tareas`);
  }

  /**
   * GET /tareas/tareas-sin-asignar
   * Obtiene las tareas sin asignar (disponibles) (requiere auth)
   */
  obtenerTareasSinAsignar(): Observable<ApiResponse<Tarea[]>> {
    return this.http.get<ApiResponse<Tarea[]>>(`${this.API_URL}/tareas-sin-asignar`);
  }

  /**
   * GET /tareas/obtener-tarea/:id
   * Obtiene una tarea por ID (requiere auth)
   */
  obtenerPorId(id: number): Observable<ApiResponse<Tarea>> {
    return this.http.get<ApiResponse<Tarea>>(`${this.API_URL}/obtener-tarea/${id}`);
  }

  /**
   * GET /tareas/obtener-asignacion/:id
   * Obtiene la asignación de una tarea (usuario o cargo asignado)
   */
  obtenerAsignacion(tareaId: number): Observable<ApiResponse<AsignacionTarea>> {
    return this.http.get<ApiResponse<AsignacionTarea>>(`${this.API_URL}/obtener-asignacion/${tareaId}`);
  }

  /**
   * POST /tareas/crear-tarea
   * Crea una nueva tarea (requiere auth)
   */
  crearTarea(tarea: CrearTareaRequest): Observable<ApiResponse<Tarea>> {
    return this.http.post<ApiResponse<Tarea>>(`${this.API_URL}/crear-tarea`, tarea);
  }

  /**
   * PUT /tareas/editar-tarea/:id
   * Actualiza una tarea existente (requiere auth)
   */
  actualizarTarea(id: number, tarea: ActualizarTareaRequest): Observable<ApiResponse<Tarea>> {
    return this.http.put<ApiResponse<Tarea>>(`${this.API_URL}/editar-tarea/${id}`, tarea);
  }

  /**
   * PUT /tareas/asignar-tarea/:id
   * Asigna una tarea al usuario autenticado (requiere auth)
   */
  asignarTarea(id: number): Observable<ApiResponse<Tarea>> {
    return this.http.put<ApiResponse<Tarea>>(`${this.API_URL}/asignar-tarea/${id}`, {});
  }

  /**
   * PUT /tareas/completar-tarea/:id
   * Marca una tarea como completada (requiere auth)
   * @param id ID de la tarea
   * @param comentario Comentario opcional de completado
   */
  completarTarea(id: number, comentario?: string): Observable<ApiResponse<Tarea>> {
    return this.http.put<ApiResponse<Tarea>>(`${this.API_URL}/completar-tarea/${id}`, { comentario });
  }

  /**
   * PUT /tareas/iniciar-tarea/:id
   * Inicia una tarea (cambia estado a En Progreso) (requiere auth)
   * @param id ID de la tarea
   * @param comentario Comentario opcional
   */
  iniciarTarea(id: number, comentario?: string): Observable<ApiResponse<Tarea>> {
    return this.http.put<ApiResponse<Tarea>>(`${this.API_URL}/iniciar-tarea/${id}`, { comentario });
  }

  /**
   * PUT /tareas/pausar-tarea/:id
   * Pausa una tarea en progreso (requiere auth)
   * @param id ID de la tarea
   * @param comentario Comentario opcional
   */
  pausarTarea(id: number, comentario?: string): Observable<ApiResponse<Tarea>> {
    return this.http.put<ApiResponse<Tarea>>(`${this.API_URL}/pausar-tarea/${id}`, { comentario });
  }

  /**
   * PUT /tareas/reabrir-tarea/:id
   * Reabre una tarea completada (requiere auth)
   */
  reabrirTarea(id: number, datos: ReabrirTareaRequest): Observable<ApiResponse<Tarea>> {
    return this.http.put<ApiResponse<Tarea>>(`${this.API_URL}/reabrir-tarea/${id}`, datos);
  }

  /**
   * DELETE /tareas/eliminar-tarea/:id
   * Elimina una tarea (requiere auth)
   */
  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/eliminar-tarea/${id}`);
  }

  // ==================== HISTORIAL DE TAREAS ====================

  /**
   * GET /tareas/historial-tarea/:id
   * Obtiene el historial completo de una tarea
   */
  obtenerHistorialTarea(id: number): Observable<ApiResponse<HistorialTarea[]>> {
    return this.http.get<ApiResponse<HistorialTarea[]>>(`${this.API_URL}/historial-tarea/${id}`);
  }

  /**
   * GET /tareas/comentario-completado/:id
   * Obtiene el comentario de completado de una tarea
   */
  obtenerComentarioCompletado(id: number): Observable<ApiResponse<ComentarioCompletado | null>> {
    return this.http.get<ApiResponse<ComentarioCompletado | null>>(`${this.API_URL}/comentario-completado/${id}`);
  }

  /**
   * POST /tareas/agregar-comentario/:id
   * Agrega un comentario a una tarea
   */
  agregarComentario(id: number, comentario: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/agregar-comentario/${id}`, { comentario });
  }

  // ==================== CATEGORÍAS ====================

  /**
   * POST /categorias/agregar-categoria
   * Crea una nueva categoría
   */
  crearCategoria(data: { nombre: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/categorias/agregar-categoria`, data);
  }

  /**
   * PUT /categorias/editar-categoria/:id
   * Edita una categoría existente
   */
  editarCategoria(id: number, data: { nombre: string }): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${environment.apiUrl}/categorias/editar-categoria/${id}`, data);
  }

  // ==================== SUBCATEGORÍAS ====================

  /**
   * POST /categorias/agregar-subcategoria
   * Crea una nueva subcategoría
   */
  crearSubcategoria(data: { nombre: string; categoria_id: number | null }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/categorias/agregar-subcategoria`, data);
  }

  /**
   * PUT /categorias/editar-subcategoria/:id
   * Edita una subcategoría existente
   */
  editarSubcategoria(id: number, data: { nombre: string; categoria_id: number }): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${environment.apiUrl}/categorias/editar-subcategoria/${id}`, data);
  }

  // ==================== SUCURSALES ====================

  /**
   * POST /sucursales/crear-sucursal
   * Crea una nueva sucursal
   */
  crearSucursal(data: { nombre: string; direccion: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/sucursales/crear-sucursal`, data);
  }

  /**
   * PUT /sucursales/editar-sucursal/:id
   * Edita una sucursal existente
   */
  editarSucursal(id: number, data: { nombre: string; direccion: string }): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${environment.apiUrl}/sucursales/editar-sucursal/${id}`, data);
  }
}
