import { asyncHandler } from "../utils/async-handler.js"
import { ApiError } from "../utils/api-error.js"
import { projectTable } from "../models/project.models.js"
import { noteTable } from "../models/note.model.js"
import { ApiResponse } from "../utils/api-response.js"
import {deleteFromS3} from "../utils/s3-delete.js"


export const createNote = asyncHandler( async (req,res) => {
    const {projectId} = req.params
    if(!projectId) throw new ApiError("Project Id is required", 400)

    const {title, content, tags, isPinned} = req.body

    if(!title || !content) throw new ApiError("Title and content are required", 400)

     const project = await projectTable.findById(projectId)
     if(!project) throw new ApiError("Project not found", 404)

  // handle attachments from s3 buckets
    const attachments = req.files?.map( (file) => ({
        url : file.location,
        filename : file.originalname,
        mimetype : file.mimetype,
        size : file.size,
        uploadedBy : req.user._id

    }) )

    const note =  await noteTable.create({
        title : title,
        content : content,
        projectId : projectId,
        createdBy : req.user._id,
        lastEditedBy : req.user._id,
        tags : tags || [],
        isPinned : isPinned || false,
        attachments : attachments || []

     })

       // ---------------------------  Response   ---------------------------
        return res.status(200).json(new ApiResponse(200, note, "Note created successfully"))
    })


// ----------------- list notes--------------------
export const listNotes = asyncHandler( async (req,res) => {
    const {projectId} = req.params
    if(!projectId) throw new ApiError("Project Id is required", 400)
    const { search, tags, pinned, sort } = req.query
    const filter = { projectId }
    if (search) filter.$text = { $search: search }
    if (tags) filter.tags = {$in : tags.split(",")}

    if(pinned) filter.isPinned = pinned === "true"
    const notes = await noteTable.find(filter)
    return res.status(200).json(new ApiResponse(200, notes, "Notes fetched successfully"))
})


// ---------------- updateNotes ------------------------
export const updateNotes  = asyncHandler( async (req,res) => {
    const {projectId , noteId} = req.params
    if(!projectId || !noteId ) throw new ApiError("Project ID and Note ID are required", 400)
    // ----------- existing note check -------------

    const project = await projectTable.findById(projectId)
     if(!project) throw new ApiError("Project not found", 404)

    const note = await noteTable.findById(noteId)
    if(!note) throw new ApiError("Note not found", 404)

    const {title, content, tags, isPinned = false} = req.body

    if(!title && !content && !tags ) throw new ApiError(
        "At least one field is required (title, content , tags) to update", 400)

//    -------------------- database manipulation to update schema -----------------------------
// just before update the note , push old version in history array
if (title || content || tags){
    note.versionHistory.push({
    title : note.title,
    content : note.content,
    editedBy : req.user._id,
    editedAt : new Date()
 })
}
 note.versions += 1

//  ----------------- update note --------------

if (title) note.title = title
if (content) note.content = content
if (tags) note.tags = tags
if(isPinned !== undefined) note.isPinned = isPinned

note.lastEditedBy = req.user._id
await note.save()

// ---------------------------- response ------------------------------
return res.status(200).json(new ApiResponse(200, note, "Note updated successfully"))

})

// ------------------ deleteNotes -------------------------
export const deleteNotes  = asyncHandler( async (req,res) => {
    // ------------------ receive able ------------------------
    const {projectId , noteId} = req.params
    if(!projectId || !noteId ) throw new ApiError("Project ID and Note ID are required", 400)

    //  project id is exists or not ----------------
    const project = await projectTable.findById(projectId)
    if(!project) throw new ApiError("Project not found", 404)

    const note = await noteTable.findById(noteId)
    if(!note) throw new ApiError("Note not found", 404)


//    -------------------- database manipulation to update schema -----------------------------
if(note.attachments.length > 0) {
   await Promise.all(
   note.attachments.map(file => deleteFromS3(file.url))
   )
}

await noteTable.findByIdAndDelete(noteId)

// -------------------------- response ------------------------
return res.status(200).json(new ApiResponse(200, note, "Note deleted successfully"))
})























