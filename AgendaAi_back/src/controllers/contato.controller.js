import { Contato } from "../models/contato.js";
import nodemailer from "nodemailer";

// Função auxiliar com o CSS e estrutura do template (Baseado no emailTemplate.js)
const getEmailHtml = (titulo, conteudoHTML) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
        .header { background-color: rgb(110, 153, 139); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: white; padding: 30px; border-radius: 0 0 5px 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .info-box { background-color: #f0f0f0; padding: 15px; margin: 20px 0; border-left: 4px solid rgb(110, 153, 139); }
        .info-item { margin: 10px 0; }
        .label { font-weight: bold; color: rgb(110, 153, 139); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${titulo}</h1>
        </div>
        <div class="content">
          ${conteudoHTML}
        </div>
        <div class="footer">
          <p>Este é um email automático, por favor não responda.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const Register = async (req, res) => {
  const { email, telefone, assunto, mensagem } = req.body;

  try {
    // 1. Salvar no Banco
    const contato = await Contato.create({
      email,
      telefone,
      assunto,
      mensagem,
    });
    await contato.save();

    // 2. Configurar Transporter (Mesmas credenciais do user.controller.js)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: 'brunocapita.dev@gmail.com',
        pass: 'rphp tdwn ynhw wphp',
      },
    });

    // --- PREPARAÇÃO DOS CONTEÚDOS ---

    // 3. Conteúdo para o ADMIN (Detalhes completos)
    const conteudoAdmin = `
      <p>Você recebeu uma nova mensagem através do site:</p>
      <div class="info-box">
        <div class="info-item"><span class="label">✉️ De:</span> ${email}</div>
        <div class="info-item"><span class="label">📞 Telefone:</span> ${telefone}</div>
        <div class="info-item"><span class="label">📌 Assunto:</span> ${assunto}</div>
        <div class="info-item"><span class="label">📝 Mensagem:</span><br>${mensagem}</div>
      </div>
    `;
    const htmlAdmin = getEmailHtml(" Novo Contato Recebido", conteudoAdmin);

    // 4. Conteúdo para o USUÁRIO (Texto exato que você pediu)
    const conteudoUser = `
      <h3>Olá!</h3>
      <p>Recebemos seu contato referente ao assunto: <strong>${assunto}</strong>.</p>
      <p>Nossa equipe já está analisando sua mensagem e retornaremos em breve para resolver seu problema ou esclarecer sua dúvida.</p>
      <br/>
      <p>Atenciosamente,</p>
      <p><strong>Equipe Agenda AI</strong></p>
    `;
    const htmlUser = getEmailHtml(" Mensagem Recebida!", conteudoUser);


    // 5. Enviar E-mails
    await transporter.sendMail({
      to: "projetoquintoams@gmail.com",
      from: "brunocapita.dev@gmail.com",
      subject: `[Fale Conosco] ${assunto}`,
      html: htmlAdmin
    });

    await transporter.sendMail({
      to: email,
      from: "brunocapita.dev@gmail.com",
      subject: "Recebemos sua mensagem - Agenda AI",
      html: htmlUser
    });

    res.status(201).json(contato);

  } catch (error) {
    console.error("Erro no processo de contato:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export const ListarContatos = async (req, res) => {
  try {
    const contatos = await Contato.find().sort({ createdAt: -1 });
    res.status(200).json(contatos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar contatos" });
  }
};