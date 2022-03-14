const mongoose=require("mongoose");
const bcrypt=require("bcrypt");

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
        default:"default.jpg"
    },
    role:{
        type:String,
        enum: ["user", "guide","lead-guide", "admin"],
        default:"user"
    },
    password:{
        type:String,
        required:[true, "Please provide a password"],
        minlength:8,
        select:false
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
    },
    passwordChangedAt:{
        type:Date
    },
    passwordResetToken:String,
    passwordResetExpires:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
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

userSchema.pre(/^find/,function(next){
    this.find({active:{$ne:false}});
    next()
});

userSchema.pre("save",function(next){
    if(!this.isModified("password") || this.isNew) return next();
    this.passwordChangedAt= Date.now()-1000;
    next()

})


// Instance method=> This method is available to all user document
userSchema.methods.correctPassword=async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword)
}

userSchema.methods.changedPasswordAfter=function(JWTTimeStamp){
    // IF CHANGED
    if(this.passwordChangedAt){
        const changedTimeStamp= parseInt(this.passwordChangedAt.getTime()/1000);
        return JWTTimeStamp<changedTimeStamp;
    }

    // FALSE MEANS NOT CHANGED
    return false;
}

userSchema.methods.createPasswordResetToken=function(){
    const resetToken=crypto.randomBytes(32).toString("hex");

   this.passwordResetToken=crypto.createHash("sha256").update(resetToken).digest("hex");
   this.passwordResetExpires=Date.now() + 10 * 60 * 1000;

   return resetToken;
}

const User=mongoose.model("User", userSchema);

module.exports=User;