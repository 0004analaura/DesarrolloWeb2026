const express = require('express');

const app = express();

app.use(express.json());
app.use('/cursos', require('./cursos'));

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor disponible en http://localhost:${PORT}`);
});