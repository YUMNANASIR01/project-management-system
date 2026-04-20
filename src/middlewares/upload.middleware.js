import dotenv from "dotenv"
import multer from "multer"
import multerS3 from "multer-s3"
import s3_Client from "../config/s3.js"

dotenv.config()

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip"
]


// s3 buckets mai avatar ko dalna
export const uploadAvatar = multer({
    storage : multerS3({
        s3 : s3_Client,
        bucket : process.env.AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
        const timestamp = Date.now()
        // Changed: Avatars will go to 'avatars/' folder instead of 'task-new/'
        const filename = `avatars/${timestamp}-${file.originalname}`
        cb(null , filename)
    }
    }),
    fileFilter : (req, file, cb)=> {
        // only avatar images is allowed
        const imageTypes = ["image/jpeg", "image/png", "image/gif"]
        if(imageTypes.includes(file.mimetype)){
            cb(null, true)
        } else{
            cb(new Error("only images are allowed for avatar", false))
        }
    },

    limits : {
        fileSize : 50 * 1024 * 1024 ,//50 MB
        files : 10 //max 10 files
    }
})




// ------------------------------ uploadTaskAttachments   s3 mai dalna task ko ----------------------------
//   s3 mai attachment ko dalna
export const uploadTaskAttachments = multer({
    storage : multerS3({
        s3 : s3_Client,
        bucket : process.env.AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key : (req, file, cb) => {
        const taskId = req.params.taskId || "new"
        const timestamp = Date.now()
        const filename = `task-${taskId}/${timestamp}-${file.originalname}`
        cb(null , filename)
    }
    }),
    fileFilter : (req, file, cb)=> {
        // only avatar images is allowed 
        if(allowedMimeTypes.includes(file.mimetype)){
            cb(null, true)
        } else{
            cb(new Error("Files type not allowed ", false))
        }
    },

})




// ------------------------------------------------
export const uploadNoteAttachments = multer({
    storage : multerS3({
        s3 : s3_Client,
        bucket : process.env.AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key : (req, file, cb) => {
        const noteId = req.params.noteId || "new"
        const timestamp = Date.now()
        const filename = `note-${noteId}/${timestamp}-${file.originalname}`
        cb(null , filename)
    }
    }),
    fileFilter : (req, file, cb)=> {
        // only avatar images is allowed 
        if(allowedMimeTypes.includes(file.mimetype)){
            cb(null, true)
        } else{
            cb(new Error("Files type not allowed ", false))
        }
    },

})