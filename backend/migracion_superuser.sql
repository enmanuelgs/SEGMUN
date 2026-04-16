-- Migración: Agregar columna EsSuperuser a organizadores
-- Ejecutar en la base de datos PostgreSQL del proyecto

ALTER TABLE organizadores ADD COLUMN IF NOT EXISTS essuperuser BOOLEAN NOT NULL DEFAULT false;

-- Para asignar el superuser inicial (reemplazar el nombre del voluntario correspondiente):
-- UPDATE organizadores SET essuperuser = true WHERE id = 1;
