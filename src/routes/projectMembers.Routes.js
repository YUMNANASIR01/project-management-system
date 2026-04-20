import express from "express"
import { listProjectMembers, addProjectMember, updateProjectMember, removeProjectMember} from "../controllers/projectMembers.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { requireProjectMember,requireProjectAdmin } from "../middlewares/project.middleware.js"

const router = express.Router()
// ------------------- middlewares---------------------
router.use(verifyJWT) // this will verify the token for all routes in this router (login)
// router.use(requireProjectMember) // this will check if the user is a member of the project for all routes in this router

// ---------------- Api routes -----------------------
router.route("/:projectId/members").all(requireProjectMember).get(listProjectMembers) //list all members of the project (access token check)
    // requireProjectAdmin -> membership check (is user is a member of the project or not)
router.route("/:projectId/members").all(requireProjectMember).post(requireProjectAdmin, addProjectMember) //add a member to the project 

router.route("/:projectId/members/:userId").all(requireProjectMember).put(requireProjectAdmin, updateProjectMember) // update the role and permission of the project member (admin only)
router.route("/:projectId/members/:userId").all(requireProjectMember).delete(requireProjectAdmin,removeProjectMember) // remove a member from the project (admin only)

export default router 