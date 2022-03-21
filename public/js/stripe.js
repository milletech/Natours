import axios from "axios"
import { showAlert } from "./alert";


export const bookTour=async tourId=>{
    const stripe=Stripe("pk_test_51KdRnEBq1njwNNqlzzTnJKGAehqWGaSf25FqtxRuccuO6n4XCzpPuITewSGtICuVppDaKPoSlBFtgpPOpW0sSkxG00rCLtieSu");
    try{
        // 1) Get checkout session from API
        const session=await axios(`/api/v1/bookings/checkout-session/${tourId}`)

        

        // 2) Create checkout from and charge credit card
        await stripe.redirectToCheckout({
            sessionId:session.data.session.id
        })
    }catch(err){
        showAlert("error",err.message);
    }


}