
import {User} from '../models/User.js';
import {Entrepreneur} from '../models/Entrepreneur.js'; // Importe o modelo Entrepreneur

export const Register = async (req, res) => {
  const { userId } = req.params;
  const { name, cpf, telefone, cep, rua, numero, complemento, bairro, cidade, estado } = req.body;

  // 1. Validação básica de entrada
  if (!cpf || !userId) {
    return res.status(400).json({ message: 'CPF e ID do usuário são obrigatórios.' });
  }

  const format_cpf = cpf.replace(/\D/g, '');
  const format_telefone = telefone.replace(/\D/g, '');
  const format_cep = cep.replace(/\D/g, '');

  try {
    // 2. Criar e salvar o novo documento Entrepreneur
    let companyImageBase64 = null;
    if (req.file) {
      companyImageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const newEntrepreneur = new Entrepreneur({
      name,
      cpf: format_cpf,
      telefone: format_telefone,
      cep: format_cep,
      rua,
      numero,
      comple: complemento, // Mapeia 'complemento' para 'comple'
      bairro,
      cidade,
      estado,
      image: companyImageBase64, // Mapeia 'companyImage' para 'image'
      user: userId
    });

    const savedEntrepreneur = await newEntrepreneur.save();

    // 3. Encontrar o usuário e vincular o ID do empreendedor
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          // Agora salvamos a referência (ObjectId), não o objeto inteiro
          entrepreneur: savedEntrepreneur._id, 
          isEntrepreneur: true,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      // Se o usuário não for encontrado, seria bom deletar o empreendedor recém-criado (lógica de rollback)
      await Entrepreneur.findByIdAndDelete(savedEntrepreneur._id);
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.status(200).json({ message: 'Empreendedor registrado com sucesso!', user: updatedUser });

  } catch (error) { 
    console.error('Erro no registro do empreendedor:', error);
    // Diferencia erros de validação (do Mongoose) de outros erros
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Erro de validação', details: error.message });
    }
    res.status(500).json({ message: 'Erro interno do servidor.', error: error.message });
  }
};

export const Login = async (req, res) => {
    // ... sua lógica de login permanece a mesma ...
};

// --- NOVA FUNÇÃO ADICIONADA ---
export const getEntrepreneurByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    // Procura na coleção Entrepreneur por um documento cujo campo 'user' corresponda ao userId
    const entrepreneur = await Entrepreneur.findOne({ user: userId });

    if (!entrepreneur) {
      return res.status(404).json({ message: 'Nenhum perfil de empreendedor encontrado para este usuário.' });
    }

    res.status(200).json(entrepreneur);

  } catch (error) {
    console.error("Erro ao buscar dados do empreendedor:", error);
    res.status(500).json({ message: 'Erro interno do servidor.', error: error.message });
  }
};
