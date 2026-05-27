import { useEffect, useMemo, useState } from "react";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

function App() {

  const [difficulty, setDifficulty] =
    useState("easy");

  const [region, setRegion] =
    useState("all");

  const [quizType, setQuizType] =
    useState("towns");

  const [gameStarted, setGameStarted] =
    useState(false);

  const [towns, setTowns] =
    useState(null);

  const [roads, setRoads] =
    useState(null);

  const [landmarks, setLandmarks] =
    useState(null);

  const [target, setTarget] =
    useState(null);

  const [completedItems, setCompletedItems] =
    useState([]);

  const [wrongCount, setWrongCount] =
    useState(0);

  const [message, setMessage] =
    useState("");

  useEffect(() => {

    if (!gameStarted) return;

    async function loadData() {

      const townRes = await fetch(
        `/li_towns_${difficulty}.geojson`
      );

      const townData = await townRes.json();

      let filteredTowns =
        townData.features;

      if (region === "nassau") {

        filteredTowns =
          filteredTowns.filter(
            f =>
              f.properties.county_name
                === "Nassau"
          );

      } else if (
        region === "suffolk"
      ) {

        filteredTowns =
          filteredTowns.filter(
            f =>
              f.properties.county_name
                === "Suffolk"
          );

      }

      const filteredTownData = {
        ...townData,
        features: filteredTowns
      };

      const roadRes = await fetch(
        "/li_roads.geojson"
      );

      const roadData =
        await roadRes.json();

      const landmarkRes = await fetch(
        "/li_landmarks.geojson"
      );

      const landmarkData =
        await landmarkRes.json();

      setTowns(filteredTownData);
      setRoads(roadData);
      setLandmarks(landmarkData);

      setCompletedItems([]);
      setWrongCount(0);
      setMessage("");

      let firstTarget = null;

      if (quizType === "towns") {

        firstTarget =
          filteredTownData.features[
            Date.now() %
              filteredTownData.features
                .length
          ].properties.town_name;

      } else if (
        quizType === "roads"
      ) {

        firstTarget =
          roadData.features[
            Date.now() %
              roadData.features.length
          ].properties.name;

      } else {

        firstTarget =
          landmarkData.features[
            Date.now() %
              landmarkData.features.length
          ].properties.name;

      }

      setTarget(firstTarget);

    }

    loadData();

  }, [
    difficulty,
    region,
    quizType,
    gameStarted
  ]);

  function getCurrentFeatures() {

    if (quizType === "towns") {
      return towns?.features || [];
    }

    if (quizType === "roads") {
      return roads?.features || [];
    }

    return landmarks?.features || [];
  }

  function getFeatureName(feature) {

    if (quizType === "towns") {
      return feature.properties.town_name;
    }

    return feature.properties.name;
  }

  function pickRandomItem(features) {

    const remaining = features.filter(
      f =>
        !completedItems.includes(
          getFeatureName(f)
        )
    );

    if (remaining.length === 0) {

      setMessage(
        "You completed the quiz!"
      );

      return null;
    }

    const index =
      Date.now() % remaining.length;

    return getFeatureName(
      remaining[index]
    );
  }

  function handleCorrect(clicked) {

    setMessage("Correct!");

    setCompletedItems(prev => [
      ...prev,
      clicked
    ]);

    const nextTarget =
      pickRandomItem(
        getCurrentFeatures()
      );

    setTarget(nextTarget);

    setWrongCount(0);
  }

  function handleWrong(clicked) {

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
            width: "340px",
            textAlign: "center"
          }}
        >

          <h1>
            Long Island Geo Quiz
          </h1>

          <div
            style={{
              marginTop: "30px",
              marginBottom: "30px"
            }}
          >

            <h3>Quiz Type</h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}
            >

              <button
                onClick={() =>
                  setQuizType("towns")
                }
                style={{
                  padding: "10px",
                  border: "none",
                  borderRadius: "8px",
                  background:
                    quizType === "towns"
                      ? "#4caf50"
                      : "#ddd",
                  color:
                    quizType === "towns"
                      ? "white"
                      : "black",
                  cursor: "pointer"
                }}
              >
                Towns
              </button>

              <button
                onClick={() =>
                  setQuizType("roads")
                }
                style={{
                  padding: "10px",
                  border: "none",
                  borderRadius: "8px",
                  background:
                    quizType === "roads"
                      ? "#ff9800"
                      : "#ddd",
                  color:
                    quizType === "roads"
                      ? "white"
                      : "black",
                  cursor: "pointer"
                }}
              >
                Roads
              </button>

              <button
                onClick={() =>
                  setQuizType("landmarks")
                }
                style={{
                  padding: "10px",
                  border: "none",
                  borderRadius: "8px",
                  background:
                    quizType ===
                    "landmarks"
                      ? "#e26a6a"
                      : "#ddd",
                  color:
                    quizType ===
                    "landmarks"
                      ? "white"
                      : "black",
                  cursor: "pointer"
                }}
              >
                Landmarks
              </button>

            </div>

          </div>

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
                    difficulty ===
                    "medium"
                      ? "#ff9800"
                      : "#ddd",
                  color:
                    difficulty ===
                    "medium"
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

  const currentFeatures =
    getCurrentFeatures();

  return (

    <>

      {/* Target Box */}
      <div
        style={{
          position: "absolute",
          zIndex: 1000,
          top: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "white",
          padding: "12px 24px",
          borderRadius: "10px",
          fontSize: "24px",
          fontWeight: "bold",
          boxShadow:
            "0 0 10px rgba(0,0,0,0.2)"
        }}
      >

        {target
          ? `Find: ${target}`
          : "Finished!"}

      </div>

      {/* Message */}
      <div
        style={{
          position: "absolute",
          zIndex: 1000,
          bottom: "210px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "white",
          padding: "8px 18px",
          borderRadius: "8px",
          fontWeight: "bold",
          boxShadow:
            "0 0 10px rgba(0,0,0,0.2)"
        }}
      >
        {message}
      </div>

      {/* Scrollable List */}
      <div
        style={{
          position: "absolute",
          zIndex: 1000,
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "92%",
          maxHeight: "180px",
          overflowY: "auto",
          background: "white",
          borderRadius: "10px",
          padding: "10px",
          boxShadow:
            "0 0 10px rgba(0,0,0,0.2)"
        }}
      >

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "6px",
            fontSize: "14px",
            textAlign: "center"
          }}
        >

          {[...currentFeatures]
            .sort((a, b) =>
              getFeatureName(a)
                .localeCompare(
                  getFeatureName(b)
                )
            )
            .map(feature => {

              const name =
                getFeatureName(feature);

              const completed =
                completedItems.includes(
                  name
                );

              return (

                <div
                  key={name}
                  style={{
                    color:
                      completed
                        ? "green"
                        : "black",
                    fontWeight:
                      completed
                        ? "bold"
                        : "normal"
                  }}
                >
                  {name}
                </div>

              );

            })}

        </div>

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

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />

        {/* Towns */}
        {towns && (
          <GeoJSON
            data={towns}
            style={feature => {

              const townName =
                feature.properties
                  .town_name;

              const isCorrect =
                quizType === "towns"
                &&
                townName
                  .toLowerCase()
                  .trim()
                ===
                target
                  ?.toLowerCase()
                  .trim();

              const completed =
                completedItems.includes(
                  townName
                );

              return {
                fillColor:
                  completed
                    ? "green"
                    : feature.properties
                        .county_name
                      === "Nassau"
                    ? "#4a90e2"
                    : "#e26a6a",
                fillOpacity:
                  completed
                    ? 0.7
                    : 0.35,
                color:
                  isCorrect
                  && wrongCount >= 3
                    ? "yellow"
                    : "black",
                weight:
                  isCorrect
                  && wrongCount >= 3
                    ? 4
                    : 1
              };

            }}
            onEachFeature={(
              feature,
              layer
            ) => {

              if (
                quizType !== "towns"
              ) return;

              layer.on({

                click: () => {

                  const clicked =
                    feature.properties
                      .town_name;

                  if (
                    clicked
                      .toLowerCase()
                      .trim()
                    ===
                    target
                      .toLowerCase()
                      .trim()
                  ) {

                    handleCorrect(clicked);

                  } else {

                    handleWrong(clicked);

                  }

                }

              });

            }}
          />
        )}


          {/* Town Labels During Roads / Landmarks */}
          {towns
            && quizType !== "towns"
            && towns.features.map(
              feature => {
          
                const geoLayer =
                  L.geoJSON(feature);
          
                const bounds =
                  geoLayer.getBounds();
          
                if (!bounds.isValid()) {
                  return null;
                }
          
                const center =
                  bounds.getCenter();
          
                return (
          
                <Marker
                  key={
                    feature.properties
                      .town_name
                  }
                  position={center}
                  icon={L.divIcon({
                    className: "town-label-div",
                    html: `
                      <div
                        style="
                          font-size: 0.7vw;
                          font-weight: bold;
                          color: black;
                          white-space: nowrap;
                          text-shadow:
                            1px 1px 2px white,
                            -1px -1px 2px white;
                          transform: translate(-50%, -50%);
                          pointer-events: none;
                        "
                      >
                        ${feature.properties.town_name}
                      </div>
                    `,
                    iconSize: [0, 0]
                  })}
                />
                    
                );
          
              }
            )}

          {/* Roads */}
            {roads && (
              <>
              
                <GeoJSON
                  data={roads}
                  style={feature => {
            
                    const roadName =
                      feature.properties.name;
            
                    const isCorrect =
                      quizType === "roads"
                      &&
                      roadName
                        .toLowerCase()
                        .trim()
                      ===
                      target
                        ?.toLowerCase()
                        .trim();
            
                    const completed =
                      completedItems.includes(
                        roadName
                      );
            
                    return {
                      color:
                        completed
                          ? "green"
                          : isCorrect
                          && wrongCount >= 3
                          ? "yellow"
                          : "#333",
                      weight:
                        completed
                          ? 6
                          : isCorrect
                          && wrongCount >= 3
                          ? 8
                          : 4,
                      opacity: 0.9
                    };
            
                  }}
                  onEachFeature={(
                    feature,
                    layer
                  ) => {
            
                    const roadName =
                      feature.properties.name;
            
                    if (
                      quizType !== "roads"
                    ) return;
            
                    layer.on({
            
                      click: () => {
            
                        if (
                          roadName
                            .toLowerCase()
                            .trim()
                          ===
                          target
                            .toLowerCase()
                            .trim()
                        ) {
            
                          handleCorrect(
                            roadName
                          );
            
                        } else {
            
                          handleWrong(
                            roadName
                          );
            
                        }
            
                      }
            
                    });
            
                  }}
                />
            
                {/* Road Labels During Town Quiz */}
                {quizType === "towns"
                  && roads.features.map(
                    feature => {
            
                      const roadName =
                        feature.properties.name;
            
                      const coords =
                        feature.geometry.coordinates;
            
                      let center;
            
                      if (
                        Array.isArray(coords[0][0])
                      ) {
            
                        const line =
                          coords[0];
            
                        center =
                          line[
                            Math.floor(
                              line.length / 2
                            )
                          ];
            
                      } else {
            
                        center =
                          coords[
                            Math.floor(
                              coords.length / 2
                            )
                          ];
            
                      }
            
                      return (
            
                        <Marker
                          key={roadName}
                          position={[
                            center[1],
                            center[0]
                          ]}
                          interactive={false}
                          icon={L.divIcon({
                            className:
                              "road-name-marker",
                            html: `
                              <div style="
                                font-size: 0.55vw;
                                font-weight: bold;
                                color: #222;
                                white-space: nowrap;
                                text-shadow:
                                  1px 1px 2px white,
                                  -1px -1px 2px white;
                                pointer-events: none;
                              ">
                                ${roadName}
                              </div>
                            `,
                            iconSize: [0, 0]
                          })}
                        />
            
                      );
            
                    }
                  )}
            
              </>
            )}

        {/* Landmarks */}
        {landmarks
          && quizType ===
          "landmarks"
          && landmarks.features.map(
            feature => {

              const coords =
                feature.geometry
                  .coordinates;

              const landmarkName =
                feature.properties.name;

              const completed =
                completedItems.includes(
                  landmarkName
                );

              return (

                <Marker
                  key={landmarkName}
                  position={[
                    coords[1],
                    coords[0]
                  ]}
                  eventHandlers={{
                    click: () => {

                      if (
                        landmarkName
                          .toLowerCase()
                          .trim()
                        ===
                        target
                          .toLowerCase()
                          .trim()
                      ) {

                        handleCorrect(
                          landmarkName
                        );

                      } else {

                        handleWrong(
                          landmarkName
                        );

                      }

                    }
                  }}
                >

                  <Popup>
                    <strong>
                      {landmarkName}
                    </strong>
                  </Popup>


                </Marker>

              );

            }
          )}

      </MapContainer>

    </>

  );
}

export default App;