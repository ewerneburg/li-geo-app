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

  const [difficulty, setDifficulty] =
    useState("easy");

  useEffect(() => {

    fetch(`/li_towns_${difficulty}.geojson`)
      .then(res => res.json())
      .then(data => {

        setTowns(data);

        setCompletedTowns([]);
        setWrongCount(0);
        setMessage("");

        const seed = Date.now();

        const index =
          seed % data.features.length;
        
        const randomTown =
          data.features[index]
            .properties
            .town_name;
        
        setTargetTown(randomTown);

      });

    // fetch("/li_roads.geojson")
    //   .then(res => res.json())
    //   .then(data => setRoads(data));

  }, [difficulty]);

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

      {/* Difficulty Buttons */}
      <div
        style={{
          position: "absolute",
          zIndex: 1000,
          background: "white",
          padding: "10px",
          top: "10px",
          left: "10px",
          display: "flex",
          gap: "10px",
          borderRadius: "8px"
        }}
      >

        <button
          onClick={() =>
            setDifficulty("easy")
          }
        >
          Easy
        </button>

        <button
          onClick={() =>
            setDifficulty("medium")
          }
        >
          Medium
        </button>

        <button
          onClick={() =>
            setDifficulty("hard")
          }
        >
          Hard
        </button>

      </div>

      {/* Town List */}
      <div
          style={{
            position: "absolute",
            zIndex: 1000,
            background: "white",
            padding: "10px",
            bottom: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "90%",
            maxHeight: "180px",
            overflowY: "auto",
            borderRadius: "8px",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)"
          }}
        >
        
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "6px",
              fontSize: "14px",
              textAlign: "center"
            }}
          >
        
            {towns &&
              [...towns.features]

                  .sort((a, b) =>
                
                    a.properties.town_name.localeCompare(
                      b.properties.town_name
                    )
                
                  )
                
                  .map(f => (
        
                <div
                  key={f.properties.town_name}
                  style={{
                    color:
                      completedTowns.includes(
                        f.properties.town_name
                      )
                        ? "green"
                        : "black",
        
                    fontWeight:
                      completedTowns.includes(
                        f.properties.town_name
                      )
                        ? "bold"
                        : "normal"
                  }}
                >
                  {f.properties.town_name}
                </div>
        
              ))
            }
        
          </div>
        
        </div>

      {/* Current Target */}
      <div
          style={{
              position: "absolute",
              zIndex: 1000,
              background: "white",
              padding: "10px 20px",
              top: "10px",
              left: "50%",
              transform: "translateX(-50%)",
              borderRadius: "8px",
              fontSize: "24px",
              fontWeight: "bold"
            }}
      >

        {targetTown
          ? `Find: ${targetTown}`
          : "Finished!"
        }

      </div>

      {/* Message Box */}
      <div
        style={{
          position: "absolute",
          zIndex: 1000,
          background: "white",
          padding: "10px",
          top: "380px",
          left: "10px",
          minWidth: "220px",
          borderRadius: "8px"
        }}
      >
        {message}
      </div>

      <MapContainer
        key={difficulty}
        center={[40.8, -73.2]}
        zoom={9}
        zoomControl={false}
        style={{
          height: "100vh",
          width: "100vw"
        }}
      >

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />

        {towns && (
          <GeoJSON
            key={`${difficulty}-${targetTown}-${wrongCount}`}
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

                    : feature.properties.county_name
                        === "Nassau"
                        ? "#4a90e2"
                        : "#e26a6a",

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

                    setCompletedTowns([
                      ...completedTowns,
                      clicked
                    ]);

                    const randomTown =
                      pickRandomTown(
                        towns.features
                      );

                    setTargetTown(randomTown);

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