import React,{useEffect, useState} from 'react';

const Map = (props) =>{
    useEffect(()=>{
        const initMap = async () =>{
            const { GMAP } = await windows.google.maps.importLibrary("maps");
            const { AdvancedMarkerElement, PinElement } =
            await window.google.maps.importLibrary("marker");

            const map = new GMAP(mapRef.current, {
                center:{ lat: -33.860664, lng: 151.208138 },
                zoom: 18,
                mapId: map_id,
                disableDefaultUI: true,
                clickableIcons: false,
            });
        }
        initMap();
    },[]);

    return (
        <div className="h-[40vh] w-[40vw] z-0">
            <div id="map-view" className="h-[40vh] w-[40vh]" ref={mapRef}></div>
        </div>
    );
}

export default Map;
