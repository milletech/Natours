import "@babel/polyfill"
import { displayMap } from "./mapbox";
import { login,logout } from "./login"
import {updateSettings} from "./updateSettings"

// DOM ELEMENTS
const mapBox=document.getElementById("map");
const loginForm=document.querySelector(".form--login");
const logoutBtn=document.querySelector(".nav__el--logout");
const updateForm=document.querySelector(".form-user-data");
const updatePassword=document.querySelector(".form-user-settings")

if(mapBox){
    const locations=JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}


if(loginForm){
    loginForm.addEventListener("submit",e=>{
        e.preventDefault();
        const email=document.getElementById("email").value;
        const password=document.getElementById("password").value;
        login(email,password)
    })
}

if(updateForm){
    updateForm.addEventListener("submit",e=>{
        e.preventDefault();
        // Multi-part form data
        const form=new FormData()
        form.append("name",document.getElementById("name").value);
        form.append("email",document.getElementById("email").value);
        form.append("photo",document.getElementById("photo").files[0]);

        // const email=document.getElementById("email").value;
        // const name=document.getElementById("name").value

        updateSettings(form,"data")
    })
}

if(updatePassword){
    updatePassword.addEventListener("submit",async e=>{
        e.preventDefault();
        document.querySelector(".btn--save-password").innerHTML="Updating...";
        const currentPassword=document.getElementById("password-current").value;
        const password=document.getElementById("password").value;
        const passwordConfirm=document.getElementById("password-confirm").value;

        await updateSettings({currentPassword,password,passwordConfirm},"password");

        document.querySelector(".btn--save-password").innerHTML="Save password";
        document.getElementById("password-current").value="";
        document.getElementById("password").value="";
        document.getElementById("password-confirm").value=""
    })
}

if(logoutBtn){
    logoutBtn.addEventListener("click",logout)
}

