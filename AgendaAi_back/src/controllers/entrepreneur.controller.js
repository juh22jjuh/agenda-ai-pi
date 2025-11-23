
import {User} from '../models/User.js';

export const Register = async (req, res) => {
  const { userId } = req.params;
  const { name, cpf, telefone, cep, rua, numero, complemento, bairro, cidade, estado } = req.body;

  if (!cpf) {
    return res.status(400).json({ message: 'O CPF é obrigatório.' });
  }
  
  const format_cpf = cpf.replace(/\D/g, '');

  try {
    let companyImageBase64 = null;

    // Se um arquivo foi enviado, converte para Base64
    if (req.file) {
      // Formato: data:[<mime type>];base64,[<dados>]
      companyImageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          entrepreneur: {
            name,
            cpf: format_cpf,
            telefone,
            cep,
            address: {
              rua,
              numero,
              complemento,
              bairro,
              cidade,
              estado,
            },
            // Salva a string Base64 no banco
            companyImage: companyImageBase64 
          },
          isEntrepreneur: true,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.status(200).json({ message: 'Empreendedor registrado com sucesso!', user: updatedUser });

  } catch (error) {
    console.error('Erro no registro do empreendedor:', error);
    res.status(500).json({ message: 'Erro interno do servidor.', error: error.message });
  }
};

export const Login = async (req, res) => {
    // ... a sua lógica de login permanece a mesma ...
};
