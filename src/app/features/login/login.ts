import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Eye, EyeOff, Package, Lock, Mail, CheckSquare, ListTodo, Users, BarChart3 } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit, OnDestroy {
  readonly icons = { Eye, EyeOff, Package, Lock, Mail, CheckSquare, ListTodo, Users, BarChart3 };

  // Datos del formulario
  usuario: string = '';
  password: string = '';
  showPassword: boolean = false;
  rememberMe: boolean = false;

  // Estados
  loading: boolean = false;
  blocked: boolean = false;
  
  // URL de retorno después del login
  private returnUrl: string = '/index';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Si ya está autenticado, redirigir según su rol
    if (this.authService.isAuthenticated()) {
      this.redirectByRole();
      return;
    }

    // Obtener la URL de retorno desde los query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/index';
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    // Limpiar estado de bloqueo previo
    this.blocked = false;

    // Validaciones básicas
    if (!this.usuario || !this.password) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos incompletos',
        detail: 'Por favor complete todos los campos',
        life: 3000
      });
      return;
    }

    if (this.usuario.trim().length < 3) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Usuario inválido',
        detail: 'El usuario debe tener al menos 3 caracteres',
        life: 3000
      });
      return;
    }

    // Autenticación con el backend
    this.loading = true;

    this.authService.login(this.usuario, this.password).subscribe({
      next: (response) => {
       
        if (response.tipo === 1) {
          
          const successMsg = response.mensajes && response.mensajes.length > 0 
            ? response.mensajes[0] 
            : 'Inicio de sesión exitoso';
          
          this.messageService.add({
            severity: 'success',
            summary: '¡Bienvenido!',
            detail: successMsg, // <- Del backend
            life: 2000
          });
          this.loading = false;
          // Pequeño delay para que se vea el toast
          setTimeout(() => this.redirectByRole(), 500);
        } else if (response.tipo === 2) {
          // Advertencia (bloqueo temporal) - tipo: 2
          const warnMsg = response.mensajes && response.mensajes.length > 0 
            ? response.mensajes[0] 
            : 'Advertencia';
          
          this.blocked = true;
          this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: warnMsg, // <- Del backend
            life: 6000
          });
          this.loading = false;
        } else {
          // Error - tipo: 3
          const errorMsg = response.mensajes && response.mensajes.length > 0 
            ? response.mensajes[0] 
            : 'Error al iniciar sesión';
          
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMsg, // <- Del backend
            life: 4000
          });
          this.loading = false;
        }
      },
      error: (error) => {

        // Verificar tipo de respuesta (2=warning para bloqueos)
        const errorTipo = error.error && error.error.tipo ? error.error.tipo : 3;
        
        if (errorTipo === 2) {
          // Advertencia (bloqueo temporal)
          this.blocked = true;
        } else {
          this.blocked = false;
        }
        
        // Obtener mensaje del backend directamente
        let errorMsg = 'Error al conectar con el servidor';
        let severity: 'error' | 'warn' = errorTipo === 2 ? 'warn' : 'error';
        
        if (error.error && error.error.mensajes && error.error.mensajes.length > 0) {
          errorMsg = error.error.mensajes[0]; // <- MENSAJE DEL BACKEND
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        // Mostrar toast con mensaje del backend
        this.messageService.add({
          severity: severity,
          summary: severity === 'warn' ? 'Advertencia' : 'Error',
          detail: errorMsg, // <- MENSAJE DEL BACKEND
          life: this.blocked ? 6000 : 4000
        });
        
        this.loading = false;
      }
    });
  }

  /**
   * Redirige al usuario según su rol
   */
  private redirectByRole(): void {
    // Verificar si es ADMIN
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin-tareas']);
    } else {
      // Usuario normal va a vista limitada
      this.router.navigate(['/tareas']);
    }
  }
}
