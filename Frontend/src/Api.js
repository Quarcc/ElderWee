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
                console.log('Error Response: ' + error.response);
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

export async function getLogs(){
    try{

        let res = await fetch(`http://${APIEndPoint}/api/accountlogs`);
        let data = await res.json();
        return data;

    }
    catch(error){
        error=>{
            // anything outside the status code 2xx range
            if(error.response){
                console.log('Error Response: ' + error.response);
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

export async function getAllUsers(){
        try {
          let res = await fetch(`http://${APIEndPoint}/api/users`);
          let data = await res.json();
          return data;
        } catch (error) {
          (error) => {
            // anything outside the status code 2xx range
            if (error.response) {
              console.log("Error Response: " + error.response);
            }
            // Request made with no response
            else if (error.request) {
              console.log("Error Request: " + error.request);
            }
            // Any other error
            else {
              console.log("Error Message: " + error.message);
            }
          };
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

export async function retrieveAccountDetailsWithEmail(email){
    try{
        let userRes = await fetch(`http://localhost:8000/api/users/email/${email}`);
        let data = await userRes.json();
        
        let userID = data.UserID;
        let res = await fetch(
          `http://localhost:8000/api/accounts/userid/${userID}`
        );
        data = await res.json();
        return data;
    }catch(error){
        (error) => {
          // anything outside the status code 2xx range
          if (error.response) {
            console.log("Error Response: " + error.repsonse);
          }
          // Request made with no response
          else if (error.request) {
            console.log("Error Request: " + error.request);
          }
          // Any other error
          else {
            console.log("Error Message: " + error.message);
          }
        }; 
    }
}

export async function getCountry(coords){
  let lat = coords.latitude ? coords.latitude : coords.lat;
  let lng = coords.longitude ? coords.longitude: coords.lng;
  const apiKey = process.env.REACT_APP_GMAPSAPIKEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${apiKey}`;
  try {
    let res = await fetch(url);
    
    const results = await res.json();
    let country = "NIL"
    //console.log("COUNTRY RESULTS:", results, coords);

    results.results.forEach((address)=>{
      //console.log(address);
      if(address.types.includes("country")){
        console.log("INCLUDES");
        country = address.formatted_address;
      }
    });

    return country;
  } catch (error) {
    console.error("Error getting country name:", error);
    return error;
  }
}
