import express from "express"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { requireProjectAdmin, requireProjectMember } from "../middlewares/project.middleware.js"
import { createTask,  listTask, getTaskDetails, updateTask, deleteTask } from "../controllers/tasks.controllers.js"
import { uploadTaskAttachments} from "../middlewares/upload.middleware.js"

const router = express.Router()
// checking your login status
router.use(verifyJWT) // this will verify the token for all routes in the router (login)

//                            Authentication check     Authorization check
                                            //         s3 mai dalna task ko
router.route("/:projectId").all(requireProjectMember, uploadTaskAttachments.array("attachments", 10) , requireProjectAdmin).post(createTask)
// list task 
router.route("/:projectId").all(requireProjectMember).get(listTask)
// single task ko dekhny wale api
router.route("/:projectId/:taskId").all(requireProjectMember).get(getTaskDetails)

// single task ko update wale api
router.route("/:projectId/:taskId").all(requireProjectMember, requireProjectAdmin).put(updateTask)

//  single task ko delete wale api (only admin can delete the task`)
router.route("/:projectId/:taskId").all(requireProjectMember, requireProjectAdmin).delete(deleteTask)
// ------------------------------------------------------------
export default router


