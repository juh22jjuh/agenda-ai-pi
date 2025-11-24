import { Router } from "express"
import { GetUserById, Login, Register, requestPasswordReset, resetPassword, GetAllUsers, ToggleStatusUser, UpdateUserPhoto, UpdateUser } from "../controllers/user.controller.js"
import upload from "../config/multer.js";

export const router = Router()

router.post("/register", Register)
router.post("/login", Login)
router.get("/get/:id", GetUserById)
router.post('/requestpasswordreset', requestPasswordReset);
router.post('/resetpassword', resetPassword);
router.get('/all', GetAllUsers);
router.patch('/Status/:id', ToggleStatusUser);
router.put("/update-photo/:id", upload.single("profileImage"), UpdateUserPhoto);
router.put("/:id", UpdateUser);


