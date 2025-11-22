import { Router } from "express";
import {
  createScheduling,
  getSchedulingByService,
  getAvailableDates,
  getAvailableHours,
  getSchedulingByUser
} from "../controllers/scheduling.controller.js";
import upload from "../config/multer.js";

export const routerSche = Router();

routerSche.post("/", upload.single("inspirationImage"), createScheduling);
routerSche.get("/service/:serviceId", getSchedulingByService);
routerSche.get("/user/:userId", getSchedulingByUser);
routerSche.get("/dates/:id", getAvailableDates);
routerSche.get("/hours/:serviceId/:date", getAvailableHours);
