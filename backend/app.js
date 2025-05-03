import express from "express";
import cors from "cors";
import mogan from "morgan";
import connect from "./db/db.js";
import userRoutes from './routes/user.routes.js'
import projectRoutes from "./routes/project.routes.js"
import cookieParser from 'cookie-parser';
import geminiRoutes from "./routes/gemini.routes.js"


const app = express();
app.use(cors())
app.use(cookieParser());
connect();
app.use(mogan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', userRoutes) 
app.use('/projects', projectRoutes)
app.use("/ai" , geminiRoutes)

export default app;
