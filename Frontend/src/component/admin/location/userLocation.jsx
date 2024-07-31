import React, {useState,useEffect} from 'react';
import AdminNavBar from "../navbar/adminNavbar";
import '../css/adminNavbar.css';
import {GoogleMap,useLoadScript,Circle,Marker } from "@react-google-maps/api"
import { useLocation } from 'react-router-dom';
import AccountLogTable from './accountLogTable';
import '../css/geolocation.css';

function UserLocation(){
  const mapContainerStyle = {
    width: "40vw",
    height: "40vh",
  };

  const location = useLocation()

  const [logs, setLogs] = useState(location.state.AccountLogs);

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
          if (JSON.parse(record.LoginTime) > JSON.parse(latestRecord.LoginTime)) {
              latestRecord = record;
          }
      });
      
      let coords = JSON.parse(latestRecord.LoginCoords);
      if(coords.latitude){
        coords = {
          lat:coords.latitude,
          lng:coords.longitude
        }
      }
      setCenter(coords);

      return latestRecord;
    }
    getLatestRecord(logs);
  },[])

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBvZRQzQxY9N6RLgT1ePYC95-3Dmpq_Ul0",
    libraries,
  });

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div className='container-fluid'>
      <div className=""> 
        <AdminNavBar/>
      </div>
      <div className='location-bg'>
        <div className='row mb-5 p-3'>
            {/* Account Number */}
        </div>
        <div className='row mb-5 p-3 d-flex'>
          <div className='col'>
            <table></table>
          </div>
          <div className='col'>
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
          <div>
            <AccountLogTable logs={logs}/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserLocation;
