import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TareasList } from './pages/tareas-list/tareas-list';
import { SubtareaDetail } from './pages/subtarea-detail/subtarea-detail';
import { CrearReapertura } from './pages/crear-reapertura/crear-reapertura';

const routes: Routes = [
  {
    path: '',
    component: TareasList
  },
  {
    path: 'subtarea-info/:id',
    component: SubtareaDetail
  },
  {
    path: 'tarea-reapertura/:id',
    component: CrearReapertura
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuarioTareasRoutingModule { }
