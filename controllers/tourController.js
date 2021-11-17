const fs=require("fs");
const tours=JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`,"utf-8"));

// Function Handlers
exports.getAllTours=(req,res)=>{
    res.status(200).json({
        status:"success",
        result:tours.length,
        data:{
            tours:tours
        }
    })
}
exports.getTour=(req,res)=>{

    const id=req.params.id*1;

    const tour=tours.find(el=>el.id===id);

    if(!tour) return res.status(404).json({status:"ID not found"})

    res.status(200).json({
        status:"success",
        data:{
            tour
        }
    })
}

exports.createTour=(req,res)=>{
    const newID=tours[tours.length-1].id+1;

    const newTour=Object.assign(req.body,{id:newID});
    tours.push(newTour);

    // Overwrite the tours file
    // We use the async version because the code in the callback function will run in the event loop
    // Number 1 Node JS rule is that we don't block the event loop
    fs.writeFileSync(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours),err=>{
        console.log(err)
    })

    res.status(201).json({
        status:"Sucess",
        tour:{
            tour:newTour
        }
    })
}

exports.updateTour=(req,res)=>{
    const id=req.params.id*1;
    const tour=tours.find(el=>el.id===id);
    if(!tour) return res.status(404).json({status:"ID not found"})

    res.status(200).json({
        status:"success",
        data:{
            tour:"<Updated Tour here...>"
        }
    })
}

exports.deleteTour=(req,res)=>{
    const id=req.params.id*1;
    const tour=tours.find(el=>el.id===id);
    if(!tour) return res.status(404).json({status:"ID not found"})

    res.status(204).json({
        status:"success",
        data:null
    })
}