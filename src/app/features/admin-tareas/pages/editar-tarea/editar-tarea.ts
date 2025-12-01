import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TareasService as TareasApiService, Categoria, Usuario } from '../../../../core/services/tareas.service';
import { ActividadesService, Actividad } from '../../../../core/services/actividades.service';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-editar-tarea',
  standalone: false,
  templateUrl: './editar-tarea.html',
  styleUrl: './editar-tarea.scss',
})
export class EditarTarea implements OnInit {
  tareaId: string = '';
  titulo: string = '';
  descripcion: string = '';
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA' = 'MEDIA';
  fechaProgramada: Date | null = null;
  categoriaId: number | null = null;
  usuarioId: number | null = null;
  isLoading: boolean = false;

  prioridades = [
    { label: 'Alta', value: 'ALTA' },
    { label: 'Media', value: 'MEDIA' },
    { label: 'Baja', value: 'BAJA' }
  ];

  categoriasDisponibles: Categoria[] = [];
  usuariosDisponibles: Usuario[] = [];
  actividadesDisponibles: Actividad[] = [];
  actividadId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private tareasApiService: TareasApiService,
    private actividadesService: ActividadesService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.tareaId = id;
      this.cargarCatalogosYTarea(id);
    }
  }

  cargarCatalogosYTarea(id: string): void {
    this.isLoading = true;

    // Cargar catálogos y tarea en paralelo
    forkJoin({
      categorias: this.tareasApiService.getCategorias(),
      usuarios: this.tareasApiService.getUsuarios(),
      actividades: this.actividadesService.getActividades(),
      tarea: this.tareasApiService.getTareaPorId(Number(id))
    }).subscribe({
      next: (result) => {
        // Procesar catálogos
        if (result.categorias.tipo === 1) {
          this.categoriasDisponibles = result.categorias.data.categorias;
        }
        if (result.usuarios.tipo === 1) {
          this.usuariosDisponibles = result.usuarios.data.usuarios;
        }
        if (result.actividades.tipo === 1) {
          this.actividadesDisponibles = result.actividades.data.actividades;
        }

        // Cargar datos de la tarea
        if (result.tarea.tipo === 1 && result.tarea.data.tarea) {
          const tarea = result.tarea.data.tarea;
          
          this.titulo = tarea.tareas_titulo || '';
          this.descripcion = tarea.tareas_descripcion || '';
          this.prioridad = tarea.tareas_prioridad || 'MEDIA';
          this.categoriaId = tarea.categoria_id || null;
          this.usuarioId = tarea.usuarios_id || null;
          this.actividadId = tarea.actividades_id || null;

          if (tarea.tareas_fecha_programada) {
            this.fechaProgramada = new Date(tarea.tareas_fecha_programada);
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
    if (!this.titulo || this.titulo.trim().length < 3) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'El título debe tener al menos 3 caracteres',
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

    // Formatear fecha programada a formato MySQL datetime
    const fechaStr = this.fechaProgramada.toISOString().slice(0, 19).replace('T', ' ');

    const request: any = {
      titulo: this.titulo.trim(),
      prioridad: this.prioridad,
      fecha_programada: fechaStr
    };

    if (this.descripcion?.trim()) {
      request.descripcion = this.descripcion.trim();
    }
    if (this.categoriaId) {
      request.categoria_id = this.categoriaId;
    } else {
      request.categoria_id = null;
    }
    
    if (this.usuarioId) {
      request.usuarios_id = this.usuarioId;
    } else {
      request.usuarios_id = null;
    }

    if (this.actividadId) {
      request.actividades_id = this.actividadId;
    } else {
      request.actividades_id = null;
    }

    this.tareasApiService.actualizarTarea(Number(this.tareaId), request).subscribe({
      next: (response) => {
        if (response.tipo === 1) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Tarea actualizada correctamente',
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
          detail: error.error?.mensajes?.[0] || 'Error al actualizar la tarea',
          life: 4000
        });
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  get puedeGuardar(): boolean {
    return !!(this.titulo && this.titulo.trim().length >= 3 && this.fechaProgramada);
  }
}
