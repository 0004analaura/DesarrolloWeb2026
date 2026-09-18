/**
 * app.js — Lógica del sitio (Fetch + Dialogs)
 * Tarea Sesión 7 · Desarrollo Web · UMG
 *
 * El cliente consume la API REST con Fetch.
 * Las operaciones de escritura exigen el header `x-api-key`.
 */

const API = '/alumnos';
const API_KEY = 'umg-2026'; // debe coincidir con config.env

// Helper ya resuelto: cabeceras para las peticiones
const cabeceras = (conJson = true) => ({
    ...(conJson ? { 'Content-Type': 'application/json' } : {}),
    'x-api-key': API_KEY,
});

// Referencias del DOM (ya resueltas)
const tabla = document.querySelector('#tablaAlumnos tbody');
const mensaje = document.querySelector('#mensaje');
const dialogoForm = document.querySelector('#dialogoForm');
const dialogoEliminar = document.querySelector('#dialogoEliminar');
const form = document.querySelector('#formAlumno');
const tituloForm = document.querySelector('#tituloForm');
const nombreEliminar = document.querySelector('#nombreEliminar');
const btnNuevo = document.querySelector('#btnNuevo');
const btnCancelar = document.querySelector('#btnCancelar');
const btnCancelarEliminar = document.querySelector('#btnCancelarEliminar');
const btnConfirmarEliminar = document.querySelector('#btnConfirmarEliminar');

let idEnEdicion = null;        // null = crear | string = editar
let idAEliminar = null;
let alumnosActuales = [];

/**
 * GET /alumnos y pinta las filas en la tabla.
 * Cada fila incluye botones "Editar" y "Eliminar".
 */
async function cargarAlumnos() {
    try {
        const respuesta = await fetch(API);

        if (!respuesta.ok) {
            throw new Error('No se pudieron cargar los alumnos');
        }

        const alumnos = await respuesta.json();
        alumnosActuales = alumnos;
        tabla.innerHTML = '';

        alumnos.forEach((alumno) => {
            const fila = document.createElement('tr');

            const valores = [
                alumno.id,
                alumno.nombre,
                alumno.apellido,
                alumno.email,
                alumno.edad ?? '',
            ];

            valores.forEach((valor) => {
                const celda = document.createElement('td');
                celda.textContent = valor;
                fila.appendChild(celda);
            });

            const acciones = document.createElement('td');
            acciones.className = 'celdas-acciones';

            const btnEditar = document.createElement('button');
            btnEditar.type = 'button';
            btnEditar.className = 'btn-editar';
            btnEditar.textContent = '✏️ Editar';
            btnEditar.addEventListener('click', () => abrirDialogoEditar(alumno.id));

            const btnEliminar = document.createElement('button');
            btnEliminar.type = 'button';
            btnEliminar.className = 'btn-eliminar';
            btnEliminar.textContent = '🗑️ Eliminar';
            btnEliminar.addEventListener('click', () => eliminarAlumno(alumno.id));

            acciones.append(btnEditar, btnEliminar);
            fila.appendChild(acciones);
            tabla.appendChild(fila);
        });
    } catch (error) {
        mostrarMensaje(error.message, 'error');
    }
}

/**
 * Limpia el formulario y abre el dialog para crear un alumno.
 */
function abrirDialogoNuevo() {
    form.reset();
    idEnEdicion = null;
    tituloForm.textContent = 'Nuevo alumno';
    dialogoForm.showModal();
}

/**
 * Precarga los datos del alumno y abre el dialog de edición.
 */
async function abrirDialogoEditar(id) {
    try {
        const respuesta = await fetch(`${API}/${id}`);

        if (!respuesta.ok) {
            throw new Error('No se pudo obtener el alumno');
        }

        const alumno = await respuesta.json();

        idEnEdicion = alumno.id;
        tituloForm.textContent = 'Editar alumno';

        form.elements.nombre.value = alumno.nombre;
        form.elements.apellido.value = alumno.apellido;
        form.elements.email.value = alumno.email;
        form.elements.edad.value = alumno.edad ?? '';

        dialogoForm.showModal();
    } catch (error) {
        mostrarMensaje(error.message, 'error');
    }
}

/**
 * Crea o actualiza un alumno según idEnEdicion.
 */
async function guardarAlumno(event) {
    event.preventDefault();

    const datos = {
        nombre: form.elements.nombre.value.trim(),
        apellido: form.elements.apellido.value.trim(),
        email: form.elements.email.value.trim(),
    };

    const valorEdad = form.elements.edad.value;
    if (valorEdad !== '') {
        datos.edad = Number(valorEdad);
    }

    const editando = idEnEdicion !== null;
    const url = editando ? `${API}/${idEnEdicion}` : API;
    const metodo = editando ? 'PUT' : 'POST';

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: cabeceras(),
            body: JSON.stringify(datos),
        });

        if (!respuesta.ok) {
            const datosError = await respuesta.json();
            throw new Error(datosError.error || 'No se pudo guardar el alumno');
        }

        dialogoForm.close();
        idEnEdicion = null;
        await cargarAlumnos();
        mostrarMensaje(
            editando
                ? 'Alumno actualizado correctamente'
                : 'Alumno creado correctamente',
            'ok',
        );
    } catch (error) {
        mostrarMensaje(error.message, 'error');
    }
}

/**
 * Abre el dialog de confirmación para eliminar un alumno.
 */
function eliminarAlumno(id) {
    idAEliminar = id;

    const alumno = alumnosActuales.find((item) => item.id === id);
    nombreEliminar.textContent = alumno
        ? `${alumno.nombre} ${alumno.apellido}`
        : '';

    dialogoEliminar.showModal();
}

/**
 * Muestra un mensaje de éxito o error.
 */
function mostrarMensaje(texto, tipo = 'ok') {
    mensaje.textContent = texto;
    mensaje.className = tipo;
}

// ============================================================
// Conexión de eventos
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    btnNuevo.addEventListener('click', abrirDialogoNuevo);
    form.addEventListener('submit', guardarAlumno);

    btnCancelar.addEventListener('click', () => {
        dialogoForm.close();
    });

    btnCancelarEliminar.addEventListener('click', () => {
        idAEliminar = null;
        dialogoEliminar.close();
    });

    btnConfirmarEliminar.addEventListener('click', async () => {
        if (!idAEliminar) {
            return;
        }

        try {
            const respuesta = await fetch(`${API}/${idAEliminar}`, {
                method: 'DELETE',
                headers: cabeceras(false),
            });

            if (!respuesta.ok) {
                const datosError = await respuesta.json();
                throw new Error(datosError.error || 'No se pudo eliminar el alumno');
            }

            dialogoEliminar.close();
            idAEliminar = null;
            await cargarAlumnos();
            mostrarMensaje('Alumno eliminado correctamente', 'ok');
        } catch (error) {
            mostrarMensaje(error.message, 'error');
        }
    });

    cargarAlumnos();
});
