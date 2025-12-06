import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environments';
import { 
  ApiResponse, 
  TipoRespuesta, 
  isSuccess 
} from '../interfaces/api-response.interface';
import { 
  Usuario, 
  RolUsuario
} from '../interfaces/usuario.interface';
import { 
  LoginRequest, 
  AuthUser
} from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/login`;
  private currentUserSubject: BehaviorSubject<AuthUser | null>;
  public currentUser$: Observable<AuthUser | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = this.getUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<AuthUser | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * Obtiene el valor actual del usuario
   */
  public get currentUserValue(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  public isAuthenticated(): boolean {
    const user = this.currentUserValue;
    return !!user && !!user.token;
  }

  /**
   * Obtiene el token actual
   */
  public getToken(): string | null {
    return this.currentUserValue?.token ?? null;
  }

  /**
   * Obtiene el rol_id del usuario actual
   */
  public getUserRolId(): number | null {
    return this.currentUserValue?.rol_id ?? null;
  }

  /**
   * Verifica si el usuario es ADMIN (rol_id = 1)
   */
  public isAdmin(): boolean {
    return this.getUserRolId() === RolUsuario.ADMIN;
  }

  /**
   * Verifica si el usuario es usuario normal (rol_id = 2)
   */
  public isUsuarioNormal(): boolean {
    return this.getUserRolId() === RolUsuario.USUARIO_NORMAL;
  }

  /**
   * Login - Autenticación con el backend
   * POST /login/login
   */
  login(username: string, password: string): Observable<ApiResponse<Usuario>> {
    const loginData: LoginRequest = { username, password };

    return this.http.post<ApiResponse<Usuario>>(`${this.API_URL}/login`, loginData).pipe(
      tap(response => {
        if (isSuccess(response) && response.data) {
          // Extraer datos del usuario para almacenar
          // Convertir rol_id a número ya que el backend lo devuelve como string
          const authUser: AuthUser = {
            id: Number(response.data.id),
            nombre_completo: response.data.nombre_completo,
            username: response.data.username,
            rol_id: Number(response.data.rol_id),
            token: response.data.token!
          };
          this.setUserToStorage(authUser);
          this.currentUserSubject.next(authUser);
        }
      }),
      catchError(error => {
        let errorMessage = 'Error al iniciar sesión';
        
        if (error.error?.mensajes?.length > 0) {
          errorMessage = error.error.mensajes[0];
        } else if (error.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor';
        } else if (error.status === 401) {
          errorMessage = 'Credenciales inválidas';
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Registro de nuevo usuario
   * POST /login/registro
   */
  registro(data: {
    nombre_completo: string;
    username: string;
    password: string;
    rol_id?: number;
    cargo_id?: number;
  }): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.API_URL}/registro`, data).pipe(
      catchError(error => {
        let errorMessage = 'Error al registrar usuario';
        
        if (error.error?.mensajes?.length > 0) {
          errorMessage = error.error.mensajes[0];
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Logout - Cerrar sesión (solo limpia datos locales)
   */
  logout(): void {
    this.clearUserData();
  }

  /**
   * Limpia los datos del usuario y redirige al login
   */
  private clearUserData(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Guarda el usuario en localStorage
   */
  private setUserToStorage(user: AuthUser): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  /**
   * Obtiene el usuario desde localStorage
   */
  private getUserFromStorage(): AuthUser | null {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        const user = JSON.parse(userJson) as AuthUser;
        // Asegurar que rol_id sea número
        if (user && user.rol_id !== undefined) {
          user.rol_id = Number(user.rol_id);
          user.id = Number(user.id);
        }
        return user;
      } catch {
        return null;
      }
    }
    return null;
  }
}
