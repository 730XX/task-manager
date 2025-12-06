import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TareasService } from '../../../../core/services/tareas.service';
import { Tarea, TareaUI, tareaAUI, HistorialTarea } from '../../../../core/interfaces/tarea.interface';
import { isSuccess } from '../../../../core/interfaces/api-response.interface';
import { MessageService } from 'primeng/api';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    public tareasService: TareasService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const tareaId = this.route.snapshot.paramMap.get('id');
    if (tareaId) {
      this.cargarTarea(tareaId);
    }
  }

  cargarTarea(id: string): void {
    this.isLoading = true;
    this.tareasService.obtenerPorId(Number(id)).subscribe({
      next: (response) => {
        if (isSuccess(response) && response.data) {
          this.tareaBackend = response.data;
          // Convertir al formato del frontend usando tareaAUI
          this.tarea = tareaAUI(response.data);
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
    // Enviar comentario si existe
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
          // Limpiar comentario
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
