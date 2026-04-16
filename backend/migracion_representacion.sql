-- Migración: campo Representación en participantes
ALTER TABLE participantes ADD COLUMN representacion VARCHAR;
