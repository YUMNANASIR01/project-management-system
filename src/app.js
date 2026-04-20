import express from "express";
import cors from "cors"
import healthCheckRoutes from "./routes/healthCheck.routes.js"
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser";
import projectRouter from "./routes/project.routes.js"
import projectMemberRouter from "./routes/projectMembers.Routes.js"
import taskRouter from "./routes/task.routes.js"
import subTaskRouter from "./routes/subTask.Route.js"
import noteRouter from "./routes/notes.routes.js"
import aiRouter from "./routes/ai.routes.js"

// ---------------------- middleware -----------------
const app = express();
// ---------------------- cookie parser ---------------------
app.use(cookieParser());

app.use(express.json({ limit: "16kb" })); //to make readable client json.body
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // this will encode your url for safety reason
app.use(express.static("public")); //this tells express about never changing files/data

// ---------------------- CORS ---------------------
app.use(cors(
  {
    // origin: process.env.CORS_ORIGIN || "*",
    origin: "http://localhost:3000",
    credentials : true,
    method : [ "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders : ["Content-Type", "Authorization"],
  }
))
// --------------  Api -------------------------
app.get("/", (req, res) => {
  res.end("Welcome to Project Management API");
});
// ----------------------------- api routes -----------------
app.use("/api/v1/health-check", healthCheckRoutes)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/project", projectRouter)
// ----------list MyProject api ke liye route----------------
// --- is project ki id ky ander kinty members mojod hain---------
app.use("/api/v1/projects", projectMemberRouter )
// --------------------------------------------
// -------- Create a Task ------------
app.use("/api/v1/tasks", taskRouter )
// -------- sub Tasks ------------
app.use("/api/v1/tasks", subTaskRouter )
// -------- notes--------------
app.use("/api/v1/notes", noteRouter )
// -------------------------------------
app.use("/api/v1/ai", aiRouter)
// ----------------------------------------
export default app;

