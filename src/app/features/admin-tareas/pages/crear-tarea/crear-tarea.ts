import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { TareasService } from '../../../../core/services/tareas.service';
import { CategoriasService } from '../../../../core/services/categorias.service';
import { UsuariosService } from '../../../../core/services/usuarios.service';
import { ActividadesService } from '../../../../core/services/actividades.service';
import { CargosService } from '../../../../core/services/cargos.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Usuario } from '../../../../core/interfaces/usuario.interface';
import { Actividad } from '../../../../core/interfaces/actividad.interface';
import { Categoria } from '../../../../core/interfaces/categoria.interface';
import { Subcategoria } from '../../../../core/interfaces/subcategoria.interface';
import { Cargo } from '../../../../core/interfaces/cargo.interface';
import { isSuccess } from '../../../../core/interfaces/api-response.interface';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-crear-tarea',
  standalone: false,
  templateUrl: './crear-tarea.html',
  styleUrl: './crear-tarea.scss',
})
export class CrearTarea implements OnInit {
  titulo: string = '';
  descripcion: string = '';
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA' = 'MEDIA';
  
  // Fechas
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  minDate: Date = new Date();
  
  // Categoría y Subcategoría
  categoriaId: number | null = null;
  subcategoriaId: number | null = null;
  
  // Asignación (por usuario o por cargo)
  tipoAsignacion: 'usuario' | 'cargo' | null = null;
  usuarioId: number | null = null;
  cargoId: number | null = null;
  
  // Actividad
  actividadId: number | null = null;
  
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
    private router: Router,
    private location: Location,
    private tareasService: TareasService,
    private categoriasService: CategoriasService,
    private usuariosService: UsuariosService,
    private cargosService: CargosService,
    private actividadesService: ActividadesService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.isLoading = true;

    forkJoin({
      categorias: this.categoriasService.obtenerTodas(),
      subcategorias: this.categoriasService.obtenerSubcategorias(),
      usuarios: this.usuariosService.obtenerTodos(),
      cargos: this.cargosService.obtenerTodos(),
      actividades: this.actividadesService.obtenerTodas()
    }).subscribe({
      next: (result) => {
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
        this.isLoading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los catálogos',
          life: 3000
        });
        this.isLoading = false;
      }
    });
  }

  /**
   * Filtra las subcategorías según la categoría seleccionada
   */
  filtrarSubcategorias(): void {
    if (this.categoriaId) {
      const catId = Number(this.categoriaId);
      this.subcategoriasFiltradas = this.subcategoriasDisponibles.filter(
        sub => Number(sub.categoria_id) === catId
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
    this.subcategoriaId = null;
    this.filtrarSubcategorias();
  }

  /**
   * Maneja el cambio de tipo de asignación
   */
  onTipoAsignacionChange(): void {
    this.usuarioId = null;
    this.cargoId = null;
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

    if (!this.fechaFin) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'Debe seleccionar una fecha de fin',
        life: 3000
      });
      return;
    }

    if (this.fechaFin < this.fechaInicio) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Error de fechas',
        detail: 'La fecha de fin debe ser mayor o igual a la fecha de inicio',
        life: 3000
      });
      return;
    }

    if (!this.categoriaId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'Debe seleccionar una categoría',
        life: 3000
      });
      return;
    }

    if (!this.subcategoriaId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'Debe seleccionar una subcategoría',
        life: 3000
      });
      return;
    }

    if (!this.actividadId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'Debe seleccionar una actividad',
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
    request.categoria_id = Number(this.categoriaId);
    request.subcategoria_id = Number(this.subcategoriaId);
    request.actividad_id = Number(this.actividadId);
    
    // ID del usuario que crea la tarea (usuario logueado actualmente)
    const usuarioActual = this.authService.currentUserValue;
    if (usuarioActual?.id) {
      request.usuario_id = Number(usuarioActual.id);
    }
    
    // Asignación por usuario o cargo
    if (this.tipoAsignacion === 'usuario' && this.usuarioId) {
      request.usuario_asignado_id = Number(this.usuarioId);
    } else if (this.tipoAsignacion === 'cargo' && this.cargoId) {
      request.cargo_asignado_id = Number(this.cargoId);
    }

    this.tareasService.crearTarea(request).subscribe({
      next: (response) => {
        if (isSuccess(response)) {
          this.messageService.add({
            severity: 'success',
            summary: '¡Éxito!',
            detail: 'Tarea creada correctamente',
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
          detail: error.error?.mensajes?.[0] || 'Error al crear la tarea',
          life: 4000
        });
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  get puedeGuardar(): boolean {
    return !!(
      this.titulo && 
      this.titulo.trim().length >= 5 && 
      this.fechaInicio && 
      this.fechaFin &&
      this.categoriaId &&
      this.subcategoriaId &&
      this.actividadId
    );
  }
}
