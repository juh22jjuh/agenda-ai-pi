import express from 'express';
import {router} from "./routes/user.route.js";
import {routerEnt} from "./routes/entrepreneur.routes.js";
import dotenv from 'dotenv/config.js'
import { routerCont } from './routes/contato.router.js';
//import { routerAdmin } from './routes/admin.route.js';
import { routerServicesEntreprenuer } from './routes/services_entreprenuer.js';
import { routerSche } from './routes/scheduling.router.js';
import cors from 'cors';

export const app = express();

// Allow requests from localhost:4200
const corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());
app.use("/user", router);
app.use("/entrepreneur", routerEnt);
app.use("/scheduling", routerSche);
app.use("/contato", routerCont);
app.use("/servicesEntreprenuer", routerServicesEntreprenuer);
app.use("/api/entrepreneur", routerEnt);
app.use("/api/user", router);
