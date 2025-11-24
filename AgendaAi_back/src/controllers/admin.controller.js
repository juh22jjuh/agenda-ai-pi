import { Entrepreneur } from "../models/Entrepreneur.js";
import { User } from "../models/User.js";

export const listUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // não mostra a senha
    res.json(users || []);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar usuários" });
  }
};

export const listEntrepreneurs = async (req, res) => {
  try {
    const entrepreneurs = await Entrepreneur.find()
    res.json({ empresas: entrepreneurs || []})
  } catch(error) {
    res.status(500).json({ error: "Erro ao listar empresas"})
  } 
}

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Usuário excluído com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir usuário" });
  }
};

export const deactivateEntrepreneur = async (req, res) => {
    try {
        const { id } = req.params;
        const { deactivationDays } = req.body;

        if (!deactivationDays || deactivationDays <= 0) {
            return res.status(400).json({ error: "Número de dias de desativação inválido" });
        }

        const deactivatedUntil = new Date();
        deactivatedUntil.setDate(deactivatedUntil.getDate() + deactivationDays);

        await Entrepreneur.findByIdAndUpdate(id, {
            isActive: false,
            deactivatedUntil,
        });

        res.json({ message: "Empresa desativado com sucesso" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao desativar empresa" });
    }
};

export const deactivateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { deactivationDays } = req.body;

        if (!deactivationDays || deactivationDays <= 0) {
            return res.status(400).json({ error: "Número de dias de desativação inválido" });
        }

        const deactivatedUntil = new Date();
        deactivatedUntil.setDate(deactivatedUntil.getDate() + deactivationDays);

        await User.findByIdAndUpdate(id, {
            isActive: false,
            deactivatedUntil,
        });

        res.json({ message: "Usuário desativado com sucesso" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao desativar usuário" });
    }
};

export const activateUser = async (req, res) => {
    try {
        const { id } = req.params;

        await User.findByIdAndUpdate(id, {
            isActive: true,
            deactivatedUntil: null,
        });

        res.json({ message: "Usuário ativado com sucesso" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao ativar usuário" });
    }
};

export const activateEntreprenuer = async (req, res) => {
    try {
        const { id } = req.params;

        await Entrepreneur.findByIdAndUpdate(id, {
            isActive: true,
            deactivatedUntil: null,
        });

        res.json({ message: "Empresa ativada com sucesso" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao ativar empresa" });
    }
};