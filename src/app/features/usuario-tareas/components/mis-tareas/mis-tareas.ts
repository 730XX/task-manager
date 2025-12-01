import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Tarea } from '../../models/tarea.model';
import { TareasService } from '../../services/tareas.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mis-tareas',
  standalone: false,
  templateUrl: './mis-tareas.html',
  styleUrl: './mis-tareas.scss',
})
export class MisTareas implements OnInit, OnDestroy {
  @Input() tareas: Tarea[] = [];
  @Input() tareaRecienAnadida: string = '';
  @Output() completarTareaEvento = new EventEmitter<string>();

  private subscription: Subscription = new Subscription();

  constructor(
    public tareasService: TareasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.tareasService.subtareasActualizadas$.subscribe(() => {
        // Refrescar vista
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  verDetalleTarea(tareaId: string): void {
    // Las tareas del usuario son subtareas individuales
    this.router.navigate(['/tareas/subtarea-info', tareaId]);
  }

  getBorderColor(tarea: Tarea): string {
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

  trackByTareaId(index: number, tarea: Tarea): string {
    return tarea.id;
  }
}
