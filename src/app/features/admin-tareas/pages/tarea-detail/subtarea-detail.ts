import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TareasService, ReabrirTareaRequest } from '../../../../core/services/tareas.service';
import { CategoriasService } from '../../../../core/services/categorias.service';
import { Tarea, TareaUI, tareaAUI, HistorialTarea } from '../../../../core/interfaces/tarea.interface';
import { Categoria } from '../../../../core/interfaces/categoria.interface';
import { Subcategoria } from '../../../../core/interfaces/subcategoria.interface';
import { isSuccess } from '../../../../core/interfaces/api-response.interface';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { ReabrirTareaData } from './reabrir-tarea-modal/reabrir-tarea-modal';

@Component({
  selector: 'app-subtarea-detail',
  standalone: false,
  templateUrl: './subtarea-detail.html',
  styleUrl: './subtarea-detail.scss',
})
export class SubtareaDetail implements OnInit {
  tarea: TareaUI | null = null;
  tareaBackend: Tarea | null = null;
  comentario: string = '';
  imagenesAdjuntas: string[] = [];
  isLoading: boolean = false;
  historial: HistorialTarea[] = [];
  mostrarHistorial: boolean = false;
  
  // Modal de reapertura
  mostrarModalReabrir: boolean = false;
  isReabriendo: boolean = false;
  
