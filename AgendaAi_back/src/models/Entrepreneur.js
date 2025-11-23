
import mongoose from 'mongoose';

const entrepreneurSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    cpf: {
        type: String,
        required: true,
    },
    telefone: {
        type: Number,
        required: true,
    },
    cep: {
        type: Number,
        required: true,
        maxLength: 8
    },
    rua: {
        type: String,
        required: true,
    },
    numero: {
        type: String,
        required: true,
    },
    comple: {
        type: String,
        required: false, // Complemento não é obrigatório
    },
    bairro: {
        type: String,
        required: true,
    },
    cidade: {
        type: String,
        required: true,
    },
    estado: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false, // Imagem não é obrigatória
    },
    // --- CAMPO ADICIONADO ---
    services_entreprenuer: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "servicesEntreprenuer"
    }],
    // ----------------------
    created_at: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['pending', 'authorized', 'denegad'],
        default: 'pending',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

export const Entrepreneur = mongoose.model('Entrepreneur', entrepreneurSchema);

