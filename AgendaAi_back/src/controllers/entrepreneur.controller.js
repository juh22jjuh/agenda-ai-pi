
import {User} from '../models/User.js';
import {Entrepreneur} from '../models/Entrepreneur.js'; // Importe o modelo Entrepreneur

// Função para normalizar o caminho do arquivo
const normalizePath = (path) => {
  if (!path) return null;
  return path.replace(/\\/g, '/');
};

export const Register = async (req, res) => {
  const { userId } = req.params;
  const { name, cpf, telefone, cep, rua, numero, comple, bairro, cidade, estado } = req.body;
  console.log('REQ BODY', req.body)
  // 1. Validação de entrada aprimorada para incluir os campos requeridos
  if (!name || !cpf || !telefone || !cep || !rua || !numero || !bairro || !cidade || !estado) {
    return res.status(400).json({ message: 'Todos os campos obrigatórios, incluindo o ID do usuário, devem ser fornecidos.' });
  }

  const format_cpf = cpf.replace(/\D/g, '');
  const format_telefone = telefone.replace(/\D/g, '');
  const format_cep = cep.replace(/\D/g, '');

  try {

    const newEntrepreneur = new Entrepreneur({
      name,
      cpf: format_cpf,
      telefone: format_telefone,
      cep: format_cep,
      rua,
      numero,
      comple, // Mapeado diretamente
      bairro,
      cidade,
      estado,
      user: userId,
      services_entreprenuer: [] // Inicializa como um array vazio
    });

    const savedEntrepreneur = await newEntrepreneur.save();

    // 3. Encontrar o usuário e vincular o ID do empreendedor
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          entrepreneur: savedEntrepreneur._id, 
          isEntrepreneur: true,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      await Entrepreneur.findByIdAndDelete(savedEntrepreneur._id);
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.status(200).json({ message: 'Empreendedor registrado com sucesso!', user: updatedUser });

  } catch (error) { 
    console.error('Erro no registro do empreendedor:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Erro de validação', details: error.message });
    }
    res.status(500).json({ message: 'Erro interno do servidor.', error: error.message });
  }
};

// --- FUNÇÃO DE BUSCA (permanece a mesma) ---
export const getEntrepreneurByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const entrepreneur = await Entrepreneur.findOne({ user: userId });

    if (!entrepreneur) {
      return res.status(404).json({ exists: false, message: 'Nenhum perfil de empreendedor encontrado para este usuário.' });
    }

    res.status(200).json(entrepreneur);

  } catch (error) {
    console.error("Erro ao buscar dados do empreendedor:", error);
    res.status(500).json({ message: 'Erro interno do servidor.', error: error.message });
  }
};

export const GetEntreprenuerById = async (req, res) => {
  try {
    const { id } = req.params
    const entrepreneur = await Entrepreneur.find({ _id: id}).populate('services_entreprenuer')
    if (!entrepreneur) return res.status(400).json({ message: 'Empresa não encontrada' })
    res.status(200).json(entrepreneur)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const Delete = async (req, res) => {
  const { id } = req.params
  try {
    const empresa = await Entrepreneur.findById(id)

    if (!empresa) {
      return res.status(404).json({ message: "Empresa não encontrada" })
    }

    await User.findByIdAndUpdate(empresa.user, {
      $unset: { entrepreneur: "" }
    })

    await Entrepreneur.deleteOne({ _id: id })

    res.status(200).json({
      message: 'Empresa excluída com sucesso'
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const AllEntrepreneur = async (req, res) => {
  try {
    const entreprenuers = await Entrepreneur.find()

    res.status(200).json({
      empresas: entreprenuers
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({error: 'Internal server error'})
  }
}

export const UpdateEntreprenuer = async (req, res) => {
  try {
    const { id } = req.params;

    const updateFields = {};
    const allowedFields = ['name', 'telefone', 'cep', 'rua', 'numero', 'comple', 'bairro', 'cidade', 'estado'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        updateFields[field] = req.body[field];
      }
    });

    // Se tiver imagem (não é seu caso atual)
    if (req.file) {
      updateFields.image = normalizePath(req.file.path);
    }

    // Normaliza telefone e cep
    if (updateFields.telefone) {
      updateFields.telefone = String(updateFields.telefone).replace(/\D/g, '');
    }

    if (updateFields.cep) {
      updateFields.cep = String(updateFields.cep).replace(/\D/g, '');
    }

    // Converte qualquer campo numérico para string
    if (updateFields.numero) {
      updateFields.numero = String(updateFields.numero);
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar fornecido.' });
    }

    const updatedEntrepreneur = await Entrepreneur.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedEntrepreneur) {
      return res.status(404).json({ message: 'Empreendedor não encontrado.' });
    }

    res.status(200).json({
      message: 'Empresa atualizada com sucesso!',
      entrepreneur: updatedEntrepreneur
    });

  } catch (error) {
    console.error('Erro ao atualizar empreendedor:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Erro de validação', details: error.message });
    }
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};


export const ToggleStatusEntrepreneur = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const entrepreneur = await Entrepreneur.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!entrepreneur) {
      return res.status(404).json({ message: "Empreendedor não encontrado" });
    }

    res.status(200).json({
      message: `Empreendedor ${isActive ? "ativado" : "inativado"} com sucesso!`,
      entrepreneur,
    });
  } catch (error) {
    console.error("Erro ao alterar status:", error);
    res.status(500).json({ message: "Erro ao alterar status do empreendedor." });
  }
};

export const SearchEntrepreneurByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Informe o nome da empresa para buscar." });
    }

    // Busca por nome parcial, sem diferenciar maiúsculas/minúsculas
    const results = await Entrepreneur.find({
      name: { $regex: name, $options: "i" },
    });

    if (results.length === 0) {
      return res.status(404).json({ message: "Nenhuma empresa encontrada." });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    res.status(500).json({ message: "Erro interno ao buscar empresa." });
  }
};