  // Mapas para lookup rápido
  categoriasMap: Map<number, string> = new Map();
  subcategoriasMap: Map<number, string> = new Map();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    public tareasService: TareasService,
    private categoriasService: CategoriasService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    const tareaId = this.route.snapshot.paramMap.get('id');
    if (tareaId) {
      this.cargarDatos(tareaId);
    }
  }

  cargarDatos(id: string): void {
    this.isLoading = true;
    
    // Cargar tarea, categorías y subcategorías en paralelo
    forkJoin({
      tarea: this.tareasService.obtenerPorId(Number(id)),
      categorias: this.categoriasService.obtenerTodas(),
      subcategorias: this.categoriasService.obtenerSubcategorias()
    }).subscribe({
      next: ({ tarea, categorias, subcategorias }) => {
        // Construir mapa de categorías
        if (isSuccess(categorias) && categorias.data) {
          categorias.data.forEach((cat: Categoria) => {
            const catId = cat.id || cat.categorias_id;
            const catNombre = cat.nombre || cat.categorias_nombre;
            if (catId && catNombre) {
              this.categoriasMap.set(Number(catId), catNombre);
            }
          });
        }
        
        // Construir mapa de subcategorías
        if (isSuccess(subcategorias) && subcategorias.data) {
          subcategorias.data.forEach((subcat: Subcategoria) => {
            if (subcat.id && subcat.nombre) {
              this.subcategoriasMap.set(Number(subcat.id), subcat.nombre);
            }
          });
        }
        
        // Procesar tarea con nombres de categorías
        if (isSuccess(tarea) && tarea.data) {
          this.tareaBackend = tarea.data;
          
          // Obtener nombres de categoría y subcategoría
          const categoriaNombre = this.categoriasMap.get(Number(tarea.data.categoria_id)) || 'Sin categoría';
          const subcategoriaNombre = this.subcategoriasMap.get(Number(tarea.data.subcategoria_id)) || 'Sin subcategoría';
          
          // Convertir al formato del frontend
          this.tarea = tareaAUI(tarea.data, categoriaNombre, subcategoriaNombre);
          // Cargar historial
          this.cargarHistorial(id);
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

  cargarTarea(id: string): void {
    this.cargarDatos(id);
  }

  cargarHistorial(id: string): void {
    this.tareasService.obtenerHistorialTarea(Number(id)).subscribe({
      next: (response) => {
        if (isSuccess(response) && response.data) {
          // Mostrar TODO el historial, ordenado por fecha descendente
          this.historial = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar historial:', error);
      }
    });
  }

  toggleHistorial(): void {
    this.mostrarHistorial = !this.mostrarHistorial;
  }

  getTipoComentarioLabel(accion: string): string {
    const labels: Record<string, string> = {
      'Completado': 'Tarea completada',
      'Reapertura': 'Tarea reabierta',
      'Inicio': 'Tarea iniciada',
      'Pausa': 'Tarea pausada'
    };
    return labels[accion] || accion;
  }

  getTipoComentarioBadgeColor(accion: string): string {
    const colors: Record<string, string> = {
      'Completado': 'bg-green-500',
      'Reapertura': 'bg-orange-500',
      'Inicio': 'bg-blue-500',
      'Pausa': 'bg-yellow-500'
    };
    return colors[accion] || 'bg-gray-500';
  }

  getTipoComentarioIcon(accion: string): string {
    const icons: Record<string, string> = {
      'Completado': 'pi-check-circle',
      'Reapertura': 'pi-replay',
      'Inicio': 'pi-play-circle',
      'Pausa': 'pi-pause-circle'
    };
    return icons[accion] || 'pi-circle';
  }
  
  tieneComentario(item: any): boolean {
    return item.comentario && item.comentario.trim() !== '';
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('es-ES', opciones);
  }

  formatearFechaCompleta(fecha: string): string {
    const date = new Date(fecha);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const anio = date.getFullYear();
    const hora = date.getHours().toString().padStart(2, '0');
    const minutos = date.getMinutes().toString().padStart(2, '0');
    
    return `${dia}/${mes}/${anio} a las ${hora}:${minutos}`;
  }

  iniciarTarea(): void {
    if (!this.tarea || (this.tarea.estado !== 'Pendiente' && this.tarea.estado !== 'Pausada')) return;

    this.isLoading = true;
    const comentarioParaEnviar = this.comentario.trim() || undefined;
    
    this.tareasService.iniciarTarea(Number(this.tarea.id), comentarioParaEnviar).subscribe({

      next: (response) => {
        if (isSuccess(response)) {
          this.messageService.add({
            severity: 'success',
            summary: 'Tarea iniciada',
            detail: response.mensajes?.[0] || 'Tarea en progreso',
            life: 3000
          });
          this.comentario = '';
          // Recargar los datos de la tarea
          this.cargarTarea(this.tarea!.id);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.mensajes?.[0] || 'Error al iniciar la tarea',
          life: 3000
        });
      }
    });
  }

  pausarTarea(): void {
    if (!this.tarea || this.tarea.estado !== 'En progreso') return;

    this.isLoading = true;
    const comentarioParaEnviar = this.comentario.trim() || undefined;
    
    this.tareasService.pausarTarea(Number(this.tarea.id), comentarioParaEnviar).subscribe({
      next: (response) => {
        if (isSuccess(response)) {
          this.messageService.add({
            severity: 'success',
            summary: 'Tarea pausada',
            detail: response.mensajes?.[0] || 'Tarea pausada correctamente',
            life: 3000
          });
          this.comentario = '';
          // Recargar los datos de la tarea
          this.cargarTarea(this.tarea!.id);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.mensajes?.[0] || 'Error al pausar la tarea',
          life: 3000
        });
      }
    });
  }

  completarTarea(): void {
    if (!this.tarea) return;

    this.isLoading = true;
    const comentarioParaEnviar = this.comentario.trim() || undefined;
    
    this.tareasService.completarTarea(Number(this.tarea.id), comentarioParaEnviar).subscribe({
      next: (response) => {
        if (isSuccess(response)) {
          this.messageService.add({
            severity: 'success',
            summary: '¡Tarea completada!',
            detail: response.mensajes?.[0] || 'Tarea marcada como completada',
            life: 3000
          });
          this.comentario = '';
          // Recargar los datos de la tarea
          this.cargarTarea(this.tarea!.id);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.mensajes?.[0] || 'Error al completar la tarea',
          life: 3000
        });
      }
    });
  }

  adjuntarImagen(): void {
    console.log('Abrir selector de imagen');
  }

  // Métodos para reabrir tarea
  abrirModalReabrir(): void {
    this.mostrarModalReabrir = true;
  }

  cerrarModalReabrir(): void {
    this.mostrarModalReabrir = false;
  }

  confirmarReapertura(data: ReabrirTareaData): void {
    if (!this.tarea) return;

    this.isReabriendo = true;
    
    const request: ReabrirTareaRequest = {
      motivo: data.motivo as any,
      observaciones: data.observaciones,
      prioridad_nueva: data.prioridad_nueva,
      fecha_vencimiento_nueva: data.fecha_vencimiento_nueva
    };

    this.tareasService.reabrirTarea(Number(this.tarea.id), request).subscribe({
      next: (response) => {
        if (isSuccess(response)) {
          this.messageService.add({
            severity: 'success',
            summary: 'Tarea reabierta',
            detail: 'La tarea se reabrió correctamente y ahora está en estado PENDIENTE',
            life: 3000
          });
          this.mostrarModalReabrir = false;
          // Recargar los datos de la tarea
          this.cargarTarea(this.tarea!.id);
        }
        this.isReabriendo = false;
      },
      error: (error) => {
        this.isReabriendo = false;
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

  goBack(): void {
    this.location.back();
  }

  getPrioridadColor(): string {
    switch (this.tarea?.Prioridad) {
      case 'Alta': return 'bg-red-100 text-red-600';
      case 'Media': return 'bg-yellow-100 text-yellow-600';
      case 'Baja': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }
}
