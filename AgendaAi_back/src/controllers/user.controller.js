import { User } from "../models/User.js"
import createToken from "../utils/createToken.js"
import { hashPass } from "../utils/hashPass.js"
import nodemailer from "nodemailer"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

// CONFIGURAÇÃO DO TRANSPORTE DE E-MAIL (Reutilizável)
// Sugestão: Mova as credenciais para o .env assim que possível
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: 'brunocapita.dev@gmail.com',
    pass: 'rphp tdwn ynhw wphp',
  },
});

export const Register = async (req, res) => {
  const { name, email, password, confirmPass } = req.body
  
  if (password !== confirmPass) {
    return res.status(400).json({ message: "As senhas estão diferentes" })
  }

  const verifyUser = await User.findOne({
    email: email
  })

  if (verifyUser) {
    return res.status(400).json({ message: "Usuário já existe" })
  }

  const hash = await hashPass(password)

  try {
    // 1. Cria o utilizador
    const user = await User.create({
      name: name,
      email: email,
      password: hash,
    })
    await user.save()

    // 2. Envia o e-mail de boas-vindas (TEMPLATE NOVO)
    await transporter.sendMail({
      to: email,
      from: "brunocapita.dev@gmail.com",
      subject: "Bem-vindo ao Agenda AI!",
      html: `
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bem-vindo ao AgendaAI</title>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
            <style>
                body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
                table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
                img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
                table { border-collapse: collapse !important; }
                body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: rgb(110, 153, 139); font-family: 'Roboto', sans-serif; }
                
                .wrapper { width: 100%; table-layout: fixed; background-color: rgb(110, 153, 139); padding-bottom: 40px; }
                .main-table { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); }
                .header { background-color: rgb(110, 153, 139); padding: 40px 20px; text-align: center; }
                .header h1 { color: #f7f1f3; font-size: 28px; margin: 0; font-weight: 700; }
                .content { padding: 40px 30px; text-align: left; color: #333333; }
                .content h2 { color: rgb(110, 153, 139); font-size: 22px; margin-bottom: 15px; margin-top: 0; }
                .content p { font-size: 16px; line-height: 1.6; margin-bottom: 20px; color: #555555; }
                .features-box { background-color: #f7f1f3; border-left: 4px solid rgb(110, 153, 139); padding: 20px; margin: 20px 0; border-radius: 4px; }
                .features-list { padding: 0; margin: 0; list-style: none; }
                .features-list li { font-size: 15px; margin-bottom: 10px; padding-left: 20px; position: relative; }
                .features-list li::before { content: "✨"; position: absolute; left: 0; color: rgb(110, 153, 139); }
                .btn-container { text-align: center; margin-top: 30px; }
                .btn-primary { background-color: rgb(110, 153, 139); color: #ffffff; display: inline-block; font-size: 16px; font-weight: bold; line-height: 50px; text-align: center; text-decoration: none; width: 240px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
                .footer { text-align: center; padding: 20px; color: rgba(255, 255, 255, 0.8); font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <table class="main-table" align="center" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td class="header">
                            <h1>Bem-vindo(a) ao<br>AgendaAI</h1>
                        </td>
                    </tr>
                    <tr>
                        <td class="content">
                            <h2>Olá, ${name}! 👋</h2>
                            <p>Seja muito bem-vindo(a) ao <strong>AgendaAI</strong>, o sistema definitivo para simplificar a rotina de quem trabalha com <strong>Estética</strong>.</p>
                            <p>Sabemos que a beleza e o bem-estar exigem foco total. Por isso, deixe a organização e a agenda com a gente.</p>

                            <div class="features-box">
                                <h3 style="margin-top: 0; color: rgb(110, 153, 139); font-size: 18px;">O que você pode fazer agora:</h3>
                                <ul class="features-list">
                                    <li><strong>Agendamento 24/7:</strong> Seus clientes marcam horário a qualquer momento.</li>
                                    <li><strong>Gestão Completa:</strong> Controle total de serviços e horários.</li>
                                    <li><strong>Organização:</strong> Reduza faltas e otimize seu tempo.</li>
                                </ul>
                            </div>

                            <div class="btn-container">
                                <a href="http://localhost:4200/login" class="btn-primary" target="_blank">Acessar Minha Conta</a>
                            </div>
                        </td>
                    </tr>
                </table>
                <div class="footer">
                    <p>&copy; 2025 AgendaAI. Organização e Beleza em um clique.</p>
                    <p>Este é um e-mail automático, por favor não responda.</p>
                </div>
            </div>
        </body>
        </html>
      `
    });

    return res.status(201).json(user)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Problemas no servidor" })
  }
}

