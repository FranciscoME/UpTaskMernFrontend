import Usuario from '../models/usuario.js';
import { generarId } from '../helpers/generarId.js';
import generarJWT from '../helpers/generarJWT.js';
import { emailRegistro, emailOlvidePassword } from '../helpers/email.js';

// Registrar usuario
const registrar = async (req, res) => {

  // Evitar registro de usuarios duplicados
  const { email } = req.body;
  const existeUsuario = await Usuario.findOne({ email: email });

  if (existeUsuario) {
    const error = new Error('Usuario ya registrado');
    return res.status(400).json({ msg: error.message });
  }

  try {
    const usuario = new Usuario(req.body);
    usuario.token = generarId();
    const usuarioAlmacenado = await usuario.save();
    usuarioAlmacenado.password = undefined;

    // Enviar email de confirmacion
    emailRegistro({
      nombre : usuarioAlmacenado.nombre,
      email: usuarioAlmacenado.email,
      token: usuarioAlmacenado.token,
    })
    
    res.json({msg: 'Usuario registrado correctamente, revisa tu email para confirmar tu cuenta', usuario: usuarioAlmacenado});
  } catch (e) {
    const error = new Error('Ha ocurrido un error al ingresar el usuario');
    return res.status(400).json({ msg: error.message });
  }

}

// Autenticar usuario
const autenticar = async (req, res) => {
  // Comprobar que el usuario existe
  const { email,password } = req.body;
  const usuario = await Usuario.findOne({ email: email });
  if (!usuario) {
    const error = new Error('El usuario no existe'); 
    return res.status(400).json({ msg: error.message });
  }
  // Comprobar si el usuario esta confirmado 
  if (!usuario.confirmado) {
    const error = new Error('Tu cuenta no ha sido confirmada'); 
    return res.status(403).json({ msg: error.message });
  }

  // Comprobar password
  if( await usuario.comprobarPassword(password)){
    res.json({
      _id : usuario._id,
      nombre : usuario.nombre,
      email: usuario.email,
      token: generarJWT(usuario._id),
    })
  }
  else{
    const error = new Error('email o password incorrecto'); 
    return res.status(403).json({ msg: error.message });
  }

};

const confirmar = async (req,res)=>{
  const {token} = req.params;
  const usuarioConfirmar = await Usuario.findOne({token:token});
  if(!usuarioConfirmar){
    const error = new Error('Token no valido');
    return res.status(403).json({msg:error.message});
  }

  try {
    usuarioConfirmar.confirmado = true;
    usuarioConfirmar.token = '';
    await usuarioConfirmar.save();
    return res.json({msg:'Cuenta confirmada correctamente'});     
  } catch (e) {
    const error = new Error('Ha ocurrido un error al confirmar la cuenta');
    return res.status(403).json({msg:error.message});
  }

}

const olvidePassword = async(req,res)=>{
 const {email} = req.body;

  const usuario = await Usuario.findOne({ email: email });
  if (!usuario) {
    const error = new Error('El usuario no existe'); 
    return res.status(400).json({ msg: error.message });
  }

  try {
    usuario.token= generarId();
    await usuario.save();
    // Enviar el email para cambiar el password
    emailOlvidePassword({
      nombre : usuario.nombre,
      email: usuario.email,
      token: usuario.token,
    })

    return res.json({msg:'Se ha enviado un email con las instrucciones'});
    
  } catch (error) {
    console.log(error);
  }
}


const comprobarToken = async(req,res)=>{
  const {token} = req.params;

  const tokenValido = await Usuario.findOne({token:token});
  if(tokenValido){
    res.json({msg:'Token valido'});
  }
  else{    
    const error = new Error('Token no valido');
    return res.status(403).json({msg:error.message});
  }

}

const nuevoPassword = async(req,res)=>{
  const {token} = req.params;
  const {password}= req.body;

  const usuario = await Usuario.findOne({token:token});
  if(usuario){
    usuario.password = password;
    usuario.token = '';

    try {
      await usuario.save();
      res.json({msg:'Password cambiado correctamente'}); 
    }
    catch (error) {
      console.log(error);
    }
  }
  else{    
    const error = new Error('Token no valido');
    return res.status(403).json({msg:error.message});
  }

}



const perfil = async(req, res)=>{
  const {usuario}= req;
  res.json({usuario});
}

export {
  registrar,
  autenticar,
  confirmar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
}