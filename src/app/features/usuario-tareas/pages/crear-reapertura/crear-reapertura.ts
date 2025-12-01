import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TareasService } from '../../services/tareas.service';
import { Tarea } from '../../models/tarea.model';
import { TareasService as TareasApiService, ReabrirTareaRequest } from '../../../../core/services/tareas.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-crear-reapertura',
  standalone: false,
  templateUrl: './crear-reapertura.html',
  styleUrl: './crear-reapertura.scss',
})
export class CrearReapertura implements OnInit {
  tarea: Tarea | null = null;
  tareaId: string = '';
  motivoReapertura: string = '';
  observaciones: string = '';
  prioridadNueva: string = '';
  fechaVencimientoNueva: Date | null = null;
  isLoading: boolean = false;

  motivosReapertura = [
    { label: 'Error en la ejecución', value: 'ERROR_EJECUCION' },
    { label: 'Información incompleta', value: 'INFORMACION_INCOMPLETA' },
    { label: 'Cambio en los requerimientos', value: 'CAMBIO_REQUERIMIENTOS' },
    { label: 'Solicitud del cliente', value: 'SOLICITUD_CLIENTE' },
    { label: 'Corrección de calidad', value: 'CORRECCION_CALIDAD' },
    { label: 'Otros', value: 'OTROS' }
  ];

  prioridades = [
    { label: 'Baja', value: 'Baja' },
    { label: 'Media', value: 'Media' },
    { label: 'Alta', value: 'Alta' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private tareasService: TareasService,
    private tareasApiService: TareasApiService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    const tareaId = this.route.snapshot.paramMap.get('id');
    if (tareaId) {
      this.tareaId = tareaId;
      this.cargarTarea(tareaId);
    }
  }

  cargarTarea(id: string): void {
    this.isLoading = true;
    this.tareasApiService.getTareaPorId(Number(id)).subscribe({
      next: (response) => {
        if (response.tipo === 1 && response.data.tarea) {
          const tb = response.data.tarea;
          // Convertir al formato del frontend
          this.tarea = {
            id: tb.tareas_id.toString(),
            titulo: tb.tareas_titulo,
            descripcion: tb.tareas_descripcion || '',
            completada: tb.tareas_estado === 'COMPLETADA',
            estado: this.mapearEstado(tb.tareas_estado),
            estadodetarea: 'Activo',
            progreso: 100,
            Prioridad: this.mapearPrioridad(tb.tareas_prioridad),
            Categoria: tb.categoria_nombre || 'Sin categoría',
            fechaAsignacion: tb.tareas_fecha_programada,
            fechaAsignacionTimestamp: new Date(tb.tareas_fecha_programada).getTime(),
            fechaVencimiento: tb.tareas_fecha_programada,
            horainicio: '',
            horafin: '',
            totalSubtareas: 0,
            subtareasCompletadas: 0
          };
          this.prioridadNueva = this.tarea.Prioridad || 'Media';
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

  goBack() {
    this.location.back();
  }

  confirmarReapertura() {
    if (!this.motivoReapertura || this.motivoReapertura.trim() === '') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'Debe seleccionar un motivo de reapertura',
        life: 3000
      });
      return;
    }

    if (!this.observaciones || this.observaciones.trim() === '') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'Las observaciones son obligatorias',
        life: 3000
      });
      return;
    }

    if (this.observaciones.trim().length < 10) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Observaciones muy cortas',
        detail: 'Las observaciones deben tener al menos 10 caracteres',
        life: 3000
      });
      return;
    }

    this.isLoading = true;

    // Mapear prioridad del frontend al backend
    let prioridadBackend: 'ALTA' | 'MEDIA' | 'BAJA' | undefined = undefined;
    if (this.prioridadNueva) {
      switch (this.prioridadNueva) {
        case 'Alta': prioridadBackend = 'ALTA'; break;
        case 'Media': prioridadBackend = 'MEDIA'; break;
        case 'Baja': prioridadBackend = 'BAJA'; break;
      }
    }

    // Formatear fecha si existe
    let fechaVencimientoStr: string | undefined = undefined;
    if (this.fechaVencimientoNueva) {
      const fecha = new Date(this.fechaVencimientoNueva);
      fechaVencimientoStr = fecha.toISOString().slice(0, 19).replace('T', ' ');
    }

    const request: ReabrirTareaRequest = {
      motivo: this.motivoReapertura as any,
      observaciones: this.observaciones.trim(),
      prioridad_nueva: prioridadBackend,
      fecha_vencimiento_nueva: fechaVencimientoStr
    };

    this.tareasApiService.reabrirTarea(Number(this.tareaId), request).subscribe({
      next: (response) => {
        if (response.tipo === 1) {
          this.messageService.add({
            severity: 'success',
            summary: 'Tarea reabierta',
            detail: 'La tarea se reabrió correctamente y ahora está en estado PENDIENTE',
            life: 3000
          });
          
          // Navegar de vuelta a la lista de tareas
          setTimeout(() => {
            this.router.navigate(['/tareas']);
          }, 1500);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        const mensaje = error.error?.mensajes?.[0] || 'Error al reabrir la tarea';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: mensaje,
          life: 4000
        });
      }
    });
  }

  get puedeConfirmar(): boolean {
    return !!(this.motivoReapertura && this.motivoReapertura.trim() !== '');
  }

  get minDate(): Date {
    return new Date();
  }
}
