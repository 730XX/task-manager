import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TareasService } from '../../../../core/services/tareas.service';
import { AuthService } from '../../../../core/services/auth.service';
import { 
  Tarea, 
  TareaUI, 
  ResumenTareasUI, 
  tareaAUI 
} from '../../../../core/interfaces/tarea.interface';
import { ApiResponse, isSuccess } from '../../../../core/interfaces/api-response.interface';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-tareas-list',
  standalone: false,
  templateUrl: './tareas-list.html',
  styleUrl: './tareas-list.scss',
})
export class TareasList implements OnInit, OnDestroy {
  selectedTab: string = 'mis-tareas';
  searchTerm: string = '';
  diaSeleccionado: Date = new Date();
  
  tareasMisTareas: TareaUI[] = [];
  tareasSinAsignar: TareaUI[] = [];
  tareasSeleccionadas: Set<string> = new Set();
  resumen: ResumenTareasUI = {
    totalTareas: 0,
    tareasCompletadas: 0,
    tareasEnProgreso: 0,
    porcentajeAvance: 0
  };
  
  tareaRecienAnadida: string = '';
  isLoading: boolean = false;
  
  // Modales de filtros
  modalFiltrosVisible: boolean = false;
  filtrosActivos: any = null;
  
  // User menu
  userMenuOpen: boolean = false;
  
  private subscription: Subscription = new Subscription();

