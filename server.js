const mongoose=require("mongoose");
const dotenv=require("dotenv");
dotenv.config({path:"./config.env"});

const app=require("./app");

// DATABASE CONNECTION
const DB=process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD)

mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
}).then(con=>{
    console.log(con.connections);
    console.log("DB connection successful!")
}).catch(err=>{
    console.log("There is an error")
})

// INIT SERVER
const port=3000;
app.listen(port,()=>{
    console.log("The server is up and running")
})

