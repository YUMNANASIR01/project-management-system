import express from "express"
import { healthCheck } from "../controllers/healthCheck.controllers.js"
const router = express.Router()

// ------- api/v1/healthCheck 
router.route("/").get(healthCheck)
// -------------------------------
export default router