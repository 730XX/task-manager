import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environments';
import { LoginRequest, LoginResponse, User, LogoutResponse } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Inicializar el usuario actual desde localStorage
    const storedUser = this.getUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * Obtiene el valor actual del usuario
   */
  public get currentUserValue(): User | null {
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
    const user = this.currentUserValue;
    return user ? user.token : null;
  }

  /**
   * Obtiene el rol del usuario actual
   */
  public getUserRole(): string | null {
    const user = this.currentUserValue;
    return user ? user.rol : null;
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  public hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  /**
   * Verifica si el usuario es ADMIN
   */
  public isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  /**
   * Login - Autenticación con el backend
   */
  login(usuario: string, password: string): Observable<LoginResponse> {
    const loginData: LoginRequest = {
      usuario,
      password
    };

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, loginData).pipe(
      tap(response => {
        // tipo: 1=success, 2=warning, 3=error
        if (response.tipo === 1 && response.data) {
          // Guardar usuario en localStorage y actualizar el BehaviorSubject
          const user: User = {
            usuario_id: response.data.usuario_id,
            rol: response.data.rol,
            token: response.data.token
          };
          this.setUserToStorage(user);
          this.currentUserSubject.next(user);
        }
      }),
      catchError(error => {
        // Manejar errores específicos del backend
        let errorMessage = 'Error al iniciar sesión';
        
        if (error.error && error.error.mensajes && error.error.mensajes.length > 0) {
          errorMessage = error.error.mensajes[0];
        } else if (error.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor';
        } else if (error.status === 401) {
          errorMessage = 'Credenciales inválidas';
        } else if (error.status === 403) {
          errorMessage = 'Cuenta bloqueada temporalmente';
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Logout - Cerrar sesión
   */
  logout(): Observable<LogoutResponse> {
    const token = this.getToken();
    
    if (!token) {
      // Si no hay token, simplemente limpiar el estado local
      this.clearUserData();
      return new Observable(observer => {
        observer.next({ tipo: 1, mensajes: ['Sesión cerrada'] }); // tipo: 1 = success
        observer.complete();
      });
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<LogoutResponse>(`${this.apiUrl}/auth/logout`, {}, { headers }).pipe(
      tap(() => {
        this.clearUserData();
      }),
      catchError(error => {
        // Incluso si hay error, limpiar datos locales
        this.clearUserData();
        return throwError(() => new Error('Error al cerrar sesión'));
      })
    );
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
  private setUserToStorage(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  /**
   * Obtiene el usuario desde localStorage
   */
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        return JSON.parse(userJson) as User;
      } catch {
        return null;
      }
    }
    return null;
  }
}
