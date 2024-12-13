import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8080";

function App() {
  const [data, setData] = useState<string>("");

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const response = await fetch(API_URL);
      const { data } = await response.json();
      setData(data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const updateData = async () => {
    try {
      await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ data }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      await getData();
      console.log("Updated data successfully")
    } catch (error) {
      console.error("Failed to update data:", error);
    }
  };

  // Send corrupted data to the server
  const corruptData = async () => {
    try {
      await fetch(`${API_URL}/corrupt`, {
        method: "POST",
        body: JSON.stringify({ data: "Corrupted Data" }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      await getData();
    } catch (error) {
      console.error("Failed to corrupt data:", error);
    }
  };

  const verifyData = async () => {
    try {
      const response = await fetch(`${API_URL}/verify`, {
        method: "POST",
        body: JSON.stringify({ data }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const { valid } = await response.json();
      if (valid) {
        alert("✅ Data is valid. No tampering detected.");
      } else {
        alert("❌ Tampering detected! Data may have been altered.");
      }
    } catch (error) {
      console.error("Verification failed:", error);
    }
  };

  return (
    <div
    style={{
      width: "100vw",
      height: "100vh",
      display: "flex",
      position: "absolute",
      padding: 0,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      gap: "20px",
      fontSize: "30px",
    }}
  >
    <div>Saved Data</div>
    <input
      style={{ fontSize: "30px" }}
      type="text"
      value={data}
      onChange={(e) => setData(e.target.value)}
    />

    <div style={{ display: "flex", gap: "10px" }}>
      <button style={{ fontSize: "20px" }} onClick={updateData}>
        Update Data
      </button>
      <button style={{ fontSize: "20px" }} onClick={corruptData}>
          Corrupt Data
        </button>
      <button style={{ fontSize: "20px" }} onClick={verifyData}>
        Verify Data
      </button>
    </div>
  </div>
  );
}

export default App;
