import { Router } from "express";
import {
  createScheduling,
  getSchedulingByService,
  getAvailableDates,
  getAvailableHours
} from "../controllers/scheduling.controller.js";

export const routerSche = Router();

routerSche.post("/", createScheduling);
routerSche.get("/service/:serviceId", getSchedulingByService);
routerSche.get("/dates/:id", getAvailableDates);
routerSche.get("/hours/:serviceId/:date", getAvailableHours);
