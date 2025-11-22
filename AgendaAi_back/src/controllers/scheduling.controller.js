import { scheduling } from "../models/Scheduling.js";
import { servicesEntreprenuer } from "../models/services_entreprenuer.js";

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

    const service = await servicesEntreprenuer.findById(services_entrepreneur_id);
    if (!service)
      return res.status(404).json({ error: "Serviço não encontrado" });

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
      time
    });

    res.status(201).json(newScheduling);

  } catch (error) {
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

    const allowedDays = service.selectedDays.map(
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

    const availableTimes = service.selectedTime
      .map(t => t.label)
      .filter(t => !reservedTimes.includes(t));

    res.json({ availableTimes });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar horários" });
  }
};
