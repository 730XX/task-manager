import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ApiResponse } from '../interfaces/api-response.interface';
import { 
  Categoria, 
  CrearCategoriaRequest 
} from '../interfaces/categoria.interface';
import { Subcategoria } from '../interfaces/subcategoria.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private readonly API_URL = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) {}

  /**
   * GET /categorias/listar-categorias
   * Obtiene todas las categorías (requiere auth)
   */
  obtenerTodas(): Observable<ApiResponse<Categoria[]>> {
    return this.http.get<ApiResponse<Categoria[]>>(`${this.API_URL}/listar-categorias`);
  }

  /**
   * GET /categorias/listar-subcategorias
   * Obtiene todas las subcategorías (requiere auth)
   */
  obtenerSubcategorias(): Observable<ApiResponse<Subcategoria[]>> {
    return this.http.get<ApiResponse<Subcategoria[]>>(`${this.API_URL}/listar-subcategorias`);
  }

  /**
   * POST /categorias/agregar-categoria
   * Crea una nueva categoría (requiere auth)
   */
  crear(categoria: CrearCategoriaRequest): Observable<ApiResponse<Categoria>> {
    return this.http.post<ApiResponse<Categoria>>(`${this.API_URL}/agregar-categoria`, categoria);
  }
}
