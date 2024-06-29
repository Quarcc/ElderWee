import React, { useState } from 'react';

const GeolocationComponent = () => {



  const [location, setLocation] = useState(
    {
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null
  }
);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            error: null,
          });
        },
        (error) => {
          setLocation({
            latitude: null,
            longitude: null,
            accuracy: null,
            error: error.message
          });
        }
      );
    } else {
      setLocation({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: "Geolocation is not supported by this browser."
      });
    }
  };

  return (
    <div className="container">
        {acc ? <Profile acc={acc} anything={123}/> : <Landing/>}
      <h1>Geolocation API Example</h1>
      <button onClick={getLocation}>Get Location</button>
      <div id="locationInfo">
        {location.error ? (
          <p>{location.error}</p>
        ) : (
          <>
            <p>Latitude: {location.latitude}</p>
            <p>Longitude: {location.longitude}</p>
            <p>Accuracy: {location.accuracy} meters</p>
          </>
        )}
      </div>
    </div>
  );
};

export default GeolocationComponent;
