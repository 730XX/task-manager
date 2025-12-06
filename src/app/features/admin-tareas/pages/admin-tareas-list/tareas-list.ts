import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { TareasService } from '../../../../core/services/tareas.service';
import { TareaUI, ResumenTareasUI, tareaAUI, Tarea } from '../../../../core/interfaces/tarea.interface';
import { isSuccess } from '../../../../core/interfaces/api-response.interface';
import { Subscription, forkJoin } from 'rxjs';
import { ActividadesService } from '../../../../core/services/actividades.service';
import { Actividad } from '../../../../core/interfaces/actividad.interface';
import { AuthService } from '../../../../core/services/auth.service';
import { MessageService } from 'primeng/api';
import { CategoriasService } from '../../../../core/services/categorias.service';
import { Categoria } from '../../../../core/interfaces/categoria.interface';
import { Subcategoria } from '../../../../core/interfaces/subcategoria.interface';

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
  actividades: Actividad[] = [];
  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];
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
  modalFiltrosAdminVisible: boolean = false;
  filtrosActivos: any = null;
  
  // User menu
  userMenuOpen: boolean = false;
  
  private subscription: Subscription = new Subscription();

  constructor(
    public tareasService: TareasService,
    private actividadesService: ActividadesService,
    private categoriasService: CategoriasService,
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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

  isAdmin(): boolean {
    return this.authService.isAdmin();
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
    
    // Primero cargar categorías y subcategorías, luego las tareas
    forkJoin({
      categorias: this.categoriasService.obtenerTodas(),
      subcategorias: this.categoriasService.obtenerSubcategorias()
    }).subscribe({
      next: (result) => {
        if (isSuccess(result.categorias) && result.categorias.data) {
          this.categorias = result.categorias.data;
        }
        if (isSuccess(result.subcategorias) && result.subcategorias.data) {
          this.subcategorias = result.subcategorias.data;
        }
        // Ahora cargar las tareas (con categorías ya disponibles)
        this.cargarTareas();
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        // Cargar tareas aunque fallen las categorías
        this.cargarTareas();
      }
    });

    // Cargar ACTIVIDADES desde el backend real
    this.cargarActividades();
  }

  private cargarTareas(): void {
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

  cargarActividades(): void {
    this.subscription.add(
      this.actividadesService.obtenerTodas().subscribe({
        next: (response) => {
          if (isSuccess(response) && response.data) {
            this.actividades = response.data;
          }
        },
        error: (error) => {
          console.error('Error al cargar actividades:', error);
        }
      })
    );
  }

  get actividadesFiltradas(): Actividad[] {
    let resultado = this.actividades;

    // Filtro por búsqueda
    if (this.searchTerm) {
      resultado = resultado.filter(actividad => 
        (actividad.nombre || actividad.actividades_titulo || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (actividad.descripcion || actividad.actividades_descripcion || '').toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Aplicar filtros adicionales si existen
    if (this.filtrosActivos && this.filtrosActivos.filtrosAplicados) {
      // Filtro por sucursal/departamento (usa sucursal_id o actividades_sucursal)
      if (this.filtrosActivos.departamento && this.filtrosActivos.departamento !== 'Todas') {
        resultado = resultado.filter(actividad => 
          (actividad.sucursal || '') === this.filtrosActivos.departamento
        );
      }

      // Filtro por categoría
      if (this.filtrosActivos.categoria && this.filtrosActivos.categoria !== 'Todas') {
        resultado = resultado.filter(actividad => 
          (actividad.categoria || '') === this.filtrosActivos.categoria
        );
      }

      // Filtro por progreso/estado
      if (this.filtrosActivos.progreso && this.filtrosActivos.progreso !== 'Todos') {
        resultado = resultado.filter(actividad => {
          const progreso = actividad.progreso_porcentaje || 0;
          if (this.filtrosActivos.progreso === 'Completada') return progreso === 100;
          if (this.filtrosActivos.progreso === 'En progreso') return progreso > 0 && progreso < 100;
          if (this.filtrosActivos.progreso === 'Pendiente') return progreso === 0;
          return true;
        });
      }
    }

    return resultado;
  }

  /**
   * Convierte tareas del formato backend al formato del frontend usando tareaAUI
   */
  private convertirTareasBackend(tareasBackend: Tarea[]): TareaUI[] {
    return tareasBackend.map(tb => {
      // Buscar nombre de categoría
      const categoria = this.categorias.find(c => c.id === tb.categoria_id);
      const categoriaNombre = categoria?.nombre || 'Sin categoría';
      
      // Buscar nombre de subcategoría
      const subcategoria = this.subcategorias.find(s => s.id === tb.subcategoria_id);
      const subcategoriaNombre = subcategoria?.nombre || undefined;
      
      return tareaAUI(tb, categoriaNombre, subcategoriaNombre);
    });
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
    
    let resultado = tareas;

    // Filtro por búsqueda
    if (this.searchTerm) {
      resultado = resultado.filter(tarea => 
        tarea.titulo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        tarea.Categoria.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Aplicar filtros adicionales si existen
    if (this.filtrosActivos && this.filtrosActivos.filtrosAplicados) {
      // Filtro por prioridad
      if (this.filtrosActivos.prioridad && this.filtrosActivos.prioridad !== 'Todos') {
        resultado = resultado.filter(tarea => 
          tarea.Prioridad === this.filtrosActivos.prioridad
        );
      }

      // Filtro por categoría
      if (this.filtrosActivos.categoria && this.filtrosActivos.categoria !== 'Todas') {
        resultado = resultado.filter(tarea => 
          tarea.Categoria === this.filtrosActivos.categoria
        );
      }

      // Filtro por estado/progreso
      if (this.filtrosActivos.progreso && this.filtrosActivos.progreso !== 'Todos') {
        resultado = resultado.filter(tarea => 
          tarea.estado === this.filtrosActivos.progreso
        );
      }

      // Filtro por categorías múltiples (modo lista - sin asignar)
      if (this.filtrosActivos.categorias && this.filtrosActivos.categorias.length > 0 && !this.filtrosActivos.todasCategorias) {
        resultado = resultado.filter(tarea => 
          this.filtrosActivos.categorias.includes(tarea.Categoria)
        );
      }
    }

    return resultado;
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
    if (this.selectedTab === 'actividades') {
      this.modalFiltrosAdminVisible = true;
    } else {
      this.modalFiltrosVisible = true;
    }
  }

  cerrarModalFiltros(): void {
    this.modalFiltrosVisible = false;
  }

  cerrarModalFiltrosAdmin(): void {
    this.modalFiltrosAdminVisible = false;
  }

  aplicarFiltros(filtros: any): void {
    this.filtrosActivos = filtros;
    this.modalFiltrosVisible = false;
    this.modalFiltrosAdminVisible = false;
    
    // Mostrar mensaje de éxito
    this.messageService.add({
      severity: 'success',
      summary: 'Filtros aplicados',
      detail: 'Los filtros se han aplicado correctamente',
      life: 2000
    });
  }

  limpiarFiltrosActivos(): void {
    this.filtrosActivos = null;
    this.messageService.add({
      severity: 'info',
      summary: 'Filtros limpiados',
      detail: 'Se han removido todos los filtros',
      life: 2000
    });
  }

  crearNuevaTarea(): void {
    this.router.navigate(['/admin-tareas/crear-tarea']);
  }

  crearNuevaActividad(): void {
    this.router.navigate(['/admin-tareas/crear-actividad']);
  }

  verDetalleActividad(actividadId: string): void {
    this.router.navigate(['/admin-tareas/actividad', actividadId]);
  }

  getFormattedId(id?: string): string {
    return id ? id.padStart(3, '0') : '000';
  }
}
