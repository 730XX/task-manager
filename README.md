# Task Manager RBAC (Role-Based Access Control)

## Resumen Ejecutivo

Este proyecto implementa un sistema de gestión de tareas con control de acceso basado en roles (RBAC) usando Angular y PHP (Slim) como backend. Permite separar completamente la experiencia de usuario entre administradores y usuarios normales, garantizando seguridad, escalabilidad y facilidad de mantenimiento.

---

## Arquitectura General

- **Frontend:** Angular 20, PrimeNG, módulos standalone, lazy loading
- **Backend:** PHP Slim v2, JWT, MySQL
- **Autenticación:** JWT, roles embebidos en el token
- **Roles:**
  - `ADMIN`: Acceso total (CRUD tareas y actividades, gestión de usuarios, etc.)
  - `USER`: Acceso limitado (solo ver/gestionar sus tareas)

---

## Funcionalidades Implementadas

### 1. Separación de módulos por rol
- **admin-tareas/**: Vista exclusiva para administradores
  - CRUD completo de tareas y actividades
  - 3 tabs: Mis Tareas, Sin Asignar, Actividades
  - Acceso protegido por `AdminGuard`
- **usuario-tareas/**: Vista para usuarios normales
  - Solo 2 tabs: Mis Tareas, Sin Asignar
  - Solo puede asignarse tareas, completarlas o reabrirlas
  - Sin acceso a crear/editar tareas ni actividades
  - Acceso protegido por `UserGuard`

### 2. Guards y rutas protegidas
- **AdminGuard**: Solo permite acceso a `/admin-tareas` si el usuario es ADMIN
- **UserGuard**: Solo permite acceso a `/tareas` si el usuario es USER (redirige a admin si es ADMIN)
- **AuthGuard**: Protege rutas generales
- **Redirección automática** tras login según rol

### 3. Experiencia de usuario diferenciada
- **ADMIN**:
  - Puede crear, editar y eliminar tareas y actividades
  - Acceso a todas las pestañas y funcionalidades
- **USER**:
  - Solo puede ver y gestionar sus tareas
  - No ve botones de crear/editar
  - No accede a pestaña de actividades

### 4. Código limpio y mantenible
- Servicios y modelos compartidos en `/core` y `/shared`
- Módulos y rutas totalmente desacoplados
- Sin condicionales *ngIf* para ocultar funcionalidades: todo es por arquitectura

---

## Seguridad
- JWT con roles en el payload
- Guards en frontend y middleware en backend
- Redirección automática según permisos

---

## Cómo probar
1. Iniciar backend y frontend normalmente
2. Loguearse con usuario ADMIN: será redirigido a `/admin-tareas` (todas las funciones)
3. Loguearse con usuario USER: será redirigido a `/tareas` (solo funciones limitadas)
4. Intentar acceder manualmente a rutas restringidas: el sistema redirige según permisos

---

## Estructura de carpetas relevante

```
features/
  admin-tareas/         # Módulo exclusivo para admin
  usuario-tareas/       # Módulo para usuarios normales
core/
  guards/               # AdminGuard, UserGuard, AuthGuard
  services/             # AuthService, TareasService, etc.
```

---

## Estado actual
- [x] Separación total de vistas por rol
- [x] Guards y rutas protegidas
- [x] Redirección automática tras login
- [x] Código limpio y modular
- [x] Seguridad robusta

---

## Autor
Desarrollado por Elder Cardoza para el CEO. ¡Listo para demo y revisión!
