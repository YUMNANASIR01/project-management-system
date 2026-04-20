
import mongoose, {Schema} from "mongoose";

const subTaskSchema = new Schema({
    title : {
        type : String,
        required : [true, "Subtask title is required"],
        trim : true,
        maxlength : [100, "Subtask title must be less than 100 characters"]
    },

    task: {
        type: Schema.Types.ObjectId,
        ref: "task",
        required: [true, "Task reference ID is required for subtask"],
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project", 
        required: [true, "Project reference ID is required for subtask"],
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Created by reference ID is required for subtask"],
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    completedAt: {
        type: Date,
        default: null,
    },
    completedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }

},{timestamps: true});

export const subTaskTable = mongoose.model("subTask", subTaskSchema)