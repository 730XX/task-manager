import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AdminTareasRoutingModule } from './admin-tareas.routing';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

// Lucide Icons
import { LucideAngularModule, ListTodo, FolderKanban, Plus, Filter, LogOut, Settings, Folder, FolderOpen, Building2, Pencil, X, Check, RefreshCw, ArrowLeft, CheckSquare, ChevronDown, Clock, Loader, CheckCircle, Search, Users, RotateCcw, Info } from 'lucide-angular';

// PrimeNG Components
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { Textarea } from 'primeng/textarea';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';

// Pages
import { TareasList } from './pages/admin-tareas-list/tareas-list';
import { CrearTarea } from './pages/crear-tarea/crear-tarea';
import { EditarTarea } from './pages/editar-tarea/editar-tarea';
import { CrearActividad } from './pages/crear-actividad/crear-actividad';
import { EditarActividad } from './pages/editar-actividad/editar-actividad';
import { TareasDetail } from './pages/actividad-detail/tareas-detail';
import { SubtareaDetail } from './pages/tarea-detail/subtarea-detail';
import { Configuracion } from './pages/configuracion/configuracion';
import { ReabrirTareaModal } from './pages/tarea-detail/reabrir-tarea-modal/reabrir-tarea-modal';

// Shared components
import { ComponentsModule } from '../usuario-tareas/components/components-module';

@NgModule({
  declarations: [
    TareasList,
    CrearTarea,
    EditarTarea,
    CrearActividad,
    EditarActividad,
    TareasDetail,
    SubtareaDetail,
    Configuracion,
    ReabrirTareaModal
  ],
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    ToastModule,
    TooltipModule,
    Dialog,
    Select,
    Button,
    Textarea,
    DatePicker,
    InputText,
    ComponentsModule,
    AdminTareasRoutingModule,
    LucideAngularModule.pick({ ListTodo, FolderKanban, Plus, Filter, LogOut, Settings, Folder, FolderOpen, Building2, Pencil, X, Check, RefreshCw, ArrowLeft, CheckSquare, ChevronDown, Clock, Loader, CheckCircle, Search, Users, RotateCcw, Info })
  ],
  providers: [
    MessageService
  ]
})
export class AdminTareasModule { }
