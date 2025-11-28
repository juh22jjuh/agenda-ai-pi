import { Entrepreneur } from "../models/Entrepreneur.js";
import { servicesEntreprenuer } from "../models/services_entreprenuer.js";

// Função responsável por registrar um novo serviço vinculado a um empreendedor específico.
// Ela recebe os dados do serviço pelo body da requisição e o ID do empreendedor pelos parâmetros.
// Em seguida, cria o serviço, salva no banco e atualiza o empreendedor adicionando esse serviço na lista dele.
export const Register = async (req, res) => {
  const { nome, categoria, descricao, duracao, time, dias } =
    req.body;

  const { id } = req.params; 
  console.log('RECEBENDO ID', id);
  
  try {
    // Criação do serviço com as informações recebidas
    const createServiceEntreprenuer = await servicesEntreprenuer.create({
      nome: nome,
      categoria: categoria,
      descricao: descricao,
      duracao: duracao,
      time: time,
      dias: dias,
      entrepreneur: id
    });
    
    await createServiceEntreprenuer.save();
    
    // Vincula o serviço criado ao empreendedor atualizando seu array de serviços
    await Entrepreneur.findByIdAndUpdate(id, { $push: { services_entreprenuer: createServiceEntreprenuer._id } }, {new: true})

    // Retorna o serviço recém-criado
    res.status(201).json(createServiceEntreprenuer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Função que busca todos os serviços cadastrados pertencentes a um empreendedor específico.
// O ID do empreendedor é recebido como parâmetro na rota.
export const GetAllServicesEntreprenuer = async (req, res) => {
  const { id } = req.params; // id da empresa
  try {
    // Busca filtrando apenas serviços vinculados ao empreendedor informado
    const services = await servicesEntreprenuer.find().where('entrepreneur').equals(id);
    res.status(200).json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Função responsável por atualizar um serviço já cadastrado.
// O ID do serviço é passado por parâmetro e o corpo da requisição contém os novos dados.
export const UpdateServiceEntreprenuer = async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Atualiza e retorna os novos dados do serviço
    const updatedService = await servicesEntreprenuer.findByIdAndUpdate(
      serviceId,
      req.body,
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Serviço não encontrado" });
    }

    res.json(updatedService);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar serviço" });
  }
};

// Função que exclui um serviço baseado no ID recebido pela rota.
// Caso o ID não exista no banco, retorna erro; caso contrário confirma a exclusão.
export const DeleteServiceEntreprenuer = async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Remove o serviço pelo ID
    const deleted = await servicesEntreprenuer.findByIdAndDelete(serviceId);

    if (!deleted) {
      return res.status(404).json({ message: "Serviço não encontrado" });
    }

    res.status(200).json({ message: "Serviço excluído com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir serviço:", error);
    res.status(500).json({ message: "Erro interno ao excluir serviço" });
  }
};
