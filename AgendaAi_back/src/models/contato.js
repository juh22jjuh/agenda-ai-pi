import mongoose from "mongoose";

const contatoSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    telefone: {
      type: String,
      required: true,
      maxLength: 20, // ✅ Aumentado de 12 para 20 para aceitar (XX) XXXXX-XXXX
    },
    assunto: {
      type: String,
      required: true,
    },
    mensagem: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Contato = mongoose.model("Contato", contatoSchema);