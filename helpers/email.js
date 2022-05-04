import nodemailer from 'nodemailer';

const emailRegistro = async (datos) => {
  const { nombre, email, token } = datos;

   const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Informacion del email
  const info = await transport.sendMail({
    from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
    to: email,
    subject: "UpTask - Confirma tu cuenta",
    text: 'Comprueba tu cuenta en UpTask',
    html:`
      <p>Hola ${nombre} Comprueba tu cuenta en UpTask</p>
      <p> Tue cuenta ya esta casi lista, solo debes comprobarla en el siguiente enlace:</p>

      <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar Cuenta</a>

      <p>Si tu no creaste la cuenta, ingnora el mensaje</p>    
    `
  })

}


const emailOlvidePassword = async (datos) => {
  const { nombre, email, token } = datos;

  // TODO: Mover hacia variables de entorno
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Informacion del email
  const info = await transport.sendMail({
    from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
    to: email,
    subject: "UpTask - Reestablece tu contraseña",
    text: 'Resetea tu contraseña en UpTask',
    html:`
      <p>Hola ${nombre} ha solicitado reestablecer tu password en UpTask</p>
      <p> Da click el siguiente enlace para generar un nuevo password:</p>

      <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Restablecer password</a>

      <p>Si tu no has solicitado cambio de password, ingnora el mensaje</p>    
    `
  })

}


export {
  emailRegistro,
  emailOlvidePassword
}