  constructor(
    public tareasService: TareasService,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  // Cerrar menú al hacer click fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.userMenuOpen && !this.elementRef.nativeElement.querySelector('.relative')?.contains(event.target)) {
      this.userMenuOpen = false;
    }
  }

  ngOnInit(): void {
    this.cargarTareasDelDia();
    this.suscribirACambios();
  }

  cerrarSesion(): void {
    this.userMenuOpen = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Sesión cerrada',
      detail: 'Has cerrado sesión correctamente',
      life: 2000
    });
    
    // Usar el método logout del AuthService que limpia todo y redirige
    this.authService.logout();
  }

  // ========== User Menu Methods ==========
  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  getUserName(): string {
    return this.authService.currentUserValue?.nombre_completo || 'Usuario';
  }

  getInitials(): string {
    const nombre = this.getUserName();
    const partes = nombre.split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }

  getUserRol(): string {
    const rolId = this.authService.getUserRolId();
    return rolId === 1 ? 'Administrador' : 'Usuario';
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private suscribirACambios(): void {
    this.subscription.add(
      this.tareasService.tareasActualizadas$.subscribe(() => {
        this.cargarTareasDelDia();
      })
    );
  }

  cargarTareasDelDia(): void {
    this.isLoading = true;
    
    // Cargar MIS TAREAS desde el backend real
    this.subscription.add(
      this.tareasService.obtenerMisTareas().subscribe({
        next: (response) => {
          if (isSuccess(response) && response.data) {
            // Convertir tareas del backend al formato del frontend
            this.tareasMisTareas = this.convertirTareasBackend(response.data);
            this.calcularResumen();
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.mensajes?.[0] || 'Error al cargar tareas',
            life: 3000
          });
          this.isLoading = false;
        }
      })
    );

    // Cargar TAREAS SIN ASIGNAR desde el backend real
    this.subscription.add(
      this.tareasService.obtenerTareasSinAsignar().subscribe({
        next: (response) => {
          if (isSuccess(response) && response.data) {
            this.tareasSinAsignar = this.convertirTareasBackend(response.data);
          }
        },
        error: (error) => {
          console.error('Error al cargar tareas disponibles:', error);
        }
      })
    );

  }

  /**
   * Convierte tareas del formato backend al formato del frontend usando tareaAUI
   */
  private convertirTareasBackend(tareasBackend: Tarea[]): TareaUI[] {
    return tareasBackend.map(tb => tareaAUI(tb));
  }

  private calcularResumen(): void {
    const total = this.tareasMisTareas.length;
    const completadas = this.tareasMisTareas.filter(t => t.completada).length;
    const enProgreso = this.tareasMisTareas.filter(t => t.estado === 'En progreso').length;
    
    this.resumen = {
      totalTareas: total,
      tareasCompletadas: completadas,
      tareasEnProgreso: enProgreso,
      porcentajeAvance: total > 0 ? Math.round((completadas / total) * 100) : 0
    };
  }

  get tareasFiltradas(): TareaUI[] {
    const tareas = this.selectedTab === 'mis-tareas' ? this.tareasMisTareas : this.tareasSinAsignar;
    
    if (!this.searchTerm) {
      return tareas;
    }

    return tareas.filter(tarea => 
      tarea.titulo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      tarea.Categoria.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  onSearchInput(event: any): void {
    this.searchTerm = event.target.value;
  }

  segmentChanged(value: string): void {
    this.selectedTab = value;
    this.tareasSeleccionadas.clear();
  }

  toggleSeleccionTarea(data: {tareaId: string, event: Event}): void {
    data.event.stopPropagation();
    
    if (this.tareasSeleccionadas.has(data.tareaId)) {
      this.tareasSeleccionadas.delete(data.tareaId);
    } else {
      this.tareasSeleccionadas.add(data.tareaId);
    }
  }

  asignarTareasSeleccionadas(): void {
    if (this.tareasSeleccionadas.size === 0) return;

    const tareasIds = Array.from(this.tareasSeleccionadas);
    this.isLoading = true;

    // Asignar cada tarea de forma secuencial
    let completadas = 0;
    let errores = 0;

    tareasIds.forEach((tareaId, index) => {
      this.tareasService.asignarTarea(Number(tareaId)).subscribe({
        next: (response) => {
          completadas++;
          
          // Si es la última tarea
          if (completadas + errores === tareasIds.length) {
            this.finalizarAsignacion(completadas, errores);
          }
        },
        error: (error) => {
          errores++;
          console.error(`Error al asignar tarea ${tareaId}:`, error);
          
          // Si es la última tarea
          if (completadas + errores === tareasIds.length) {
            this.finalizarAsignacion(completadas, errores);
          }
        }
      });
    });
  }

  private finalizarAsignacion(exitosas: number, fallidas: number): void {
    this.isLoading = false;
    this.tareasSeleccionadas.clear();
    
    if (fallidas === 0) {
      this.messageService.add({
        severity: 'success',
        summary: '¡Tareas asignadas!',
        detail: `${exitosas} tarea(s) asignada(s) correctamente`,
        life: 3000
      });
    } else if (exitosas > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Asignación parcial',
        detail: `${exitosas} asignadas, ${fallidas} fallaron`,
        life: 4000
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo asignar ninguna tarea',
        life: 3000
      });
    }
    
    // Recargar y cambiar a Mis Tareas
    this.cargarTareasDelDia();
    this.selectedTab = 'mis-tareas';
  }

  completarTarea(tareaId: string): void {
    const tarea = this.tareasMisTareas.find(t => t.id === tareaId);
    if (!tarea) return;

    // Si ya está completada, no hacer nada
    if (tarea.completada) {
      this.messageService.add({
        severity: 'info',
        summary: 'Tarea ya completada',
        detail: 'Esta tarea ya fue completada anteriormente',
        life: 3000
      });
      return;
    }

    this.isLoading = true;

    // Llamar al backend para completar la tarea
    this.subscription.add(
      this.tareasService.completarTarea(Number(tareaId)).subscribe({
        next: (response) => {
          if (isSuccess(response)) {
            this.messageService.add({
              severity: 'success',
              summary: '¡Tarea completada!',
              detail: response.mensajes?.[0] || 'Tarea marcada como completada',
              life: 3000
            });
            // Recargar tareas
            this.cargarTareasDelDia();
          }
        },
        error: (error) => {
          this.isLoading = false;
          const mensaje = error.error?.mensajes?.[0] || 'Error al completar la tarea';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: mensaje,
            life: 3000
          });
        }
      })
    );
  }

  abrirFiltros(): void {
    this.modalFiltrosVisible = true;
  }

  cerrarModalFiltros(): void {
    this.modalFiltrosVisible = false;
  }

  aplicarFiltros(filtros: any): void {
    this.filtrosActivos = filtros;
  }

  getFormattedId(id?: string): string {
    return id ? id.padStart(3, '0') : '000';
  }
}
