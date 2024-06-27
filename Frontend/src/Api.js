import axios from 'axios';

const APIEndPoint = 'localhost:8000';

async function getAll(){ 
    await axios.get(`https://${APIEndPoint}/All`).then(
        res=>{
            return res.data
        }
    ).catch(
        error=>{
            // anything outside the status code 2xx range
            if(error.response){
                console.log('Error Response: ' + error.repsonse);
            }
            // Request made with no response
            else if(error.request){
                console.log('Error Request: ' + error.request);
            }
            // Any other error
            else{
                console.log('Error Message: ' + error.message);
            }
        } 
    )
}