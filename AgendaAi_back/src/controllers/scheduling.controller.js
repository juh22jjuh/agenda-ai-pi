import { scheduling } from "../models/Scheduling.js";
import { servicesEntreprenuer } from "../models/services_entreprenuer.js";
import { User } from "../models/User.js";
import { Entrepreneur } from "../models/Entrepreneur.js"; // Importe o model da Empresa
import nodemailer from "nodemailer"; // Importe o nodemailer

// Configuração do Transporter (Mesmas credenciais do user.controller)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: 'brunocapita.dev@gmail.com',
    pass: 'rphp tdwn ynhw wphp',
  },
});

// Função para normalizar o caminho do arquivo
const normalizePath = (path) => {
  if (!path) return null;
  return path.replace(/\\/g, '/');
};

// CRIAR AGENDAMENTO (COM NOTIFICAÇÃO DUPLA)
export const createScheduling = async (req, res) => {
  try {
    const {
      services_entrepreneur_id,
      user_id,
      name,
      age,
      description,
      date,
      time
    } = req.body;

    // Busca cliente (quem está agendando)
    const clientUser = await User.findById(user_id);
    
    if (!clientUser) return res.status(404).json({ error: "Usuário não encontrado" });
    if (!clientUser.isActive) return res.status(403).json({ error: "Sua conta está desativada." });

    const inspirationImage = req.file ? normalizePath(req.file.path) : null;

    // Busca o serviço
    const service = await servicesEntreprenuer.findById(services_entrepreneur_id);
    if (!service) return res.status(404).json({ error: "Serviço não encontrado" });

    // --- VALIDAÇÕES (Mantidas iguais) ---
    const weekMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    // Verifica se dias é undefined antes de mapear
    if (!service.dias) return res.status(400).json({ error: "Configuração de dias do serviço inválida" });
    
    const allowedDays = service.dias.map(d => weekMap[d.id.toLowerCase()]);
    const requestedDate = new Date(`${date}T00:00:00`); 
    const requestedWeekday = requestedDate.getDay();

    if (!allowedDays.includes(requestedWeekday)) {
      return res.status(400).json({ error: "Serviço indisponível neste dia" });
    }

    const allowedTimes = service.time.map(t => t.label);
    if (!allowedTimes.includes(time)) {
      return res.status(400).json({ error: "Serviço indisponível neste horário" });
    }

    const conflict = await scheduling.findOne({ services_entrepreneur_id, date, time });
    if (conflict) return res.status(400).json({ error: "Horário já ocupado" });

    // 1. SALVA O AGENDAMENTO
    const newScheduling = await scheduling.create({
      services_entrepreneur_id,
      user_id,
      name,
      age,
      description,
      date,
      time,
      inspirationImage
    });

    // --- LÓGICA DE NOTIFICAÇÃO (CLIENTE E DONO) ---
    try {
      // Busca o dono do estabelecimento (Entrepreneur + User)
      // O campo 'entrepreneur' deve existir no seu model de serviço e conter o ID do Entrepreneur
      const entrepreneur = await Entrepreneur.findById(service.entrepreneur).populate('user');

      if (clientUser && service && entrepreneur && entrepreneur.user) {
        
        const dateObj = new Date(`${date}T00:00:00`);
        const formattedDate = dateObj.toLocaleDateString('pt-BR');
        const ownerEmail = entrepreneur.user.email; // Email do Dono
        const ownerName = entrepreneur.user.name;   // Nome do Dono

        // EMAIL 1: PARA O CLIENTE (CONFIRMAÇÃO)
        await transporter.sendMail({
          to: clientUser.email, 
          from: "brunocapita.dev@gmail.com",
          subject: "Agendamento Confirmado! ✅ - AgendaAI",
          html: `
            <!DOCTYPE html>
            <html lang="pt-br">
            <body style="font-family: Arial, sans-serif; background-color: rgb(110, 153, 139); padding: 20px;">
                <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 8px; padding: 20px;">
                    <h2 style="color: rgb(110, 153, 139); text-align: center;">Olá, ${clientUser.name}! 👋</h2>
                    <p>Seu horário foi agendado com sucesso!</p>
                    <div style="background-color: #f7f1f3; padding: 15px; border-radius: 5px;">
                        <p><strong>🏢 Local:</strong> ${entrepreneur.name}</p>
                        <p><strong>💇‍♀️ Serviço:</strong> ${service.nome || service.title}</p>
                        <p><strong>📅 Data:</strong> ${formattedDate}</p>
                        <p><strong>⏰ Horário:</strong> ${time}</p>
                    </div>
                    <p style="text-align: center; margin-top: 20px;">
                        <a href="http://localhost:4200/my-schedules" style="background-color: rgb(110, 153, 139); color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Meus Agendamentos</a>
                    </p>
                </div>
            </body>
            </html>
          `
        });

        // EMAIL 2: PARA O DONO DO ESTABELECIMENTO (NOVO CLIENTE)
        await transporter.sendMail({
          to: ownerEmail,
          from: "brunocapita.dev@gmail.com",
          subject: "Novo Agendamento Recebido! 📅 - AgendaAI",
          html: `
            <!DOCTYPE html>
            <html lang="pt-br">
            <body style="font-family: Arial, sans-serif; background-color: rgb(110, 153, 139); padding: 20px;">
                <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 8px; padding: 20px;">
                    <h2 style="color: rgb(110, 153, 139); text-align: center;">Novo Cliente, ${ownerName}! 🚀</h2>
                    <p>Você acabou de receber um novo agendamento pelo App.</p>
                    <div style="background-color: #f7f1f3; padding: 15px; border-radius: 5px; border-left: 5px solid rgb(110, 153, 139);">
                        <p><strong>👤 Cliente:</strong> ${clientUser.name}</p>
                        <p><strong>📱 Telefone:</strong> ${clientUser.phone || 'Não informado'}</p>
                        <p><strong>💇‍♀️ Serviço Solicitado:</strong> ${service.nome || service.title}</p>
                        <p><strong>📅 Data:</strong> ${formattedDate}</p>
                        <p><strong>⏰ Horário:</strong> ${time}</p>
                    </div>
                    <p>Acesse seu painel para ver mais detalhes.</p>
                </div>
            </body>
            </html>
          `
        });

        console.log(`Emails enviados para Cliente (${clientUser.email}) e Dono (${ownerEmail})`);
      }
    } catch (emailError) {
      console.error("Erro ao enviar notificações de email:", emailError);
    }
    // --- FIM DA LÓGICA DE EMAIL ---

    res.status(201).json(newScheduling);

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Dados inválidos' });
    }
    console.log(error);
    res.status(500).json({ error: "Erro ao criar agendamento" });
  }
};


