import Proyecto from '../models/proyecto.js';
import Tarea from '../models/Tarea.js';
import Usuario from '../models/usuario.js';

const obtenerProyectos = async (req, res) => {
  const proyectos = await Proyecto.find({
    '$or': [
      { 'colaboradores': { $in: req.usuario } },
      { 'creador': { $in: req.usuario } },
    ]
  })
    // .where('creador')
    // .equals(req.usuario)
  // .select('-tareas');

  res.json(proyectos)

}


const nuevoProyecto = async (req, res) => {
  const proyecto = new Proyecto(req.body);
  proyecto.creador = req.usuario._id;

  try {
    const proyectoAlmacenado = await proyecto.save();
    res.json(proyectoAlmacenado);

  } catch (error) {
    console.log(error)
  }

}

const obtenerProyecto = async (req, res) => {
  const { id } = req.params;
  //  const {_id} = req.usuario;
  const proyecto = await Proyecto.findById(id)
    // .populate('tareas')
    .populate({path:'tareas',populate: {path:'completado', select:'nombre'}})
    .populate('colaboradores', 'nombre email');

  if (!proyecto) {
    const error = new Error('Proyecto no encontrado');
    return res.status(404).json({ msg: error.message });
  }

  
  if (proyecto.creador.toString() !== req.usuario._id.toString() &&
      !proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())
     ) {
    const error = new Error('No tienes permisos necesarios');
    return res.status(401).json({ msg: error.message }); 
  }

  // obtener las tareas del proyecto

  // solo pueden acceder el creador y colaboradores
  const tareas = await Tarea.find().where('proyecto').equals(proyecto._id);

  return res.json({
    proyecto,
    tareas
  })

}

const editarProyecto = async (req, res) => {
  const { id } = req.params;
  //  const {_id} = req.usuario;
  const proyecto = await Proyecto.findById(id);

  if (!proyecto) {
    const error = new Error('Proyecto no encontrado');
    return res.status(404).json({ msg: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('No tienes permisos pnecesarios');
    return res.status(401).json({ msg: error.message });
  }

  proyecto.nombre = req.body.nombre || proyecto.nombre;
  proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
  proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
  proyecto.cliente = req.body.cliente || proyecto.cliente;

  try {
    const proyectoAlmacenado = await proyecto.save();
    return res.json(proyectoAlmacenado);
  } catch (e) {
    const error = new Error('Error al actualizar el proyecto');
    return res.status(400).json({ msg: error.message });
  }

}

const eliminarProyecto = async (req, res) => {
  const { id } = req.params;
  //  const {_id} = req.usuario;
  const proyecto = await Proyecto.findById(id);

  if (!proyecto) {
    const error = new Error('Proyecto no encontrado');
    return res.status(404).json({ msg: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('No tienes permisos pnecesarios');
    return res.status(401).json({ msg: error.message });
  }

  try {
    await proyecto.deleteOne();
    res.json({ msg: 'Proyecto eliminado correctamente' });
  } catch (e) {
    const error = new Error('Error al eliminar el proyecto');
    return res.status(400).json({ msg: error.message });
  }
}

const buscarColaborador = async (req, res) => {
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email })
    .select('-confirmado -createdAt -updatedAt -__v -password -token');
  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    return res.status(404).json({ msg: error.message })
  }
  res.json(usuario);
}

const agregarColaborador = async (req, res) => {
  // console.log(req.params.id)
  const { email } = req.body;
  const proyecto = await Proyecto.findById(req.params.id);
  if (!proyecto) {
    const error = new Error('Proyecto no encontrado');
    return res.status(404).json({ msg: error.message })
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('Proyecto no encontrado');
    return res.status(404).json({ msg: error.message });
  }

  const usuario = await Usuario.findOne({ email })
    .select('-confirmado -createdAt -updatedAt -__v -password -token');
  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    return res.status(404).json({ msg: error.message })
  }


  if (proyecto.creador.toString() === usuario._id.toString()) {
    const error = new Error('No puedes agregarte a ti mismo como colaborador');
    return res.status(404).json({ msg: error.message })
  }

  if (proyecto.colaboradores.includes(usuario._id)) {
    const error = new Error('El usuario ya es colaborador');
    return res.status(404).json({ msg: error.message })
  }

  // Agregar usuario al proyecto
  proyecto.colaboradores.push(usuario._id);
  await proyecto.save();
  res.json({ msg: 'Colaborador agregado correctamente' });

}


const obtenerTareas = async (req, res) => {
  const { id } = req.params;
  const existeProyecto = await Proyecto.findById(id);
  if (!existeProyecto) {
    const error = new Error('Proyecto no encontrado');
    return res.status(404).json({ msg: error.message });
  }
  // solo pueden acceder el creador y colaboradores
  const tareas = await Tarea.find().where('proyecto').equals(id);
  return res.json(tareas)

}

const eliminarColaborador = async (req, res) => {
  //  console.log(req.body)
  //  console.log(req.params.id)
  const proyecto = await Proyecto.findById(req.params.id);
  if (!proyecto) {
    const error = new Error('Proyecto no encontrado');
    return res.status(404).json({ msg: error.message })
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('Proyecto no encontrado');
    return res.status(404).json({ msg: error.message });
  }

  proyecto.colaboradores.pull(req.body.id);
  await proyecto.save();
  res.json({ msg: 'Colaborador eliminado correctamente' });

}

export {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  buscarColaborador,
  agregarColaborador,
  eliminarColaborador,
  obtenerTareas,
}