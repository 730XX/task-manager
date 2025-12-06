import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TareasService, ReabrirTareaRequest } from '../../../../core/services/tareas.service';
import { TareaUI, tareaAUI } from '../../../../core/interfaces/tarea.interface';
import { isSuccess } from '../../../../core/interfaces/api-response.interface';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-crear-reapertura',
  standalone: false,
  templateUrl: './crear-reapertura.html',
  styleUrl: './crear-reapertura.scss',
})
export class CrearReapertura implements OnInit {
  tarea: TareaUI | null = null;
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
    this.tareasService.obtenerPorId(Number(id)).subscribe({
      next: (response) => {
        if (isSuccess(response) && response.data) {
          // Convertir al formato del frontend usando tareaAUI
          this.tarea = tareaAUI(response.data);
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

    this.tareasService.reabrirTarea(Number(this.tareaId), request).subscribe({
      next: (response) => {
        if (isSuccess(response)) {
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
