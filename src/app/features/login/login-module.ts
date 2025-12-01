import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Lucide Icons
import { LucideAngularModule, Eye, EyeOff, Package, Lock, Mail } from 'lucide-angular';

// Component
import { Login } from './login';

const routes: Routes = [
  {
    path: '',
    component: Login
  }
];

@NgModule({
  declarations: [
    Login
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    InputTextModule,
    ButtonModule,
    CheckboxModule,
    ToastModule,
    ProgressSpinnerModule,
    LucideAngularModule.pick({ Eye, EyeOff, Package, Lock, Mail })
  ],
  providers: [
    MessageService
  ]
})
export class LoginModule { }
