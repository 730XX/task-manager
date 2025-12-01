import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TareasService } from '../../../../core/services/tareas.service';
import { TareaAdminClass, Tarea } from '../../../usuario-tareas/models/tarea.model';
import { ActividadesService, Actividad } from '../../../../core/services/actividades.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-tareas-detail',
  standalone: false,
  templateUrl: './tareas-detail.html',
  styleUrl: './tareas-detail.scss',
})
export class TareasDetail implements OnInit {
  tareaAdminSeleccionada: TareaAdminClass | null = null;
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
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const tareaId = this.route.snapshot.paramMap.get('id');
    if (tareaId) {
      this.cargarTarea(tareaId);
    }
  }

  cargarTarea(id: string): void {
    this.isLoading = true;
    
    // Cargar detalles de la actividad
    this.actividadesService.getActividadPorId(Number(id)).subscribe({
      next: (response) => {
        if (response.tipo === 1 && response.data.actividad) {
          this.actividadBackend = response.data.actividad;
          this.progresoGeneral = {
            total: this.actividadBackend.total_tareas || 0,
            completadas: this.actividadBackend.tareas_completadas || 0,
            porcentaje: this.actividadBackend.progreso_porcentaje || 0
          };
          
          // Crear objeto compatible con el template
          this.tareaAdminSeleccionada = new TareaAdminClass({
            id: this.actividadBackend.actividades_id.toString(),
            titulo: this.actividadBackend.actividades_titulo,
            estado: this.mapearEstadoActividad(this.actividadBackend.actividades_estado),
            Categoria: 'Actividad',
            fechaAsignacion: this.actividadBackend.actividades_creado,
            horaprogramada: '',
            horainicio: '',
            horafin: '',
            sucursal: '',
            Tarea: []
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
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

    // Cargar tareas de la actividad
    this.actividadesService.getTareasDeActividad(Number(id)).subscribe({
      next: (response) => {
        if (response.tipo === 1 && response.data.tareas) {
          this.tareasBackend = response.data.tareas;
          
          // Convertir tareas al formato del frontend
          if (this.tareaAdminSeleccionada) {
            this.tareaAdminSeleccionada.Tarea = this.convertirTareasBackend(response.data.tareas);
          }
        }
      },
      error: (error) => {
        console.error('Error al cargar tareas de la actividad:', error);
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

  private convertirTareasBackend(tareasBackend: any[]): Tarea[] {
    return tareasBackend.map(tb => ({
      id: tb.tareas_id.toString(),
      titulo: tb.tareas_titulo,
      descripcion: tb.tareas_descripcion || '',
      completada: tb.tareas_estado === 'COMPLETADA',
      estado: this.mapearEstado(tb.tareas_estado),
      estadodetarea: 'Activo',
      progreso: tb.tareas_estado === 'COMPLETADA' ? 100 : (tb.tareas_estado === 'EN_PROGRESO' ? 50 : 0),
      Prioridad: this.mapearPrioridad(tb.tareas_prioridad),
      Categoria: tb.categoria_nombre || 'Sin categoría',
      fechaAsignacion: tb.tareas_fecha_programada,
      fechaAsignacionTimestamp: new Date(tb.tareas_fecha_programada).getTime(),
      fechaVencimiento: tb.tareas_fecha_programada,
      horainicio: '',
      horafin: '',
      totalSubtareas: 0,
      subtareasCompletadas: 0,
      usuarioasignado: tb.usuarios_id ? 'Usuario' : undefined
    }));
  }

  private mapearEstado(estadoBackend: string): 'Pendiente' | 'En progreso' | 'Completada' | 'Cerrada' | 'Activo' | 'Inactiva' {
    switch (estadoBackend) {
      case 'PENDIENTE': return 'Pendiente';
      case 'EN_PROGRESO': return 'En progreso';
      case 'COMPLETADA': return 'Completada';
      default: return 'Pendiente';
    }
  }

  private mapearPrioridad(prioridadBackend: string): 'Alta' | 'Media' | 'Baja' {
    switch (prioridadBackend) {
      case 'ALTA': return 'Alta';
      case 'MEDIA': return 'Media';
      case 'BAJA': return 'Baja';
      default: return 'Media';
    }
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

  get tareasCompletadas(): Tarea[] {
    return this.tareaAdminSeleccionada?.Tarea || [];
  }

  get tareasFiltradas(): Tarea[] {
    const tareas = this.tareaAdminSeleccionada?.Tarea || [];
    if (!this.searchTerm) return tareas;
    
    return tareas.filter(t => 
      t.titulo.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  navegarASubtarea(subtarea: Tarea): void {
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
