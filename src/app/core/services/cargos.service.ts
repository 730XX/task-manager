import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ApiResponse } from '../interfaces/api-response.interface';
import { 
  Cargo, 
  CrearCargoRequest 
} from '../interfaces/cargo.interface';

@Injectable({
  providedIn: 'root'
})
export class CargosService {
  private readonly API_URL = `${environment.apiUrl}/cargo`;

  constructor(private http: HttpClient) {}

  /**
   * GET /cargo/listar-cargos
   * Obtiene todos los cargos (requiere auth)
   */
  obtenerTodos(): Observable<ApiResponse<Cargo[]>> {
    return this.http.get<ApiResponse<Cargo[]>>(`${this.API_URL}/listar-cargos`);
  }

  /**
   * POST /cargo/agregar-cargo
   * Crea un nuevo cargo (requiere auth)
   */
  crear(cargo: CrearCargoRequest): Observable<ApiResponse<Cargo>> {
    return this.http.post<ApiResponse<Cargo>>(`${this.API_URL}/agregar-cargo`, cargo);
  }
}
