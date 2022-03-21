const mongoose=require("mongoose");
const dotenv=require("dotenv");
dotenv.config({path:"./config.env"});

// Random uncaught synchronous errors
process.on("uncaughtException", err=>{
    console.log(err.name, err.message);
    console.log("UNHANDLED REJECTION shutting down...");
    process.exit(1);
})
const app=require("./app");


// DATABASE CONNECTION
const DB=process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD)

mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
}).then(con=>{
    console.log("DB connection successful!")
})


// INIT SERVER
const port=process.env.PORT || 3000;
const server=app.listen(port,()=>{
    console.log("The server is up and running")
})

// Failed Promises
process.on("unhandledRejection", err=>{
    console.log(err.name, err.message);
    console.log("UNHANDLED REJECTION shutting down...");
    server.close(()=>{
        process.exit(1);
    })
})


