-- Migración: Borrado lógico de participantes
-- Ejecutar en la base de datos evaluacionPLERD

ALTER TABLE participantes ADD COLUMN eliminado BOOLEAN NOT NULL DEFAULT FALSE;
