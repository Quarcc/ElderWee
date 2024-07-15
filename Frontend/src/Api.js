import axios from 'axios';

const APIEndPoint = 'localhost:8000';

// Example
export async function getAllAccounts(){ 
    try{
        let res = await fetch(`http://${APIEndPoint}/api/accounts`);
        let data = await res.json();
        return data;
    }
    catch(error){
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
    }
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

