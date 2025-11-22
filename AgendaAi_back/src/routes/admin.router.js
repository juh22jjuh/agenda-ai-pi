import { Router } from "express";
import { listUsers, deleteUser, deactivateUser, activateUser } from "../controllers/admin.controller.js";
import { authorize } from "../utils/authorize.js";
import { authMiddleware } from "../utils/authMiddleware.js";

export const routerAdmin = Router();

routerAdmin.get("/admin/users", authMiddleware, authorize(["admin"])
, listUsers);
routerAdmin.delete("/admin/users/:id", authMiddleware, authorize(["admin"])
, deleteUser);
routerAdmin.put("/admin/users/:id/deactivate", authMiddleware, authorize(["admin"])
, deactivateUser);
routerAdmin.put("/admin/users/:id/activate", authMiddleware, authorize(["admin"])
, activateUser);
