
const {promisify}=require("util")
const User=require("./../models/userModel");
const catchAsync=require("./../utils/catchAsync")
const AppError=require("./../utils/appError");
const jwt=require("jsonwebtoken");
const sendEmail=require("./../utils/email");
const crypto=require("crypto");
const Email=require("./../utils/email");


const signToken=id=>{
    return jwt.sign({id: id}, process.env.JWT_SECRET,{expiresIn: process.env.JWT_EXPIRES_IN})
}
const createSendToken=(user, statusCode,res)=>{
    const token=signToken(user._id);
    const cookieOptions={
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly:true
    };

    if(process.env.NODE_ENV === "production") cookieOptions.secure= true;

    res.cookie("jwt", token, cookieOptions)

    res.status(statusCode).json({
        status:"success",
        token,
        data:{
            user
        }
    })
}
exports.signup=catchAsync(async (req,res,next)=>{
    const newUser=await User.create({
        name:req.body.name,
        gender:req.body.gender,
        email:req.body.email,
        role:req.body.role,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm,
        passwordChangedAt:req.body.passwordChangedAt
    });

    const url=`${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser,url).sendWelcome()
    // User is logged  in since the token is sent
    createSendToken(newUser,201,res)
})

exports.login=async (req,res,next)=>{
    const {email,password}=req.body;
    // 1)Check the email and the password exist
    if(!email || !password){
        return next(new AppError("Please provide an email and password",400))
    }
    // 2)Check if the user exists & the password is correct
    const user=await User.findOne({email}).select("+password");
    if(!user || !await user.correctPassword(password,user.password)){
        return next(new AppError("Incorrect email or password",400))
    }
    // 3)If everything okay, send the Token to the client
    const token=signToken(user._id);

    createSendToken(user,200,res)
};

exports.logout=(req,res)=>{
    // console.log('logout');

    res.cookie("jwt","",{
        expires:new Date(Date.now()+10*1000),
        httpOnly:true
    });
    res.status(200).json({status:"success"})
}


exports.protect=catchAsync(async (req,res,next)=>{
    
    let token;
    // 1) Getting token and check of it's there
    if(req.headers.authorization && (req.headers.authorization).startsWith("Bearer")){
        token=req.headers.authorization.split(" ")[1];
    }else if(req.cookies.jwt){
        token=req.cookies.jwt;
    }
    if(!token){
        return next(new AppError("You are not logged in, please log in to gain access",401))
    } 

    // 2) Verification token 
    const decoded=await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser=await User.findById(decoded.id);
    if(!currentUser){
        return next(new AppError("The user belonging to this token does not exist anymore",401))
    }

    // 4) Check if user changed password after the JWT was issued
    if( currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError("User recently changed password! please login again",401))
    }
    

    req.user=currentUser;
    res.locals.user=currentUser;
    next();
})

exports.isLoggedIn=catchAsync(async (req,res,next)=>{
    
    if(req.cookies.jwt){
        // 1) Verify token
        const decoded=await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

        // 2) Check if user still exists
        const currentUser=await User.findById(decoded.id);
        if(!currentUser){
            return next();
        }
        // 3) Check if user changed password after the JWT was issued
        if( currentUser.changedPasswordAfter(decoded.iat)){
            return next();
        }
        // There is a logged in user
        res.locals.user=currentUser;
        return next();

    }

    next()
})

exports.restrictTo=(...roles)=>{
    return function(req,res, next){

        if(!roles.includes(req.user.role)){
            return next(new AppError("You do not have the permission top perform this action",403))
        }

        next()
    }
}

exports.forgotPassword=catchAsync(async(req,res,next)=>{
    // 1) Get User Email
    const user= await User.findOne({email: req.body.email});
    if(!user){
        return next(new AppError("User not found with this email address",404))
    }

    // 2) Generate random token
    const resetToken=user.createPasswordResetToken();
    await user.save({validateBeforeSave:false})

    // 3) Send it to the user's email
    
    // const message=`Forgot your password? Submit a PATCH request with your new password and passwordConfirm to:
    // ${resetURL}.\n If you didn't forget your password, please ignore this email!`;

    try{
        const resetURL =`${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user,resetURL).sendPasswordReset()
        res.status(200).json({
            status:"Success",
            message:"Token sent to email!"
        })
    }catch(err){
        user.passwordResetToken=undefined;
        user.passwordResetExpires=undefined;

        return next(new AppError("The was an error sending the email. Try again later",500))
    }

})

exports.resetPassword=catchAsync(async (req,res,next)=>{
    // 1) Get user based on the token
    const hashedToken=crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user=await User.findOne({passwordResetToken: hashedToken,passwordResetExpires:{$gt:Date.now()}});

    // 2) If token has not expired, and the is user, set the new password

    if(!user){
        return next(new AppError("Token is invalid or has expired",400))
    }

    user.password=req.body.password;
    user.passwordConfirm=req.body.passwordConfirm;
    user.passwordResetExpires=undefined;
    user.passwordResetToken=undefined;

    await user.save()

    // 3) Update changedPasswordAt property for the user


    // 4)Log the user in, send JWT

    const token=signToken(user._id);

    res.status(200).json({
        status:"Success",
        token
    })

})

exports.updatePassword=catchAsync(async(req,res,next)=>{

    // 1) Get the user from the collection
    const user= await User.findById(req.user.id).select("+password");

    

    // 2) Check if the current posted password is correct
    if(!(await user.correctPassword(req.body.currentPassword, user.password))){
        return next(new AppError("Please input your correct current password!",401))
    }

    
    // 3) If so, update the password
    user.password=req.body.password;
    user.passwordConfirm=req.body.passwordConfirm;

    await user.save();
    
    // 4) Login the user, send the JWT token

    createSendToken(user,200,res);
    // const token=signToken(user._id);
    // res.status(200).json({
    //     status:"success",
    //     token
    // })
})