import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ApiResponse } from '../interfaces/api-response.interface';
import { Usuario } from '../interfaces/usuario.interface';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private readonly API_URL = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  /**
   * GET /usuarios/listar
   * Obtiene todos los usuarios (requiere auth)
   */
  obtenerTodos(): Observable<ApiResponse<Usuario[]>> {
    return this.http.get<ApiResponse<Usuario[]>>(`${this.API_URL}/listar`);
  }

  /**
   * GET /usuarios/:id
   * Obtiene un usuario por ID (requiere auth)
   */
  obtenerPorId(id: number): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.API_URL}/${id}`);
  }

  /**
   * GET /usuarios/cargo/:cargo_id
   * Obtiene usuarios filtrados por cargo (requiere auth)
   */
  obtenerPorCargo(cargoId: number): Observable<ApiResponse<Usuario[]>> {
    return this.http.get<ApiResponse<Usuario[]>>(`${this.API_URL}/cargo/${cargoId}`);
  }
}
