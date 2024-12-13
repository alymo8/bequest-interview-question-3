import express, { Request, Response } from "express";
import cors from "cors";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

const PORT = 8080;
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

// Replica Type Definition
interface Replica {
  id: number;
  data: string;
  hash: string;
}

// Each replica has a copy of the data and its HMAC
const replicas: Replica[] = [
  { id: 1, data: "Hello World", hash: "" },
  { id: 2, data: "Hello World", hash: "" },
  { id: 3, data: "Hello World", hash: "" }
];

// Helper function to generate HMAC (Hash-based Message Authentication Code)
const generateHMAC = (data: crypto.BinaryLike): string => {
  return crypto.createHmac('sha256', SECRET_KEY as string).update(data).digest('hex');
};

// Initialize HMACs for all replicas
replicas.forEach(replica => {
  replica.hash = generateHMAC(replica.data);
});

// Get all replicas
app.get("/", (req: Request, res: Response) => {
  res.json({ replicas });
});

// Update data for all replicas
app.post("/", (req: Request, res: Response) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: "Data is required" });

  replicas.forEach(replica => {
    replica.data = data;
    replica.hash = generateHMAC(replica.data);
  });

  res.json({ message: "Data updated successfully", replicas });
});

// Corrupt data in one replica
app.post("/corrupt", (req: Request, res: Response) => {
  const { id, data } = req.body;
  if (id === undefined || !data) return res.status(400).json({ error: "Replica ID and data are required" });

  const replica = replicas.find(replica => replica.id === id);
  if (!replica) return res.status(404).json({ error: "Replica not found" });

  replica.data = data; 
  res.json({ message: `Replica ${id} corrupted successfully`, replica });
});

// Verify if replicas are valid
app.get("/verify", (req: Request, res: Response) => {
  const corruptReplicas = replicas.filter(replica => generateHMAC(replica.data) !== replica.hash);
  
  if (corruptReplicas.length > 0) {
    res.json({ message: "Data tampering detected", corruptReplicas });
  } else {
    res.json({ message: "All replicas are valid", replicas });
  }
});

// Restore replicas to the most common data
app.post("/restore", (req: Request, res: Response) => {
  const dataCounts: Record<string, number> = {};

  // Count occurrences of each data value
  replicas.forEach(replica => {
    dataCounts[replica.data] = (dataCounts[replica.data] || 0) + 1;
  });

  // Find the most common data (majority rule)
  const mostCommonData = Object.keys(dataCounts).reduce((a, b) => 
    dataCounts[a] > dataCounts[b] ? a : b
  );

  // Restore all replicas to the most common data
  replicas.forEach(replica => {
    replica.data = mostCommonData;
    replica.hash = generateHMAC(replica.data);
  });

  res.json({ message: 'Data restored successfully', mostCommonData, replicas });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
