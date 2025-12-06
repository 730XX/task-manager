import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { TareasService } from '../../../../core/services/tareas.service';

interface Categoria {
  id: number;
  nombre: string;
  editando?: boolean;
  nombreOriginal?: string;
}

interface Subcategoria {
  id: number;
  categoria_id: number;
  nombre: string;
  editando?: boolean;
  nombreOriginal?: string;
  categoriaOriginal?: number;
}

interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  editando?: boolean;
  nombreOriginal?: string;
  direccionOriginal?: string;
}

@Component({
  selector: 'app-configuracion',
  standalone: false,
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.scss'
})
export class Configuracion implements OnInit {
  // Datos
  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];
  sucursales: Sucursal[] = [];

  // Estados de carga
  cargandoCategorias = false;
  cargandoSubcategorias = false;
  cargandoSucursales = false;

  // Formularios de creación
  nuevaCategoria = { nombre: '' };
  nuevaSubcategoria = { nombre: '', categoria_id: null as number | null };
  nuevaSucursal = { nombre: '', direccion: '' };

  // Modales
  modalCategoria = false;
  modalSubcategoria = false;
  modalSucursal = false;

  constructor(
    private tareasService: TareasService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargarCategorias();
    this.cargarSubcategorias();
    this.cargarSucursales();
  }

  // ==================== CATEGORÍAS ====================
  cargarCategorias(): void {
    this.cargandoCategorias = true;
    this.tareasService.obtenerCategorias().subscribe({
      next: (res) => {
        if (res.tipo === 1) {
          this.categorias = res.data.map((c: any) => ({
            id: Number(c.id),
            nombre: c.nombre,
            editando: false
          }));
        }
        this.cargandoCategorias = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar categorías' });
        this.cargandoCategorias = false;
      }
    });
  }

  abrirModalCategoria(): void {
    this.nuevaCategoria = { nombre: '' };
    this.modalCategoria = true;
  }

  guardarCategoria(): void {
    if (!this.nuevaCategoria.nombre.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'El nombre es obligatorio' });
      return;
    }

    this.tareasService.crearCategoria(this.nuevaCategoria).subscribe({
      next: (res) => {
        if (res.tipo === 1) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría creada correctamente' });
          this.modalCategoria = false;
          this.cargarCategorias();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: res.mensajes[0] });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear categoría' });
      }
    });
  }

  editarCategoria(categoria: Categoria): void {
    categoria.editando = true;
    categoria.nombreOriginal = categoria.nombre;
  }

  cancelarEdicionCategoria(categoria: Categoria): void {
    categoria.editando = false;
    categoria.nombre = categoria.nombreOriginal || categoria.nombre;
  }

  guardarEdicionCategoria(categoria: Categoria): void {
    if (!categoria.nombre.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'El nombre es obligatorio' });
      return;
    }

    this.tareasService.editarCategoria(categoria.id, { nombre: categoria.nombre }).subscribe({
      next: (res) => {
        if (res.tipo === 1) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría actualizada' });
          categoria.editando = false;
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: res.mensajes[0] });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar categoría' });
      }
    });
  }

  // ==================== SUBCATEGORÍAS ====================
  cargarSubcategorias(): void {
    this.cargandoSubcategorias = true;
    this.tareasService.obtenerSubcategorias().subscribe({
      next: (res) => {
        if (res.tipo === 1) {
          this.subcategorias = res.data.map((s: any) => ({
            id: Number(s.id),
            categoria_id: Number(s.categoria_id),
            nombre: s.nombre,
            editando: false
          }));
        }
        this.cargandoSubcategorias = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar subcategorías' });
        this.cargandoSubcategorias = false;
      }
    });
  }

  abrirModalSubcategoria(): void {
    this.nuevaSubcategoria = { nombre: '', categoria_id: null };
    this.modalSubcategoria = true;
  }

  guardarSubcategoria(): void {
    if (!this.nuevaSubcategoria.nombre.trim() || !this.nuevaSubcategoria.categoria_id) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Nombre y categoría son obligatorios' });
      return;
    }

    this.tareasService.crearSubcategoria(this.nuevaSubcategoria).subscribe({
      next: (res) => {
        if (res.tipo === 1) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Subcategoría creada correctamente' });
          this.modalSubcategoria = false;
          this.cargarSubcategorias();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: res.mensajes[0] });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear subcategoría' });
      }
    });
  }

  editarSubcategoria(subcategoria: Subcategoria): void {
    subcategoria.editando = true;
    subcategoria.nombreOriginal = subcategoria.nombre;
    subcategoria.categoriaOriginal = subcategoria.categoria_id;
  }

  cancelarEdicionSubcategoria(subcategoria: Subcategoria): void {
    subcategoria.editando = false;
    subcategoria.nombre = subcategoria.nombreOriginal || subcategoria.nombre;
    subcategoria.categoria_id = subcategoria.categoriaOriginal || subcategoria.categoria_id;
  }

  guardarEdicionSubcategoria(subcategoria: Subcategoria): void {
    if (!subcategoria.nombre.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'El nombre es obligatorio' });
      return;
    }

    this.tareasService.editarSubcategoria(subcategoria.id, { 
      nombre: subcategoria.nombre, 
      categoria_id: subcategoria.categoria_id 
    }).subscribe({
      next: (res) => {
        if (res.tipo === 1) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Subcategoría actualizada' });
          subcategoria.editando = false;
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: res.mensajes[0] });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar subcategoría' });
      }
    });
  }

  getNombreCategoria(categoriaId: number): string {
    const cat = this.categorias.find(c => c.id === categoriaId);
    return cat ? cat.nombre : 'Sin categoría';
  }

  // ==================== SUCURSALES ====================
  cargarSucursales(): void {
    this.cargandoSucursales = true;
    this.tareasService.obtenerSucursales().subscribe({
      next: (res) => {
        if (res.tipo === 1) {
          this.sucursales = res.data.map((s: any) => ({
            id: Number(s.id),
            nombre: s.nombre,
            direccion: s.direccion || '',
            editando: false
          }));
        }
        this.cargandoSucursales = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar sucursales' });
        this.cargandoSucursales = false;
      }
    });
  }

  abrirModalSucursal(): void {
    this.nuevaSucursal = { nombre: '', direccion: '' };
    this.modalSucursal = true;
  }

  guardarSucursal(): void {
    if (!this.nuevaSucursal.nombre.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'El nombre es obligatorio' });
      return;
    }

    this.tareasService.crearSucursal(this.nuevaSucursal).subscribe({
      next: (res) => {
        if (res.tipo === 1) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Sucursal creada correctamente' });
          this.modalSucursal = false;
          this.cargarSucursales();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: res.mensajes[0] });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear sucursal' });
      }
    });
  }

  editarSucursal(sucursal: Sucursal): void {
    sucursal.editando = true;
    sucursal.nombreOriginal = sucursal.nombre;
    sucursal.direccionOriginal = sucursal.direccion;
  }

  cancelarEdicionSucursal(sucursal: Sucursal): void {
    sucursal.editando = false;
    sucursal.nombre = sucursal.nombreOriginal || sucursal.nombre;
    sucursal.direccion = sucursal.direccionOriginal || sucursal.direccion;
  }

  guardarEdicionSucursal(sucursal: Sucursal): void {
    if (!sucursal.nombre.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'El nombre es obligatorio' });
      return;
    }

    this.tareasService.editarSucursal(sucursal.id, { 
      nombre: sucursal.nombre, 
      direccion: sucursal.direccion 
    }).subscribe({
      next: (res) => {
        if (res.tipo === 1) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Sucursal actualizada' });
          sucursal.editando = false;
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: res.mensajes[0] });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar sucursal' });
      }
    });
  }

  volver(): void {
    this.router.navigate(['/admin-tareas']);
  }
}
