import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from './core/guards/admin.guard';
import { UserGuard } from './core/guards/user.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./features/login/login-module').then(m => m.LoginModule)
  },
  {
    path: 'admin-tareas',
    loadChildren: () => import('./features/admin-tareas/admin-tareas.module').then(m => m.AdminTareasModule),
    canActivate: [AdminGuard]
  },
  {
    path: 'tareas',
    loadChildren: () => import('./features/usuario-tareas/usuario-tareas-module').then(m => m.UsuarioTareasModule),
    canActivate: [UserGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
