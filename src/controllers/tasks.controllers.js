import { asyncHandler } from "../utils/async-handler.js";
import {projectTable} from "../models/project.models.js"
import { ApiError } from "../utils/api-error.js";
import { projectMember } from "../models/projectMemeberRole.model.js";
import { tableTask } from "../models/tasks.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { deleteFromS3 } from "../utils/s3-delete.js";


export const createTask = asyncHandler ( async (req, res) => {
    //  verify project exists 
    const {projectId} = req.params

    //  extract task details from req.body
    const {
    title, description, assignedTo, status = "todo", priority = "medium", dueDate, estimatedHours,
    tags } = req.body
    

    // if title not present , throw error
    if(!title){
        throw new ApiError(400, "Title is required to create a task")
    }

    const project = await projectTable.findById(projectId)
    if (!project){
       throw new ApiError(400, "Project not found")
    }
//   if assignedTo user validated it
    const member = await projectMember.findOne({
        project : projectId,
        user : assignedTo
    })
    if (!member){
       throw new ApiError(400, "Project member not found")

    }

    if (dueDate && new Date(dueDate) < new Date() ){
        throw new ApiError(400, "Due data cannot be in the past")
    }

    const validStatuses = [ "todo", "in-progress", "done"]
    const validPriorities  = ["low", "medium", "high" , "critical"]

    if (status && !validStatuses.includes(status)) {
        throw new ApiError(400, `Invalid status value. Allowed values are: ${validStatuses.join(", ")}`)
    }

    if (priority && !validPriorities.includes(priority)) {
        throw new ApiError(400, `Invalid priority . Valid options are: ${validPriorities.join(", ")}`)
    }

    // handle attachments from s3 buckets
    const attachments = req.files?.map( (file) => ({
        url : file.location,
        filename : file.originalname,
        mimetype : file.mimetype,
        size : file.size,
        uploadedBy : req.user._id

    }) )

    // create the task in mongodb 
    const task = await tableTask.create({
       title : title,
       description : description,
       project : projectId,
       assignedTo : assignedTo || null,
       assignedBy : req.user._id,
       status :  status,
       priority :  priority,
       dueDate: dueDate || null,
       estimatedHours: estimatedHours || 0,
       tags : tags || [],
       attachments : attachments || [],
    })

    if( !task) {
        throw new ApiError (500, "Failed to create a task")
    }

    // update proejct metadata
    await projectTable.findByIdAndUpdate( projectId, {
        $inc : {"metadata.totalTasks": 1},
        $set : {"metadata.lastActivity": new Date()}  
     }).exec() //execute the query

    return res.status(201).json(new ApiResponse(201, task, "Task created successfully"))

})



// ---------------------------------------
export const listTask = asyncHandler(async (req, res) => {
    // get project id from url
    const {projectId} = req.params

    // Verify project exists
    const project  = await projectTable.findById(projectId)
    if(!project){
        throw new ApiError(404, "Project not found")
    }

    // extract query params for filtering
    const {
        status,
        priority,
        assignedTo,
        tags,
        search,
        sort,
        page,
        limit,
        dueDateGte,
        dueDateLte
    } = req.query

    // validate status & priority values if provided
    const validStatuses = ["todo", "in-progress", "done"]
    const validPriorities = ["low", "medium", "high", "critical"]

    if (status && !validStatuses.includes(status)) {
        throw new ApiError(400, `Invalid status value. Allowed values are: ${validStatuses.join(", ")}`)
    }

    if (priority && !validPriorities.includes(priority)) {
        throw new ApiError(400, `Invalid priority value. Allowed values are: ${validPriorities.join(", ")}`)
    }

    // Build filter object based on query params
    const filter = { project: projectId }

    if (status) filter.status = status
    if (priority) filter.priority = priority
    if (assignedTo) filter.assignedTo = assignedTo
    if(tags){
        const tagArray = tags.split(",").filter(Boolean);
        if (tagArray.length) filter.tags = { $all : tagArray}
    }
    if (search) filter.title = { $regex: search, $options: "i" }

    if (dueDateGte || dueDateLte) {
        filter.dueDate = {}
        if (dueDateGte) filter.dueDate.$gte = new Date(dueDateGte)
        if (dueDateLte) filter.dueDate.$lte = new Date(dueDateLte)
    }

    // pagination
    const pageNum = Math.max(1, parseInt(page) || 1) // default to page 1 if not provided or invalid
    const limitNum = Math.min(100, parseInt(limit) || 10) // default to 10 items per page, max 100
    const skip = (pageNum - 1) * limitNum // calculate how many items to skip based on current page and limit

    // sorting
    const validSort = ["createdAt", "dueDate", "priority", "status"]
    const sortField = validSort.includes(sort) ? sort : "createdAt" // default to sorting by creation date
    const sortOrder = sort === "dueDate" ? 1 : -1 // sort by due date in ascending order, others in descending

    // fetch task + total count in parallel
    const [tasks, totalCount] = await Promise.all([
        tableTask.find(filter).sort({ [sortField]: sortOrder }).skip(skip).limit(limitNum).exec(),

        tableTask.countDocuments(filter).exec()
    ])

    // return response with tasks and pagination info
    return res.status(200).json(
        new ApiResponse(200, {
            tasks,
            pagination: {
                total: totalCount, //100
                page: pageNum, //10
                limit: limitNum, //100
                totalPages: Math.ceil(totalCount / limitNum)
            }
        }, "Tasks fetched successfully")
    )


})



