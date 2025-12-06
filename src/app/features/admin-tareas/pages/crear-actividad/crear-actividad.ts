import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ActividadesService } from '../../../../core/services/actividades.service';
import { CrearActividadRequest } from '../../../../core/interfaces/actividad.interface';
import { isSuccess } from '../../../../core/interfaces/api-response.interface';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-crear-actividad',
  standalone: false,
  templateUrl: './crear-actividad.html',
  styleUrl: './crear-actividad.scss',
})
export class CrearActividad implements OnInit {
  titulo: string = '';
  descripcion: string = '';
  sucursal: string = '';
  estado: 'ACTIVA' | 'PAUSADA' | 'COMPLETADA' | 'PENDIENTE' | 'EN_PROGRESO' = 'PENDIENTE';
  fechaProgramada: Date | null = null;
  horaInicio: Date | null = null;
  horaFin: Date | null = null;
  isLoading: boolean = false;

  estadosDisponibles = [
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'Activa', value: 'ACTIVA' },
    { label: 'En Progreso', value: 'EN_PROGRESO' },
    { label: 'Pausada', value: 'PAUSADA' },
    { label: 'Completada', value: 'COMPLETADA' }
  ];

  constructor(
    private router: Router,
    private location: Location,
    private actividadesService: ActividadesService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Componente de creación, no necesita cargar datos
  }

  guardar(): void {
    // Validaciones
    if (!this.titulo || this.titulo.trim().length < 5) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'El título debe tener al menos 5 caracteres',
        life: 3000
      });
      return;
    }

    if (!this.fechaProgramada) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'Debe seleccionar una fecha programada',
        life: 3000
      });
      return;
    }

    this.isLoading = true;

    // Construir el request
    const request: CrearActividadRequest = {
      nombre: this.titulo.trim(),
      sucursal_id: 1, // TODO: Obtener del selector de sucursales
      fecha_inicio: this.formatearFecha(this.fechaProgramada),
      fecha_fin: this.formatearFecha(this.fechaProgramada),
      titulo: this.titulo.trim(),
      estado: this.estado
    };

    // Campos opcionales
    if (this.descripcion?.trim()) {
      request.descripcion = this.descripcion.trim();
    }

    if (this.sucursal?.trim()) {
      request.sucursal = this.sucursal.trim();
    }

    // Fecha programada - formato YYYY-MM-DD
    if (this.fechaProgramada) {
      request.fecha_programada = this.formatearFecha(this.fechaProgramada);
    }

    // Hora inicio - formato HH:mm:ss
    if (this.horaInicio) {
      const hours = String(this.horaInicio.getHours()).padStart(2, '0');
      const minutes = String(this.horaInicio.getMinutes()).padStart(2, '0');
      request.hora_inicio = `${hours}:${minutes}:00`;
    }

    // Hora fin - formato HH:mm:ss
    if (this.horaFin) {
      const hours = String(this.horaFin.getHours()).padStart(2, '0');
      const minutes = String(this.horaFin.getMinutes()).padStart(2, '0');
      request.hora_fin = `${hours}:${minutes}:00`;
    }

    this.actividadesService.crear(request).subscribe({
      next: (response) => {
        if (isSuccess(response)) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Actividad creada correctamente',
            life: 3000
          });
          
          setTimeout(() => {
            this.router.navigate(['/admin-tareas']);
          }, 1500);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.mensajes?.[0] || 'Error al crear la actividad',
          life: 4000
        });
      }
    });
  }

  private formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  goBack(): void {
    this.location.back();
  }

  get puedeGuardar(): boolean {
    return !!(this.titulo && this.titulo.trim().length >= 5 && this.fechaProgramada);
  }
}
