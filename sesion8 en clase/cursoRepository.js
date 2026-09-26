const Curso = require('../models/Curso'); 

async function obtenerTodos() {
  return Curso.findAll();
}

async function crear(datosCurso) {
  return Curso.create(datosCurso);
}

module.exports = { obtenerTodos, crear };