// yah orignal code hai jis mai s3 bucket mai nahi lagayi hai persistent cde ky lia 
// import { asyncHandler } from "../utils/async-handler.js";
// import {ApiError} from "../utils/api-error.js"
// import {projectTable} from "../models/project.models.js"
// import {noteTable} from "../models/note.model.js"
// import {ApiResponse} from "../utils/api-response.js"
// import {deleteFromS3} from "../utils/s3-delete.js"

 
 
 
//  export const createNote = asyncHandler(async (req, res) => {
//     const {projectId} = req.params
//     if(!projectId) throw new ApiError(400, "Project ID is required")

//     const {title, content, tags, isPinned} = req.body
//     if(!title || !content) throw new ApiError(400, "Title and content are required")

//     const project = await projectTable.findById(projectId)
//     if(!project) throw new ApiError(404, "Project not found")

//    // handle attachments from s3 bucket
//    const attachments = req.files?.map((file) => ({
//    url: file.location,
//    filename: file.orignalname,
//    mimetype: file.mimetype,
//    size: file.size,
//    uploadedBy: req.user._id
//    }))      

//     const note = await noteTable.create({
//         title: title,
//         content: content,
//         projectId: projectId,
//         createdBy: req.user._id,
//         tags: tags || [],
//         isPinned: isPinned || false,
//         attachments: attachments || []
//     })

//     return res.status(201).json(new ApiResponse(201, note, "Note created successfully"))
//  })





//  export const listNotes = asyncHandler(async (req, res) => {
//     const {projectId} = req.params
//     if(!projectId) throw new ApiError(400, "Project ID is required")

//     const { search, tags, pinned, sort } = req.query

//     const filter = { projectId }

//     if (search) filter.$text = { $search: search }

//     if (tags) filter.tags = { $in: tags.split(",") }

//     if (pinned) filter.isPinned = pinned === "true"

//     const notes = await noteTable.find(filter)

//     return res.status(200).json(new ApiResponse(200, notes, "Notes fetched successfully"))
//  })





// export const updateNote = asyncHandler(async (req, res) => {
// // ---------------------------  1. Receivable  (req.param, req.query, req.body)  ---------------------------
//    const {projectId, noteId} = req.params
//    if(!projectId || !noteId) throw new ApiError(400, "Project ID and Note ID are required")

//    const {title, content, tags, isPinned = false} = req.body
//    if(!title && !content && !tags) throw new ApiError(400, "At least one field (title, content, tags) is required to update")

// // ---------------------------  2. exist or not (Receivable)  ---------------------------
//    const project = await projectTable.findById(projectId)
//    if(!project) throw new ApiError(404, "Project not found")
   
//    const note = await noteTable.findById(noteId)
//    if(!note) throw new ApiError(404, "Note not found")

// // ---------------------------  3. according to condition (Receivable)  ---------------------------
// // skipped

// // ---------------------------  4. database manipulation (according to schema)  ---------------------------
// // just before update, push old version in history array
// if(title || content || tags){
//    note.versionHistory.push({
//       title: note.title,
//       content: note.content,
//       editedBy: req.user._id,
//       editedAt: new Date()
//    })
// }

// note.version += 1


// // updating
// if(title) note.title = title
// if(content) note.content = content
// if(tags) note.tags = tags
// if(isPinned !== undefined) note.isPinned = isPinned


// note.lastEditedBy = req.user._id

// await note.save()

// // ---------------------------  5. Response   ---------------------------
//    return res.status(200).json(new ApiResponse(200, note, "Note updated successfully"))
// })





// export const deleteNote = asyncHandler(async (req, res) => {
// // ---------------------------  1. Receivable  (req.param, req.query, req.body)  ---------------------------
//    const {projectId, noteId} = req.params
//    if(!projectId || !noteId) throw new ApiError(400, "Project ID and Note ID are required")

// // ---------------------------  2. exist or not (Receivable)  ---------------------------
//    const project = await projectTable.findById(projectId)
//    if(!project) throw new ApiError(404, "Project not found")

//    const note = await noteTable.findById(noteId)
//    if(!note) throw new ApiError(404, "Note not found")

// // ---------------------------  3. according to condition (Receivable)  ---------------------------
// // skipped

// // ---------------------------  4. database manipulation (according to schema)  ---------------------------
// if(note.attachments.length > 0) {
//    await Promise.all(
//    note.attachments.map(file => deleteFromS3(file.url))
//    )
// }

// await noteTable.findByIdAndDelete(noteId)

// // ---------------------------  5. Response   ---------------------------
//    return res.status(200).json(new ApiResponse(200, null, "Note deleted successfully"))


// })







