import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { UsuarioTareasRoutingModule } from './usuario-tareas-routing.module';
import { PagesModule } from './pages/pages-module';
import { ComponentsModule } from './components/components-module';
import { TareasService } from './services/tareas.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ToastModule,
    ComponentsModule,
    PagesModule,
    UsuarioTareasRoutingModule
  ],
  providers: [
    TareasService,
    MessageService
  ]
})
export class UsuarioTareasModule { }
