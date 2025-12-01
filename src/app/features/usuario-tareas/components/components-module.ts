import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG Components
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { Textarea } from 'primeng/textarea';
import { DatePicker } from 'primeng/datepicker';

import { MisTareas } from './mis-tareas/mis-tareas';
import { EquiposTareas } from './equipos-tareas/equipos-tareas';
import { SubtareasList } from './subtareas-list/subtareas-list';
import { FiltrosModal } from './filtros-modal/filtros-modal';
import { FiltrosAdminModal } from './filtros-admin-modal/filtros-admin-modal';
import { TareaFormModal } from './tarea-form-modal/tarea-form-modal';

@NgModule({
  declarations: [
    MisTareas,
    EquiposTareas,
    SubtareasList,
    FiltrosModal,
    FiltrosAdminModal,
    TareaFormModal
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    Dialog,
    Select,
    Button,
    Textarea,
    DatePicker
  ],
  exports: [
    MisTareas,
    EquiposTareas,
    SubtareasList,
    FiltrosModal,
    FiltrosAdminModal,
    TareaFormModal,
    CommonModule,
    FormsModule,
    RouterModule
  ]
})
export class ComponentsModule { }
