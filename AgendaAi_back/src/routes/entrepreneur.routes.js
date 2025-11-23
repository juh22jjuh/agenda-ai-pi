
import { Router } from 'express';
// Adiciona a nova função ao import
import { Register, Login, getEntrepreneurByUserId } from '../controllers/entrepreneur.controller.js';
import upload from '../config/multer.js'; // Import the multer configuration

export const routerEnt = Router();

// Rota para registro de empreendedor
routerEnt.post('/register/:userId', upload.single('companyImage'), Register);

// Rota para login
routerEnt.post('/login', Login);

// --- NOVA ROTA ADICIONADA ---
// Rota para buscar dados do empreendedor pelo ID do usuário
routerEnt.get('/user/:userId', getEntrepreneurByUserId);
