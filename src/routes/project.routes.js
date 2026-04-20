import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createProject, listMyProject } from "../controllers/projects.controllers.js";

const router = express.Router();
// middleware  (asscess token ky zariya user ko dhundata hai)
router.use(verifyJWT) // this will verify JWT for all routes in this router

// project ko create karny ki api hai 
// http:/localhost:8000/api/v1/project   or router.route("/").
router.route("/").post(createProject).get(listMyProject)
// --------------------------------------
export default router
