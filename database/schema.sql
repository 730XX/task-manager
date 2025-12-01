-- ============================================================================
-- SCRIPT DE BASE DE DATOS - TASK MANAGER
-- Sistema de Gestión de Tareas y Actividades
-- Compatible con: MySQL 5.7+ / MariaDB 10.2+
-- XAMPP Compatible
-- ============================================================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS task_manager 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE task_manager;

-- ============================================================================
-- TABLAS EXISTENTES (NO SE MODIFICAN)
-- ============================================================================
-- Se asume que ya tienes:
-- - usuarios (con usuarios_id como PK)
-- - roles (con roles_id como PK)
-- ============================================================================


-- ============================================================================
-- 1. TABLA: CATEGORIAS
-- Gestión dinámica de categorías para tareas y actividades
-- ============================================================================
CREATE TABLE IF NOT EXISTS categorias (
    categoria_id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_nombre VARCHAR(50) UNIQUE NOT NULL,
    categoria_tipo ENUM('TAREA', 'ACTIVIDAD', 'AMBOS') DEFAULT 'AMBOS',
    categoria_color VARCHAR(7) DEFAULT '#6B7280',
    categoria_descripcion VARCHAR(200),
    categoria_activo TINYINT(1) DEFAULT 1,
    categoria_creado DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_categoria_activo (categoria_activo),
    INDEX idx_categoria_tipo (categoria_tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar categorías iniciales del frontend
INSERT INTO categorias (categoria_nombre, categoria_tipo, categoria_color) VALUES
('Almacenes', 'AMBOS', '#8B5CF6'),
('Limpieza', 'AMBOS', '#10B981'),
('Operaciones', 'AMBOS', '#3B82F6'),
('Cocina', 'AMBOS', '#EF4444'),
('Servicio', 'AMBOS', '#F59E0B'),
('Administración', 'AMBOS', '#6366F1'),
('Eventos', 'AMBOS', '#EC4899'),
('Mantenimiento', 'AMBOS', '#14B8A6'),
('Logística', 'AMBOS', '#8B5CF6'),
('Inventario', 'AMBOS', '#F97316'),
('Reportes', 'AMBOS', '#6366F1'),
('Capacitación', 'AMBOS', '#10B981'),
('Documentación', 'AMBOS', '#6B7280');


-- ============================================================================
-- 2. TABLA: SUBCATEGORIAS
-- Subcategorías asociadas a categorías padre
-- ============================================================================
CREATE TABLE IF NOT EXISTS subcategorias (
    subcategoria_id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT NOT NULL,
    subcategoria_nombre VARCHAR(50) NOT NULL,
    subcategoria_descripcion VARCHAR(200),
    subcategoria_activo TINYINT(1) DEFAULT 1,
    subcategoria_creado DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (categoria_id) REFERENCES categorias(categoria_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    INDEX idx_subcategoria_categoria (categoria_id),
    INDEX idx_subcategoria_activo (subcategoria_activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- 3. TABLA: ACTIVIDADES (Padre)
-- Representa grandes proyectos o grupos de tareas administrativas
-- ============================================================================
CREATE TABLE IF NOT EXISTS actividades (
    actividades_id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT NULL,
    
    actividades_titulo VARCHAR(150) NOT NULL,
    actividades_descripcion TEXT,
    actividades_sucursal VARCHAR(100),
    actividades_progreso TINYINT DEFAULT 0 CHECK (actividades_progreso BETWEEN 0 AND 100),
    
    -- Fechas y horarios
    actividades_fecha_programada DATE NOT NULL,
    actividades_hora_inicio TIME,
    actividades_hora_fin TIME,
    actividades_fecha_inicio_real DATETIME NULL,
    actividades_fecha_fin_real DATETIME NULL,
    
    -- Estados
    actividades_estado ENUM('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA') DEFAULT 'PENDIENTE',
    actividades_activo TINYINT(1) DEFAULT 1,
    
    -- Auditoría
    actividades_creado_por INT NOT NULL,
    actividades_creado DATETIME DEFAULT CURRENT_TIMESTAMP,
    actividades_actualizado DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (categoria_id) REFERENCES categorias(categoria_id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    FOREIGN KEY (actividades_creado_por) REFERENCES usuarios(usuarios_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    
    INDEX idx_actividades_fecha (actividades_fecha_programada),
    INDEX idx_actividades_estado (actividades_estado),
    INDEX idx_actividades_sucursal (actividades_sucursal),
    INDEX idx_actividades_creador (actividades_creado_por)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- 4. TABLA: TAREAS (Hija)
-- Tareas individuales asignables a usuarios
-- ============================================================================
CREATE TABLE IF NOT EXISTS tareas (
    tareas_id INT AUTO_INCREMENT PRIMARY KEY,
    actividades_id INT NULL,
    categoria_id INT NULL,
    subcategoria_id INT NULL,
    usuarios_id INT NULL, -- NULL = "Sin Asignar"
    
    -- Información básica
    tareas_titulo VARCHAR(150) NOT NULL,
    tareas_descripcion TEXT,
    tareas_prioridad ENUM('ALTA', 'MEDIA', 'BAJA') DEFAULT 'MEDIA',
    
    -- Fechas
    tareas_fecha_programada DATETIME NOT NULL,
    tareas_fecha_vencimiento DATETIME,
    tareas_fecha_inicio_real DATETIME NULL,
    tareas_fecha_fin_real DATETIME NULL,
    
    -- Asignación
    tareas_tipo_asignacion ENUM('INDIVIDUAL', 'CARGO') DEFAULT 'INDIVIDUAL',
    tareas_cargo_destino VARCHAR(50) NULL,
    tareas_responsable_nombre VARCHAR(100),
    
    -- Estados y control
    tareas_estado ENUM('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA') DEFAULT 'PENDIENTE',
    tareas_orden INT DEFAULT 0,
    tareas_activo TINYINT(1) DEFAULT 1,
    tareas_reabierta TINYINT(1) DEFAULT 0,
    
    -- Auditoría de completado
    tareas_completada_por INT NULL,
    tareas_fecha_completado DATETIME NULL,
    
    -- Timestamps
    tareas_creado_por INT NOT NULL,
    tareas_creado DATETIME DEFAULT CURRENT_TIMESTAMP,
    tareas_actualizado DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (actividades_id) REFERENCES actividades(actividades_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(categoria_id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    FOREIGN KEY (subcategoria_id) REFERENCES subcategorias(subcategoria_id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    FOREIGN KEY (usuarios_id) REFERENCES usuarios(usuarios_id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    FOREIGN KEY (tareas_completada_por) REFERENCES usuarios(usuarios_id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    FOREIGN KEY (tareas_creado_por) REFERENCES usuarios(usuarios_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    
    INDEX idx_tareas_fecha_prog (tareas_fecha_programada),
    INDEX idx_tareas_usuario (usuarios_id),
    INDEX idx_tareas_usuario_fecha (usuarios_id, tareas_fecha_programada),
    INDEX idx_tareas_estado (tareas_estado),
    INDEX idx_tareas_prioridad (tareas_prioridad),
    INDEX idx_tareas_actividad (actividades_id),
    INDEX idx_tareas_sin_asignar (usuarios_id, tareas_estado, tareas_fecha_programada),
    INDEX idx_tareas_categoria (categoria_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- 5. TABLA: HISTORIAL_REAPERTURAS
-- Auditoría de reaperturas de tareas completadas
-- ============================================================================
CREATE TABLE IF NOT EXISTS historial_reaperturas (
    reapertura_id INT AUTO_INCREMENT PRIMARY KEY,
    tareas_id INT NOT NULL,
    usuarios_id INT NOT NULL, -- Quién reabrió la tarea
    
    -- Motivos exactos del frontend
    reapertura_motivo ENUM(
        'ERROR_EJECUCION',
        'INFORMACION_INCOMPLETA',
        'CAMBIO_REQUERIMIENTOS',
        'SOLICITUD_CLIENTE',
        'CORRECCION_CALIDAD',
        'OTROS'
    ) NOT NULL,
    
    reapertura_observacion TEXT NOT NULL,
    
    -- Cambios aplicados
    reapertura_prioridad_nueva ENUM('ALTA', 'MEDIA', 'BAJA'),
    reapertura_fecha_vencimiento_nueva DATETIME,
    
    -- Estado anterior (auditoría)
    reapertura_estado_anterior ENUM('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA') NOT NULL,
    reapertura_prioridad_anterior ENUM('ALTA', 'MEDIA', 'BAJA'),
    
    reapertura_fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tareas_id) REFERENCES tareas(tareas_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY (usuarios_id) REFERENCES usuarios(usuarios_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    
    INDEX idx_reapertura_tarea (tareas_id),
    INDEX idx_reapertura_usuario (usuarios_id),
    INDEX idx_reapertura_fecha (reapertura_fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- 6. TABLA: TAREAS_ASIGNACIONES
-- Historial de asignaciones y reasignaciones
-- ============================================================================
CREATE TABLE IF NOT EXISTS tareas_asignaciones (
    asignacion_id INT AUTO_INCREMENT PRIMARY KEY,
    tareas_id INT NOT NULL,
    usuarios_id_anterior INT NULL,
    usuarios_id_nuevo INT NOT NULL,
    asignado_por INT NOT NULL, -- Admin o el mismo usuario
    
    asignacion_tipo ENUM('AUTO', 'MANUAL', 'REASIGNACION') DEFAULT 'MANUAL',
    asignacion_comentario VARCHAR(255),
    asignacion_fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tareas_id) REFERENCES tareas(tareas_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY (usuarios_id_anterior) REFERENCES usuarios(usuarios_id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    FOREIGN KEY (usuarios_id_nuevo) REFERENCES usuarios(usuarios_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    FOREIGN KEY (asignado_por) REFERENCES usuarios(usuarios_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    
    INDEX idx_asignacion_tarea (tareas_id),
    INDEX idx_asignacion_usuario_nuevo (usuarios_id_nuevo),
    INDEX idx_asignacion_fecha (asignacion_fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- 7. TABLA: TAREAS_COMENTARIOS
-- Sistema de comentarios para colaboración
-- ============================================================================
CREATE TABLE IF NOT EXISTS tareas_comentarios (
    comentario_id INT AUTO_INCREMENT PRIMARY KEY,
    tareas_id INT NOT NULL,
    usuarios_id INT NOT NULL,
    
    comentario_texto TEXT NOT NULL,
    comentario_adjunto VARCHAR(255) NULL, -- Path del archivo adjunto
    comentario_tipo ENUM('NORMAL', 'SISTEMA', 'IMPORTANTE') DEFAULT 'NORMAL',
    
    comentario_creado DATETIME DEFAULT CURRENT_TIMESTAMP,
    comentario_editado DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tareas_id) REFERENCES tareas(tareas_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY (usuarios_id) REFERENCES usuarios(usuarios_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    INDEX idx_comentario_tarea (tareas_id),
    INDEX idx_comentario_usuario (usuarios_id),
    INDEX idx_comentario_fecha (comentario_creado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- 8. TABLA: TAREAS_ARCHIVOS
-- Gestión de archivos adjuntos
-- ============================================================================
CREATE TABLE IF NOT EXISTS tareas_archivos (
    archivo_id INT AUTO_INCREMENT PRIMARY KEY,
    tareas_id INT NOT NULL,
    usuarios_id INT NOT NULL, -- Quién subió el archivo
    
    archivo_nombre_original VARCHAR(255) NOT NULL,
    archivo_nombre_sistema VARCHAR(255) NOT NULL UNIQUE,
    archivo_ruta VARCHAR(500) NOT NULL,
    archivo_tipo VARCHAR(50),
    archivo_tamano INT, -- En bytes
    
    archivo_subido DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tareas_id) REFERENCES tareas(tareas_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY (usuarios_id) REFERENCES usuarios(usuarios_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    
    INDEX idx_archivo_tarea (tareas_id),
    INDEX idx_archivo_usuario (usuarios_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- VISTAS ÚTILES PARA EL BACKEND
-- ============================================================================

-- Vista: Tareas con información completa
CREATE OR REPLACE VIEW vista_tareas_completas AS
SELECT 
    t.tareas_id,
    t.tareas_titulo,
    t.tareas_descripcion,
    t.tareas_estado,
    t.tareas_prioridad,
    t.tareas_fecha_programada,
    t.tareas_fecha_vencimiento,
    t.tareas_reabierta,
    
    -- Categoría
    c.categoria_nombre,
    sc.subcategoria_nombre,
    
    -- Usuario asignado
    u.usuarios_id,
    CONCAT(u.usuarios_nombre, ' ', u.usuarios_apellido) AS usuario_nombre_completo,
    
    -- Actividad padre (si existe)
    a.actividades_id,
    a.actividades_titulo,
    a.actividades_sucursal,
    
    -- Completado por
    uc.usuarios_id AS completado_por_id,
    CONCAT(uc.usuarios_nombre, ' ', uc.usuarios_apellido) AS completado_por_nombre,
    t.tareas_fecha_completado,
    
    -- Timestamps
    t.tareas_creado,
    t.tareas_actualizado
FROM tareas t
LEFT JOIN categorias c ON t.categoria_id = c.categoria_id
LEFT JOIN subcategorias sc ON t.subcategoria_id = sc.subcategoria_id
LEFT JOIN usuarios u ON t.usuarios_id = u.usuarios_id
LEFT JOIN actividades a ON t.actividades_id = a.actividades_id
LEFT JOIN usuarios uc ON t.tareas_completada_por = uc.usuarios_id
WHERE t.tareas_activo = 1;


-- Vista: Actividades con estadísticas de subtareas
CREATE OR REPLACE VIEW vista_actividades_estadisticas AS
SELECT 
    a.actividades_id,
    a.actividades_titulo,
    a.actividades_sucursal,
    a.actividades_estado,
    a.actividades_fecha_programada,
    a.actividades_hora_inicio,
    a.actividades_hora_fin,
    
    c.categoria_nombre,
    
    -- Estadísticas de subtareas
    COUNT(t.tareas_id) AS total_subtareas,
    SUM(CASE WHEN t.tareas_estado = 'COMPLETADA' THEN 1 ELSE 0 END) AS subtareas_completadas,
    SUM(CASE WHEN t.tareas_estado = 'EN_PROGRESO' THEN 1 ELSE 0 END) AS subtareas_en_progreso,
    SUM(CASE WHEN t.tareas_estado = 'PENDIENTE' THEN 1 ELSE 0 END) AS subtareas_pendientes,
    
    -- Porcentaje de progreso calculado
    CASE 
        WHEN COUNT(t.tareas_id) > 0 THEN
            ROUND((SUM(CASE WHEN t.tareas_estado = 'COMPLETADA' THEN 1 ELSE 0 END) * 100.0) / COUNT(t.tareas_id), 0)
        ELSE 0
    END AS porcentaje_progreso,
    
    a.actividades_creado
FROM actividades a
LEFT JOIN categorias c ON a.categoria_id = c.categoria_id
LEFT JOIN tareas t ON a.actividades_id = t.actividades_id AND t.tareas_activo = 1
WHERE a.actividades_activo = 1
GROUP BY a.actividades_id;


-- ============================================================================
-- TRIGGERS AUTOMÁTICOS
-- ============================================================================

-- Trigger: Actualizar progreso de actividad al cambiar estado de tarea
DELIMITER //
CREATE TRIGGER trg_actualizar_progreso_actividad
AFTER UPDATE ON tareas
FOR EACH ROW
BEGIN
    IF NEW.actividades_id IS NOT NULL AND (OLD.tareas_estado != NEW.tareas_estado OR OLD.tareas_activo != NEW.tareas_activo) THEN
        UPDATE actividades a
        SET a.actividades_progreso = (
            SELECT ROUND((SUM(CASE WHEN t.tareas_estado = 'COMPLETADA' THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 0)
            FROM tareas t
            WHERE t.actividades_id = NEW.actividades_id AND t.tareas_activo = 1
        )
        WHERE a.actividades_id = NEW.actividades_id;
    END IF;
END//
DELIMITER ;


-- Trigger: Registrar asignación automática en historial
DELIMITER //
CREATE TRIGGER trg_registrar_asignacion
AFTER UPDATE ON tareas
FOR EACH ROW
BEGIN
    IF OLD.usuarios_id IS NULL AND NEW.usuarios_id IS NOT NULL THEN
        INSERT INTO tareas_asignaciones (
            tareas_id, 
            usuarios_id_anterior, 
            usuarios_id_nuevo, 
            asignado_por, 
            asignacion_tipo
        ) VALUES (
            NEW.tareas_id,
            OLD.usuarios_id,
            NEW.usuarios_id,
            NEW.usuarios_id, -- Auto-asignación
            'AUTO'
        );
    ELSEIF OLD.usuarios_id IS NOT NULL AND NEW.usuarios_id IS NOT NULL AND OLD.usuarios_id != NEW.usuarios_id THEN
        INSERT INTO tareas_asignaciones (
            tareas_id, 
            usuarios_id_anterior, 
            usuarios_id_nuevo, 
            asignado_por, 
            asignacion_tipo
        ) VALUES (
            NEW.tareas_id,
            OLD.usuarios_id,
            NEW.usuarios_id,
            NEW.usuarios_id,
            'REASIGNACION'
        );
    END IF;
END//
DELIMITER ;


-- Trigger: Marcar tarea como reabierta al insertar en historial_reaperturas
DELIMITER //
CREATE TRIGGER trg_marcar_tarea_reabierta
AFTER INSERT ON historial_reaperturas
FOR EACH ROW
BEGIN
    UPDATE tareas 
    SET 
        tareas_reabierta = 1,
        tareas_estado = 'PENDIENTE',
        tareas_prioridad = COALESCE(NEW.reapertura_prioridad_nueva, tareas_prioridad),
        tareas_fecha_vencimiento = COALESCE(NEW.reapertura_fecha_vencimiento_nueva, tareas_fecha_vencimiento),
        tareas_completada_por = NULL,
        tareas_fecha_completado = NULL
    WHERE tareas_id = NEW.tareas_id;
END//
DELIMITER ;


-- ============================================================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- ============================================================================

-- Procedimiento: Obtener mis tareas por fecha
DELIMITER //
CREATE PROCEDURE sp_obtener_mis_tareas(
    IN p_usuario_id INT,
    IN p_fecha DATE
)
BEGIN
    SELECT * FROM vista_tareas_completas
    WHERE usuarios_id = p_usuario_id
    AND DATE(tareas_fecha_programada) = p_fecha
    ORDER BY 
        FIELD(tareas_prioridad, 'ALTA', 'MEDIA', 'BAJA'),
        tareas_orden,
        tareas_fecha_programada;
END//
DELIMITER ;


-- Procedimiento: Obtener tareas sin asignar
DELIMITER //
CREATE PROCEDURE sp_obtener_tareas_sin_asignar(
    IN p_fecha DATE
)
BEGIN
    SELECT * FROM vista_tareas_completas
    WHERE usuarios_id IS NULL
    AND DATE(tareas_fecha_programada) = p_fecha
    ORDER BY 
        FIELD(tareas_prioridad, 'ALTA', 'MEDIA', 'BAJA'),
        tareas_fecha_programada;
END//
DELIMITER ;


-- Procedimiento: Obtener resumen de tareas por usuario y fecha
DELIMITER //
CREATE PROCEDURE sp_resumen_tareas_usuario(
    IN p_usuario_id INT,
    IN p_fecha DATE
)
BEGIN
    SELECT 
        COUNT(*) AS total_tareas,
        SUM(CASE WHEN tareas_estado = 'COMPLETADA' THEN 1 ELSE 0 END) AS tareas_completadas,
        SUM(CASE WHEN tareas_estado = 'EN_PROGRESO' THEN 1 ELSE 0 END) AS tareas_en_progreso,
        SUM(CASE WHEN tareas_estado = 'PENDIENTE' THEN 1 ELSE 0 END) AS tareas_pendientes,
        ROUND((SUM(CASE WHEN tareas_estado = 'COMPLETADA' THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 0) AS porcentaje_avance
    FROM tareas
    WHERE usuarios_id = p_usuario_id
    AND DATE(tareas_fecha_programada) = p_fecha
    AND tareas_activo = 1;
END//
DELIMITER ;


-- Procedimiento: Asignar múltiples tareas a un usuario
DELIMITER //
CREATE PROCEDURE sp_asignar_tareas_masivo(
    IN p_tareas_ids VARCHAR(500), -- IDs separados por coma: "1,2,3"
    IN p_usuario_id INT,
    IN p_asignado_por INT
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE tarea_id INT;
    DECLARE cur CURSOR FOR 
        SELECT CAST(value AS UNSIGNED) 
        FROM JSON_TABLE(
            CONCAT('["', REPLACE(p_tareas_ids, ',', '","'), '"]'),
            '$[*]' COLUMNS(value VARCHAR(50) PATH '$')
        ) AS jt;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO tarea_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        UPDATE tareas 
        SET usuarios_id = p_usuario_id,
            tareas_responsable_nombre = (
                SELECT CONCAT(usuarios_nombre, ' ', usuarios_apellido) 
                FROM usuarios WHERE usuarios_id = p_usuario_id
            )
        WHERE tareas_id = tarea_id AND usuarios_id IS NULL;
        
        INSERT INTO tareas_asignaciones (
            tareas_id, 
            usuarios_id_nuevo, 
            asignado_por, 
            asignacion_tipo
        ) VALUES (
            tarea_id, 
            p_usuario_id, 
            p_asignado_por, 
            IF(p_usuario_id = p_asignado_por, 'AUTO', 'MANUAL')
        );
    END LOOP;
    CLOSE cur;
END//
DELIMITER ;


-- ============================================================================
-- DATOS DE PRUEBA (OPCIONAL - Comentar si no se necesita)
-- ============================================================================

-- Nota: Asegúrate de tener al menos un usuario en la tabla 'usuarios'
-- antes de ejecutar estos inserts

/*
-- Insertar actividad de prueba (requiere usuarios_id válido)
INSERT INTO actividades (
    actividades_titulo, 
    actividades_sucursal, 
    actividades_fecha_programada,
    actividades_hora_inicio,
    actividades_hora_fin,
    actividades_creado_por,
    categoria_id
) VALUES 
('Auditoría Sucursal Centro', 'Sede Centro', CURDATE(), '08:00:00', '18:00:00', 1, 1),
('Capacitación Personal Nuevo', 'Sucursal Norte', CURDATE(), '09:00:00', '17:00:00', 1, 12);

-- Insertar tareas de prueba
INSERT INTO tareas (
    tareas_titulo,
    tareas_descripcion,
    tareas_prioridad,
    tareas_fecha_programada,
    tareas_creado_por,
    categoria_id,
    usuarios_id
) VALUES
('Revisar inventario almacén principal', 'Verificar stock de productos críticos', 'ALTA', NOW(), 1, 1, NULL),
('Limpieza área de cocina', 'Limpieza profunda post-servicio', 'MEDIA', NOW(), 1, 2, NULL),
('Preparar reporte mensual', 'Generar estadísticas del mes', 'BAJA', NOW(), 1, 11, 1);
*/


-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================
SELECT 'Script ejecutado correctamente!' AS status,
       NOW() AS fecha_ejecucion,
       DATABASE() AS base_datos_activa;

SHOW TABLES;
