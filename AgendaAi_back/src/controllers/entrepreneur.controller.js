import {User} from '../models/User.js';
import {Entrepreneur} from '../models/Entrepreneur.js'; // Importe o modelo Entrepreneur

// Função para normalizar o caminho do arquivo (troca "\" por "/")
const normalizePath = (path) => {
  if (!path) return null;
  return path.replace(/\\/g, '/');
};

export const Register = async (req, res) => {
  // Recebe o ID do usuário via rota e dados do formulário via body
  const { userId } = req.params;
  const { name, cpf, telefone, cep, rua, numero, comple, bairro, cidade, estado } = req.body;
  console.log('REQ BODY', req.body)

  // Valida se todos os campos essenciais foram preenchidos
  if (!name || !cpf || !telefone || !cep || !rua || !numero || !bairro || !cidade || !estado) {
    return res.status(400).json({ message: 'Todos os campos obrigatórios, incluindo o ID do usuário, devem ser fornecidos.' });
  }

  // Remove caracteres não numéricos do CPF, telefone e CEP
  const format_cpf = cpf.replace(/\D/g, '');
  const format_telefone = telefone.replace(/\D/g, '');
  const format_cep = cep.replace(/\D/g, '');

  try {

    // Cria novo empreendedor associado ao usuário
    const newEntrepreneur = new Entrepreneur({
      name,
      cpf: format_cpf,
      telefone: format_telefone,
      cep: format_cep,
      rua,
      numero,
      comple, 
      bairro,
      cidade,
      estado,
      user: userId,
      services_entreprenuer: [] // Inicializa a lista de serviços vazia
    });

    // Salva o empreendedor
    const savedEntrepreneur = await newEntrepreneur.save();

    // Atualiza o usuário vinculando o ID do empreendedor criado
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

    // Caso o usuário não exista, desfaz o cadastro do empreendedor
    if (!updatedUser) {
      await Entrepreneur.findByIdAndDelete(savedEntrepreneur._id);
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Retorna sucesso
    res.status(200).json({ message: 'Empreendedor registrado com sucesso!', user: updatedUser });

  } catch (error) { 
    console.error('Erro no registro do empreendedor:', error);

    // Tratamento de erros de validação
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Erro de validação', details: error.message });
    }

    // Erro do servidor
    res.status(500).json({ message: 'Erro interno do servidor.', error: error.message });
  }
};

// --- FUNÇÃO DE BUSCA (permanece a mesma) ---
export const getEntrepreneurByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    // Busca o empreendedor vinculado ao usuário
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
    // Busca empresa por ID e popula a lista de serviços
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
    // Busca empresa pelo ID antes de excluir
    const empresa = await Entrepreneur.findById(id)

    if (!empresa) {
      return res.status(404).json({ message: "Empresa não encontrada" })
    }

    // Remove o vínculo do empreendedor dentro do usuário
    await User.findByIdAndUpdate(empresa.user, {
      $unset: { entrepreneur: "" }
    })

    // Remove a empresa do banco de dados
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
    // Retorna todas as empresas cadastradas
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

    // Cria objeto somente com os campos enviados no body
    const updateFields = {};
    const allowedFields = ['name', 'telefone', 'cep', 'rua', 'numero', 'comple', 'bairro', 'cidade', 'estado'];
    
    // Preenche apenas campos atualizáveis
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        updateFields[field] = req.body[field];
      }
    });

    // Caso tenha imagem (upload)
    if (req.file) {
      updateFields.image = normalizePath(req.file.path);
    }

    // Normaliza telefone e CEP
    if (updateFields.telefone) {
      updateFields.telefone = String(updateFields.telefone).replace(/\D/g, '');
    }

    if (updateFields.cep) {
      updateFields.cep = String(updateFields.cep).replace(/\D/g, '');
    }

    // Converte número para string
    if (updateFields.numero) {
      updateFields.numero = String(updateFields.numero);
    }

    // Impede atualização vazia
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar fornecido.' });
    }

    // Atualiza no banco
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

    // Ativa/inativa empresa
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

    // Valida busca
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Informe o nome da empresa para buscar." });
    }

    // Busca parcial por nome (case-insensitive)
    const results = await Entrepreneur.find({
      name: { $regex: name, $options: "i" },
    });

    // Caso não encontre
    if (results.length === 0) {
      return res.status(404).json({ message: "Nenhuma empresa encontrada." });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    res.status(500).json({ message: "Erro interno ao buscar empresa." });
  }
};
