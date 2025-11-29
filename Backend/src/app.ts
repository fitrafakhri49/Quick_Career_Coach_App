import  express  from "express";

const app=express()




app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1")
// app.use("/uploads",express.static(path.join(__dirname,"uploads")))
app.listen(process.env.PORT,()=>{
    console.log(`server is running at ${process.env.PORT}`)
})