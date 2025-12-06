import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from '../components/components-module';

// Lucide Icons
import { LucideAngularModule, CheckSquare, ChevronDown, LogOut, ListTodo, Users, Filter, Search, Clock, Loader, CheckCircle, Plus, Check } from 'lucide-angular';

// PrimeNG Components
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { Textarea } from 'primeng/textarea';
import { DatePicker } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

import { TareasList } from './tareas-list/tareas-list';
import { SubtareaDetail } from './subtarea-detail/subtarea-detail';
import { CrearReapertura } from './crear-reapertura/crear-reapertura';

@NgModule({
  declarations: [
    TareasList,
    SubtareaDetail,
    CrearReapertura
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ComponentsModule,
    Dialog,
    Select,
    Button,
    Textarea,
    DatePicker,
    ToastModule,
    TooltipModule,
    LucideAngularModule.pick({ CheckSquare, ChevronDown, LogOut, ListTodo, Users, Filter, Search, Clock, Loader, CheckCircle, Plus, Check })
  ],
  exports: [
    TareasList,
    SubtareaDetail,
    CrearReapertura,
    RouterModule
  ]
})
export class PagesModule { }