// -------------------- getTaskDetails ------------------- \
// ------------ get all tasks ------------------
export const getTaskDetails = asyncHandler(async(req,res) => {
    const {projectId, taskId} = req.params
    
    // verify project exists
    const project = await projectTable.findById(projectId)
    if (!project){
        throw new ApiError(404, "Project not found")
    }
    //  fetch task details
    const task = await tableTask.findById(taskId).exec()
      if (!task){
        throw new ApiError(404, "Task not found")
    }
    // check if task belongs to the project
    if (task.project.toString() !== projectId){
        throw new ApiError(403, "Access denied")
    }

    return res.status(200).json(new ApiResponse(200, task, "Task details fetched successfully"))

})
// --------------------- updateTask ------------------
export const updateTask = asyncHandler(async(req,res) => {
    const {projectId, taskId} = req.params
    // 
    const {
       title,
       description ,
       assignedTo,
       status ,
       priority ,
       dueDate,
       actualHours,
       tags 
    } = req.body

    // verify the project exists
    const project = await projectTable.findById(projectId);
    if(!project) throw new ApiError (404, "Project not found")

        // fetch task details
    const task = await tableTask.findById(taskId).exec()
    if(!task) throw new ApiError (404, "task not found")

    // validate status & priority values if provided
    const validStatuses = ["todo", "in-progress", "done"]
    const validPriorities = ["low", "medium", "high", "critical"]

    if (status && !validStatuses.includes(status)) {
        throw new ApiError(400, `Invalid status value. Allowed values are: ${validStatuses.join(", ")}`)
    }

    if (priority && !validPriorities.includes(priority)) {
        throw new ApiError(400, `Invalid priority value. Allowed values are: ${validPriorities.join(", ")}`)
    }

    // validate the date
    if (dueDate && new Date (dueDate) < new Date()){
        throw new ApiError (400, "Due date cannot be in the past")
    }

    // if assignedTo is provided, validate it 
    if (assignedTo){
        const member = await projectMember.findOne({
            project : projectId,
            user : assignedTo
        })
        if (!member){
            throw new ApiError(400 , "This user is not a member of the project")
        }
    }

    // update fields (only update what was sent in the request body)
//update karny wale nahi rakhi to woh undefined hai agar dia hai to title ki value mai ja ky update kardy
    if (title !== undefined) task.title = title;

    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (actualHours !== undefined) task.actualHours = actualHours;
    if (tags !== undefined) task.tags = tags;

    // if status changed to done, set completedAt
    //  kis waqt pe complete hua is pr date set hogyi is time pe complete hua
  if (status === "done" && task.status !== "done"){
    task.completedAt = new Date()
  }
//   if status is changed from done to something else, remove completedAt
 if (status !== "done" && task.status === "done"){
    task.completedAt = null
  }

//   save the update task
 await task.save()

//  update project meta data (extra information is called meta data)
    await projectTable.findByIdAndUpdate(projectId, {
        $set : { "metadata.lastActivity" : new Date()}
    }).exec()

    return res.status(200).json(new ApiResponse(200, task, "Task updated successfully"))

    })


    
    //-------------------------  deleteTask
    export const deleteTask = asyncHandler(async(req,res) => {
     const {projectId, taskId} = req.params

       // verify the project exists
    const project = await projectTable.findById(projectId);
    if(!project) throw new ApiError (404, "Project not found")

        // fetch task details
    const task = await tableTask.findById(taskId).exec()
    if(!task) throw new ApiError (404, "task not found")

        // only admin can delete a task
          // Check if the user is an admin of the project          
        if (req.membership.role !== "admin") {
                throw new ApiError(403, "You are not an admin of this project")
            }

    if (task.attachments.length > 0) {
        await Promise.all(
            task.attachments.map( file => deleteFromS3(file.url))
        )
    }

    // delete task
    await tableTask.deleteOne({ _id : taskId }) 

    // update project meta data
    await projectTable.findByIdAndUpdate(projectId, {
        $inc : {"metadata.totalTasks": -1},
        $set : {"metadata.lastActivity": new Date()}  
     }).exec() //execute the query

    //  return response
      return res.status(200).json(new ApiResponse(200, {}, "Task delete successfully"))


    })

























