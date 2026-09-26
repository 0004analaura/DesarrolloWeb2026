const express = require('express');
const { body, validationResult } = require('express-validator');
const cursoRepository = require('../repositories/cursoRepository');
const authJWT = require('../middlewares/authJWT'); 

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const cursos = await cursoRepository.obtenerTodos();
    res.json(cursos);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener los cursos' });
  }
});

router.post(
  '/',
  authJWT,
  [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('codigo').trim().notEmpty().withMessage('El código es obligatorio'),
    body('creditos')
      .isInt({ min: 1 })
      .withMessage('Los créditos deben ser un entero mayor que cero')
      .toInt()
  ],
  async (req, res) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }

    try {
      const { nombre, codigo, creditos } = req.body;
      const curso = await cursoRepository.crear({ nombre, codigo, creditos });
      return res.status(201).json(curso);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'El código ya existe' });
      }

      return res.status(500).json({ error: 'No se pudo crear el curso' });
    }
  }
);

module.exports = router;