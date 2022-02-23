const fs=require("fs");
const Tour=require("./../../models/tourModel");
const User=require("./../../models/userModel");
const Review=require("./../../models/reviewModel");

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

const tours=JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,"utf-8"));
const users=JSON.parse(fs.readFileSync(`${__dirname}/users.json`,"utf-8"));
const reviews=JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,"utf-8"));

// Import data into DB

const importData=async()=>{
    try {
        await Tour.create(tours);
        await User.create(users,{validateBeforeSave:false});
        await Review.create(reviews,{validateBeforeSave:false});
        console.log("Data successfully loaded!")
        
    } catch (error) {
        console.log(error)
    }
    process.exit()
}

// Delete all data from collection


const deleteData=async()=>{
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("Data successfully deleted!")
        
    } catch (error) {
        console.log(error)
    }
    process.exit()
}
console.log(process.argv);

if(process.argv[2]==="--import"){
    importData();
}else if(process.argv[2]==="--delete"){
    deleteData();
}

