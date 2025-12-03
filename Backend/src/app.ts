import  express  from "express";
import user from "./routes/user";
import dotenv from "dotenv";
import cors from "cors";
import cvRoutes from "./routes/Cv";
import interviewRoutes from "./routes/Interview";



dotenv.config();

const app=express()
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1",user,cvRoutes,interviewRoutes)

app.listen(process.env.PORT,()=>{
    console.log(`server is running at ${process.env.PORT}`)
})