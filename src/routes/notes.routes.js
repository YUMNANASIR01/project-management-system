import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireProjectMember } from "../middlewares/project.middleware.js";
import { listNotes } from "../controllers/note.contoller.js";
import {createNote, updateNotes, deleteNotes} from "../controllers/note.contoller.js"
import { uploadNoteAttachments } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(verifyJWT)
router.route("/:projectId").all(requireProjectMember, uploadNoteAttachments.array("attachments", 10)).post(createNote)
router.route("/:projectId").all(requireProjectMember).get(listNotes)
router.route("/:projectId/:noteId").all(requireProjectMember).put(updateNotes)
router.route("/:projectId/:noteId").all(requireProjectMember).delete(deleteNotes)

export default router;