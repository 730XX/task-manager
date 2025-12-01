import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { TareasService } from '../../../usuario-tareas/services/tareas.service';
import { TareasService as TareasApiService, CrearTareaRequest, Categoria, Usuario } from '../../../../core/services/tareas.service';
import { ActividadesService, Actividad } from '../../../../core/services/actividades.service';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-crear-tarea',
  standalone: false,
  templateUrl: './crear-tarea.html',
  styleUrl: './crear-tarea.scss',
})
export class CrearTarea implements OnInit {
  titulo: string = 'Crear tarea';
  nombreTarea: string = '';
  descripcionTarea: string = '';
  tipoAsignacion: string = 'cargo';
  cargoSeleccionado: string = 'Seleccionar cargo';
  usuario: string = 'Seleccionar usuario';
  subcategoria: string = '';
  orden: string = '1';
  prioridad: string = 'media';
  estadoActivo: boolean = true;
  
  modoEdicion: boolean = false;
  tareaId?: string;
  isLoading: boolean = false;
  fechaProgramada: Date = new Date();
  minDate: Date = new Date();

  cargosDisponibles: any[] = []; // Vacío por ahora ya que usuarios no tienen cargo

  usuariosDisponibles: Usuario[] = [];
  categoriasDisponibles: Categoria[] = [];
  actividadesDisponibles: Actividad[] = [];
  actividadSeleccionada: number | null = null;

  constructor(
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private tareasService: TareasService,
    private tareasApiService: TareasApiService,
    private actividadesService: ActividadesService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.cargarCatalogos();
    
    this.route.queryParams.subscribe(params => {
      if (params['edit'] === 'true') {
        this.modoEdicion = true;
        this.titulo = 'Editar tarea';
        this.tareaId = params['tareaId'];
        this.cargarDatosTarea();
      }
    });
  }

  cargarCatalogos(): void {
    forkJoin({
      categorias: this.tareasApiService.getCategorias(),
      usuarios: this.tareasApiService.getUsuarios(),
      actividades: this.actividadesService.getActividades()
    }).subscribe({
      next: (response) => {
        if (response.categorias.tipo === 1) {
          this.categoriasDisponibles = response.categorias.data.categorias;
          console.log('Categorías cargadas:', this.categoriasDisponibles.length);
        }
        if (response.usuarios.tipo === 1) {
          this.usuariosDisponibles = response.usuarios.data.usuarios;
          console.log('Usuarios cargados:', this.usuariosDisponibles.length);
        }
        if (response.actividades.tipo === 1) {
          this.actividadesDisponibles = response.actividades.data.actividades;
          console.log('Actividades cargadas:', this.actividadesDisponibles.length);
          console.log('Actividades:', this.actividadesDisponibles);
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los catálogos',
          life: 3000
        });
      }
    });
  }

  cargarDatosTarea(): void {
    if (this.tareaId) {
      /*const tarea = this.tareasService.getTareaPorId(this.tareaId);
      if (tarea) {
        this.nombreTarea = tarea.titulo;
        this.descripcionTarea = tarea.descripcion;
        this.subcategoria = tarea.Categoria;
        this.prioridad = tarea.Prioridad?.toLowerCase() || 'media';
      }*/
    }
  }

  onTipoAsignacionChange(): void {
    this.cargoSeleccionado = 'Seleccionar cargo';
    this.usuario = 'Seleccionar usuario';
  }

  guardarTarea(): void {
    // Validaciones básicas
    if (!this.nombreTarea || !this.nombreTarea.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'El nombre de la tarea es obligatorio',
        life: 3000
      });
      return;
    }

    if (this.nombreTarea.trim().length < 5) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Título muy corto',
        detail: 'El título debe tener al menos 5 caracteres',
        life: 3000
      });
      return;
    }

    if (!this.fechaProgramada) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Fecha requerida',
        detail: 'Debes seleccionar una fecha programada',
        life: 3000
      });
      return;
    }

    this.isLoading = true;

    // Formatear fecha para el backend (YYYY-MM-DD HH:MM:SS)
    const fechaFormateada = this.formatearFechaCompleta(this.fechaProgramada);

    // Preparar datos para el backend
    const nuevaTarea: CrearTareaRequest = {
      titulo: this.nombreTarea.trim(),
      descripcion: this.descripcionTarea?.trim() || undefined,
      prioridad: this.prioridad.toUpperCase() as 'ALTA' | 'MEDIA' | 'BAJA',
      fecha_programada: fechaFormateada,
      categoria_id: this.subcategoria ? Number(this.subcategoria) : undefined,
      usuarios_id: (this.tipoAsignacion === 'usuario' && this.usuario) ? Number(this.usuario) : undefined,
      actividades_id: this.actividadSeleccionada || undefined
    };

    // Llamar al backend
    this.tareasApiService.crearTarea(nuevaTarea).subscribe({
      next: (response) => {
        if (response.tipo === 1) {
          this.messageService.add({
            severity: 'success',
            summary: '¡Tarea creada!',
            detail: response.mensajes?.[0] || 'La tarea se creó correctamente',
            life: 3000
          });
          
          // Volver a la lista después de un pequeño delay
          setTimeout(() => {
            this.router.navigate(['/admin-tareas']);
          }, 1000);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        const mensaje = error.error?.mensajes?.[0] || 'Error al crear la tarea';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: mensaje,
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

  private formatearFechaCompleta(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    const seconds = String(fecha.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  goBack(): void {
    this.location.back();
  }
}
