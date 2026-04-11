-- Migración: Sesiones de Trabajo y Pase de Lista
-- Ejecutar en la base de datos evaluacionPLERD

CREATE TABLE sesionestrabajo (
    id               SERIAL PRIMARY KEY,
    idmodelo         INTEGER REFERENCES modelos(id) ON DELETE CASCADE,
    numsesiontrabajo VARCHAR NOT NULL
);

CREATE INDEX idx_sesiones_modelo ON sesionestrabajo (idmodelo);

CREATE TABLE paselista (
    id                 SERIAL PRIMARY KEY,
    idsesiontrabajo    INTEGER NOT NULL REFERENCES sesionestrabajo(id) ON DELETE CASCADE,
    idparticipante     INTEGER NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
    numsesiontrabajo   VARCHAR NOT NULL,
    numeracionplerd    VARCHAR,
    nombreparticipante VARCHAR NOT NULL,
    estadopresencia    VARCHAR NOT NULL CHECK (estadopresencia IN ('Presente', 'Ausente', 'Tardanza')),
    UNIQUE (idsesiontrabajo, idparticipante)
);

CREATE INDEX idx_paselista_sesion ON paselista (idsesiontrabajo);
