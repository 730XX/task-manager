import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ApiResponse } from '../interfaces/api-response.interface';
import { 
  Sucursal, 
  CrearSucursalRequest, 
  ActualizarSucursalRequest 
} from '../interfaces/sucursal.interface';

@Injectable({
  providedIn: 'root'
})
export class SucursalesService {
  private readonly API_URL = `${environment.apiUrl}/sucursales`;

  constructor(private http: HttpClient) {}

  /**
   * GET /sucursales/listar-sucursales
   * Obtiene todas las sucursales (requiere auth)
   */
  obtenerTodas(): Observable<ApiResponse<Sucursal[]>> {
    return this.http.get<ApiResponse<Sucursal[]>>(`${this.API_URL}/listar-sucursales`);
  }

  /**
   * GET /sucursales/obtener-sucursal/:id
   * Obtiene una sucursal por ID (requiere auth)
   */
  obtenerPorId(id: number): Observable<ApiResponse<Sucursal>> {
    return this.http.get<ApiResponse<Sucursal>>(`${this.API_URL}/obtener-sucursal/${id}`);
  }

  /**
   * POST /sucursales/crear-sucursal
   * Crea una nueva sucursal (requiere auth)
   */
  crear(sucursal: CrearSucursalRequest): Observable<ApiResponse<Sucursal>> {
    return this.http.post<ApiResponse<Sucursal>>(`${this.API_URL}/crear-sucursal`, sucursal);
  }

  /**
   * PUT /sucursales/editar-sucursal/:id
   * Actualiza una sucursal existente (requiere auth)
   */
  actualizar(id: number, sucursal: ActualizarSucursalRequest): Observable<ApiResponse<Sucursal>> {
    return this.http.put<ApiResponse<Sucursal>>(`${this.API_URL}/editar-sucursal/${id}`, sucursal);
  }
}
