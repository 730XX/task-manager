import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Tarea } from '../../models/tarea.model';
import { TareasService } from '../../services/tareas.service';

@Component({
  selector: 'app-equipos-tareas',
  standalone: false,
  templateUrl: './equipos-tareas.html',
  styleUrl: './equipos-tareas.scss',
})
export class EquiposTareas implements OnInit {
  @Input() tareas: Tarea[] = [];
  @Input() tareasSeleccionadas: Set<string> = new Set();
  @Output() toggleSeleccion = new EventEmitter<{tareaId: string, event: Event}>();
  @Output() asignarTareas = new EventEmitter<void>();

  constructor(
    public tareasService: TareasService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  verDetalleTarea(tareaId: string): void {
    // Las tareas de equipo son subtareas individuales
    this.router.navigate(['/tareas/subtarea-info', tareaId]);
  }

  onToggleSeleccion(tareaId: string, event: Event): void {
    this.toggleSeleccion.emit({tareaId, event});
  }

  isTareaSeleccionada(tareaId: string): boolean {
    return this.tareasSeleccionadas.has(tareaId);
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
