import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { TareasService } from '../../../../core/services/tareas.service';

@Component({
  selector: 'app-filtros-admin-modal',
  standalone: false,
  templateUrl: './filtros-admin-modal.html',
  styleUrl: './filtros-admin-modal.scss',
})
export class FiltrosAdminModal implements OnInit {
  @Input() esTareaInfo: boolean = false;
  @Input() visible: boolean = false;
  @Output() onClose = new EventEmitter<any>();
  @Output() onApply = new EventEmitter<any>();

  filtroDepartamento: string = '';
  filtroCategoria: string = '';
  filtroCargo: string = '';
  filtroProgreso: string = '';
  filtroPrioridad: string = '';

  departamentos = ['Todas', 'Sede Centro', 'Sucursal Norte', 'Sucursal Sur'];
  categorias = ['Todas', 'Almacenes', 'Limpieza', 'Operaciones', 'Cocina', 'Servicio', 'Capacitación', 'Mantenimiento'];
  cargos = ['Todos', 'Mesero', 'Supervisor', 'Limpieza', 'Cocinero'];
  progresos = ['Todos', 'Pendiente', 'En progreso', 'Completada'];
  prioridades = ['Todos', 'Alta', 'Media', 'Baja'];

  constructor(
    public tareasService: TareasService,
    private router: Router
  ) { }

  ngOnInit() {}

  cerrarModal() {
    this.onClose.emit();
  }

  aplicarFiltros() {
    const filtros: any = {
      filtrosAplicados: true,
      departamento: this.filtroDepartamento,
      categoria: this.filtroCategoria,
      cargo: this.filtroCargo,
      progreso: this.filtroProgreso,
      prioridad: this.filtroPrioridad
    };

    this.onApply.emit(filtros);
  }

  limpiarFiltros() {
    this.filtroDepartamento = '';
    this.filtroCategoria = '';
    this.filtroCargo = '';
    this.filtroProgreso = '';
    this.filtroPrioridad = '';
  }
}
