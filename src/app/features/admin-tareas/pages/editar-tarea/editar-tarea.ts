import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TareasService } from '../../../../core/services/tareas.service';
import { CategoriasService } from '../../../../core/services/categorias.service';
import { UsuariosService } from '../../../../core/services/usuarios.service';
import { ActividadesService } from '../../../../core/services';
import { CargosService } from '../../../../core/services/cargos.service';
import { Usuario } from '../../../../core/interfaces/usuario.interface';
import { Actividad } from '../../../../core/interfaces/actividad.interface';
import { Categoria } from '../../../../core/interfaces/categoria.interface';
import { Subcategoria } from '../../../../core/interfaces/subcategoria.interface';
import { Cargo } from '../../../../core/interfaces/cargo.interface';
import { isSuccess } from '../../../../core/interfaces/api-response.interface';
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
  
  // Fechas
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  
  // Categoría y Subcategoría (strings porque el backend devuelve strings)
  categoriaId: string | null = null;
  subcategoriaId: string | null = null;
  
  // Asignación (por usuario o por cargo)
  tipoAsignacion: 'usuario' | 'cargo' | null = null;
  usuarioId: string | null = null;
  cargoId: string | null = null;
  
  // Actividad
  actividadId: string | null = null;
  
  isLoading: boolean = false;

  prioridades = [
    { label: 'Alta', value: 'ALTA' },
    { label: 'Media', value: 'MEDIA' },
    { label: 'Baja', value: 'BAJA' }
  ];

  tiposAsignacion = [
    { label: 'Usuario', value: 'usuario' },
    { label: 'Cargo', value: 'cargo' }
  ];

  categoriasDisponibles: Categoria[] = [];
  subcategoriasDisponibles: Subcategoria[] = [];
  subcategoriasFiltradas: Subcategoria[] = [];
  usuariosDisponibles: Usuario[] = [];
  cargosDisponibles: Cargo[] = [];
  actividadesDisponibles: Actividad[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private tareasService: TareasService,
    private categoriasService: CategoriasService,
    private usuariosService: UsuariosService,
    private cargosService: CargosService,
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

    // Cargar catálogos, tarea y asignación en paralelo
    forkJoin({
      categorias: this.categoriasService.obtenerTodas(),
      subcategorias: this.categoriasService.obtenerSubcategorias(),
      usuarios: this.usuariosService.obtenerTodos(),
      cargos: this.cargosService.obtenerTodos(),
      actividades: this.actividadesService.obtenerTodas(),
      tarea: this.tareasService.obtenerPorId(Number(id)),
      asignacion: this.tareasService.obtenerAsignacion(Number(id))
    }).subscribe({
      next: (result) => {
        // Procesar catálogos
        if (isSuccess(result.categorias) && result.categorias.data) {
          this.categoriasDisponibles = result.categorias.data;
        }
        if (isSuccess(result.subcategorias) && result.subcategorias.data) {
          this.subcategoriasDisponibles = result.subcategorias.data;
        }
        if (isSuccess(result.usuarios) && result.usuarios.data) {
          this.usuariosDisponibles = result.usuarios.data;
        }
        if (isSuccess(result.cargos) && result.cargos.data) {
          this.cargosDisponibles = result.cargos.data;
        }
        if (isSuccess(result.actividades) && result.actividades.data) {
          this.actividadesDisponibles = result.actividades.data;
        }

        // Cargar datos de la tarea
        if (isSuccess(result.tarea) && result.tarea.data) {
          const tarea = result.tarea.data;
          
          this.titulo = tarea.titulo || '';
          this.descripcion = tarea.descripcion || '';
          this.prioridad = (tarea.prioridad?.toUpperCase() as 'ALTA' | 'MEDIA' | 'BAJA') || 'MEDIA';
          this.categoriaId = tarea.categoria_id ? String(tarea.categoria_id) : null;
          this.subcategoriaId = tarea.subcategoria_id ? String(tarea.subcategoria_id) : null;
          this.actividadId = tarea.actividad_id ? String(tarea.actividad_id) : null;

          // Filtrar subcategorías según la categoría cargada
          if (this.categoriaId) {
            this.filtrarSubcategorias();
          }

          // Cargar fechas
          if (tarea.fecha_inicio_programada) {
            this.fechaInicio = new Date(tarea.fecha_inicio_programada);
          }
          if (tarea.fecha_fin_programada) {
            this.fechaFin = new Date(tarea.fecha_fin_programada);
          }
        }

        // Cargar datos de asignación (del nuevo endpoint)
        if (isSuccess(result.asignacion) && result.asignacion.data) {
          const asignacion = result.asignacion.data;
          
          if (asignacion.usuario_asignado_id) {
            this.tipoAsignacion = 'usuario';
            this.usuarioId = String(asignacion.usuario_asignado_id);
          } else if (asignacion.cargo_asignado_id) {
            this.tipoAsignacion = 'cargo';
            this.cargoId = String(asignacion.cargo_asignado_id);
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

  /**
   * Filtra las subcategorías según la categoría seleccionada
   */
  filtrarSubcategorias(): void {
    if (this.categoriaId) {
      this.subcategoriasFiltradas = this.subcategoriasDisponibles.filter(
        sub => String(sub.categoria_id) === String(this.categoriaId)
      );
    } else {
      this.subcategoriasFiltradas = [];
      this.subcategoriaId = null;
    }
  }

  /**
   * Maneja el cambio de categoría
   */
  onCategoriaChange(): void {
    this.subcategoriaId = null; // Limpiar subcategoría al cambiar categoría
    this.filtrarSubcategorias();
  }

  /**
   * Maneja el cambio de tipo de asignación
   */
  onTipoAsignacionChange(): void {
    // Limpiar selecciones previas al cambiar tipo
    this.usuarioId = null;
    this.cargoId = null;
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

    if (!this.fechaInicio) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'Debe seleccionar una fecha de inicio',
        life: 3000
      });
      return;
    }

    if (!this.fechaFin) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'Debe seleccionar una fecha de fin',
        life: 3000
      });
      return;
    }

    // Validar que fecha fin sea mayor o igual a fecha inicio
    if (this.fechaFin < this.fechaInicio) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Error de fechas',
        detail: 'La fecha de fin debe ser mayor o igual a la fecha de inicio',
        life: 3000
      });
      return;
    }

    this.isLoading = true;

    // Formatear fechas a formato MySQL datetime
    const fechaInicioStr = this.fechaInicio.toISOString().slice(0, 19).replace('T', ' ');
    const fechaFinStr = this.fechaFin.toISOString().slice(0, 19).replace('T', ' ');

    // Convertir prioridad a formato del backend (Primera letra mayúscula)
    const prioridadMap: { [key: string]: string } = {
      'ALTA': 'Alta',
      'MEDIA': 'Media',
      'BAJA': 'Baja'
    };

    const request: any = {
      titulo: this.titulo.trim(),
      prioridad: prioridadMap[this.prioridad] || 'Media',
      fecha_inicio: fechaInicioStr,
      fecha_fin: fechaFinStr
    };

    if (this.descripcion?.trim()) {
      request.descripcion = this.descripcion.trim();
    }
    
    // IDs con los nombres correctos que espera el backend
    request.categoria_id = this.categoriaId ? Number(this.categoriaId) : 0;
    request.subcategoria_id = this.subcategoriaId ? Number(this.subcategoriaId) : 0;
    request.actividad_id = this.actividadId ? Number(this.actividadId) : 0;
    
    // Asignación por usuario o cargo (nombres que espera el backend)
    if (this.tipoAsignacion === 'usuario') {
      request.usuario_asignado_id = this.usuarioId ? Number(this.usuarioId) : null;
      request.cargo_asignado_id = null;
    } else if (this.tipoAsignacion === 'cargo') {
      request.cargo_asignado_id = this.cargoId ? Number(this.cargoId) : null;
      request.usuario_asignado_id = null;
    } else {
      request.usuario_asignado_id = null;
      request.cargo_asignado_id = null;
    }

    this.tareasService.actualizarTarea(Number(this.tareaId), request).subscribe({
      next: (response) => {
        if (isSuccess(response)) {
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
    return !!(this.titulo && this.titulo.trim().length >= 3 && this.fechaInicio && this.fechaFin);
  }
}
