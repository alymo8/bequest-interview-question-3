import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8080";

function App() {
  const [data, setData] = useState<string>("");

  useEffect(() => {
    getData();
  }, []);

  // Fetch all replica data
  const getData = async () => {
    try {
      const response = await fetch(`${API_URL}/`);
      const { replicas } = await response.json();
      setData(replicas[0].data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  // Update data on all replicas
  const updateData = async () => {
    try {
      await fetch(`${API_URL}/`, {
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

  // Corrupt one replica's data
  const corruptData = async () => {
    try {
      await fetch(`${API_URL}/corrupt`, {
        method: "POST",
        body: JSON.stringify({ id: 2, data: "Corrupted Data" }),
        headers: { 'Content-Type': 'application/json' },
      });
      await getData();
    } catch (error) {
      console.error("Failed to corrupt data:", error);
    }
  };

  // Restore data from majority consensus
  const restoreData = async () => {
    try {
      await fetch(`${API_URL}/restore`, { method: "POST" });
      await getData();
    } catch (error) {
      console.error("Failed to restore data:", error);
    }
  };

  // Verify if the replicas have been tampered with
  const verifyData = async () => {
    try {
      const response = await fetch(`${API_URL}/verify`);
      const result = await response.json();

      if (result.message === "All replicas are valid") {
        alert("✅ All replicas are valid. No tampering detected.");
      } else if (result.corruptReplicas && result.corruptReplicas.length > 0) {
        const corruptedIds = result.corruptReplicas.map((replica) => `ID: ${replica.id}`).join(", ");
        alert(`❌ Tampering detected in the following replicas: ${corruptedIds}`);
      } else {
        alert("⚠️ Verification result unknown.");
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
      <button style={{ fontSize: "20px" }} onClick={restoreData}>
        Restore Data
      </button>
    </div>
  </div>
  );
}

export default App;
