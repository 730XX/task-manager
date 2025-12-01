import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TareasService } from '../../../usuario-tareas/services/tareas.service';
import { Tarea } from '../../../usuario-tareas/models/tarea.model';
import { TareasService as TareasApiService, Tarea as TareaBackend } from '../../../../core/services/tareas.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-subtarea-detail',
  standalone: false,
  templateUrl: './subtarea-detail.html',
  styleUrl: './subtarea-detail.scss',
})
export class SubtareaDetail implements OnInit {
  tarea: Tarea | null = null;
  tareaBackend: TareaBackend | null = null;
  comentario: string = '';
  imagenesAdjuntas: string[] = [];
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    public tareasService: TareasService,
    private tareasApiService: TareasApiService,
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
    this.tareasApiService.getTareaPorId(Number(id)).subscribe({
      next: (response) => {
        if (response.tipo === 1 && response.data.tarea) {
          this.tareaBackend = response.data.tarea;
          // Convertir al formato del frontend
          this.tarea = this.convertirTareaBackend(response.data.tarea);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.mensajes?.[0] || 'Error al cargar la tarea',
          life: 3000
        });
        this.isLoading = false;
        this.goBack();
      }
    });
  }

  private convertirTareaBackend(tb: TareaBackend): Tarea {
    // Convertir la prioridad del backend (ALTA, MEDIA, BAJA) al formato del frontend (Alta, Media, Baja)
    let prioridadFrontend: 'Alta' | 'Media' | 'Baja' = 'Media';
    if (tb.tareas_prioridad === 'ALTA') prioridadFrontend = 'Alta';
    else if (tb.tareas_prioridad === 'MEDIA') prioridadFrontend = 'Media';
    else if (tb.tareas_prioridad === 'BAJA') prioridadFrontend = 'Baja';

    // Formatear fecha programada para mostrar
    let fechaProgramada = '';
    let horaInicio = '';
    let horaFin = '';
    if (tb.tareas_fecha_programada) {
      const fecha = new Date(tb.tareas_fecha_programada);
      fechaProgramada = fecha.toLocaleDateString('es-ES');
      horaInicio = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }

    return {
      id: tb.tareas_id.toString(),
      titulo: tb.tareas_titulo,
      descripcion: tb.tareas_descripcion || '',
      completada: tb.tareas_estado === 'COMPLETADA',
      estado: this.mapearEstado(tb.tareas_estado),
      estadodetarea: 'Activo',
      progreso: tb.tareas_estado === 'COMPLETADA' ? 100 : (tb.tareas_estado === 'EN_PROGRESO' ? 50 : 0),
      Prioridad: prioridadFrontend,
      Categoria: tb.categoria_nombre || 'Sin categoría',
      fechaAsignacion: fechaProgramada,
      fechaAsignacionTimestamp: tb.tareas_fecha_programada ? new Date(tb.tareas_fecha_programada).getTime() : 0,
      fechaVencimiento: fechaProgramada,
      horainicio: horaInicio,
      horafin: horaFin,
      totalSubtareas: 0,
      subtareasCompletadas: 0,
      usuarioasignado: tb.responsable_nombre || (tb.usuarios_id ? 'Usuario' : undefined)
    };
  }

  private mapearEstado(estadoBackend: string): 'Pendiente' | 'En progreso' | 'Completada' | 'Cerrada' | 'Activo' | 'Inactiva' {
    switch (estadoBackend) {
      case 'PENDIENTE': return 'Pendiente';
      case 'EN_PROGRESO': return 'En progreso';
      case 'COMPLETADA': return 'Completada';
      default: return 'Pendiente';
    }
  }

  iniciarTarea(): void {
    if (!this.tarea || this.tarea.estado !== 'Pendiente') return;

    this.isLoading = true;
    this.tareasApiService.asignarTarea(Number(this.tarea.id)).subscribe({
      next: (response) => {
        if (response.tipo === 1) {
          this.messageService.add({
            severity: 'success',
            summary: 'Tarea iniciada',
            detail: response.mensajes?.[0] || 'Tarea asignada y en progreso',
            life: 3000
          });
          // Recargar los datos de la tarea
          this.cargarTarea(this.tarea!.id);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.mensajes?.[0] || 'Error al iniciar la tarea',
          life: 3000
        });
      }
    });
  }

  pausarTarea(): void {
    if (this.tarea && this.tarea.estado === 'En progreso') {
      this.tarea.estado = 'Pendiente';
      console.log('Tarea pausada');
    }
  }

  completarTarea(): void {
    if (!this.tarea) return;

    this.isLoading = true;
    this.tareasApiService.completarTarea(Number(this.tarea.id)).subscribe({
      next: (response) => {
        if (response.tipo === 1) {
          this.messageService.add({
            severity: 'success',
            summary: '¡Tarea completada!',
            detail: response.mensajes?.[0] || 'Tarea marcada como completada',
            life: 3000
          });
          // Recargar los datos de la tarea
          this.cargarTarea(this.tarea!.id);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.mensajes?.[0] || 'Error al completar la tarea',
          life: 3000
        });
      }
    });
  }

  adjuntarImagen(): void {
    console.log('Abrir selector de imagen');
  }

  goBack(): void {
    this.location.back();
  }

  getPrioridadColor(): string {
    switch (this.tarea?.Prioridad) {
      case 'Alta': return 'bg-red-100 text-red-600';
      case 'Media': return 'bg-yellow-100 text-yellow-600';
      case 'Baja': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }
}
