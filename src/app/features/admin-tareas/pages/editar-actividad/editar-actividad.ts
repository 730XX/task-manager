import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ActividadesService } from '../../../../core/services';
import { SucursalesService } from '../../../../core/services/sucursales.service';
import { Sucursal } from '../../../../core/interfaces/sucursal.interface';
import { ActualizarActividadRequest } from '../../../../core/interfaces/actividad.interface';
import { isSuccess, ApiResponse } from '../../../../core/interfaces/api-response.interface';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';

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
  sucursalId: string | null = null;
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'ACTIVA' | 'PAUSADA' = 'PENDIENTE';
  isLoading: boolean = false;

  // Catálogos
  sucursalesDisponibles: Sucursal[] = [];

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
    private sucursalesService: SucursalesService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.actividadId = id;
      this.cargarDatos(id);
    }
  }

  cargarDatos(id: string): void {
    this.isLoading = true;
    
    // Cargar sucursales y actividad en paralelo
    forkJoin({
      sucursales: this.sucursalesService.obtenerTodas(),
      actividad: this.actividadesService.obtenerPorId(Number(id))
    }).subscribe({
      next: (result) => {
        // Procesar sucursales
        if (isSuccess(result.sucursales) && result.sucursales.data) {
          this.sucursalesDisponibles = result.sucursales.data;
        }
        
        // Procesar actividad
        if (isSuccess(result.actividad) && result.actividad.data) {
          const act = result.actividad.data;
          
          this.titulo = act.nombre || '';
          this.descripcion = act.descripcion || '';
          this.sucursalId = act.sucursal_id ? String(act.sucursal_id) : null;
          this.estado = (act.actividades_estado as any) || 'PENDIENTE';
          
          // Convertir fechas
          if (act.fecha_inicio) {
            this.fechaInicio = new Date(act.fecha_inicio);
          }
          if (act.fecha_fin) {
            this.fechaFin = new Date(act.fecha_fin);
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.mensajes?.[0] || 'Error al cargar datos',
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

    if (!this.fechaInicio) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'Debe seleccionar una fecha de inicio',
        life: 3000
      });
      return;
    }

    this.isLoading = true;

    // Formatear fechas a formato MySQL datetime
    const fechaInicioStr = this.fechaInicio.toISOString().slice(0, 19).replace('T', ' ');
    const fechaFinStr = this.fechaFin ? this.fechaFin.toISOString().slice(0, 19).replace('T', ' ') : undefined;

    const request: ActualizarActividadRequest = {
      nombre: this.titulo.trim(),
      fecha_inicio: fechaInicioStr,
      fecha_fin: fechaFinStr,
      descripcion: this.descripcion?.trim() || undefined,
      sucursal_id: this.sucursalId ? Number(this.sucursalId) : undefined
    };

    this.actividadesService.actualizar(Number(this.actividadId), request).subscribe({
      next: (response :any) => {
        if (isSuccess(response)) {
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
      error: (error: any) => {
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
    return !!(this.titulo && this.titulo.trim().length >= 5 && this.fechaInicio);
  }
}
