-- ============================================================================
-- INNOVEX CRM B2B2C
-- Motor: MySQL 8.0+
-- ============================================================================
DROP DATABASE IF EXISTS innovex_db;
CREATE DATABASE inovex_db;
USE innovex_db;

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ============================================================================
-- SECCIÓN 1: CATÁLOGOS DEL SISTEMA
-- ============================================================================

CREATE TABLE IF NOT EXISTS catalogo_tipo_transaccion (
    codigo                   VARCHAR(60)    NOT NULL PRIMARY KEY,
    descripcion              VARCHAR(200)   NOT NULL,
    direccion                ENUM('credito','debito','neutro') NOT NULL,
    aplica_estado_comision   TINYINT(1)     NOT NULL DEFAULT 0,
    es_reversible            TINYINT(1)     NOT NULL DEFAULT 1,
    activo                   TINYINT(1)     NOT NULL DEFAULT 1,
    created_at               TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO catalogo_tipo_transaccion
    (codigo, descripcion, direccion, aplica_estado_comision, es_reversible) VALUES
    ('comision_generada',
     'Comisión calculada al aprobar una venta. No modifica saldo_disponible; queda en pendiente_liberacion hasta confirmación bancaria.',
     'neutro',  1, 1),
    ('comision_liberada',
     'Comisión habilitada para retiro tras confirmación bancaria real. Solo entonces ingresa a saldo_disponible.',
     'credito', 1, 1),
    ('comision_retenida',
     'Comisión congelada por retención administrativa — doc v2.1 §5.5.4.',
     'debito',  1, 1),
    ('retencion_liberada',
     'Comisión retenida liberada por administrador — doc v2.1 §5.5.4.',
     'credito', 1, 1),
    ('pago_deuda',
     'Pago realizado por distribuidor sobre su deuda.',
     'debito',  0, 1),
    ('descuento_deuda_por_venta',
     'Reducción de deuda al validar una venta.',
     'debito',  0, 1),
    ('retiro_comision',
     'Retiro o pago de comisión al distribuidor.',
     'debito',  0, 1),
    ('penalizacion_financiera',
     'Sanción económica por infracción registrada.',
     'debito',  0, 1),
    ('ajuste_admin_credito',
     'Ajuste manual positivo con doble aprobación.',
     'credito', 0, 1),
    ('ajuste_admin_debito',
     'Ajuste manual negativo con doble aprobación.',
     'debito',  0, 1),
    ('puntos_marketplace_acreditados',
     'Puntos de recompensa acreditados. direccion=neutro: no modifica saldo_disponible. Ver DECISIÓN 4.',
     'neutro',  0, 1),
    ('puntos_marketplace_canjeados',
     'Puntos descontados al canjear una recompensa. direccion=neutro: no modifica saldo_disponible. Ver DECISIÓN 4.',
     'neutro',  0, 1),
    ('reversa',
     'Reversión de transacción previa con referencia explícita. es_reversible=0: nunca revertir una reversa. Ver DECISIÓN 1.',
     'neutro',  0, 0);


-- ============================================================================
-- SECCIÓN 2: IDENTIDAD GLOBAL — PASAPORTE GLOBAL
-- ============================================================================

CREATE TABLE IF NOT EXISTS usuario (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    uuid                     CHAR(36)         NOT NULL UNIQUE,
    nombre                   VARCHAR(100)     NOT NULL,
    apellido                 VARCHAR(100)     NOT NULL,
    numero_documento         VARCHAR(30)      NOT NULL UNIQUE,
    tipo_documento           ENUM('dni','pasaporte','cedula','ruc','otro') NOT NULL,
    email                    VARCHAR(180)     NOT NULL UNIQUE,
    telefono                 VARCHAR(30)      NOT NULL,
    direccion                VARCHAR(255)     NULL,
    password_hash            VARCHAR(255)     NOT NULL,
    estado_global            ENUM('activo','suspendido','baneado') NOT NULL DEFAULT 'activo',
    es_usuario_sistema       TINYINT(1)       NOT NULL DEFAULT 0,
    es_superadmin            TINYINT(1)       NOT NULL DEFAULT 0,
    email_verificado_at      TIMESTAMP        NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at               TIMESTAMP        NULL,

    INDEX idx_usuario_email      (email),
    INDEX idx_usuario_documento  (numero_documento),
    INDEX idx_usuario_estado     (estado_global),
    INDEX idx_usuario_superadmin (es_superadmin),
    INDEX idx_usuario_deleted    (deleted_at),

    CONSTRAINT chk_usuario_sistema_no_superadmin CHECK (
        NOT (es_usuario_sistema = 1 AND es_superadmin = 1)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS registro_biometrico (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    usuario_id               BIGINT UNSIGNED  NOT NULL,
    tipo_biometria           ENUM('facial','dactilar') NOT NULL,
    representacion_cifrada   TEXT             NOT NULL,
    huella_integridad        VARCHAR(64)      NOT NULL,
    clave_ref_externa        VARCHAR(128)     NOT NULL,
    version                  SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    deleted_at               TIMESTAMP        NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_biometrico_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,

    INDEX idx_biometrico_usuario  (usuario_id),
    INDEX idx_biometrico_activo   (usuario_id, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS dispositivo_registrado (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    usuario_id               BIGINT UNSIGNED  NOT NULL,
    fingerprint              VARCHAR(128)     NOT NULL
                             COMMENT 'Hash identificador del dispositivo físico.',
    nombre_dispositivo       VARCHAR(100)     NULL,
    plataforma               ENUM('ios','android','web') NOT NULL,
    estado                   ENUM('confiable','pendiente','bloqueado') NOT NULL DEFAULT 'pendiente',
    primer_uso_at            TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultimo_uso_at            TIMESTAMP        NULL,
    ultimo_ip                VARCHAR(45)      NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_dispositivo_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,

    UNIQUE KEY uq_dispositivo_usuario_fp (usuario_id, fingerprint),
    INDEX idx_dispositivo_estado         (usuario_id, estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS consentimiento_usuario (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    usuario_id               BIGINT UNSIGNED  NOT NULL,
    tipo_consentimiento      VARCHAR(80)      NOT NULL,
    version_documento        VARCHAR(20)      NOT NULL,
    huella_documento         VARCHAR(64)      NOT NULL,
    aceptado                 TINYINT(1)       NOT NULL DEFAULT 1,
    contrato_id              BIGINT UNSIGNED  NULL,
    ip_origen                VARCHAR(45)      NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_consentimiento_usuario   FOREIGN KEY (usuario_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,
    CONSTRAINT fk_consentimiento_contrato  FOREIGN KEY (contrato_id)
        REFERENCES contrato_digital (id) ON DELETE RESTRICT,

    INDEX idx_consentimiento_usuario  (usuario_id),
    INDEX idx_consentimiento_tipo     (usuario_id, tipo_consentimiento),
    INDEX idx_consentimiento_contrato (contrato_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sesion_usuario (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    usuario_id               BIGINT UNSIGNED  NOT NULL,
    token_jti                VARCHAR(128)     NOT NULL UNIQUE,
    dispositivo_id           BIGINT UNSIGNED  NULL,
    ip_origen                VARCHAR(45)      NULL,
    canal                    ENUM('app_movil','panel_web','api') NOT NULL,
    activa                   TINYINT(1)       NOT NULL DEFAULT 1,
    expira_at                TIMESTAMP        NOT NULL,
    creada_at                TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revocada_at              TIMESTAMP        NULL,

    CONSTRAINT fk_sesion_usuario     FOREIGN KEY (usuario_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,
    CONSTRAINT fk_sesion_dispositivo FOREIGN KEY (dispositivo_id)
        REFERENCES dispositivo_registrado (id) ON DELETE RESTRICT,

    INDEX idx_sesion_usuario (usuario_id, activa),
    INDEX idx_sesion_expira  (expira_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- SECCIÓN 3: EMPRESAS (WORKSPACES) Y CONFIGURACIÓN MULTI-TENANT
-- ============================================================================

CREATE TABLE IF NOT EXISTS empresa (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    uuid                     CHAR(36)         NOT NULL UNIQUE,
    nombre                   VARCHAR(150)     NOT NULL,
    nombre_comercial         VARCHAR(150)     NULL,
    ruc_nit                  VARCHAR(30)      NULL,
    logo_url                 VARCHAR(500)     NULL,
    color_primario           CHAR(7)          NULL,
    color_secundario         CHAR(7)          NULL,
    moneda_iso               CHAR(3)          NOT NULL DEFAULT 'USD',
    zona_horaria             VARCHAR(50)      NOT NULL DEFAULT 'America/Lima',
    email_contacto           VARCHAR(180)     NULL,
    telefono_contacto        VARCHAR(30)      NULL,
    sitio_web                VARCHAR(255)     NULL,
    estado                   ENUM('activa','suspendida','configuracion','inactiva')
                             NOT NULL DEFAULT 'configuracion',
    plan_saas                VARCHAR(50)      NULL,
    max_distribuidores       INT UNSIGNED     NULL,
    creado_por_id            BIGINT UNSIGNED  NOT NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at               TIMESTAMP        NULL,

    UNIQUE KEY uq_empresa_ruc (ruc_nit, (IF(deleted_at IS NULL, 1, NULL))),

    CONSTRAINT fk_empresa_creado_por FOREIGN KEY (creado_por_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,

    INDEX idx_empresa_estado  (estado),
    INDEX idx_empresa_deleted (deleted_at),

    CONSTRAINT chk_empresa_color_primario CHECK (
        color_primario IS NULL
        OR (LENGTH(color_primario) = 7 AND color_primario REGEXP '^#[0-9A-Fa-f]{6}$')
    ),
    CONSTRAINT chk_empresa_color_secundario CHECK (
        color_secundario IS NULL
        OR (LENGTH(color_secundario) = 7 AND color_secundario REGEXP '^#[0-9A-Fa-f]{6}$')
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- SECCIÓN 3.5: ROLES ADMINISTRATIVOS POR EMPRESA (RBAC PANEL WEB)
-- ============================================================================

CREATE TABLE IF NOT EXISTS rol_workspace (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    empresa_id               BIGINT UNSIGNED  NOT NULL,
    usuario_id               BIGINT UNSIGNED  NOT NULL,
    rol                      ENUM('administrador_empresa') NOT NULL,
    asignado_por_id          BIGINT UNSIGNED  NOT NULL,
    revocado_por_id          BIGINT UNSIGNED  NULL,
    revocado_at              TIMESTAMP        NULL,
    motivo_revocacion        TEXT             NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at               TIMESTAMP        NULL,

    CONSTRAINT fk_rolws_empresa      FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_rolws_usuario      FOREIGN KEY (usuario_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,
    CONSTRAINT fk_rolws_asignador    FOREIGN KEY (asignado_por_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,
    CONSTRAINT fk_rolws_revocador    FOREIGN KEY (revocado_por_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,

    UNIQUE KEY uq_rolws_empresa_usuario_rol (
        empresa_id,
        usuario_id,
        rol,
        (IF(deleted_at IS NULL, 1, NULL))
    ),

    INDEX idx_rolws_empresa  (empresa_id, rol),
    INDEX idx_rolws_usuario  (usuario_id),
    INDEX idx_rolws_deleted  (deleted_at),
    INDEX idx_rolws_activos  (empresa_id, rol, deleted_at),
    INDEX idx_rolws_usuario_empresa_lookup (empresa_id, usuario_id, deleted_at),

    CONSTRAINT chk_rolws_revocacion_completa CHECK (
        revocado_at IS NULL
        OR (revocado_por_id IS NOT NULL
            AND revocado_at IS NOT NULL
            AND motivo_revocacion IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE IF NOT EXISTS configuracion_rangos (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    empresa_id               BIGINT UNSIGNED  NOT NULL,
    nombre_rango             VARCHAR(80)      NOT NULL,
    nivel                    TINYINT UNSIGNED NOT NULL,
    max_distribuidores_directos INT UNSIGNED  NULL,
    limite_kits_credito      INT UNSIGNED     NOT NULL DEFAULT 0,
    porcentaje_comision_cascada DECIMAL(5,2)  NOT NULL DEFAULT 0.00,
    accesos_json             JSON             NULL,
    activo                   TINYINT(1)       NOT NULL DEFAULT 1,
    vigente_desde            TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_rango_empresa FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,

    UNIQUE KEY uq_rango_empresa_nivel (empresa_id, nivel),
    INDEX idx_rango_empresa           (empresa_id, activo),

    CONSTRAINT chk_rango_comision CHECK (porcentaje_comision_cascada BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS historial_configuracion_rangos (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    empresa_id               BIGINT UNSIGNED  NOT NULL,
    rango_id                 BIGINT UNSIGNED  NOT NULL,
    nivel                    TINYINT UNSIGNED NOT NULL,
    snapshot_json            JSON             NOT NULL,
    motivo_cambio            TEXT             NOT NULL,
    cambiado_por_id          BIGINT UNSIGNED  NOT NULL,
    vigente_desde            TIMESTAMP        NOT NULL,
    vigente_hasta            TIMESTAMP        NOT NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_histrangos_empresa    FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_histrangos_rango      FOREIGN KEY (rango_id)
        REFERENCES configuracion_rangos (id) ON DELETE RESTRICT,
    CONSTRAINT fk_histrangos_admin      FOREIGN KEY (cambiado_por_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,

    INDEX idx_histrangos_empresa (empresa_id),
    INDEX idx_histrangos_rango   (rango_id),
    INDEX idx_histrangos_fechas  (empresa_id, nivel, vigente_desde, vigente_hasta),

    CONSTRAINT chk_histrangos_fechas CHECK (vigente_hasta >= vigente_desde)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS configuracion_scoring (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    empresa_id               BIGINT UNSIGNED  NOT NULL,
    rol_evaluado             ENUM('vendedor_base','lider_red') NOT NULL,
    peso_eficiencia          DECIMAL(5,4)     NOT NULL DEFAULT 0.4000,
    peso_consistencia        DECIMAL(5,4)     NOT NULL DEFAULT 0.2000,
    peso_volumen_ventas      DECIMAL(5,4)     NOT NULL DEFAULT 0.2000,
    peso_pago_puntual        DECIMAL(5,4)     NOT NULL DEFAULT 0.2000,
    peso_salud_red           DECIMAL(5,4)     NOT NULL DEFAULT 0.0000,
    umbral_nivel_nuevo       SMALLINT UNSIGNED NOT NULL DEFAULT 200,
    umbral_nivel_confiable   SMALLINT UNSIGNED NOT NULL DEFAULT 500,
    umbral_nivel_verificado  SMALLINT UNSIGNED NOT NULL DEFAULT 800,
    umbral_nivel_elite       SMALLINT UNSIGNED NOT NULL DEFAULT 1000,
    vigente_desde            TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_scoring_empresa FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,

    UNIQUE KEY uq_scoring_empresa_rol (empresa_id, rol_evaluado),

    CONSTRAINT chk_scoring_pesos CHECK (
        peso_eficiencia + peso_consistencia + peso_volumen_ventas
        + peso_pago_puntual + peso_salud_red BETWEEN 0.9999 AND 1.0001
    ),
    CONSTRAINT chk_scoring_salud_red_base CHECK (
        rol_evaluado != 'vendedor_base' OR peso_salud_red = 0.0000
    ),
    CONSTRAINT chk_scoring_salud_red_lider CHECK (
        rol_evaluado != 'lider_red' OR peso_salud_red > 0.0000
    ),
    CONSTRAINT chk_scoring_umbrales_orden CHECK (
        umbral_nivel_nuevo    < umbral_nivel_confiable
        AND umbral_nivel_confiable  < umbral_nivel_verificado
        AND umbral_nivel_verificado < umbral_nivel_elite
        AND umbral_nivel_elite     <= 1000
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS historial_configuracion_scoring (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    empresa_id               BIGINT UNSIGNED  NOT NULL,
    rol_evaluado             ENUM('vendedor_base','lider_red') NOT NULL,
    snapshot_json            JSON             NOT NULL,
    motivo_cambio            TEXT             NOT NULL,
    cambiado_por_id          BIGINT UNSIGNED  NOT NULL,
    vigente_desde            TIMESTAMP        NOT NULL,
    vigente_hasta            TIMESTAMP        NOT NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_histscoring_empresa FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_histscoring_admin   FOREIGN KEY (cambiado_por_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,

    INDEX idx_histscoring_empresa (empresa_id),
    INDEX idx_histscoring_rol     (empresa_id, rol_evaluado),
    INDEX idx_histscoring_fechas  (empresa_id, rol_evaluado, vigente_desde, vigente_hasta),

    CONSTRAINT chk_histscoring_fechas CHECK (vigente_hasta >= vigente_desde)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS configuracion_pagos (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    empresa_id               BIGINT UNSIGNED  NOT NULL,
    modelo_pago              ENUM('bullet','fraccionado') NOT NULL DEFAULT 'bullet',
    dias_plazo_bullet        SMALLINT UNSIGNED NULL,
    numero_cuotas            TINYINT UNSIGNED NULL,
    periodicidad_dias        TINYINT UNSIGNED NULL,
    dias_gracia_recepcion    TINYINT UNSIGNED NOT NULL DEFAULT 0,
    tolerancia_pago_horas    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    vigente_desde            TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_confpagos_empresa FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,

    UNIQUE KEY uq_confpagos_empresa (empresa_id),

    CONSTRAINT chk_confpagos_bullet CHECK (
        modelo_pago != 'bullet' OR dias_plazo_bullet IS NOT NULL
    ),
    CONSTRAINT chk_confpagos_fraccionado CHECK (
        modelo_pago != 'fraccionado'
        OR (numero_cuotas IS NOT NULL AND periodicidad_dias IS NOT NULL)
    ),
    CONSTRAINT chk_confpagos_sin_huerfanos_fraccionado CHECK (
        modelo_pago = 'fraccionado'
        OR (numero_cuotas IS NULL AND periodicidad_dias IS NULL)
    ),
    CONSTRAINT chk_confpagos_sin_huerfanos_bullet CHECK (
        modelo_pago = 'bullet' OR dias_plazo_bullet IS NULL
    ),
    CONSTRAINT chk_confpagos_periodicidad CHECK (
        periodicidad_dias IS NULL OR periodicidad_dias > 0
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS historial_configuracion_pagos (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    empresa_id               BIGINT UNSIGNED  NOT NULL,
    snapshot_json            JSON             NOT NULL,
    motivo_cambio            TEXT             NOT NULL,
    cambiado_por_id          BIGINT UNSIGNED  NOT NULL,
    vigente_desde            TIMESTAMP        NOT NULL,
    vigente_hasta            TIMESTAMP        NOT NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_histpagos_empresa FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_histpagos_admin   FOREIGN KEY (cambiado_por_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,

    INDEX idx_histpagos_empresa (empresa_id),
    INDEX idx_histpagos_fechas  (empresa_id, vigente_desde, vigente_hasta),

    CONSTRAINT chk_histpagos_fechas CHECK (vigente_hasta >= vigente_desde)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historial auditable de políticas de pago.';


-- ============================================================================
-- SECCIÓN 4: MEMBRESÍA — PUENTE IDENTIDAD GLOBAL ↔ EMPRESA
-- ============================================================================


CREATE TABLE IF NOT EXISTS workspace_membresia (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    usuario_id               BIGINT UNSIGNED  NOT NULL,
    empresa_id               BIGINT UNSIGNED  NOT NULL,
    rango_id                 BIGINT UNSIGNED  NULL,
    referente_id             BIGINT UNSIGNED  NULL,
    nivel_en_arbol           SMALLINT UNSIGNED NULL,
    arbol_calculado_at       TIMESTAMP        NULL,
    estado_validacion        ENUM(
                                 'pre_registro',
                                 'biometria_pendiente',
                                 'documentos_pendientes',
                                 'revision_admin',
                                 'activa',
                                 'suspendida',
                                 'rechazada'
                             ) NOT NULL DEFAULT 'pre_registro',
    nivel_confianza          SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    insignia                 ENUM('nuevo','confiable','verificado','elite_biometrico')
                             NOT NULL DEFAULT 'nuevo',
    puntos_marketplace       INT UNSIGNED     NOT NULL DEFAULT 0,
    perfil_web_activo        TINYINT(1)       NOT NULL DEFAULT 0,
    validado_at              TIMESTAMP        NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at               TIMESTAMP        NULL,

    CONSTRAINT fk_membresia_usuario   FOREIGN KEY (usuario_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,
    CONSTRAINT fk_membresia_empresa   FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_membresia_rango     FOREIGN KEY (rango_id)
        REFERENCES configuracion_rangos (id) ON DELETE RESTRICT,
    CONSTRAINT fk_membresia_referente FOREIGN KEY (referente_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,

    UNIQUE KEY uq_membresia_usuario_empresa (
        usuario_id,
        empresa_id,
        (IF(deleted_at IS NULL, 1, NULL))
    ),
    INDEX idx_membresia_empresa             (empresa_id),
    INDEX idx_membresia_referente           (referente_id),
    INDEX idx_membresia_estado              (empresa_id, estado_validacion),
    INDEX idx_membresia_confianza           (empresa_id, nivel_confianza),
    INDEX idx_membresia_nivel_arbol         (empresa_id, nivel_en_arbol),
    INDEX idx_membresia_deleted             (deleted_at),
    INDEX idx_membresia_usuario_empresa_lookup (usuario_id, empresa_id, deleted_at),

    CONSTRAINT chk_membresia_confianza CHECK (nivel_confianza BETWEEN 0 AND 1000),
    CONSTRAINT chk_membresia_puntos    CHECK (puntos_marketplace >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- SECCIÓN 5: INVITACIONES AL WORKSPACE
-- ============================================================================

CREATE TABLE IF NOT EXISTS invitacion_workspace (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    empresa_id               BIGINT UNSIGNED  NOT NULL,
    token                    VARCHAR(128)     NOT NULL UNIQUE
                             COMMENT 'Token de uso único. Invalida al aceptarse o expirar.',
    usuario_invitado_id      BIGINT UNSIGNED  NULL,
    email_invitado           VARCHAR(180)     NULL,
    rango_id_asignado        BIGINT UNSIGNED  NULL,
    referente_id             BIGINT UNSIGNED  NULL
                             COMMENT 'Membresía del patrocinador directo.',
    generado_por_id          BIGINT UNSIGNED  NOT NULL,
    estado                   ENUM('pendiente','aceptada','rechazada','expirada','cancelada')
                             NOT NULL DEFAULT 'pendiente',
    membresia_generada_id    BIGINT UNSIGNED  NULL,
    notas                    TEXT             NULL,
    expires_at               TIMESTAMP        NOT NULL,
    aceptada_at              TIMESTAMP        NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at               TIMESTAMP        NULL,

    CONSTRAINT fk_invitacion_empresa   FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_invitacion_usuario   FOREIGN KEY (usuario_invitado_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,
    CONSTRAINT fk_invitacion_rango     FOREIGN KEY (rango_id_asignado)
        REFERENCES configuracion_rangos (id) ON DELETE RESTRICT,
    CONSTRAINT fk_invitacion_referente FOREIGN KEY (referente_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,
    CONSTRAINT fk_invitacion_generador FOREIGN KEY (generado_por_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,
    CONSTRAINT fk_invitacion_membresia FOREIGN KEY (membresia_generada_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,

    INDEX idx_invitacion_empresa    (empresa_id, estado),
    INDEX idx_invitacion_usuario    (usuario_invitado_id),
    INDEX idx_invitacion_referente  (referente_id),
    INDEX idx_invitacion_expiracion (expires_at, estado),
    INDEX idx_invitacion_deleted    (deleted_at),

    CONSTRAINT chk_invitacion_destino CHECK (
        usuario_invitado_id IS NOT NULL OR email_invitado IS NOT NULL
    ),
    CONSTRAINT chk_invitacion_expiracion CHECK (expires_at > created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECCIÓN 6: HISTORIAL DE CONFIANZA Y CAMBIOS DE REFERENTE
-- ============================================================================

CREATE TABLE IF NOT EXISTS historial_nivel_confianza (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    membresia_id             BIGINT UNSIGNED  NOT NULL,
    empresa_id               BIGINT UNSIGNED  NOT NULL,
    valor_anterior           SMALLINT UNSIGNED NOT NULL,
    valor_nuevo              SMALLINT UNSIGNED NOT NULL,
    delta                    SMALLINT         NOT NULL,
    motivo                   VARCHAR(255)     NOT NULL,
    evento_referencia        VARCHAR(100)     NULL,
    generado_por_id          BIGINT UNSIGNED  NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_histconfianza_membresia FOREIGN KEY (membresia_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,
    CONSTRAINT fk_histconfianza_empresa   FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_histconfianza_generador FOREIGN KEY (generado_por_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,

    INDEX idx_histconfianza_membresia (membresia_id),
    INDEX idx_histconfianza_empresa   (empresa_id, created_at),
    INDEX idx_histconfianza_fecha     (created_at),

    CONSTRAINT chk_histconfianza_anterior CHECK (valor_anterior BETWEEN 0 AND 1000),
    CONSTRAINT chk_histconfianza_nuevo    CHECK (valor_nuevo    BETWEEN 0 AND 1000),
    CONSTRAINT chk_histconfianza_delta    CHECK (
        delta = (CAST(valor_nuevo AS SIGNED) - CAST(valor_anterior AS SIGNED))
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cambio_referente (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    membresia_id             BIGINT UNSIGNED  NOT NULL,
    referente_anterior_id    BIGINT UNSIGNED  NULL,
    referente_nuevo_id       BIGINT UNSIGNED  NULL,
    justificacion            TEXT             NOT NULL,
    aprobado_por_id          BIGINT UNSIGNED  NOT NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_camref_membresia  FOREIGN KEY (membresia_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,
    CONSTRAINT fk_camref_anterior   FOREIGN KEY (referente_anterior_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,
    CONSTRAINT fk_camref_nuevo      FOREIGN KEY (referente_nuevo_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,
    CONSTRAINT fk_camref_aprobado   FOREIGN KEY (aprobado_por_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,

    INDEX idx_camref_membresia (membresia_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Registro permanente de cambios de patrocinador. Requiere aprobación admin.';


-- ============================================================================
-- SECCIÓN 7: CAMPAÑAS, KITS E INVENTARIO
-- ============================================================================

CREATE TABLE IF NOT EXISTS campana (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    empresa_id               BIGINT UNSIGNED  NOT NULL,
    nombre                   VARCHAR(150)     NOT NULL,
    descripcion              TEXT             NULL,
    estado                   ENUM('borrador','activa','pausada','finalizada')
                             NOT NULL DEFAULT 'borrador',
    fecha_inicio             DATE             NULL,
    fecha_fin                DATE             NULL,
    creado_por_id            BIGINT UNSIGNED  NOT NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at               TIMESTAMP        NULL,

    CONSTRAINT fk_campana_empresa    FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_campana_creado_por FOREIGN KEY (creado_por_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,

    INDEX idx_campana_empresa (empresa_id),
    INDEX idx_campana_estado  (empresa_id, estado),
    INDEX idx_campana_deleted (deleted_at),

    CONSTRAINT chk_campana_fechas CHECK (
        fecha_inicio IS NULL OR fecha_fin IS NULL OR fecha_fin >= fecha_inicio
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Campañas comerciales por empresa con ciclo de vida completo.';


CREATE TABLE IF NOT EXISTS kit (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    campana_id               BIGINT UNSIGNED  NOT NULL,
    empresa_id               BIGINT UNSIGNED  NOT NULL,
    nombre                   VARCHAR(150)     NOT NULL,
    descripcion              TEXT             NULL,
    contenido_detalle        JSON             NOT NULL,
    precio_unitario          DECIMAL(12,2)    NOT NULL,
    stock_central            INT UNSIGNED     NOT NULL DEFAULT 0,
    stock_comprometido       INT UNSIGNED     NOT NULL DEFAULT 0,
    activo                   TINYINT(1)       NOT NULL DEFAULT 1,
    creado_por_id            BIGINT UNSIGNED  NOT NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at               TIMESTAMP        NULL,

    CONSTRAINT fk_kit_campana    FOREIGN KEY (campana_id)
        REFERENCES campana (id) ON DELETE RESTRICT,
    CONSTRAINT fk_kit_empresa    FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_kit_creado_por FOREIGN KEY (creado_por_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,

    INDEX idx_kit_campana (campana_id),
    INDEX idx_kit_empresa (empresa_id, activo),

    CONSTRAINT chk_kit_precio          CHECK (precio_unitario > 0),
    CONSTRAINT chk_kit_stock_central   CHECK (stock_central >= 0),
    CONSTRAINT chk_kit_comprometido    CHECK (stock_comprometido >= 0),
    CONSTRAINT chk_kit_stock_coherente CHECK (stock_comprometido <= stock_central)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Kits comerciales por campaña. Unidad básica de operación B2B2C.';


CREATE TABLE IF NOT EXISTS inventario_distribuidor (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    membresia_id             BIGINT UNSIGNED  NOT NULL,
    kit_id                   BIGINT UNSIGNED  NOT NULL,
    cantidad_disponible      INT UNSIGNED     NOT NULL DEFAULT 0,
    cantidad_comprometida    INT UNSIGNED     NOT NULL DEFAULT 0,
    cantidad_vendida         INT UNSIGNED     NOT NULL DEFAULT 0,
    updated_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventario_membresia FOREIGN KEY (membresia_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,
    CONSTRAINT fk_inventario_kit       FOREIGN KEY (kit_id)
        REFERENCES kit (id) ON DELETE RESTRICT,

    UNIQUE KEY uq_inventario_membresia_kit (membresia_id, kit_id),

    CONSTRAINT chk_inventario_disponible   CHECK (cantidad_disponible >= 0),
    CONSTRAINT chk_inventario_comprometida CHECK (cantidad_comprometida >= 0),
    CONSTRAINT chk_inventario_vendida      CHECK (cantidad_vendida >= 0),
    CONSTRAINT chk_inventario_coherente    CHECK (cantidad_comprometida <= cantidad_disponible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS movimiento_inventario (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    empresa_id               BIGINT UNSIGNED  NOT NULL,
    kit_id                   BIGINT UNSIGNED  NOT NULL,
    membresia_origen_id      BIGINT UNSIGNED  NULL,
    membresia_destino_id     BIGINT UNSIGNED  NULL,
    tipo                     ENUM(
                                 'entrada_central',
                                 'asignacion_distribuidor',
                                 'confirmacion_recepcion',
                                 'venta_consumidor',
                                 'devolucion',
                                 'ajuste_admin'
                             ) NOT NULL,
    motivo                   VARCHAR(255)     NOT NULL,
    cantidad                 INT              NOT NULL,
    stock_resultante_origen  INT              NULL,
    stock_resultante_destino INT              NULL,
    referencia_id            BIGINT UNSIGNED  NULL,
    referencia_tipo          VARCHAR(60)      NULL,
    generado_por_id          BIGINT UNSIGNED  NULL
                             COMMENT 'NULL = sistema automatizado. Ver DECISIÓN 2.',
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_movinv_empresa   FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_movinv_kit       FOREIGN KEY (kit_id)
        REFERENCES kit (id) ON DELETE RESTRICT,
    CONSTRAINT fk_movinv_origen    FOREIGN KEY (membresia_origen_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,
    CONSTRAINT fk_movinv_destino   FOREIGN KEY (membresia_destino_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,
    CONSTRAINT fk_movinv_generador FOREIGN KEY (generado_por_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,

    INDEX idx_movinv_empresa  (empresa_id),
    INDEX idx_movinv_kit      (kit_id),
    INDEX idx_movinv_origen   (membresia_origen_id),
    INDEX idx_movinv_destino  (membresia_destino_id),
    INDEX idx_movinv_fecha    (created_at),

    CONSTRAINT chk_movinv_cantidad CHECK (cantidad != 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECCIÓN 8: SOLICITUDES DE KITS Y CONTRATOS DIGITALES
-- ============================================================================

CREATE TABLE IF NOT EXISTS solicitud_kit (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    empresa_id               BIGINT UNSIGNED  NOT NULL,
    membresia_solicitante_id BIGINT UNSIGNED  NOT NULL,
    membresia_referente_id   BIGINT UNSIGNED  NULL,
    kit_id                   BIGINT UNSIGNED  NOT NULL,
    cantidad_solicitada      INT UNSIGNED     NOT NULL,
    estado                   ENUM(
                                 'borrador',
                                 'pendiente_aprobacion',
                                 'aprobada',
                                 'rechazada',
                                 'cancelada'
                             ) NOT NULL DEFAULT 'borrador',
    motivo_rechazo           TEXT             NULL,
    aprobado_por_id          BIGINT UNSIGNED  NULL,
    aprobado_at              TIMESTAMP        NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at               TIMESTAMP        NULL,

    CONSTRAINT fk_solicitud_empresa     FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_solicitud_solicitante FOREIGN KEY (membresia_solicitante_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,
    CONSTRAINT fk_solicitud_referente   FOREIGN KEY (membresia_referente_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,
    CONSTRAINT fk_solicitud_kit         FOREIGN KEY (kit_id)
        REFERENCES kit (id) ON DELETE RESTRICT,
    CONSTRAINT fk_solicitud_aprobador   FOREIGN KEY (aprobado_por_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,

    INDEX idx_solicitud_empresa     (empresa_id),
    INDEX idx_solicitud_solicitante (membresia_solicitante_id),
    INDEX idx_solicitud_estado      (empresa_id, estado),
    INDEX idx_solicitud_deleted     (deleted_at),

    CONSTRAINT chk_solicitud_cantidad CHECK (cantidad_solicitada > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contrato_digital (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    numero_contrato          VARCHAR(60)      NOT NULL,
    empresa_id               BIGINT UNSIGNED  NOT NULL,
    membresia_id             BIGINT UNSIGNED  NOT NULL,
    solicitud_kit_id         BIGINT UNSIGNED  NULL,
    campana_id               BIGINT UNSIGNED  NOT NULL,
    version_contrato         SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    contrato_padre_id        BIGINT UNSIGNED  NULL,
    pdf_url                  VARCHAR(500)     NOT NULL,
    huella_pdf               VARCHAR(64)      NOT NULL,
    huella_firma_combinada   VARCHAR(64)      NULL,
    estado                   ENUM(
                                 'generado',
                                 'presentado',
                                 'firmado',
                                 'rechazado_por_usuario',
                                 'anulado'
                             ) NOT NULL DEFAULT 'generado',
    datos_contrato_json      JSON             NOT NULL
                             COMMENT 'Snapshot al momento de generar: campaña, kit, precio, deuda, política de pago.',
    firmado_at               TIMESTAMP        NULL,
    ip_firma                 VARCHAR(45)      NULL,
    gps_latitud_firma        DECIMAL(10,8)    NULL,
    gps_longitud_firma       DECIMAL(11,8)    NULL,
    dispositivo_firma_id     BIGINT UNSIGNED  NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_contrato_empresa     FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_contrato_membresia   FOREIGN KEY (membresia_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,
    CONSTRAINT fk_contrato_solicitud   FOREIGN KEY (solicitud_kit_id)
        REFERENCES solicitud_kit (id) ON DELETE RESTRICT,
    CONSTRAINT fk_contrato_campana     FOREIGN KEY (campana_id)
        REFERENCES campana (id) ON DELETE RESTRICT,
    CONSTRAINT fk_contrato_padre       FOREIGN KEY (contrato_padre_id)
        REFERENCES contrato_digital (id) ON DELETE RESTRICT,
    CONSTRAINT fk_contrato_dispositivo FOREIGN KEY (dispositivo_firma_id)
        REFERENCES dispositivo_registrado (id) ON DELETE RESTRICT,

    UNIQUE KEY contrato_digital_numero_contrato_version_unique (numero_contrato, version_contrato),
    UNIQUE KEY uq_contrato_huella_pdf (huella_pdf),
    INDEX idx_contrato_empresa         (empresa_id),
    INDEX idx_contrato_membresia       (membresia_id),
    INDEX idx_contrato_estado          (empresa_id, estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Contratos digitales inmutables con firma biométrica. SHA-256 (64 chars)';


CREATE TABLE IF NOT EXISTS documento_soporte_contrato (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    contrato_id              BIGINT UNSIGNED  NOT NULL,
    tipo_documento           VARCHAR(80)      NOT NULL,
    archivo_url              VARCHAR(500)     NOT NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_docsop_contrato FOREIGN KEY (contrato_id)
        REFERENCES contrato_digital (id) ON DELETE RESTRICT,

    INDEX idx_docsop_contrato (contrato_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Documentos de soporte adjuntos antes de la firma del contrato.';


-- ============================================================================
-- SECCIÓN 9: EVENTO DE RECEPCIÓN — INICIO DEL RELOJ COMERCIAL
-- ============================================================================

CREATE TABLE IF NOT EXISTS evento_recepcion_kit (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    empresa_id               BIGINT UNSIGNED  NOT NULL,
    membresia_id             BIGINT UNSIGNED  NOT NULL,
    solicitud_kit_id         BIGINT UNSIGNED  NOT NULL UNIQUE,
    contrato_id              BIGINT UNSIGNED  NOT NULL,
    kit_id                   BIGINT UNSIGNED  NOT NULL,
    cantidad_recibida        INT UNSIGNED     NOT NULL,
    gps_latitud              DECIMAL(10,8)    NOT NULL,
    gps_longitud             DECIMAL(11,8)    NOT NULL,
    gps_precision_metros     DECIMAL(8,2)     NULL,
    gps_proveedor            VARCHAR(50)      NULL,
    dispositivo_id           BIGINT UNSIGNED  NOT NULL,
    huella_biometrica_ref    VARCHAR(128)     NOT NULL,
    confirmado_at            TIMESTAMP        NOT NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_recepcion_empresa     FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_recepcion_membresia   FOREIGN KEY (membresia_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,
    CONSTRAINT fk_recepcion_solicitud   FOREIGN KEY (solicitud_kit_id)
        REFERENCES solicitud_kit (id) ON DELETE RESTRICT,
    CONSTRAINT fk_recepcion_contrato    FOREIGN KEY (contrato_id)
        REFERENCES contrato_digital (id) ON DELETE RESTRICT,
    CONSTRAINT fk_recepcion_kit         FOREIGN KEY (kit_id)
        REFERENCES kit (id) ON DELETE RESTRICT,
    CONSTRAINT fk_recepcion_dispositivo FOREIGN KEY (dispositivo_id)
        REFERENCES dispositivo_registrado (id) ON DELETE RESTRICT,

    INDEX idx_recepcion_empresa   (empresa_id),
    INDEX idx_recepcion_membresia (membresia_id),
    INDEX idx_recepcion_fecha     (confirmado_at),

    CONSTRAINT chk_recepcion_cantidad CHECK (cantidad_recibida > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- SECCIÓN 10: REGISTRO FINANCIERO INMUTABLE (LEDGER)
-- ============================================================================

CREATE TABLE IF NOT EXISTS transaccion_financiera (
    id                         BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    empresa_id                 BIGINT UNSIGNED  NOT NULL,
    membresia_id               BIGINT UNSIGNED  NOT NULL,
    tipo                       VARCHAR(60)      NOT NULL,
    monto                      DECIMAL(14,2)    NOT NULL,
    estado_comision            ENUM('pendiente_liberacion','liberada','retenida','cancelada') NULL,
    saldo_disponible_anterior  DECIMAL(14,2)    NOT NULL,
    saldo_disponible_posterior DECIMAL(14,2)    NOT NULL,
    referencia_id              BIGINT UNSIGNED  NULL,
    referencia_tipo            VARCHAR(60)      NULL,
    transaccion_reversa_de     BIGINT UNSIGNED  NULL,
    descripcion                TEXT             NULL,
    generado_por_id            BIGINT UNSIGNED  NULL,
    requiere_doble_aprobacion  TINYINT(1)       NOT NULL DEFAULT 0,
    aprobado_por_id            BIGINT UNSIGNED  NULL,
    created_at                 TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_transaccion_empresa   FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_transaccion_membresia FOREIGN KEY (membresia_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,
    CONSTRAINT fk_transaccion_reversa   FOREIGN KEY (transaccion_reversa_de)
        REFERENCES transaccion_financiera (id) ON DELETE RESTRICT,
    CONSTRAINT fk_transaccion_generador FOREIGN KEY (generado_por_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,
    CONSTRAINT fk_transaccion_aprobador FOREIGN KEY (aprobado_por_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,

    INDEX idx_transaccion_empresa    (empresa_id),
    INDEX idx_transaccion_membresia_saldo (membresia_id, id DESC),
    INDEX idx_transaccion_tipo       (empresa_id, tipo),
    INDEX idx_transaccion_estado     (estado_comision),
    INDEX idx_transaccion_fecha      (created_at),
    INDEX idx_transaccion_reversa_de (transaccion_reversa_de),

    CONSTRAINT chk_transaccion_monto     CHECK (monto > 0),
    CONSTRAINT chk_transaccion_saldo_ant CHECK (saldo_disponible_anterior >= 0),
    CONSTRAINT chk_transaccion_saldo_pos CHECK (saldo_disponible_posterior >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS deuda_distribuidor (
    id                                BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    empresa_id                        BIGINT UNSIGNED  NOT NULL,
    membresia_id                      BIGINT UNSIGNED  NOT NULL,
    evento_recepcion_id               BIGINT UNSIGNED  NOT NULL UNIQUE,
    contrato_id                       BIGINT UNSIGNED  NOT NULL,
    monto_total                       DECIMAL(14,2)    NOT NULL,
    monto_pagado                      DECIMAL(14,2)    NOT NULL DEFAULT 0.00,
    monto_pendiente                   DECIMAL(14,2)    NOT NULL,
    modelo_pago                       ENUM('bullet','fraccionado') NOT NULL,
    numero_cuotas                     TINYINT UNSIGNED NULL,
    configuracion_pago_snapshot_json  JSON             NOT NULL,
    estado                            ENUM('pendiente','en_curso','pagada','vencida','en_disputa')
                                      NOT NULL DEFAULT 'pendiente',
    fecha_vencimiento                 DATETIME         NOT NULL,
    created_at                        TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                        TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_deuda_empresa   FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_deuda_membresia FOREIGN KEY (membresia_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,
    CONSTRAINT fk_deuda_recepcion FOREIGN KEY (evento_recepcion_id)
        REFERENCES evento_recepcion_kit (id) ON DELETE RESTRICT,
    CONSTRAINT fk_deuda_contrato  FOREIGN KEY (contrato_id)
        REFERENCES contrato_digital (id) ON DELETE RESTRICT,

    INDEX idx_deuda_empresa          (empresa_id),
    INDEX idx_deuda_membresia        (membresia_id),
    INDEX idx_deuda_estado           (empresa_id, estado),
    INDEX idx_deuda_vencimiento      (empresa_id, fecha_vencimiento, estado),
    INDEX idx_deuda_membresia_estado (membresia_id, estado),

    CONSTRAINT chk_deuda_monto_total         CHECK (monto_total > 0),
    CONSTRAINT chk_deuda_monto_pagado        CHECK (monto_pagado >= 0),
    CONSTRAINT chk_deuda_monto_pendiente     CHECK (monto_pendiente >= 0),
    CONSTRAINT chk_deuda_pagado_no_excede    CHECK (monto_pagado <= monto_total),
    CONSTRAINT chk_deuda_pendiente_coherente CHECK (
        monto_pendiente BETWEEN (monto_total - monto_pagado - 0.01)
                            AND (monto_total - monto_pagado + 0.01)
    ),
    CONSTRAINT chk_deuda_fraccionado CHECK (
        modelo_pago != 'fraccionado' OR numero_cuotas IS NOT NULL
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cuota_deuda (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    deuda_id                 BIGINT UNSIGNED  NOT NULL,
    empresa_id               BIGINT UNSIGNED  NOT NULL,
    numero_cuota             TINYINT UNSIGNED NOT NULL,
    monto_cuota              DECIMAL(12,2)    NOT NULL,
    fecha_vencimiento_cuota  DATETIME         NOT NULL,
    estado                   ENUM('pendiente','pagada','vencida') NOT NULL DEFAULT 'pendiente',
    pagada_at                TIMESTAMP        NULL,
    transaccion_id           BIGINT UNSIGNED  NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_cuota_deuda       FOREIGN KEY (deuda_id)
        REFERENCES deuda_distribuidor (id) ON DELETE RESTRICT,
    CONSTRAINT fk_cuota_empresa     FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_cuota_transaccion FOREIGN KEY (transaccion_id)
        REFERENCES transaccion_financiera (id) ON DELETE RESTRICT,

    UNIQUE KEY uq_cuota_deuda_numero (deuda_id, numero_cuota),
    INDEX idx_cuota_vencimiento      (empresa_id, fecha_vencimiento_cuota, estado),
    INDEX idx_cuota_empresa_estado   (empresa_id, estado),
    INDEX idx_cuota_transaccion      (transaccion_id),

    CONSTRAINT chk_cuota_monto CHECK (monto_cuota > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- SECCIÓN 11: RETENCIÓN DE COMISIONES
-- ============================================================================

CREATE TABLE IF NOT EXISTS retencion_comisiones (
    id                         BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    empresa_id                 BIGINT UNSIGNED  NOT NULL,
    membresia_id               BIGINT UNSIGNED  NOT NULL,
    porcentaje_retenido        DECIMAL(5,2)     NOT NULL,
    monto_retenido             DECIMAL(14,2)    NOT NULL,
    justificacion              TEXT             NOT NULL,
    estado                     ENUM('activa','liberada','cancelada') NOT NULL DEFAULT 'activa',
    aplicado_por_id            BIGINT UNSIGNED  NOT NULL,
    transaccion_retencion_id   BIGINT UNSIGNED  NULL,
    liberado_por_id            BIGINT UNSIGNED  NULL,
    liberado_at                TIMESTAMP        NULL,
    motivo_liberacion          TEXT             NULL,
    transaccion_liberacion_id  BIGINT UNSIGNED  NULL,
    created_at                 TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                 TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_retencion_empresa   FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_retencion_membresia FOREIGN KEY (membresia_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,
    CONSTRAINT fk_retencion_aplicador FOREIGN KEY (aplicado_por_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,
    CONSTRAINT fk_retencion_liberador FOREIGN KEY (liberado_por_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,
    CONSTRAINT fk_retencion_trx_ap    FOREIGN KEY (transaccion_retencion_id)
        REFERENCES transaccion_financiera (id) ON DELETE RESTRICT,
    CONSTRAINT fk_retencion_trx_lib   FOREIGN KEY (transaccion_liberacion_id)
        REFERENCES transaccion_financiera (id) ON DELETE RESTRICT,

    INDEX idx_retencion_empresa          (empresa_id),
    INDEX idx_retencion_membresia        (membresia_id),
    INDEX idx_retencion_estado           (empresa_id, estado),
    INDEX idx_retencion_membresia_estado (membresia_id, estado),

    CONSTRAINT chk_retencion_porcentaje CHECK (porcentaje_retenido BETWEEN 0.01 AND 100.00),
    CONSTRAINT chk_retencion_monto      CHECK (monto_retenido > 0),
    CONSTRAINT chk_retencion_cancelada_pre_ledger CHECK (
        estado != 'cancelada' OR transaccion_retencion_id IS NULL
    ),
    CONSTRAINT chk_retencion_liberada_completa CHECK (
        estado != 'liberada'
        OR (liberado_por_id IS NOT NULL
            AND liberado_at IS NOT NULL
            AND motivo_liberacion IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECCIÓN 12: FLUJO DE VENTAS B2B2C Y COMISIONES EN CASCADA
-- ============================================================================

CREATE TABLE IF NOT EXISTS venta (
    id                           BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    empresa_id                   BIGINT UNSIGNED  NOT NULL,
    membresia_vendedor_id        BIGINT UNSIGNED  NOT NULL,
    kit_id                       BIGINT UNSIGNED  NOT NULL,
    campana_id                   BIGINT UNSIGNED  NOT NULL,
    cantidad_vendida             INT UNSIGNED     NOT NULL,
    precio_unitario_venta        DECIMAL(12,2)    NOT NULL,
    monto_total_venta            DECIMAL(14,2)    NOT NULL,
    consumidor_nombre            VARCHAR(150)     NOT NULL,
    consumidor_documento         VARCHAR(30)      NULL,
    consumidor_telefono          VARCHAR(30)      NULL,
    comprobante_foto_url         VARCHAR(500)     NOT NULL,
    gps_latitud                  DECIMAL(10,8)    NOT NULL,
    gps_longitud                 DECIMAL(11,8)    NOT NULL,
    gps_precision_metros         DECIMAL(8,2)     NULL,
    dispositivo_id               BIGINT UNSIGNED  NOT NULL,
    huella_biometrica_ref        VARCHAR(128)     NOT NULL,
    capturado_at                 TIMESTAMP        NOT NULL,
    estado                       ENUM('pendiente','aprobada','rechazada') NOT NULL DEFAULT 'pendiente',
    motivo_rechazo               TEXT             NULL,
    validado_por_id              BIGINT UNSIGNED  NULL,
    validado_at                  TIMESTAMP        NULL,
    deposito_bancario_confirmado TINYINT(1)     NOT NULL DEFAULT 0,
    deposito_confirmado_por_id   BIGINT UNSIGNED  NULL,
    deposito_confirmado_at       TIMESTAMP        NULL,
    created_at                   TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                   TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at                   TIMESTAMP        NULL,

    CONSTRAINT fk_venta_empresa     FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_venta_vendedor    FOREIGN KEY (membresia_vendedor_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,
    CONSTRAINT fk_venta_kit         FOREIGN KEY (kit_id)
        REFERENCES kit (id) ON DELETE RESTRICT,
    CONSTRAINT fk_venta_campana     FOREIGN KEY (campana_id)
        REFERENCES campana (id) ON DELETE RESTRICT,
    CONSTRAINT fk_venta_dispositivo FOREIGN KEY (dispositivo_id)
        REFERENCES dispositivo_registrado (id) ON DELETE RESTRICT,
    CONSTRAINT fk_venta_validador   FOREIGN KEY (validado_por_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,
    CONSTRAINT fk_venta_depositador FOREIGN KEY (deposito_confirmado_por_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,

    INDEX idx_venta_empresa      (empresa_id),
    INDEX idx_venta_vendedor     (membresia_vendedor_id),
    INDEX idx_venta_estado       (empresa_id, estado),
    INDEX idx_venta_liberacion   (empresa_id, estado, deposito_bancario_confirmado),
    INDEX idx_venta_capturado    (empresa_id, capturado_at),
    INDEX idx_venta_fecha        (created_at),
    INDEX idx_venta_deleted      (deleted_at),

    CONSTRAINT chk_venta_cantidad CHECK (cantidad_vendida > 0),
    CONSTRAINT chk_venta_precio   CHECK (precio_unitario_venta > 0),
    CONSTRAINT chk_venta_monto    CHECK (monto_total_venta > 0),
    CONSTRAINT chk_venta_no_delete_aprobada CHECK (
        deleted_at IS NULL OR estado != 'aprobada'
    ),
    CONSTRAINT chk_venta_coherencia_monto CHECK (
        monto_total_venta BETWEEN
            (precio_unitario_venta * cantidad_vendida - 0.01)
        AND (precio_unitario_venta * cantidad_vendida + 0.01)
    ),

    CONSTRAINT chk_venta_capturado_coherente CHECK (
        capturado_at <= (created_at + INTERVAL 5 MINUTE)
        AND capturado_at >= (created_at - INTERVAL 30 DAY)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS comision_cascada (
    id                         BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    venta_id                   BIGINT UNSIGNED  NOT NULL,
    empresa_id                 BIGINT UNSIGNED  NOT NULL,
    membresia_beneficiaria_id  BIGINT UNSIGNED  NOT NULL,
    nivel_cascada              TINYINT UNSIGNED NOT NULL,
    rango_config_id            BIGINT UNSIGNED  NULL,
    porcentaje_aplicado        DECIMAL(5,2)     NOT NULL,
    monto_base_calculo         DECIMAL(14,2)    NOT NULL
                               COMMENT 'Snapshot de monto_total_venta.',
    monto_comision             DECIMAL(12,2)    NOT NULL,
    estado                     ENUM('pendiente_liberacion','liberada','retenida','cancelada')
                               NOT NULL DEFAULT 'pendiente_liberacion',
    transaccion_id             BIGINT UNSIGNED  NULL,
    liberada_at                TIMESTAMP        NULL,
    created_at                 TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                 TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_comision_venta        FOREIGN KEY (venta_id)
        REFERENCES venta (id) ON DELETE RESTRICT,
    CONSTRAINT fk_comision_empresa      FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_comision_beneficiaria FOREIGN KEY (membresia_beneficiaria_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,
    CONSTRAINT fk_comision_rango        FOREIGN KEY (rango_config_id)
        REFERENCES configuracion_rangos (id) ON DELETE RESTRICT,
    CONSTRAINT fk_comision_transaccion  FOREIGN KEY (transaccion_id)
        REFERENCES transaccion_financiera (id) ON DELETE RESTRICT,

    INDEX idx_comision_venta               (venta_id),
    INDEX idx_comision_empresa             (empresa_id),
    INDEX idx_comision_beneficiaria        (membresia_beneficiaria_id),
    INDEX idx_comision_estado              (empresa_id, estado),
    INDEX idx_comision_liberacion          (empresa_id, estado, liberada_at),
    INDEX idx_comision_beneficiaria_estado (membresia_beneficiaria_id, estado),
    INDEX idx_comision_rango               (rango_config_id),

    CONSTRAINT chk_comision_monto_base CHECK (monto_base_calculo > 0),
    CONSTRAINT chk_comision_monto      CHECK (monto_comision >= 0),
    CONSTRAINT chk_comision_porcentaje CHECK (porcentaje_aplicado BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- SECCIÓN 13: SCORING REPUTACIONAL — EVALUACIONES PERIÓDICAS
-- ============================================================================

CREATE TABLE IF NOT EXISTS evaluacion_scoring (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    membresia_id             BIGINT UNSIGNED  NOT NULL,
    empresa_id               BIGINT UNSIGNED  NOT NULL,
    scoring_config_id        BIGINT UNSIGNED  NULL,
    snapshot_pesos_json      JSON             NOT NULL,
    valor_eficiencia         DECIMAL(10,4)    NOT NULL DEFAULT 0.0000,
    valor_consistencia       DECIMAL(10,4)    NOT NULL DEFAULT 0.0000,
    valor_volumen_ventas     DECIMAL(10,4)    NOT NULL DEFAULT 0.0000,
    valor_pago_puntual       DECIMAL(10,4)    NOT NULL DEFAULT 0.0000,
    valor_salud_red          DECIMAL(10,4)    NOT NULL DEFAULT 0.0000,
    penalizaciones_acumuladas DECIMAL(10,4)   NOT NULL DEFAULT 0.0000,
    score_final_calculado    DECIMAL(10,4)    NOT NULL,
    nivel_confianza_anterior SMALLINT UNSIGNED NOT NULL,
    nivel_confianza_resultante SMALLINT UNSIGNED NOT NULL,
    periodo_desde            TIMESTAMP        NOT NULL,
    periodo_hasta            TIMESTAMP        NOT NULL,
    ventas_periodo           INT UNSIGNED     NOT NULL DEFAULT 0,
    infracciones_periodo     INT UNSIGNED     NOT NULL DEFAULT 0,
    ejecutado_por_id         BIGINT UNSIGNED  NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_evalscoring_membresia FOREIGN KEY (membresia_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,
    CONSTRAINT fk_evalscoring_empresa   FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_evalscoring_config    FOREIGN KEY (scoring_config_id)
        REFERENCES configuracion_scoring (id) ON DELETE RESTRICT,
    CONSTRAINT fk_evalscoring_ejecutor  FOREIGN KEY (ejecutado_por_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,

    UNIQUE KEY uq_evalscoring_periodo   (membresia_id, periodo_desde, periodo_hasta),
    INDEX idx_evalscoring_membresia     (membresia_id),
    INDEX idx_evalscoring_empresa       (empresa_id),
    INDEX idx_evalscoring_fecha         (created_at),
    INDEX idx_evalscoring_empresa_fecha (empresa_id, created_at),

    CONSTRAINT chk_evalscoring_periodo   CHECK (periodo_hasta >= periodo_desde),
    CONSTRAINT chk_evalscoring_confianza CHECK (nivel_confianza_resultante BETWEEN 0 AND 1000),
    CONSTRAINT chk_evalscoring_anterior  CHECK (nivel_confianza_anterior   BETWEEN 0 AND 1000),
    CONSTRAINT chk_evalscoring_score     CHECK (score_final_calculado >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECCIÓN 14: INFRACCIONES, PENALIZACIONES Y ANTIFRAUDE
-- ============================================================================

CREATE TABLE IF NOT EXISTS infraccion (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    empresa_id               BIGINT UNSIGNED  NOT NULL,
    membresia_id             BIGINT UNSIGNED  NOT NULL,
    gravedad                 ENUM('leve','media','alta') NOT NULL,
    tipo                     VARCHAR(100)     NOT NULL,
    descripcion              TEXT             NOT NULL,
    penalizacion_puntaje     SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    penalizacion_financiera  DECIMAL(10,2)    NULL,
    evento_origen_id         BIGINT UNSIGNED  NULL,
    evento_origen_tipo       VARCHAR(60)      NULL,
    registrado_por_id        BIGINT UNSIGNED  NULL,
    notificado_a_admin       TINYINT(1)       NOT NULL DEFAULT 0,
    bloqueo_temporal_hasta   TIMESTAMP        NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_infraccion_empresa     FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_infraccion_membresia   FOREIGN KEY (membresia_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,
    CONSTRAINT fk_infraccion_registrador FOREIGN KEY (registrado_por_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,

    INDEX idx_infraccion_empresa     (empresa_id),
    INDEX idx_infraccion_membresia   (membresia_id),
    INDEX idx_infraccion_gravedad    (empresa_id, gravedad),
    INDEX idx_infraccion_fecha       (created_at),
    INDEX idx_infraccion_registrador (registrado_por_id),

    CONSTRAINT chk_infraccion_financiera CHECK (
        penalizacion_financiera IS NULL OR penalizacion_financiera > 0
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS evento_antifraude (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    usuario_id               BIGINT UNSIGNED  NOT NULL,
    empresa_id               BIGINT UNSIGNED  NULL,
    tipo_riesgo              ENUM(
                                 'dispositivo_nuevo',
                                 'ubicacion_inconsistente',
                                 'intentos_biometricos_fallidos',
                                 'patron_venta_anomalo',
                                 'suplantacion_detectada',
                                 'otro'
                             ) NOT NULL,
    nivel_riesgo             ENUM('bajo','medio','alto','critico') NOT NULL,
    descripcion              TEXT             NULL,
    dispositivo_id           BIGINT UNSIGNED  NULL,
    ip_origen                VARCHAR(45)      NULL,
    gps_latitud              DECIMAL(10,8)    NULL,
    gps_longitud             DECIMAL(11,8)    NULL,
    accion_tomada            ENUM(
                                 'ninguna',
                                 'revalidacion_forzada',
                                 'bloqueo_temporal',
                                 'notificacion_admin'
                             ) NOT NULL DEFAULT 'ninguna',
    resuelto                 TINYINT(1)       NOT NULL DEFAULT 0,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_antifraude_usuario     FOREIGN KEY (usuario_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,
    CONSTRAINT fk_antifraude_empresa     FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_antifraude_dispositivo FOREIGN KEY (dispositivo_id)
        REFERENCES dispositivo_registrado (id) ON DELETE RESTRICT,

    INDEX idx_antifraude_usuario (usuario_id),
    INDEX idx_antifraude_empresa (empresa_id),
    INDEX idx_antifraude_tipo    (tipo_riesgo, nivel_riesgo),
    INDEX idx_antifraude_fecha   (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECCIÓN 15: MARKETPLACE DE RECOMPENSAS
-- ============================================================================

CREATE TABLE IF NOT EXISTS recompensa (
    id                         BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    empresa_id                 BIGINT UNSIGNED  NOT NULL,
    nombre                     VARCHAR(150)     NOT NULL,
    descripcion                TEXT             NULL,
    tipo_premio                ENUM('propio','alianza_estrategica','experiencia_vip')
                               NOT NULL DEFAULT 'propio',
    proveedor_alianza          VARCHAR(150)     NULL,
    imagen_url                 VARCHAR(500)     NULL,
    costo_puntos               INT UNSIGNED     NOT NULL,
    stock_disponible           INT UNSIGNED     NULL,
    puntaje_minimo_desbloqueo  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    activo                     TINYINT(1)       NOT NULL DEFAULT 1,
    disponible_desde           TIMESTAMP        NULL,
    disponible_hasta           TIMESTAMP        NULL,
    creado_por_id              BIGINT UNSIGNED  NOT NULL,
    created_at                 TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                 TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at                 TIMESTAMP        NULL,

    CONSTRAINT fk_recompensa_empresa    FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_recompensa_creado_por FOREIGN KEY (creado_por_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,

    INDEX idx_recompensa_empresa (empresa_id, activo),
    INDEX idx_recompensa_tipo    (empresa_id, tipo_premio),

    CONSTRAINT chk_recompensa_costo   CHECK (costo_puntos > 0),
    CONSTRAINT chk_recompensa_stock   CHECK (stock_disponible IS NULL OR stock_disponible >= 0),
    CONSTRAINT chk_recompensa_puntaje CHECK (puntaje_minimo_desbloqueo BETWEEN 0 AND 1000),
    CONSTRAINT chk_recompensa_fechas  CHECK (
        disponible_desde IS NULL OR disponible_hasta IS NULL
        OR disponible_hasta >= disponible_desde
    ),
    CONSTRAINT chk_recompensa_vip_puntaje CHECK (
        tipo_premio != 'experiencia_vip' OR puntaje_minimo_desbloqueo >= 801
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS canje_recompensa (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    empresa_id               BIGINT UNSIGNED  NOT NULL,
    membresia_id             BIGINT UNSIGNED  NOT NULL,
    recompensa_id            BIGINT UNSIGNED  NOT NULL,
    puntos_utilizados        INT UNSIGNED     NOT NULL,
    estado                   ENUM('procesando','entregado','cancelado') NOT NULL DEFAULT 'procesando',
    entregado_at             TIMESTAMP        NULL,
    cancelado_at             TIMESTAMP        NULL,
    motivo_cancelacion       TEXT             NULL,
    transaccion_id           BIGINT UNSIGNED  NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_canje_empresa     FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_canje_membresia   FOREIGN KEY (membresia_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,
    CONSTRAINT fk_canje_recompensa  FOREIGN KEY (recompensa_id)
        REFERENCES recompensa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_canje_transaccion FOREIGN KEY (transaccion_id)
        REFERENCES transaccion_financiera (id) ON DELETE RESTRICT,

    INDEX idx_canje_empresa   (empresa_id),
    INDEX idx_canje_membresia (membresia_id),
    INDEX idx_canje_estado    (empresa_id, estado),

    CONSTRAINT chk_canje_puntos CHECK (puntos_utilizados > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECCIÓN 16: COMUNICACIÓN INTERNA — CHAT UNO A UNO
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversacion (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    empresa_id               BIGINT UNSIGNED  NOT NULL,
    membresia_a_id           BIGINT UNSIGNED  NOT NULL
                             COMMENT 'Siempre el ID MENOR de los dos participantes.',
    membresia_b_id           BIGINT UNSIGNED  NOT NULL
                             COMMENT 'Siempre el ID MAYOR de los dos participantes.',
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_conv_empresa FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_conv_a       FOREIGN KEY (membresia_a_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,
    CONSTRAINT fk_conv_b       FOREIGN KEY (membresia_b_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,

    UNIQUE KEY uq_conversacion_par (empresa_id, membresia_a_id, membresia_b_id),
    INDEX idx_conversacion_a       (membresia_a_id),
    INDEX idx_conversacion_b       (membresia_b_id),

    CONSTRAINT chk_conv_orden CHECK (membresia_a_id < membresia_b_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mensaje_chat (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    empresa_id               BIGINT UNSIGNED  NOT NULL,
    conversacion_id          BIGINT UNSIGNED  NOT NULL,
    membresia_emisor_id      BIGINT UNSIGNED  NOT NULL,
    contenido                TEXT             NOT NULL,
    leido_at                 TIMESTAMP        NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_mensaje_empresa      FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_mensaje_conversacion FOREIGN KEY (conversacion_id)
        REFERENCES conversacion (id) ON DELETE RESTRICT,
    CONSTRAINT fk_mensaje_emisor       FOREIGN KEY (membresia_emisor_id)
        REFERENCES workspace_membresia (id) ON DELETE RESTRICT,

    INDEX idx_mensaje_empresa_conv_check (empresa_id, conversacion_id),
    INDEX idx_mensaje_conversacion       (conversacion_id),
    INDEX idx_mensaje_fecha              (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECCIÓN 17: AUDITORÍA Y LOGGING
-- ============================================================================

CREATE TABLE IF NOT EXISTS log_auditoria (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    empresa_id               BIGINT UNSIGNED  NULL
                             COMMENT 'NULL para acciones globales de superadmin.',
    usuario_id               BIGINT UNSIGNED  NULL
                             COMMENT 'NULL = sistema automatizado.',
    entidad                  VARCHAR(80)      NOT NULL,
    entidad_id               BIGINT UNSIGNED  NULL,
    accion                   ENUM(
                                 'crear','leer','actualizar','eliminar',
                                 'aprobar','rechazar','exportar','configurar','otro'
                             ) NOT NULL,
    datos_anteriores_json    JSON             NULL,
    datos_nuevos_json        JSON             NULL,
    ip_origen                VARCHAR(45)      NULL,
    canal                    ENUM('app_movil','panel_web','sistema','api')
                             NOT NULL DEFAULT 'sistema',
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_log_empresa  FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,
    CONSTRAINT fk_log_usuario  FOREIGN KEY (usuario_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,

    INDEX idx_log_entidad     (entidad, entidad_id),
    INDEX idx_log_admin_fecha (empresa_id, usuario_id, created_at),
    INDEX idx_log_fecha       (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECCIÓN 18: NOTIFICACIONES
-- ============================================================================

CREATE TABLE IF NOT EXISTS notificacion (
    id                       BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    usuario_id               BIGINT UNSIGNED  NOT NULL,
    empresa_id               BIGINT UNSIGNED  NULL
                             COMMENT 'NULL = notificación de ámbito global.',
    tipo                     VARCHAR(80)      NOT NULL,
    titulo                   VARCHAR(200)     NOT NULL,
    cuerpo                   TEXT             NULL,
    datos_extra_json         JSON             NULL,
    canal                    ENUM('push','websocket','email','sms') NOT NULL DEFAULT 'push',
    leida                    TINYINT(1)       NOT NULL DEFAULT 0,
    leida_at                 TIMESTAMP        NULL,
    expires_at               TIMESTAMP        NULL,
    created_at               TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at               TIMESTAMP        NULL,

    CONSTRAINT fk_notif_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuario (id) ON DELETE RESTRICT,
    CONSTRAINT fk_notif_empresa FOREIGN KEY (empresa_id)
        REFERENCES empresa (id) ON DELETE RESTRICT,

    INDEX idx_notif_usuario (usuario_id, leida),
    INDEX idx_notif_empresa (empresa_id),
    INDEX idx_notif_fecha   (created_at),
    INDEX idx_notif_purga   (leida, expires_at, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;