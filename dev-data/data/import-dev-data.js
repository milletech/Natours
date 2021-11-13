const fs=require("fs");
const Tour=require("./../../model/tourModel");
const dotenv=require("dotenv");
const mongoose=require("mongoose");
dotenv.config({"path":"./config.env"});



const DB=process.env.DATABASE.replace("<PASSWORD>",process.env.DATABASE_PASSWORD);






// Connect to the database
mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false

}).then(con=>{
    // console.log(con.connections);
    console.log("DB connect successfully")
});

// Read JSON file

const tours=JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`,"utf-8"));

// Import data into DB

const importData=async()=>{
    try {
        await Tour.create(tours);
        console.log("Data successfully loaded!")
        process.exit()
    } catch (error) {
        console.log(error)
    }
}

// Delete all data from collection


const deleteData=async()=>{
    try {
        await Tour.deleteMany();
        console.log("Data successfully deleted!")
        process.exit()
    } catch (error) {
        console.log(error)
    }
}
console.log(process.argv);

if(process.argv[2]==="--import"){
    importData();
}else if(process.argv[2]==="--delete"){
    deleteData();
}