export const Login = async (req, res) => {
  const { email, password } = req.body
  console.log('LOGIN REQ BODY', req.body)
  if (!email || !password) throw new Error("Email e senha são obrigatórios")
  try {
    const verifyUser = await User.findOne({
      email: email
    })

   if (!verifyUser) {
      return res.status(400).json({ message: "Usuário ou senha inválidos" })
    }
    
    const verifyPass = await bcrypt.compare(password, verifyUser.password)
    console.log('VERIFICANDO SENHA:', verifyPass)
    if(!verifyPass){
      return  res.status(400).json({ message: "Usuário ou senha inválidos" })
    }

    if (verifyUser) {
      try {
        const token = createToken({ name: verifyUser.name, id: verifyUser._id, role: verifyUser.roles }, '3d')
        res.status(200).json({
          user: verifyUser,
          token: token
        })
        console.log('USUÁRIO LOGADO:', verifyUser)
      } catch (error) {
        console.error(error)
      }
    } else {
      res.status(400).json({ message: "Usuário ou senha inválidos" })
    }
  } catch (error) {
    console.error(error)
  }
}

export const GetUserById = async (req, res) => {
  const { id } = req.params
  try {
    const user = await User.findById(id)
    console.log(user)
    if (!user) {
      return res.status(400).json({ message: "Usuário não existe" })
    }

    res.status(200).json(user)
  } catch (error) {
    console.log(error)
  }
}

