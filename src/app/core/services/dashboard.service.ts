import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

export interface DashboardResponse {
  tipo: number; // 1=success, 3=error
  mensajes: string[];
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene datos del dashboard de administrador
   * Endpoint protegido: requiere rol ADMIN
   */
  getAdminHome(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/admin/home`);
  }

  /**
   * Obtiene datos del dashboard de usuario
   * Endpoint protegido: requiere rol USER o ADMIN
   */
  getUserHome(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/user/home`);
  }
}
