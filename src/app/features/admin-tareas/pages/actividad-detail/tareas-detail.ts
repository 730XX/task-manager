import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TareasService } from '../../../../core/services/tareas.service';
import { TareaUI, tareaAUI, Tarea } from '../../../../core/interfaces/tarea.interface';
import { ActividadesService } from '../../../../core/services/actividades.service';
import { SucursalesService } from '../../../../core/services/sucursales.service';
import { Actividad } from '../../../../core/interfaces/actividad.interface';
import { isSuccess } from '../../../../core/interfaces/api-response.interface';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';

// Clase auxiliar para el componente (reemplaza TareaAdminClass del modelo anterior)
interface TareaAdmin {
  id: string;
  titulo: string;
  estado: 'Pendiente' | 'En progreso' | 'Pausada' | 'Completada';
  Categoria: string;
  fechaAsignacion: string;
  horaprogramada: string;
  horainicio: string;
  horafin: string;
  sucursal: string;
  Tarea: TareaUI[];
}

@Component({
  selector: 'app-tareas-detail',
  standalone: false,
  templateUrl: './tareas-detail.html',
  styleUrl: './tareas-detail.scss',
})
export class TareasDetail implements OnInit {
  tareaAdminSeleccionada: TareaAdmin | null = null;
  actividadBackend: Actividad | null = null;
  tareasBackend: any[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  
  progresoGeneral = {
    total: 0,
    completadas: 0,
    porcentaje: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    public tareasService: TareasService,
    private actividadesService: ActividadesService,
    private sucursalesService: SucursalesService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const tareaId = this.route.snapshot.paramMap.get('id');
    if (tareaId) {
      this.cargarTarea(tareaId);
    }
  }

  /**
   * Formatea fecha completa: "05 Dic 2025, 10:30 AM"
   */
  private formatearFechaCompleta(fechaStr: string): string {
    if (!fechaStr) return '--:--';
    
    const mesesCortos = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                         'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    // Puede venir como "2025-12-04 10:00:00"
    const partes = fechaStr.split(' ');
    const soloFecha = partes[0];
    const [year, month, day] = soloFecha.split('-');
    
    const mesNombre = mesesCortos[parseInt(month, 10) - 1] || month;
    let resultado = `${parseInt(day, 10)} ${mesNombre} ${year}`;
    
    // Agregar hora si existe
    if (partes.length > 1) {
      const hora24 = partes[1].substring(0, 5);
      const [horaStr, minutos] = hora24.split(':');
      let hora = parseInt(horaStr, 10);
      const periodo = hora >= 12 ? 'PM' : 'AM';
      hora = hora % 12 || 12;
      resultado += `, ${hora}:${minutos} ${periodo}`;
    }
    
    return resultado;
  }

  cargarTarea(id: string): void {
    this.isLoading = true;
    
    // Cargar detalles de la actividad
    this.actividadesService.obtenerPorId(Number(id)).subscribe({
      next: (response: any) => {
        if (isSuccess(response) && response.data) {
          this.actividadBackend = response.data;
          const act = this.actividadBackend!;
          
          this.progresoGeneral = {
            total: act.total_tareas || 0,
            completadas: act.tareas_completadas || 0,
            porcentaje: act.progreso_porcentaje || 0
          };
          
          // Crear objeto compatible con el template
          this.tareaAdminSeleccionada = {
            id: act.id.toString(),
            titulo: act.nombre,
            estado: this.mapearEstadoActividad(act.actividades_estado || 'ACTIVA'),
            Categoria: 'Actividad',
            fechaAsignacion: act.fecha_inicio || '',
            horaprogramada: '',
            horainicio: this.formatearFechaCompleta(act.fecha_inicio || ''),
            horafin: this.formatearFechaCompleta(act.fecha_fin || ''),
            sucursal: 'Cargando...',
            Tarea: []
          };
          
          // Cargar nombre de sucursal si existe sucursal_id
          if (act.sucursal_id) {
            this.cargarSucursal(Number(act.sucursal_id));
          } else {
            if (this.tareaAdminSeleccionada) {
              this.tareaAdminSeleccionada.sucursal = 'Sin sucursal';
            }
          }
          
          // Cargar tareas de la actividad
          this.cargarTareasDeActividad(id);
        } else {
          this.isLoading = false;
        }
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.mensajes?.[0] || 'Error al cargar la actividad',
          life: 3000
        });
        this.isLoading = false;
        this.goBack();
      }
    });
  }

  private cargarSucursal(sucursalId: number): void {
    this.sucursalesService.obtenerPorId(sucursalId).subscribe({
      next: (response) => {
        if (isSuccess(response) && response.data && this.tareaAdminSeleccionada) {
          this.tareaAdminSeleccionada.sucursal = response.data.nombre || 'Sin nombre';
        }
      },
      error: () => {
        if (this.tareaAdminSeleccionada) {
          this.tareaAdminSeleccionada.sucursal = 'Error al cargar';
        }
      }
    });
  }

  private cargarTareasDeActividad(id: string): void {
    this.actividadesService.obtenerTareasDeActividad(Number(id)).subscribe({
      next: (response: any) => {
        if (isSuccess(response) && response.data) {
          this.tareasBackend = response.data;
          
          // Ahora tareaAdminSeleccionada siempre existe
          if (this.tareaAdminSeleccionada) {
            this.tareaAdminSeleccionada.Tarea = this.convertirTareasBackend(response.data);
          }
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar tareas de la actividad:', error);
        this.isLoading = false;
      }
    });
  }

  private mapearEstadoActividad(estado: string): 'Pendiente' | 'En progreso' | 'Completada' {
    switch (estado) {
      case 'ACTIVA': return 'En progreso';
      case 'COMPLETADA': return 'Completada';
      case 'PAUSADA': return 'Pendiente';
      default: return 'Pendiente';
    }
  }

  private convertirTareasBackend(tareasBackend: Tarea[]): TareaUI[] {
    return tareasBackend.map(tb => tareaAUI(tb));
  }

  calcularProgreso(): void {
    if (this.tareaAdminSeleccionada?.Tarea) {
      this.progresoGeneral.total = this.tareaAdminSeleccionada.Tarea.length;
      this.progresoGeneral.completadas = this.tareaAdminSeleccionada.Tarea.filter(
        t => t.estado === 'Completada'
      ).length;
      this.progresoGeneral.porcentaje = this.progresoGeneral.total > 0
        ? Math.round((this.progresoGeneral.completadas / this.progresoGeneral.total) * 100)
        : 0;
    }
  }

  get tareasCompletadas(): TareaUI[] {
    return this.tareaAdminSeleccionada?.Tarea || [];
  }

  get tareasFiltradas(): TareaUI[] {
    const tareas = this.tareaAdminSeleccionada?.Tarea || [];
    if (!this.searchTerm) return tareas;
    
    return tareas.filter(t => 
      t.titulo.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  navegarASubtarea(subtarea: TareaUI): void {
    this.router.navigate(['/tareas/subtarea-info', subtarea.id]);
  }

  goBack(): void {
    this.location.back();
  }

  getFormattedId(id?: string): string {
    return id ? id.padStart(3, '0') : '000';
  }

  abrirFiltros(): void {
    console.log('Abrir filtros');
  }
}
