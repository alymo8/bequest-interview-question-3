import express from "express";
import cors from "cors";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

const PORT = 8080;
const database = { data: "Hello World", hmac: "" };

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  throw new Error('SECRET_KEY is not defined. Please set it in your .env file.');
}

const app = express();

app.use(cors());
app.use(express.json());

// Rate limiter to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use(limiter);

// generate HMAC (Hash-based Message Authentication Code)
const generateHMAC = (data: crypto.BinaryLike) => {
  return crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
};

// Initialize the HMAC when the server starts
database.hmac = generateHMAC(database.data);

// Get the data (only data, not HMAC)
app.get("/", (req, res) => {
  res.json({ data: database.data });
});

// Update data (recompute HMAC on the server)
app.post("/", (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: "Data is required" });
  
  database.data = data; // Update the data
  database.hmac = generateHMAC(database.data); // Recompute the HMAC
  res.json({ message: "Data updated successfully" });
});

// Verify if the data is valid (check if data matches stored HMAC)
app.post("/verify", (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: "Data is required" });

  const clientHMAC = generateHMAC(data);
  const isValid = clientHMAC === database.hmac;

  res.json({ valid: isValid });
});

// Corrupt the data (for testing purposes only)
app.post("/corrupt", (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: "Data is required" });

  database.data = data; // Corrupt the data (do not recompute HMAC)
  res.json({ message: "Data corrupted successfully", data: database.data });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
