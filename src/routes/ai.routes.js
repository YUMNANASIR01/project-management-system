// src\routes\ai.routes.js
import express from "express"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { requireProjectMember } from "../middlewares/project.middleware.js"
import { suggestTasks , analyzeRisks, predictTimeline,  balanceWorkload, smartAssignTask, prioritizeTask, summarizeMeeting } from "../controllers/ai.controllers.js"

const router = express.Router()

router.use(verifyJWT)
// localhost:8000/api/v1/ai/suggest-tasks/:projectId
router.route("/suggest-tasks/:projectId").all(requireProjectMember).post(suggestTasks)
router.route("/analyze-risks/:projectId").all(requireProjectMember).get(analyzeRisks)
router.route("/predict-timeline/:projectId").all(requireProjectMember).get(predictTimeline)
router.route("/balance-workload/:projectId").all(requireProjectMember).get(balanceWorkload)

// localhost:8000/api/v1/ai/xxxx/:taskId
// no need of memberships just need to be logged in to assigned tasks smartly 
router.route("/assign-task/:taskId").post(smartAssignTask)
router.route("/prioritize/:taskId").post(prioritizeTask)

// eneral AI route that are not specific project
router.route("/summarize-meeting").post(summarizeMeeting)

export default router