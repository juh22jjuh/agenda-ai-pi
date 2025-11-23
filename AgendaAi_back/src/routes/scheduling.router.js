
import { Router } from "express";
import {
  createScheduling,
  getSchedulingByService,
  getAvailableDates,
  getAvailableHours,
  getSchedulingByUser,
  cancelScheduling,
  getSchedulingByEntrepreneur // Importando a nova função
} from "../controllers/scheduling.controller.js";
import upload from "../config/multer.js";

export const routerSche = Router();

routerSche.post("/", upload.single("inspirationImage"), createScheduling);
routerSche.get("/service/:serviceId", getSchedulingByService);
routerSche.get("/user/:userId", getSchedulingByUser);

// NOVA ROTA
routerSche.get("/entrepreneur/:entrepreneurId", getSchedulingByEntrepreneur);

routerSche.get("/dates/:id", getAvailableDates);
routerSche.get("/hours/:serviceId/:date", getAvailableHours);
routerSche.delete("/cancel/:schedulingId", cancelScheduling);
