import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { TareasService } from '../../services/tareas.service';

interface FiltroOpcion {
  nombre: string;
  seleccionado: boolean;
}

@Component({
  selector: 'app-filtros-modal',
  standalone: false,
  templateUrl: './filtros-modal.html',
  styleUrl: './filtros-modal.scss',
})
export class FiltrosModal implements OnInit {
  @Input() selectedTab: string = 'mis-tareas';
  @Input() visible: boolean = false;
  @Output() onClose = new EventEmitter<any>();
  @Output() onApply = new EventEmitter<any>();

  // Propiedades para los filtros
  filtroPrioridad: string = '';
  filtroCategoria: string = '';
  filtroProgreso: string = '';

  // Opciones disponibles
  prioridades = ['Todos', 'Alta', 'Media', 'Baja'];
  categorias = ['Todas', 'Almacenes', 'Limpieza', 'Operaciones', 'Cocina', 'Servicio', 'Administración', 'Eventos', 'Mantenimiento', 'Logística', 'Inventario', 'Reportes', 'Capacitación', 'Documentación'];
  progresos = ['Todos', 'Pendiente', 'En progreso', 'Completada'];

  // Filtros para modo lista (tareas sin asignar)
  listadoCategorias: FiltroOpcion[] = [
    { nombre: 'Todos', seleccionado: true },
    { nombre: 'Almacenes', seleccionado: false },
    { nombre: 'Limpieza', seleccionado: false },
    { nombre: 'Operaciones', seleccionado: false },
    { nombre: 'Cocina', seleccionado: false },
    { nombre: 'Servicio', seleccionado: false },
    { nombre: 'Administración', seleccionado: false },
    { nombre: 'Eventos', seleccionado: false },
    { nombre: 'Mantenimiento', seleccionado: false },
    { nombre: 'Logística', seleccionado: false },
    { nombre: 'Otros', seleccionado: false }
  ];

  constructor(
    public tareasService: TareasService,
    private router: Router
  ) { }

  ngOnInit() {}

  get esModoLista(): boolean {
    return this.selectedTab === 'tareas-sin-asignar';
  }

  toggleSeleccion(index: number) {
    if (index === 0) {
      this.listadoCategorias.forEach((item, i) => {
        item.seleccionado = i === 0;
      });
    } else {
      this.listadoCategorias[0].seleccionado = false;
      this.listadoCategorias[index].seleccionado = !this.listadoCategorias[index].seleccionado;
      
      const haySeleccionados = this.listadoCategorias.slice(1).some(item => item.seleccionado);
      if (!haySeleccionados) {
        this.listadoCategorias[0].seleccionado = true;
      }
    }
  }

  cerrarModal() {
    this.onClose.emit();
  }

  aplicarFiltros() {
    let filtros: any = {
      filtrosAplicados: true
    };

    if (this.esModoLista) {
      const categoriasSeleccionadas = this.listadoCategorias
        .filter(item => item.seleccionado && item.nombre !== 'Todos')
        .map(item => item.nombre);
      
      filtros.categorias = categoriasSeleccionadas;
      filtros.todasCategorias = this.listadoCategorias[0].seleccionado;
    } else {
      filtros.prioridad = this.filtroPrioridad;
      filtros.categoria = this.filtroCategoria;
      filtros.progreso = this.filtroProgreso;
    }

    this.onApply.emit(filtros);
  }

  limpiarFiltros() {
    if (this.esModoLista) {
      this.listadoCategorias.forEach((item, index) => {
        item.seleccionado = index === 0;
      });
    } else {
      this.filtroPrioridad = '';
      this.filtroCategoria = '';
      this.filtroProgreso = '';
    }
  }
}
