import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface ReabrirTareaData {
  motivo: string;
  observaciones: string;
  prioridad_nueva?: 'ALTA' | 'MEDIA' | 'BAJA';
  fecha_vencimiento_nueva?: string;
}

@Component({
  selector: 'app-reabrir-tarea-modal',
  standalone: false,
  templateUrl: './reabrir-tarea-modal.html',
  styleUrl: './reabrir-tarea-modal.scss',
})
export class ReabrirTareaModal {
  @Input() visible: boolean = false;
  @Input() tareaTitulo: string = '';
  @Input() prioridadActual: string = 'Media';
  @Input() isLoading: boolean = false;
  
  @Output() onClose = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<ReabrirTareaData>();

  motivoSeleccionado: string = '';
  observaciones: string = '';
  prioridadNueva: string = '';
  fechaVencimientoNueva: Date | null = null;

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

  ngOnChanges(): void {
    if (this.visible) {
      this.prioridadNueva = this.prioridadActual || 'Media';
    }
  }

  cerrar(): void {
    this.resetForm();
    this.onClose.emit();
  }

  confirmar(): void {
    if (!this.puedeConfirmar) return;

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

    const data: ReabrirTareaData = {
      motivo: this.motivoSeleccionado,
      observaciones: this.observaciones.trim(),
      prioridad_nueva: prioridadBackend,
      fecha_vencimiento_nueva: fechaVencimientoStr
    };

    this.onConfirm.emit(data);
  }

  resetForm(): void {
    this.motivoSeleccionado = '';
    this.observaciones = '';
    this.prioridadNueva = this.prioridadActual || 'Media';
    this.fechaVencimientoNueva = null;
  }

  get puedeConfirmar(): boolean {
    return !!(
      this.motivoSeleccionado && 
      this.motivoSeleccionado.trim() !== '' &&
      this.observaciones &&
      this.observaciones.trim().length >= 10
    );
  }

  get minDate(): Date {
    return new Date();
  }
}
