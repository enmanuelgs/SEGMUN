-- =============================================
-- Migración: inclusión de tabla modelos
-- =============================================

-- 1. Crear tabla modelos
CREATE TABLE modelos (
    id           SERIAL PRIMARY KEY,
    distrito     VARCHAR,
    regional     VARCHAR,
    anioEdicion  SMALLINT
);

CREATE INDEX idx_modelos_anio ON modelos (anioEdicion);

-- 2. Agregar columna idModelo a participantes (nullable para compatibilidad)
ALTER TABLE participantes
    ADD COLUMN idModelo INTEGER;

ALTER TABLE participantes
    ADD CONSTRAINT fk_part_modelo
    FOREIGN KEY (idModelo) REFERENCES modelos (id)
    ON DELETE SET NULL;

CREATE INDEX idx_participantes_modelo ON participantes (idModelo);
