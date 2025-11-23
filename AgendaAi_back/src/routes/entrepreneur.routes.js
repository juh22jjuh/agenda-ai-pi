
import { Router } from 'express';
import { Register, Login } from '../controllers/entrepreneur.controller.js';
import upload from '../config/multer.js'; // Import the multer configuration

export const routerEnt = Router();

// Use the 'upload' middleware on the registration route.
// 'upload.single("companyImage")' tells multer to expect a single file in a field named "companyImage".
// This name MUST match the name used in the frontend FormData.
routerEnt.post('/register/:userId', upload.single('companyImage'), Register);

routerEnt.post('/login', Login);

