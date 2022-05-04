import Proyecto from '../models/proyecto.js';
import Tarea from '../models/Tarea.js';

const agregarTarea = async (req, res) => {
  const { proyecto } = req.body;
  console.log(req.usuario)
  const existeproyecto = await Proyecto.findById(proyecto);
  console.log(existeproyecto);
  if (!existeproyecto) {
    const error = new Error('Proyecto no encontrado');
    return res.status(404).json({ msg: error.message });
  }

  if (existeproyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('No tienes permisos pnecesarios');
    return res.status(401).json({ msg: error.message });
  }

  try {
    const tareaAlmacenada = await Tarea.create(req.body);
    // Almacenar el ID EN EL PROYECTO
    existeproyecto.tareas.push(tareaAlmacenada._id);
    await existeproyecto.save();
    res.json(tareaAlmacenada);
  } catch (e) {
    const error = new Error('ha ocurrido un error al agregar la tarea');
    return res.status(401).json({ msg: error.message });
  }

}

const obtenerTarea = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate('proyecto');

  if (!tarea) {
    const error = new Error('Tarea no encontrada');
    return res.status(404).json({ msg: error.message });
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('No tienes permisos necesarios para ver esta tarea');
    return res.status(403).json({ msg: error.message });
  }


  return res.json(tarea)

}

const actualizarTarea = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate('proyecto');

  if (!tarea) {
    const error = new Error('Tarea no encontrada');
    return res.status(404).json({ msg: error.message });
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('No tienes permisos necesarios para ver esta tarea');
    return res.status(403).json({ msg: error.message });
  }

  tarea.nombre = req.body.nombre || tarea.nombre;
  tarea.descripcion = req.body.descripcion || tarea.descripcion;
  tarea.prioridad = req.body.prioridad || tarea.prioridad;
  tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

  try {
    const tareaAlmacenada = await tarea.save();
    res.json(tareaAlmacenada);
  } catch (e) {
    const error = new Error('Error al crear la tarea');
    return res.status(403).json({ msg: error.message });
  }

}

const eliminarTarea = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate('proyecto');

  if (!tarea) {
    const error = new Error('Tarea no encontrada');
    return res.status(404).json({ msg: error.message });
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('No tienes permisos necesarios para ver esta tarea');
    return res.status(403).json({ msg: error.message });
  }

  try {
    const proyecto = await Proyecto.findById(tarea.proyecto);
    proyecto.tareas.pull(tarea._id);
    // await proyecto.save();
    // await tarea.deleteOne();
    await Promise.allSettled([await proyecto.save(),await tarea.deleteOne()]);

    return res.json({ msg: 'Tarea eliminada correctamente' });
  } catch (error) {
    return res.status(500).json({ msg: 'Error al eliminar la tarea' });
  }

}

const cambiarEstadoTarea = async (req, res) => {

  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate('proyecto');

  if (!tarea) {
    const error = new Error('Tarea no encontrada');
    return res.status(404).json({ msg: error.message });
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()
    && !tarea.proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())
  ) {
    const error = new Error('No tienes permisos necesarios para modificar el estado de la tarea');
    return res.status(403).json({ msg: error.message });
  }

  tarea.estado = !tarea.estado;
  tarea.completado = req.usuario._id;
  await tarea.save();

  const tareaActualizada = await Tarea.findById(id).populate('proyecto').populate('completado');

  res.json(tareaActualizada);
}



export {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstadoTarea,
}