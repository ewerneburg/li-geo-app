import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

function App() {

  const [towns, setTowns] = useState(null);
  const [roads, setRoads] = useState(null);

  const [targetTown, setTargetTown] =
    useState(null);
  const [wrongCount, setWrongCount] =
    useState(0);
  const [message, setMessage] =
    useState("");
  const [completedTowns, setCompletedTowns] =
    useState([]);

  useEffect(() => {

    fetch("/li_towns.geojson")
      .then(res => res.json())
      .then(data => {
    
        setTowns(data);
    
        const randomTown =
          pickRandomTown(data.features);
    
        setTargetTown(randomTown);
    
      });

    //fetch("/li_roads.geojson")
    //  .then(res => res.json())
    //  .then(data => setRoads(data));

  }, []);

    function pickRandomTown(features) {

          const remaining = features.filter(f =>
        
            !completedTowns.includes(
              f.properties.town_name
            )
        
          );

          if (remaining.length === 0) {
            
              setMessage(
                "You completed Long Island!"
              );
            
              return null;
            }
        
          const seed = Date.now();
        
          const index =
            seed % remaining.length;
        
          return remaining[index]
            .properties
            .town_name;
        }

  return (
    <>

      <div
        style={{
          position: "absolute",
          zIndex: 1000,
          background: "white",
          padding: "10px",
          top: "80px",
          left: "10px"
        }}
      >
        {targetTown
          ? `Find: ${targetTown}`
          : "Finished!"
        }
      </div>

      <MapContainer
        center={[40.8, -73.2]}
        zoom={9}
        zoomControl={false}
        style={{
          height: "100vh",
          width: "100vw"
        }}
      >
      <div
        style={{
          position: "absolute",
          zIndex: 1000,
          background: "white",
          padding: "10px",
          top: "130px",
          left: "10px",
          minWidth: "220px"
        }}
      >
        {message}
      </div>

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />

        {towns && (
          <GeoJSON
            key={`${targetTown}-${wrongCount}`}
            data={towns}

            style={(feature) => {
                
                  const townName =
                    feature.properties
                      .town_name;
                
                  const isCorrectTown =
                
                    townName
                      .trim()
                      .toLowerCase()
                
                    ===
                
                    targetTown
                      ?.trim()
                      .toLowerCase();
                
                  const isCompleted =
                
                    completedTowns.includes(
                      townName
                    );
                
                  return {
                
                    fillColor:
                
                      isCompleted
                        ? "green"
                
                      : wrongCount >= 3 && isCorrectTown
                        ? "yellow"
                
                        : "#3388ff",
                
                    color: "black",
                
                    weight:
                      wrongCount >= 3 && isCorrectTown
                        ? 4
                        : 1,
                
                    fillOpacity:
                      isCompleted
                        ? 0.7
                      : wrongCount >= 3 && isCorrectTown
                        ? 0.8
                        : 0.4
                
                  };
                
                }}

            onEachFeature={(feature, layer) => {

              layer.on({

                click: () => {

                    const clicked =
                      feature.properties.town_name;
                    
                    if (
                      clicked.trim().toLowerCase()
                      ===
                      targetTown.trim().toLowerCase()
                    ) {
                    
                      setMessage("Correct!");
                    
                      const randomTown =
                        pickRandomTown(
                          towns.features
                        );
                    
                      setTargetTown(randomTown);

                      setCompletedTowns([
                                         ...completedTowns,
                                         clicked
                                       ]);
                      setWrongCount(0);
                    
                    } else {
                    
                      const newWrongCount =
                        wrongCount + 1;
                    
                      setWrongCount(newWrongCount);
                    
                      if (newWrongCount >= 3) {
                    
                        setMessage(
                                  `Wrong! You clicked ${clicked}. Highlighting answer.`
                                );
                    
                      } else {
                    
                        setMessage(
                                  `Wrong! You clicked ${clicked}`
                                 );
                    
                      }

}

                }

              });

            }}
          />
        )}

        {roads && (
          <GeoJSON
            data={roads}
            style={{
              color: "red",
              weight: 4
            }}
          />
        )}

      </MapContainer>

    </>
  );
}

export default App;
