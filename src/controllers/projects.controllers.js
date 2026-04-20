import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js"
import { projectTable } from "../models/project.models.js";
import { projectMember } from "../models/projectMemeberRole.model.js";
import {ApiResponse} from "../utils/api-response.js"

// yah api project create karne ke liye hai , isme project ka name , description aur settings aayega client se ,
//  aur user ki details req.user me milegi kyunki verifyJWT middleware use kiya hai router me
export const createProject = asyncHandler (async (req, res) => {
    const { name, description = "", settings = {} } = req.body;

    // validation checks
    if(!name || name.trim() === "") {
       throw new ApiError("Project name is required", 400)
    }

    // create project into database
    const project = await projectTable.create({
        name : name.trim(),
        description : description.trim(),
        createdBy : req.user._id,
        settings : {
            visibility : settings.visibility || "private",
            defaultTaskStatus : settings.defaultTaskStatus || "todo",
            allowGuestAccess : settings.allowGuestAccess || false,
        },
        metadata:{
            totalTasks : 0,
            completedTasks : 0,
            totalMembers : 1,
            lastActivity : Date.now(),
        }
    })
    // create projectMember
    //  creator becomes admin of project
    await projectMember.create({
        user : req.user._id,
        project : project._id,
        role : "admin",
        permissions : {
        canCreateTasks : true,
        canEditTasks : true,
        canDeleteTasks : true,
        canManageMembers : true,
        canViewReports : true,

    },
    invitedBy : req.user._id,
    })
    // response to client
    res.status(201).json(new ApiResponse(201, project, "Project created successfully"));
}
)


// ---------------------------------------------------------
export const listMyProject = asyncHandler(async(req,res) => {
//     // finding all projects on behalf of user_id       
// projectMember table mai search karo
// Jahan user id current user ke equal ho
// Uska related project bhi laao (populate)
// Latest project pehle dikhao (sort)
// 👉 Is stage par user ke sab projects aa gaye (chahe archived ho ya nahi)
    const memberships = await projectMember
        .find({ user: req.user._id })
        .populate("project")
        .sort({ createdAt: -1 })
//filtering out archived projects and mapping to Client ko sirf 2 cheezein milengi project details and role
//  Sirf woh projects dikhao jo archived nahi hain.
//     // modified memberships array to get only 2 properties of project and role
    const projects = memberships
        .filter((m) => m.project && !m.project.isArchived)
        .map((m) => ({
            project: m.project,
            role: m.role,
        }))
// response back to client 
    return res.status(200).json(
        new ApiResponse(200, {projects}, "Projects fetched successfully")
    )
})
