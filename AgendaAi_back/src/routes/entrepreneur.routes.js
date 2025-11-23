
import { Router } from 'express';
import { Register, Login } from '../controllers/entrepreneur.controller.js';
import upload from '../config/multer.js'; // Import the multer configuration

const router = Router();

// Use the 'upload' middleware on the registration route.
// 'upload.single("companyImage")' tells multer to expect a single file in a field named "companyImage".
// This name MUST match the name used in the frontend FormData.
router.post('/register/:userId', upload.single('companyImage'), Register);

router.post('/login', Login);

export default router;
