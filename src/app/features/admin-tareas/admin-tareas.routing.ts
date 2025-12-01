import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TareasList } from './pages/admin-tareas-list/tareas-list';
import { TareasDetail } from './pages/actividad-detail/tareas-detail';
import { SubtareaDetail } from './pages/tarea-detail/subtarea-detail';
import { CrearTarea } from './pages/crear-tarea/crear-tarea';
import { EditarActividad } from './pages/editar-actividad/editar-actividad';
import { EditarTarea } from './pages/editar-tarea/editar-tarea';
import { CrearActividad } from './pages/crear-actividad/crear-actividad';

const routes: Routes = [
  {
    path: '',
    component: TareasList
  },
  {
    path: 'tarea/:id',
    component: SubtareaDetail
  },
  {
    path: 'actividad/:id',
    component: TareasDetail
  },
  {
    path: 'crear-tarea',
    component: CrearTarea
  },
  {
    path: 'crear-actividad',
    component: CrearActividad
  },
  {
    path: 'editar-actividad/:id',
    component: EditarActividad
  },
  {
    path: 'editar-tarea/:id',
    component: EditarTarea
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminTareasRoutingModule { }
