import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { Tarea, TareaAdmin, TareaAdminClass, ResumenTareas } from '../models/tarea.model';

@Injectable({
  providedIn: 'root'
})
export class TareasService {

  // Subject para notificar cambios en subtareas
  private subtareasActualizadasSubject = new Subject<void>();
  public subtareasActualizadas$ = this.subtareasActualizadasSubject.asObservable();
  public apartadoadmin = true;
  
  // Usuario actual del sistema
  public usuarioActual = 'Usuario';
  
  // Subject para cambios en el título de subtareas
  private tituloSubtareasSubject = new Subject<string>();
  public tituloSubtareas$ = this.tituloSubtareasSubject.asObservable();

  // Almacén de subtareas por tarea ID
  private subtareasPorTarea: { [tareaId: string]: any[] } = {};

  // Datos mock para tareas admin - VACÍO (usar endpoints del backend)
  public tareasadmin: TareaAdminClass[] = [];

  public tareasignar: Tarea[] = [];

  // Datos mock para tareas - VACÍO (usar endpoints del backend)
  public tareasMock: Tarea[] = [];

  // Subtareas mock - VACÍO
  public subtareas: any[] = [];

  // Estados originales para poder restaurar
  private estadosOriginales: { [key: string]: { progreso: number, subtareasCompletadas: number } } = {};

  constructor(private http: HttpClient) { }

  

 }

