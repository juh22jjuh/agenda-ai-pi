
import { Router } from 'express';
// Adiciona a nova função ao import
import { Register, AllEntrepreneur, Delete, GetEntreprenuerById, SearchEntrepreneurByName, ToggleStatusEntrepreneur, UpdateEntreprenuer, getEntrepreneurByUserId } from '../controllers/entrepreneur.controller.js';
import upload from '../config/multer.js'; // Import the multer configuration
import { authorize } from "../utils/authorize.js"
export const routerEnt = Router();

// Rota para registro de empreendedor
routerEnt.post('/register/:userId', upload.single('companyImage'), Register);
routerEnt.delete("/delete/:id", Delete, authorize('entrepreneur'))
routerEnt.get("/entreprenuers", AllEntrepreneur)
routerEnt.get("/entrepreneur/:id", GetEntreprenuerById)
routerEnt.patch("/update/:id", UpdateEntreprenuer)
routerEnt.patch("/status/:id", ToggleStatusEntrepreneur)
routerEnt.get("/search", SearchEntrepreneurByName)
routerEnt.get('/user/:userId', getEntrepreneurByUserId);
