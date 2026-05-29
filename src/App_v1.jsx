import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

function App() {

  const [towns, setTowns] = useState(null);

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

  const [region, setRegion] =
    useState("all");

  const [gameStarted, setGameStarted] =
    useState(false);

  useEffect(() => {

    if (!gameStarted) return;

    fetch(`/li_towns_${difficulty}.geojson`)
      .then(res => res.json())
      .then(data => {

        let filteredFeatures =
          data.features;

        if (region === "nassau") {

          filteredFeatures =
            data.features.filter(
              f =>
                f.properties.county_name
                  === "Nassau"
            );

        } else if (
          region === "suffolk"
        ) {

          filteredFeatures =
            data.features.filter(
              f =>
                f.properties.county_name
                  === "Suffolk"
            );

        }

        const filteredData = {
          ...data,
          features: filteredFeatures
        };

        setTowns(filteredData);

        setCompletedTowns([]);
        setWrongCount(0);
        setMessage("");

        const seed = Date.now();

        const index =
          seed % filteredFeatures.length;

        const randomTown =
          filteredFeatures[index]
            .properties
            .town_name;

        setTargetTown(randomTown);

      });

  }, [difficulty, region, gameStarted]);

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

  if (!gameStarted) {

    return (

      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f5f5f5"
        }}
      >

        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "16px",
            boxShadow:
              "0 0 20px rgba(0,0,0,0.15)",
            width: "320px",
            textAlign: "center"
          }}
        >

          <h1
            style={{
              marginBottom: "30px"
            }}
          >
            Long Island Town Quiz
          </h1>

          <div
            style={{
              marginBottom: "25px"
            }}
          >

            <h3>Choose Region</h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}
            >

              <button
                onClick={() =>
                  setRegion("nassau")
                }
                style={{
                  background:
                    region === "nassau"
                      ? "#4a90e2"
                      : "#ddd",
                  color:
                    region === "nassau"
                      ? "white"
                      : "black",
                  padding: "10px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                Nassau
              </button>

              <button
                onClick={() =>
                  setRegion("suffolk")
                }
                style={{
                  background:
                    region === "suffolk"
                      ? "#e26a6a"
                      : "#ddd",
                  color:
                    region === "suffolk"
                      ? "white"
                      : "black",
                  padding: "10px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                Suffolk
              </button>

              <button
                onClick={() =>
                  setRegion("all")
                }
                style={{
                  background:
                    region === "all"
                      ? "#666"
                      : "#ddd",
                  color:
                    region === "all"
                      ? "white"
                      : "black",
                  padding: "10px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                All Long Island
              </button>

            </div>

          </div>

          <div
            style={{
              marginBottom: "30px"
            }}
          >

            <h3>Choose Difficulty</h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}
            >

              <button
                onClick={() =>
                  setDifficulty("easy")
                }
                style={{
                  background:
                    difficulty === "easy"
                      ? "#4caf50"
                      : "#ddd",
                  color:
                    difficulty === "easy"
                      ? "white"
                      : "black",
                  padding: "10px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                Easy
              </button>

              <button
                onClick={() =>
                  setDifficulty("medium")
                }
                style={{
                  background:
                    difficulty === "medium"
                      ? "#ff9800"
                      : "#ddd",
                  color:
                    difficulty === "medium"
                      ? "white"
                      : "black",
                  padding: "10px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                Medium
              </button>

              <button
                onClick={() =>
                  setDifficulty("hard")
                }
                style={{
                  background:
                    difficulty === "hard"
                      ? "#f44336"
                      : "#ddd",
                  color:
                    difficulty === "hard"
                      ? "white"
                      : "black",
                  padding: "10px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                Hard
              </button>

            </div>

          </div>

          <button
            onClick={() =>
              setGameStarted(true)
            }
            style={{
              padding: "14px 24px",
              fontSize: "18px",
              border: "none",
              borderRadius: "10px",
              background: "#222",
              color: "white",
              cursor: "pointer",
              width: "100%"
            }}
          >
            Start Game
          </button>

        </div>

      </div>

    );
  }

  return (
    <>

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
          boxShadow:
            "0 0 10px rgba(0,0,0,0.2)"
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
          : "Finished!"}

      </div>

      {/* Message Box */}
      <div
        style={{
          position: "absolute",
          zIndex: 1000,
          background: "white",
          padding: "8px 16px",
          bottom: "210px",
          left: "50%",
          transform: "translateX(-50%)",
          borderRadius: "8px",
          boxShadow:
            "0 0 10px rgba(0,0,0,0.2)",
          fontWeight: "bold",
          fontSize: "18px"
        }}
      >
        {message}
      </div>

      <MapContainer
        key={`${difficulty}-${region}`}
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
            key={`${difficulty}-${region}-${targetTown}-${wrongCount}`}
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

                    : wrongCount >= 3 &&
                      isCorrectTown
                    ? "yellow"

                    : feature.properties
                        .county_name
                        === "Nassau"
                    ? "#4a90e2"
                    : "#e26a6a",

                color: "black",

                weight:
                  wrongCount >= 3 &&
                  isCorrectTown
                    ? 4
                    : 1,

                fillOpacity:
                  isCompleted
                    ? 0.7
                    : wrongCount >= 3 &&
                      isCorrectTown
                    ? 0.8
                    : 0.4

              };

            }}

            onEachFeature={(feature, layer) => {

              layer.on({

                click: () => {

                  const clicked =
                    feature.properties
                      .town_name;

                  if (
                    clicked.trim().toLowerCase()
                    ===
                    targetTown
                      .trim()
                      .toLowerCase()
                  ) {

                    setMessage("Correct!");

                    setCompletedTowns(prev => [
                      ...prev,
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

                    setWrongCount(
                      newWrongCount
                    );

                    if (
                      newWrongCount >= 3
                    ) {

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

      </MapContainer>

    </>
  );
}

export default App;