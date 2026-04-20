import { projectMember } from "../models/projectMemeberRole.model.js"
import { ApiError } from "../utils/api-error.js"

// part of the project as the part of admin yah member
export const requireProjectMember = async (req, res, next) => {
    // get the projectId from req.params
    const {projectId} =req.params

    // finding the membership of the user in the project from projectMember collection
    const membership = await projectMember.findOne({
        user : req.user._id,
        project : projectId
    })
//  if the user is not a member of the project then throw error
    if (!membership){
        return res.status(403).json(new ApiError(403, "You are not a member of this project"))
    }

    // attach the membership to the req object for future use
    req.membership = membership
    next() //proceed to the next middleware api function
}



// --------------------------------------------------------------
// you are a admin
export const requireProjectAdmin = (async (req, res, next) => {
    // Check if the user is a member of the project (membership should be attached by requireProjectMember middleware)
    if (!req.membership) {
        throw new ApiError(403, "You are not a member of this project")
    }
    
    // Check if the user is an admin of the project
    if (req.membership.role !== "admin") {
        throw new ApiError(403, "You are not an admin of this project")
    }
    
    next(); //proceed to the next middleware api function
}
)

