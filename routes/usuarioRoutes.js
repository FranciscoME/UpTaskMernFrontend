// @ts-check
import express from "express";
import {registrar, autenticar, confirmar, olvidePassword, comprobarToken,nuevoPassword, perfil} from '../controllers/usuarioController.js';
import checkAuth from "../middleware/checkAuth.js";


const router = express.Router();

// Autenticacion, Registro y Confirmacion de Usuarios
router.post('/',registrar) //Registrar usuario
router.post('/login',autenticar); //Autenticar usuario
router.get('/confirmar/:token', confirmar); //Confirmar usuario
router.post('/olvide-password', olvidePassword); //Olvide password

router.get('/olvide-password/:token', comprobarToken); //Olvide password
router.post('/olvide-password/:token', nuevoPassword); //Olvide password
// router.route('/olvide-password/:token').post(nuevoPassword).get(comprobarToken); //Son equivalentes

router.get("/perfil",checkAuth,perfil); //Comprobar si el usuario esta autenticado

export default router;