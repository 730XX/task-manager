import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.authService.currentUserValue;
    
    if (currentUser && currentUser.token) {
      // Verificar si el usuario es ADMIN
      if (this.authService.isAdmin()) {
        return true;
      }
      
      // Usuario autenticado pero no es ADMIN, redirigir a vista de usuario
      this.router.navigate(['/tareas']);
      return false;
    }

    // No autenticado, redirigir al login
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
