const mongoose=require("mongoose");
const bcrypt=require("bcrypt")
const validator=require("validator");


// User Schema

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:[true , "Please tell us your name!"],

    },
    email:{
        type:String,
        trim:true,
        required:[true, "Please provide your email"],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail, "Please provide a valid email"]
    },
    photo:{
        type:String,
    },
    password:{
        type:String,
        required:[true, "Please provide a password"],
        minlength:8
    },
    passwordConfirm:{
        type:String,
        required:[true, "Please confirm your password"],
        validate:{
            // This only works on Create and Save!
            validator:function(el){
                return el=== this.password
            },
            message:"Password are not the same!"
        }
    }
});

// Pre-save mongoose middleware function
userSchema.pre("save", async function(next){
    // Only runs if the password was modified
    if(!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password,12);
    this.passwordConfirm=undefined;

    next();
})

const User=mongoose.model("User", userSchema);

module.exports=User;