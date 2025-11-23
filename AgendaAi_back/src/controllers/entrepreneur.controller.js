
import { User } from '../models/User.js';

export const Register = async (req, res) => {
  const { userId } = req.params;
  // Thanks to multer, req.body now contains the text fields
  const { name, cpf, telefone, cep, rua, numero, complemento, bairro, cidade, estado } = req.body;

  // Check if CPF is provided before trying to use .replace
  if (!cpf) {
    return res.status(400).json({ message: 'O CPF é obrigatório.' });
  }
  
  const format_cpf = cpf.replace(/\D/g, ''); // Now this will work

  try {
    // The image information is in req.file
    const companyImagePath = req.file ? req.file.path : null;

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
            companyImage: companyImagePath // Save the image path
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
    // ... your login logic remains the same ...
};
