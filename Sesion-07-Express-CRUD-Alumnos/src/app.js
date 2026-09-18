/**
 * app.js — Servidor Express (API REST + sitio estático)
 * Tarea Sesión 7 · Desarrollo Web · UMG
 *
 * Middlewares y rutas CRUD de alumnos.
 * Los tests de `tests/api.test.js` describen el contrato de cada endpoint.
 */

import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// __dirname en ES Modules
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

// ============================================================
// MIDDLEWARES
// ============================================================

/**
 * "Autenticación falsa": exige el header `x-api-key`.
 *
 * @type {import('express').RequestHandler}
 */
export function autenticacionFalsa(req, res, next) {
    const clave = req.get('x-api-key');
    const claveEsperada = process.env.API_KEY ?? 'umg-2026';

    if (clave !== claveEsperada) {
        return res.status(401).json({
            error: 'No autorizado',
        });
    }

    next();
}

/**
 * Validación básica del cuerpo de un alumno.
 *
 * @type {import('express').RequestHandler}
 */
export function validarAlumno(req, res, next) {
    const {
        nombre,
        apellido,
        email,
        edad,
    } = req.body ?? {};

    if (typeof nombre !== 'string' || !nombre.trim()) {
        return res.status(400).json({
            error: 'Nombre inválido',
        });
    }

    if (typeof apellido !== 'string' || !apellido.trim()) {
        return res.status(400).json({
            error: 'Apellido inválido',
        });
    }

    if (
        typeof email !== 'string' ||
        !email.trim() ||
        !email.includes('@')
    ) {
        return res.status(400).json({
            error: 'Email inválido',
        });
    }

    if (
        edad !== undefined &&
        (!Number.isFinite(edad) || edad < 0)
    ) {
        return res.status(400).json({
            error: 'Edad inválida',
        });
    }

    next();
}

// ============================================================
// APP
// ============================================================

/**
 * Crea la app de Express con sus rutas.
 * Recibe el repositorio por parámetro (inyección de dependencias).
 *
 * @param {import('./repositorio.js').RepositorioAlumnos} repositorio
 * @returns {import('express').Express}
 */
export function crearApp(repositorio) {
    const app = express();

    // Middlewares base
    app.use(express.json());

    // Sitio web estático (public/index.html, styles.css, app.js)
    app.use(express.static(join(__dirname, '..', 'public')));

    // GET /alumnos → lista todos → 200
    app.get('/alumnos', (req, res) => {
        res.json(repositorio.listar());
    });

    // GET /alumnos/:id → uno o 404
    app.get('/alumnos/:id', (req, res) => {
        const alumno = repositorio.obtener(req.params.id);

        if (!alumno) {
            return res.status(404).json({
                error: 'Alumno no encontrado',
            });
        }

        res.json(alumno);
    });

    // POST /alumnos → crear (auth + validación) → 201
    app.post(
        '/alumnos',
        autenticacionFalsa,
        validarAlumno,
        (req, res) => {
            const alumno = repositorio.crear(req.body);
            res.status(201).json(alumno);
        },
    );

    // PUT /alumnos/:id → actualizar (auth + validación) → 200 o 404
    app.put(
        '/alumnos/:id',
        autenticacionFalsa,
        validarAlumno,
        (req, res) => {
            const alumno = repositorio.actualizar(
                req.params.id,
                req.body,
            );

            if (!alumno) {
                return res.status(404).json({
                    error: 'Alumno no encontrado',
                });
            }

            res.json(alumno);
        },
    );

    // DELETE /alumnos/:id → eliminar (auth) → 204 o 404
    app.delete(
        '/alumnos/:id',
        autenticacionFalsa,
        (req, res) => {
            const eliminado = repositorio.eliminar(req.params.id);

            if (!eliminado) {
                return res.status(404).json({
                    error: 'Alumno no encontrado',
                });
            }

            return res.status(204).send();
        },
    );

    return app;
}
