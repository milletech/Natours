// update data settings
import axios from "axios";
import { showAlert } from "./alert";

export const updateSettings=async(data,type)=>{
    try{

        const url=type==="password"?"/api/v1/users/updateMyPassword":"/api/v1/users/updateMe";
        const res=await axios({
            method:"PATCH",
            url,
            data
        })
        if(res.data.status==="success"){
            showAlert("success","Data updated successfully!");
            window.setTimeout(()=>{
                location.assign("/me");
            },1000)
        }

    }catch(err){
        showAlert("error",err.response.data.message)
    }
}