import express from "express";

import checkAuth from '../middleware/checkAuth.js';
import {obtenerProyectos,nuevoProyecto, editarProyecto, eliminarProyecto, obtenerProyecto, agregarColaborador, eliminarColaborador,obtenerTareas, buscarColaborador,} from '../controllers/proyectoController.js'


const router = express.Router();
router.get('/',checkAuth,obtenerProyectos);
router.post('/',checkAuth,nuevoProyecto);
router.put('/:id',checkAuth,editarProyecto);
router.get('/:id',checkAuth,obtenerProyecto);
router.delete('/:id',checkAuth,eliminarProyecto);

// router.get('/tareas/:id',checkAuth,obtenerTareas);
router.post('/colaboradores',checkAuth,buscarColaborador);
router.post('/colaboradores/:id',checkAuth,agregarColaborador);
router.post('/eliminar-colaborador/:id',checkAuth,eliminarColaborador);



export default router;