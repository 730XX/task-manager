import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TareasService } from '../../../../core/services/tareas.service';
import { Tarea, TareaUI, tareaAUI } from '../../../../core/interfaces/tarea.interface';
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

  iniciarTarea(): void {
    if (!this.tarea || (this.tarea.estado !== 'Pendiente' && this.tarea.estado !== 'Pausada')) return;

    this.isLoading = true;
    this.tareasService.iniciarTarea(Number(this.tarea.id)).subscribe({
      next: (response) => {
        if (isSuccess(response)) {
          this.messageService.add({
            severity: 'success',
            summary: 'Tarea iniciada',
            detail: response.mensajes?.[0] || 'Tarea en progreso',
            life: 3000
          });
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
    this.tareasService.pausarTarea(Number(this.tarea.id)).subscribe({
      next: (response) => {
        if (isSuccess(response)) {
          this.messageService.add({
            severity: 'success',
            summary: 'Tarea pausada',
            detail: response.mensajes?.[0] || 'Tarea pausada correctamente',
            life: 3000
          });
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
    this.tareasService.completarTarea(Number(this.tarea.id)).subscribe({
      next: (response) => {
        if (isSuccess(response)) {
          this.messageService.add({
            severity: 'success',
            summary: '¡Tarea completada!',
            detail: response.mensajes?.[0] || 'Tarea marcada como completada',
            life: 3000
          });
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
