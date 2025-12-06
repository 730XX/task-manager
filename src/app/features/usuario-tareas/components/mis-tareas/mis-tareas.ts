import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Tarea, TareaUI } from '../../../../core/interfaces/tarea.interface';
import { TareasService } from '../../../../core/services/tareas.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mis-tareas',
  standalone: false,
  templateUrl: './mis-tareas.html',
  styleUrl: './mis-tareas.scss',
})
export class MisTareas implements OnInit, OnDestroy {
  @Input() tareas: TareaUI[] = [];
  @Input() tareaRecienAnadida: string = '';
  @Input() rutaDetalle: string = '/tareas/subtarea-info'; // Ruta por defecto para usuario
  @Output() completarTareaEvento = new EventEmitter<string>();

  private subscription: Subscription = new Subscription();

  constructor(
    public tareasService: TareasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.tareasService.tareasActualizadas$.subscribe(() => {
        // Refrescar vista
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  verDetalleTarea(tareaId: string): void {
    // Navegar a la ruta configurada (admin o usuario)
    this.router.navigate([this.rutaDetalle, tareaId]);
  }

  getBorderColor(tarea: TareaUI): string {
    if (tarea.estado === 'Completada') return '#1ed467';
    if (tarea.estado === 'En progreso') return '#3B82F6';
    if (tarea.estado === 'Pendiente') return '#F2A626';
    if (tarea.estado === 'Cerrada') return '#C7C7C7';
    return '#e4e4e4';
  }

  getPrioridadColor(prioridad?: string): string {
    switch (prioridad) {
      case 'Alta': return 'bg-red-100 text-red-600';
      case 'Media': return 'bg-yellow-100 text-yellow-600';
      case 'Baja': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  trackByTareaId(index: number, tarea: TareaUI): string {
    return tarea.id;
  }
}
