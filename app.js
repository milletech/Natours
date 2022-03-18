const express=require("express");
const morgan = require("morgan");
const rateLimit=require("express-rate-limit");
const helmet=require("helmet");
const mongoSanitize=require("express-mongo-sanitize");
const xss=require("xss-clean");
const hpp=require("hpp");
const cookieParser=require("cookie-parser")
const path=require("path");
const app=express();


const AppError=require("./utils/appError");
const globalErrorHandler=require("./controllers/errorController")
const tourRouter=require("./routes/tourRoutes");
const userRouter=require("./routes/userRoutes");
const bookingRouter=require("./routes/bookingRoutes")
const reviewRouter=require("./routes/reviewRoutes");
const viewRouter=require("./routes/viewRoutes");


// Body Parser
app.use(express.json());

// Body Parser data from form submission
app.use(express.urlencoded({extended:true,limit:"10kb"}))

// Cookie Parser
app.use(cookieParser());

// Setting up PUG
app.set("view engine",'pug');
app.set("views",path.join(__dirname,"views"))

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Set security HTTP headers
app.use(helmet())

// Development logging
if(process.env.NODE_ENV === "development"){
    app.use(morgan("dev"));
}

// Limit request from the same IP Address
const limiter=rateLimit({
    max:100,
    windowMs: 60*60*1000,
    message:"To many requests coming from this IP, please try again in an hour"
});
app.use("/api",limiter);

// Data sanitization against NOSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

// Prevent parameter pollution, block duplicate fields in the req.params
app.use(hpp())

// Routers
app.use("/",viewRouter)
app.use("/api/v1/tours",tourRouter);
app.use("/api/v1/bookings",bookingRouter);
app.use("/api/v1/users",userRouter);
app.use("/api/v1/reviews",reviewRouter);

// Unhandled routes
app.all("*", (req,res,next)=>{
    next(new AppError(`Can't find ${req.originalUrl} on this server`,404));
})
// Error handling middleware function
app.use(globalErrorHandler)


module.exports=app;