// LISTAR AGENDAMENTOS DE UM SERVIÇO
export const getSchedulingByService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const list = await scheduling.find({
      services_entrepreneur_id: serviceId
    });

    res.json(list);

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'ID do serviço inválido' });
    }
    res.status(500).json({ error: "Erro ao buscar agendamentos" });
  }
};

// LISTAR AGENDAMENTOS DE UM USUÁRIO
export const getSchedulingByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const list = await scheduling.find({
      user_id: userId
    }).populate('services_entrepreneur_id');

    res.json(list);

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'ID do usuário inválido' });
    }
    res.status(500).json({ error: "Erro ao buscar agendamentos" });
  }
};

// PEGAR DATAS DISPONÍVEIS
export const getAvailableDates = async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;

    const service = await servicesEntreprenuer.findById(id);
    if (!service)
      return res.status(404).json({ error: "Serviço não encontrado" });

    const weekMap = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    };

    const allowedDays = service.dias.map(
      d => weekMap[d.id.toLowerCase()]
    );

    const availableDates = [];
    const lastDay = new Date(year, month, 0).getDate();

    for (let day = 1; day <= lastDay; day++) {
      const dateObj = new Date(year, month - 1, day);
      const weekday = dateObj.getDay();

      if (allowedDays.includes(weekday)) {
        availableDates.push(dateObj.toISOString().split("T")[0]);
      }
    }

    res.json({ availableDates });

  } catch (error) {
    if (error.name === 'CastError') {
        return res.status(400).json({ error: 'ID do serviço inválido' });
    }
    console.log(error);
    res.status(500).json({ error: "Erro ao gerar datas disponíveis" });
  }
};

// PEGAR HORÁRIOS DISPONÍVEIS
export const getAvailableHours = async (req, res) => {
  try {
    const { serviceId, date } = req.params;

    const service = await servicesEntreprenuer.findById(serviceId);
    if (!service)
      return res.status(404).json({ error: "Serviço não encontrado" });

    const reserved = await scheduling.find({
      services_entrepreneur_id: serviceId,
      date
    });

    const reservedTimes = reserved.map(r => r.time);

    const availableTimes = service.time
      .map(t => t.label)
      .filter(t => !reservedTimes.includes(t));

    res.json({ availableTimes });

  } catch (err) {
    if (err.name === 'CastError') {
        return res.status(400).json({ error: 'ID do serviço inválido' });
    }
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar horários" });
  }
};

// CANCELAR AGENDAMENTO
export const cancelScheduling = async (req, res) => {
  try {
    const { schedulingId } = req.params;

    const deletedScheduling = await scheduling.findByIdAndDelete(schedulingId);

    if (!deletedScheduling) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }

    res.json({ message: "Agendamento cancelado com sucesso" });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'ID do agendamento inválido' });
    }
    console.log(error);
    res.status(500).json({ error: "Erro ao cancelar agendamento" });
  }
};

export const getSchedulingByEntrepreneur = async (req, res) => {
  try {
    const { entrepreneurId } = req.params;

    // 1. Encontrar todos os serviços do empreendedor
    const services = await servicesEntreprenuer.find({ entrepreneur: entrepreneurId });

    if (!services || services.length === 0) {
      return res.json([]); // Retorna array vazio se não houver serviços
    }

    // 2. Extrair os IDs dos serviços
    const serviceIds = services.map(service => service._id);

    // 3. Buscar todos os agendamentos associados a esses serviços
    const schedules = await scheduling.find({
      services_entrepreneur_id: { $in: serviceIds }
    }).populate('user_id').populate('services_entrepreneur_id');

    res.json(schedules);

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'ID do empreendedor inválido' });
    }
    console.log(error);
    res.status(500).json({ error: "Erro ao buscar agendamentos da empresa" });
  }
};