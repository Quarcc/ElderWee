import axios from 'axios';

const APIEndPoint = 'localhost:8000';

// Example
async function getAll(){ 
    await axios.get(`https://${APIEndPoint}/getAll`).then(
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

export async function getAccountLog(accountNo){

    await axios(`LINK${variable}`).then(
        res=>{
            //error check      
            //?
            //return res.json()
            //:
            //return error msg
        }
    )

}

