import React, {useState,useEffect} from 'react';
import AdminNavBar from "../navbar/adminNavbar";
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
        "LoginTime": "2024-07-12 08:23:45",
        "LoginCoords": "{\"lat\": 1.358742, \"lng\": 103.825463}"
    },
    {
        "AccountNo": "ACC00001",
        "LoginTime": "2024-07-10 14:45:21",
        "LoginCoords": "{\"lat\": 1.352134, \"lng\": 103.810125}"
    },
    {
        "AccountNo": "ACC00001",
        "LoginTime": "2024-07-09 18:15:32",
        "LoginCoords": "{\"lat\": 1.359762, \"lng\": 103.819245}"
    },
    {
        "AccountNo": "ACC00002",
        "LoginTime": "2024-07-11 09:34:56",
        "LoginCoords": "{\"lat\": 1.361235, \"lng\": 103.821478}"
    },
    {
        "AccountNo": "ACC00002",
        "LoginTime": "2024-07-08 12:56:43",
        "LoginCoords": "{\"lat\": 1.355128, \"lng\": 103.828451}"
    },
    {
        "AccountNo": "ACC00002",
        "LoginTime": "2024-07-06 16:12:14",
        "LoginCoords": "{\"lat\": 1.358874, \"lng\": 103.818346}"
    },
    {
        "AccountNo": "ACC00003",
        "LoginTime": "2024-07-13 11:23:12",
        "LoginCoords": "{\"lat\": 1.357832, \"lng\": 103.824572}"
    },
    {
        "AccountNo": "ACC00003",
        "LoginTime": "2024-07-10 15:46:32",
        "LoginCoords": "{\"lat\": 1.359123, \"lng\": 103.820789}"
    },
    {
        "AccountNo": "ACC00003",
        "LoginTime": "2024-07-07 13:56:45",
        "LoginCoords": "{\"lat\": 1.353567, \"lng\": 103.825467}"
    },
    {
        "AccountNo": "ACC00004",
        "LoginTime": "2024-07-12 10:14:56",
        "LoginCoords": "{\"lat\": 1.354562, \"lng\": 103.822354}"
    },
    {
        "AccountNo": "ACC00004",
        "LoginTime": "2024-07-08 14:32:45",
        "LoginCoords": "{\"lat\": 1.357894, \"lng\": 103.826781}"
    },
    {
        "AccountNo": "ACC00004",
        "LoginTime": "2024-07-05 17:21:12",
        "LoginCoords": "{\"lat\": 1.356732, \"lng\": 103.819123}"
    },
    {
        "AccountNo": "ACC00005",
        "LoginTime": "2024-07-11 08:45:23",
        "LoginCoords": "{\"lat\": 1.353672, \"lng\": 103.821987}"
    },
    {
        "AccountNo": "ACC00005",
        "LoginTime": "2024-07-09 12:56:32",
        "LoginCoords": "{\"lat\": 1.355892, \"lng\": 103.820345}"
    },
    {
        "AccountNo": "ACC00005",
        "LoginTime": "2024-07-07 16:23:45",
        "LoginCoords": "{\"lat\": 1.358342, \"lng\": 103.827612}"
    }
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
    <div className=''>
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

  );
}

export default UserLocation;
