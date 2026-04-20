import { asyncHandler } from "../utils/async-handler.js"
import { ApiError } from "../utils/api-error.js"
import { projectMember } from "../models/projectMemeberRole.model.js"
import { ApiResponse } from "../utils/api-response.js"
import { projectTable } from "../models/project.models.js"
import { userTable } from "../models/user.model.js"

export const listProjectMembers = asyncHandler(async(req,res) => {
//  get the projectId from req.params
const { projectId } = req.params
// throw error if projectId is not present
if(!projectId){
    return res.status(400).json(new ApiError(400, "Project ID is required"))
}
// find all project members for the given project id
// find all members of the project from projectMember collection
const members = await projectMember.find({project : projectId})
.populate("user", "name email")
.sort({createdAt : -1})

// response to client
res.status(200).json(new ApiResponse(200, members,"Project members fetched successfully"))

})


// -----------------------------------------------------------
export const addProjectMember = asyncHandler(async(req,res) => {
    // get the project Id from the request params
    const {projectId} = req.params
    // throw error if projectId is not present
    if (!projectId){
        return res.status(400).json(new ApiError(400, "Project ID is required"))
    }
    // get the email, role and permission from the request body
    const {email, role= "member", permission} = req.body

    // verify the user to be added exists
    const project = await projectTable.findById(projectId)
    if (!project){
        return res.status(404).json(new ApiError(404, "Project not found"))
    }
    // find user by email
    const user = await userTable.findOne({email : email.toLowerCase().trim()})
    if (!user){
        return res.status(404).json(new ApiError(404, "User not found, please ask the user to register first"))
    }

    // check if the user already register
    const existingMembership = await projectMember.findOne({
        project : projectId,
        user : user._id
    })
    if (existingMembership){
        return res.status(400).json(new ApiError(400, "User is already a member of this project, you can not add same user twice."))
    }

    // create projectMember
    const newMember = await projectMember.create({
        project : projectId,
        user : user._id,
        role ,
        invitedBy : req.user._id,
        permissions : {
            canCreateTasks : permission?.canCreateTasks ?? true,
            canEditTasks : permission?.canEditTasks ?? true,
            canDeleteTasks : permission?.canDeleteTasks ?? false,
            canManageMembers : permission?.canManageMembers ?? false,
            canViewReports : permission?.canViewReports ?? true,
        }

    })
        // update project metadata total members
        await projectTable.findByIdAndUpdate(
            projectId,{
            $inc : {"metadata.totalMembers": 1},
            $set : {"metadata.lastActivity": new Date()}  
            }
        )
        // populate the user field in the projectMember document
        const populatedMember = await projectMember.findById(newMember._id).populate("user", "name email")
        // response to client
        res.status(201).json(new ApiResponse(201, populatedMember ,"Project Member added successfully"
    ))
})




// ----------------------------------------------
export const updateProjectMember = asyncHandler(async(req,res) =>{
    //  verify the project exists
     const {projectId , userId} = req.params
    // throw error if projectId is not present
    if (!projectId){
        return res.status(400).json(new ApiError(400, "Project ID is required"))
    }

    // get the role and premission from the request body
    const {role, permission} = req.body

    // verify the project exists
    const project = await projectTable.findById(projectId)
    if (!project){
        return res.status(404).json(new ApiError(404, "Project not found"))
    }
    //  find the project member to be updated
    const member = await projectMember.findOne({
        project : projectId,
        user : userId
    })
    if (!member){
        return res.status(404).json(new ApiError(404, "this user is not a member of the project"))
    }
    //  only allow admin to update
    if(req.membership.role !== "admin"){
        return res.status(403).json(new ApiError(403, "you are not admin of this project, you can not update member role or permissions of another member"))
    }


     // prevent removing last admin (basic safety)
    if (member.role === "admin" && project.metadata.totalMembers === 1){
        return res.status(400)
        .json(new ApiError(400, "This Project must have at least one admin, you can not remove ths last admin"))

    }
    // // prevent removing last admin (basic safety)
    // if (role === "admin" && member.role !== "admin" && project.metadata.totalMembers === 1){
    //     return res.status(400)
    //     .json(new ApiError(400, "This Project must have at least one admin, you can not change role of the admin"))

    // }
    //  update role and permissions
    member.role = role ?? member.role
    member.permissions = {
        canCreateTasks : permission?.canCreateTasks ?? member.permissions.canCreateTasks,
        canEditTasks : permission?.canEditTasks ?? member.permissions.canEditTasks,
        canDeleteTasks : permission?.canDeleteTasks ?? member.permissions.canDeleteTasks,
        canManageMembers : permission?.canManageMembers ?? member.permissions.canManageMembers,
        canViewReports : permission?.canViewReports ?? member.permissions.canViewReports,
    }
    await member.save()

    // populate the user field in the projectMember document
    await member.populate("user", "name email")
    
    // response to client
    res.status(200).json(new ApiResponse(200, member, "Project member updated successfully"))

})

// ------------------------------------------------------
export const removeProjectMember = asyncHandler(async(req,res) =>{
        //  verify the project exists
     const {projectId , userId} = req.params
    // throw error if projectId is not present
    if (!projectId){
        return res.status(400).json(new ApiError(400, "Project ID is required"))
    }
    // verify the project exists
    const project = await projectTable.findById(projectId)
    if (!project){
        return res.status(404).json(new ApiError(404, "Project not found"))
    }
     //  find the project member to be updated
    const member = await projectMember.findOne({
        project : projectId,
        user : userId
    })
    if (!member){
        return res.status(404).json(new ApiError(404, "this user is not a member of the project"))
    }
    // prevent removing last admin (basic safety)
    if (member.role === "admin" && project.metadata.totalMembers === 1){
        return res.status(400)
        .json(new ApiError(400, "This Project must have at least one admin, you can not remove the last admin"))

    }

    //  remove the member
    await member.deleteOne()

    // update project metadata total members
      // update project metadata total members
        await projectTable.findByIdAndUpdate(
            projectId,{
            $inc : {"metadata.totalMembers": 1},
            $set : {"metadata.lastActivity": new Date()}  
            }
        )

        // response to the client
        res.status(200).json(new ApiResponse(200, null, "Project member removed successfully"))
})

