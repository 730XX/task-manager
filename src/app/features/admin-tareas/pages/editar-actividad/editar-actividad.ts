import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ActividadesService } from '../../../../core/services/actividades.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-editar-actividad',
  standalone: false,
  templateUrl: './editar-actividad.html',
  styleUrl: './editar-actividad.scss',
})
export class EditarActividad implements OnInit {
  actividadId: string = '';
  titulo: string = '';
  descripcion: string = '';
  sucursal: string = '';
  fechaProgramada: Date | null = null;
  horaInicio: Date | null = null;
  horaFin: Date | null = null;
  estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'ACTIVA' | 'PAUSADA' = 'PENDIENTE';
  isLoading: boolean = false;

  estados = [
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'En Progreso', value: 'EN_PROGRESO' },
    { label: 'Completada', value: 'COMPLETADA' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private actividadesService: ActividadesService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.actividadId = id;
      this.cargarActividad(id);
    }
  }

  cargarActividad(id: string): void {
    this.isLoading = true;
    this.actividadesService.getActividadPorId(Number(id)).subscribe({
      next: (response) => {
        if (response.tipo === 1 && response.data.actividad) {
          const act = response.data.actividad;
          
          this.titulo = act.actividades_titulo || '';
          this.descripcion = act.actividades_descripcion || '';
          this.sucursal = act.actividades_sucursal || '';
          this.estado = act.actividades_estado || 'PENDIENTE';
          
          // Convertir fecha programada
          if (act.actividades_fecha_programada) {
            this.fechaProgramada = new Date(act.actividades_fecha_programada);
          }
          
          // Convertir horas a Date objects para p-datepicker con timeOnly
          if (act.actividades_hora_inicio) {
            const [hours, minutes] = act.actividades_hora_inicio.split(':');
            this.horaInicio = new Date();
            this.horaInicio.setHours(parseInt(hours), parseInt(minutes), 0);
          }
          
          if (act.actividades_hora_fin) {
            const [hours, minutes] = act.actividades_hora_fin.split(':');
            this.horaFin = new Date();
            this.horaFin.setHours(parseInt(hours), parseInt(minutes), 0);
          }
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

    // Formatear fecha programada
    const fechaStr = this.fechaProgramada.toISOString().slice(0, 10);
    
    // Formatear horas
    let horaInicioStr: string | undefined = undefined;
    let horaFinStr: string | undefined = undefined;
    
    if (this.horaInicio) {
      const hours = this.horaInicio.getHours().toString().padStart(2, '0');
      const minutes = this.horaInicio.getMinutes().toString().padStart(2, '0');
      horaInicioStr = `${hours}:${minutes}:00`;
    }
    
    if (this.horaFin) {
      const hours = this.horaFin.getHours().toString().padStart(2, '0');
      const minutes = this.horaFin.getMinutes().toString().padStart(2, '0');
      horaFinStr = `${hours}:${minutes}:00`;
    }

    const request: any = {
      titulo: this.titulo.trim(),
      fecha_programada: fechaStr,
      estado: this.estado
    };

    if (this.descripcion?.trim()) {
      request.descripcion = this.descripcion.trim();
    }
    if (this.sucursal?.trim()) {
      request.sucursal = this.sucursal.trim();
    }
    if (horaInicioStr) {
      request.hora_inicio = horaInicioStr;
    }
    if (horaFinStr) {
      request.hora_fin = horaFinStr;
    }

    this.actividadesService.actualizarActividad(Number(this.actividadId), request).subscribe({
      next: (response) => {
        if (response.tipo === 1) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Actividad actualizada correctamente',
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
          detail: error.error?.mensajes?.[0] || 'Error al actualizar la actividad',
          life: 4000
        });
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  get puedeGuardar(): boolean {
    return !!(this.titulo && this.titulo.trim().length >= 5 && this.fechaProgramada);
  }
}
