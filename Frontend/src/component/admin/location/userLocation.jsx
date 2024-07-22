import React, {useState,useEffect} from 'react';
import AdminNavBar from "../navbar/adminNavbar";
import '../css/adminNavbar.css';
import {GoogleMap,useLoadScript,Circle,Marker } from "@react-google-maps/api"

function UserLocation(){
  const mapContainerStyle = {
    width: "40vw",
    height: "40vh",
  };

  const [center, setCenter] = useState(null);




//replace with api response from db
  const dummyData = [
    {
      "AccountNo": "ACC00001",  
      "LoginTime": "2024-07-10 14:45:21",
      "LoginCoords": "{\"lat\": 1.2494, \"lng\": 103.8303}"  // Sentosa
  },
    {
      "AccountNo": "ACC00001",
      "LoginTime": "2024-07-09 18:15:32",
      "LoginCoords": "{\"lat\": 10.8231, \"lng\": 106.6297}" // Vietnam
    },
    {
        "AccountNo": "ACC00001",
        "LoginTime": "2024-07-09 18:15:32",
        "LoginCoords": "{\"lat\": 1.359762, \"lng\": 103.819245}" // Thomson 
    },
    {
      "AccountNo": "ACC00001",
      "LoginTime": "2024-07-09 18:15:32",
      "LoginCoords": "{\"lat\": 66.761345, \"lng\": 124.123756}" // Russia
  },
  
  ]
  const libraries = ["places"];

  useEffect(()=>{
    function getLatestRecord(data) {
      if (data.length === 0) {
        setCenter(null);
          return null;
      }

      let latestRecord = data[0];

      data.forEach(record => {
          if (new Date(record.LoginTime) > new Date(latestRecord.LoginTime)) {
              latestRecord = record;
          }
      });

      let coords = JSON.parse(latestRecord.LoginCoords);
      
      setCenter(coords);

      return latestRecord;
    }
    getLatestRecord(dummyData);
  },[])

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBvZRQzQxY9N6RLgT1ePYC95-3Dmpq_Ul0",
    libraries,
  });

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div className='flex h-screen'>
      <div className="w-full"> 
        <AdminNavBar/>
      </div>
      <div className='container flex justify-center items-cente r w-2/5 ml-auto'>
        {center && (
        <GoogleMap mapContainerStyle={mapContainerStyle} zoom={14} center={center}>
            <Circle
              key={"circle"}
              center={center}
              radius={500}
              options={{
              strokeColor: "#ff0000",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "#ff0000",
              fillOpacity: 0.35,
              }}
            />
          <Marker position={center} title="Current Location" />
        </GoogleMap>)}
      </div>
    </div>
  );
}

export default UserLocation;