// 1 - PEDIR RESET DE SENHA
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  console.log(email)
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Email não cadastrado" });
    }

    const secret = process.env.SECRET_KEY + user.password;
    const token = jwt.sign(
      { id: user._id, email: user.email },
      secret,
      { expiresIn: "15m" }
    );

    const resetURL = `http://localhost:4200/new-password/${user._id}/${token}`;

    // Envia o e-mail de recuperação (TEMPLATE NOVO)
    await transporter.sendMail({
      to: user.email,
      from: "brunocapita.dev@gmail.com",
      subject: "Redefinição de senha - AgendaAI",
      html: `
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Redefinição de Senha</title>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
            <style>
                body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
                table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
                img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
                table { border-collapse: collapse !important; }
                body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: rgb(110, 153, 139); font-family: 'Roboto', sans-serif; }
                
                .wrapper { width: 100%; table-layout: fixed; background-color: rgb(110, 153, 139); padding-bottom: 40px; }
                .main-table { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); }
                .header { background-color: rgb(110, 153, 139); padding: 40px 20px; text-align: center; }
                .header h1 { color: #f7f1f3; font-size: 26px; margin: 0; font-weight: 700; }
                .content { padding: 40px 30px; text-align: left; color: #333333; }
                .content h2 { color: rgb(110, 153, 139); font-size: 22px; margin-bottom: 15px; margin-top: 0; }
                .content p { font-size: 16px; line-height: 1.6; margin-bottom: 20px; color: #555555; }
                .alert-box { background-color: #f7f1f3; border-left: 4px solid rgb(110, 153, 139); padding: 15px; margin: 20px 0; border-radius: 4px; }
                .btn-container { text-align: center; margin-top: 30px; margin-bottom: 20px;}
                .btn-primary { background-color: rgb(110, 153, 139); color: #ffffff; display: inline-block; font-size: 16px; font-weight: bold; line-height: 50px; text-align: center; text-decoration: none; width: 240px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
                .footer { text-align: center; padding: 20px; color: rgba(255, 255, 255, 0.8); font-size: 12px; }
                .small-text { font-size: 13px; color: #999; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;}
            </style>
        </head>
        <body>
            <div class="wrapper">
                <table class="main-table" align="center" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td class="header">
                            <h1>AgendaAI<br><span style="font-size: 18px; font-weight: 400;">Recuperação de Conta</span></h1>
                        </td>
                    </tr>

                    <tr>
                        <td class="content">
                            <h2>Olá, ${user.name}! 🔒</h2>
                            <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
                            
                            <div class="alert-box">
                                <p style="margin: 0; font-weight: bold; color: rgb(110, 153, 139);">Importante:</p>
                                <p style="margin: 5px 0 0;">Este link é válido por apenas <strong>15 minutos</strong>.</p>
                            </div>

                            <p>Clique no botão abaixo para criar uma nova senha:</p>

                            <div class="btn-container">
                                <a href="${resetURL}" class="btn-primary" target="_blank">Redefinir Senha</a>
                            </div>

                            <p class="small-text">
                                Se você não solicitou esta alteração, por favor, ignore este e-mail. Sua senha permanecerá a mesma e sua conta está segura.
                            </p>
                        </td>
                    </tr>
                </table>

                <div class="footer">
                    <p>&copy; 2025 AgendaAI. Segurança e Organização.</p>
                </div>
            </div>
        </body>
        </html>
      `
    });

    res.json({ message: "Email enviado com sucesso!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro interno" });
  }
};


// 2 - RESETAR SENHA
export const resetPassword = async (req, res) => {
  const id = req.query.id;
  const token = req.query.token;
  const { password } = req.body;
  console.log(token)
  try {
    const oldUser = await User.findById(id);

    if (!oldUser) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const secret = process.env.SECRET_KEY + oldUser.password;

    try {
      const verified = jwt.verify(token, secret);
      const hashed = await bcrypt.hash(password, 10);
      await User.findByIdAndUpdate(id, { password: hashed });
      console.log('SENHA REDEFINIDA PARA USUÁRIO:', id);
      res.json({ message: "Senha redefinida com sucesso!" });

    } catch (err) {
      return res.status(400).json({ error: "Token inválido ou expirado" });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro interno" });
  }
};

export const GetAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const ToggleStatusUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "usuario não encontrado" });
    }

    res.status(200).json({
      message: `Usuario ${isActive ? "ativado" : "inativado"} com sucesso!`,
      user,
    });
  } catch (error) {
    console.error("Erro ao alterar status:", error);
    res.status(500).json({ message: "Erro ao alterar status do usuario." });
  }
};

export const UpdateUserPhoto = async (req, res) => {
  const { id } = req.params;
  const { file } = req;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (file) {
      user.photo = file.filename; // Salva apenas o nome do arquivo
      await user.save();
      return res.status(200).json({ message: "Foto de perfil atualizada com sucesso", user });
    } else {
      return res.status(400).json({ message: "Nenhuma foto enviada" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Problemas no servidor" });
  }
};

export const UpdateUser = async (req, res) => {
  const { id } = req.params;
  const { name, phone, password, email } = req.body;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (email && email !== user.email) {
      return res.status(400).json({ message: "O email não pode ser alterado." });
    }

    // ✔ Atualiza apenas os campos permitidos
    if (name) user.name = name;
    if (phone) user.phone = phone;

    if (password) {
      const hashed = await hashPass(password);
      user.password = hashed;
    }

    await user.save();

    // Remove a senha da resposta
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json(userResponse);

  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return res.status(500).json({ message: "Erro ao atualizar usuário." });
  }
};