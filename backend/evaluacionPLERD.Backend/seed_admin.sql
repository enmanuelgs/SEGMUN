-- Voluntario administrador
INSERT INTO voluntarios (nombrecompleto, contrasena, sexo, categoria, regional, distrito, correoelectronico, numerotelefonico)
VALUES ('Administrador Sistema', 'Admin2026!', 'N/A', 'V-Nacional', '00', '00000', 'admin@sistema.org', '0000000000')
ON CONFLICT (nombrecompleto) DO NOTHING;

-- Organizador vinculado al voluntario administrador
INSERT INTO organizadores (regional, distrito, idvoluntario, cargo, contrasena)
SELECT '00', NULL, id, 'Administrador', 'Admin2026!'
FROM voluntarios WHERE nombrecompleto = 'Administrador Sistema'
ON CONFLICT DO NOTHING;
