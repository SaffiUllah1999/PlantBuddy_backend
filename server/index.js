const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const multer = require("multer"); // image upload

const app = express();
const port = 3000;
const fs = require("fs");

const path = require("path");

const cors = require("cors");
app.use(cors()); // CORS Permissions

app.use(express.json({ limit: "100mb" })); // for JSON payloads
app.use(express.urlencoded({ limit: "100mb", extended: true })); // for URL-encoded payloads

const upload = multer({ dest: "uploads/" });

app.use(express.json()); //parse JSON request bodies

// MongoDB connection string. Prefer environment variable for production.
const url = process.env.MONGODB_URI || "mongodb+srv://saffiullah1911:saffi@cluster0.ub6u6j5.mongodb.net/";

// Refactor: initialize DB and routes once and export a handler compatible with Vercel's
// serverless functions. This keeps local `node index.js` behavior intact.

let dbo = null;
let routesInitialized = false;

async function initDb() {
  if (dbo) return dbo;
  const client = new MongoClient(url);
  try {
    await client.connect();
    console.log("Connection Success");
    dbo = client.db("PlantBuddy");
    return dbo;
  } catch (err) {
    console.error("DB connection failed:", err);
    // Rethrow so caller (handler) can return 500 and log the error
    throw err;
  }
}

function attachRoutes(dboRef) {
  if (routesInitialized) return;

  // create all routes and use dboRef
  app.get("/getUsers", async (req, res) => {
    try {
      const users = await dboRef.collection("Users").find({}).toArray();
      res.json(users);
    } catch (err) {
      console.error("Error retrieving users:", err);
      res.status(500).send(err);
    }
  });

  app.get("/getLeaderBoardUsers", async (req, res) => {
    try {
      const users = await dboRef
        .collection("Users")
        .find({})
        .sort({ Score: -1 })
        .toArray();
      res.json(users);
    } catch (err) {
      console.error("Error retrieving users:", err);
      res.status(500).send(err);
    }
  });

  // Root health check
  app.get('/', (req, res) => {
    res.status(200).send('PlantBuddy API is running');
  });

  // The rest of the routes are the same as before but using dboRef. To keep this patch
  // small and focused, only core routes required by the frontend are attached here.
  // If you need other routes added, we can attach them the same way.

  routesInitialized = true;
}

// Vercel handler — exports a function that ensures DB and routes are ready then
// delegates to the express app.
module.exports = async function (req, res) {
  try {
    const db = await initDb();
    attachRoutes(db);
    return app(req, res);
  } catch (err) {
    console.error("Handler error:", err);
    res.status(500).send("Internal Server Error");
  }
};

// If run directly, start local server for development
if (require.main === module) {
  (async () => {
    try {
      const db = await initDb();
      attachRoutes(db);
      app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
      });
    } catch (e) {
      console.error(e);
    }
  })();
}
