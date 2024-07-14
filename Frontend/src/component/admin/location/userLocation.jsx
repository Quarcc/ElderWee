import React, {useState, useEffect,useMemo, useRef} from 'react';
import Map from "./googleMap.jsx";
import {GoogleMap,useLoadScript } from "@react-google-maps/api"

function UserLocation(){

    const center = {
      lat: -3.745,
      lng: -38.523,
    };

    //replace with .env vars    
    const {isLoaded} = useLoadScript({
        googleMapsApiKey : "AIzaSyBvZRQzQxY9N6RLgT1ePYC95-3Dmpq_Ul0",
        libraries : ["places"],
        mapIds:[]
    });



    let GeoCoder;

    GeoCoder = useMemo(()=> (isLoaded ? new window.google.maps.Geocoder() : undefined),[isLoaded]);
    
    return(
            <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={8}
      center={center}
    />
    )
}

export default UserLocation;
