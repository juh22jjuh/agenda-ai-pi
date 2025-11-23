import { scheduling } from "../models/Scheduling.js";
import { servicesEntreprenuer } from "../models/services_entreprenuer.js";
import { User } from "../models/User.js";

// Função para normalizar o caminho do arquivo
const normalizePath = (path) => {
  if (!path) return null;
  return path.replace(/\\/g, '/');
};

// CRIAR AGENDAMENTO

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

    const user = await User.findById(user_id);
    if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
    }
    if (!user.isActive) {
        return res.status(403).json({ error: "Sua conta está temporariamente desativada. Você não pode criar novos agendamentos." });
    }

    const inspirationImage = req.file ? normalizePath(req.file.path) : null;

    const service = await servicesEntreprenuer.findById(services_entrepreneur_id);
    if (!service)
      return res.status(404).json({ error: "Serviço não encontrado" });

    // VALIDAÇÃO 1: VERIFICAR SE O DIA DA SEMANA É VÁLIDO
    const weekMap = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    };
    const allowedDays = service.dias.map(d => weekMap[d.id.toLowerCase()]);
    const requestedDate = new Date(`${date}T00:00:00`); // Usar T00:00:00 para evitar problemas de fuso horário
    const requestedWeekday = requestedDate.getDay();

    if (!allowedDays.includes(requestedWeekday)) {
      return res.status(400).json({ error: "O serviço não está disponível neste dia da semana" });
    }

    // VALIDAÇÃO 2: VERIFICAR SE O HORÁRIO É VÁLIDO
    const allowedTimes = service.time.map(t => t.label);
    if (!allowedTimes.includes(time)) {
      return res.status(400).json({ error: "O serviço não está disponível neste horário" });
    }

    // VALIDAÇÃO 3: VERIFICAR CONFLITOS DE AGENDAMENTO
    const conflict = await scheduling.findOne({
      services_entrepreneur_id,
      date,
      time
    });

    if (conflict)
      return res.status(400).json({ error: "Este horário já está ocupado" });

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

    res.status(201).json(newScheduling);

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'ID do serviço inválido' });
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
