import { Router } from "express";
import { listUsers, deleteUser, deactivateUser, activateUser } from "../controllers/admin.controller.js";
import { authorize } from "../utils/authorize.js";
import auth from "../utils/auth.js";

export const routerAdmin = Router();

routerAdmin.get("/users", auth, authorize(["admin"])
, listUsers);
routerAdmin.delete("/users/:id", auth, authorize(["admin"])
, deleteUser);
routerAdmin.put("/users/:id/deactivate", auth, authorize(["admin"])
, deactivateUser);
routerAdmin.put("/users/:id/activate", auth, authorize(["admin"])
, activateUser);