/// yah orignnoal code hai
// import { asyncHandler } from "../utils/async-handler.js";
// import {ApiError} from "../utils/api-error.js"
// import {tableTask} from "../models/task.model.js"
// import {subtaskTable} from "../models/subtask.model.js"
// import { ApiResponse } from "../utils/api-response.js";


// export const listSubtasks = asyncHandler(async (req, res) => {
//     // localhost:8000//api/v1/tasks/:projectId/t/:taskId/subtasks
//     const {projectId, taskId} = req.params
//     if(!(projectId && taskId)) throw new ApiError(400, "projectId & taskId is missing")

//     const task = await tableTask.findOne({_id: taskId, project: projectId})
//     if(!task) throw new ApiError(404, "Task not found into Database because of wrong taskId or projectId")

//     // projectId, taskId ==> subTask -> Database
//     const subtasks = await subtaskTable.find({task: taskId})
//     if(subtasks.length < 1) return res.status(200).json(new ApiResponse(200, subtasks, "no subtask found into database"))

//     return res.status(200).json(new ApiResponse(200, subtasks, "subtask fetched successfully"))
// })





// export const createSubtask = asyncHandler(async (req, res) => {
//     const {projectId, taskId} = req.params
//     if(!(projectId && taskId)) throw new ApiError(400, "projectId & taskId is missing")

//     // find task into database with taskId and projectId
//     const task = await tableTask.findOne({_id: taskId, project: projectId})
//     if(!task) throw new ApiError(404, "Task not found into Database because of wrong taskId or projectId so you can't create subtask")

//     // create subtask into database with taskId and projectId
//     const subtask = await subtaskTable.create({
//         title: req.body.title,
//         task: taskId,
//         project: projectId,
//         createdBy: req.user._id
//     })

//     return res.status(201).json(new ApiResponse(201, subtask, "subtask created successfully"))
// })






// export const updateSubtask = asyncHandler(async (req, res) => {
//     // ---------------------------  1. Receivable  (req.param, req.query, req.body)  ---------------------------
//     const {projectId, taskId, subtaskId} = req.params
//     if(!(projectId && taskId && subtaskId)) throw new ApiError(400, "projectId & taskId & subtaskId is missing")

//     const {title, isCompleted} = req.body
//     if(title === undefined && isCompleted === undefined) throw new ApiError(400, "title or isCompleted is required to update subtask")

//     // ---------------------------  2. exist or not (Receivable)  ---------------------------
//     // find task into database with taskId and projectId
//     const task = await tableTask.findOne({_id: taskId, project: projectId})
//     if(!task) throw new ApiError(404, "Task not found into Database because of wrong taskId or projectId")

//     // find subtask into database with subtaskId and taskId and projectId
//     const subtask = await subtaskTable.findOne({_id: subtaskId, task: taskId, project: projectId})
//     if(!subtask) throw new ApiError(404, "Subtask not found into Database because of wrong subtaskId or taskId or projectId")

//     // ---------------------------  3. according to condition (Receivable)  ---------------------------
//     // skipped

//     // ---------------------------  4. database manipulation (according to schema)  ---------------------------
//     if(title !== undefined) subtask.title = title

//     if(isCompleted == true) {
//         subtask.isCompleted = true
//         subtask.completeAt =  new Date()
//     }

//     await subtask.save()
    
//     // ---------------------------  5. Response   ---------------------------
//     return res.status(200).json(new ApiResponse(200, subtask, "subtask updated successfully"))
// })







// export const deleteSubtask = asyncHandler(async (req, res) => {
//     // ---------------------------  1. Receivable  (req.param, req.query, req.body)  ---------------------------
//     const {projectId, taskId, subtaskId} = req.params
//     if(!(projectId && taskId && subtaskId)) throw new ApiError(400, "projectId & taskId & subtaskId is missing")

//     // ---------------------------  2. exist or not (Receivable)  ---------------------------
//     // find task into database with taskId and projectId
//     const task = await tableTask.findOne({_id: taskId, project: projectId})
//     if(!task) throw new ApiError(404, "Task not found into Database because of wrong taskId or projectId")

//     // find subtask into database with subtaskId and taskId and projectId
//     const subtask = await subtaskTable.findOne({_id: subtaskId, task: taskId, project: projectId})
//     if(!subtask) throw new ApiError(404, "Subtask not found into Database because of wrong subtaskId or taskId or projectId")

//     // ---------------------------  3. according to condition (Receivable)  ---------------------------
//     // skipped

//     // ---------------------------  4. database manipulation (according to schema)  ---------------------------
//     await subtask.deleteOne({_id: subtaskId})
    
//     // ---------------------------  5. Response   ---------------------------
//     return res.status(200).json(new ApiResponse(200, null, "subtask deleted successfully"))
// })