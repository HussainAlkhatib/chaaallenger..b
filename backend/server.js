const express = require('express');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MongoDB Connection Logic =====
const uri = process.env.DATABASE_URL; // قراءة الرابط من متغيرات البيئة في Render
if (!uri) {
    throw new Error('DATABASE_URL environment variable not set');
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToDb() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Exit if connection fails
  }
}
// ====================================


// This is the crucial part: serving static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// A simple API endpoint example
app.get('/api/data', (req, res) => {
    res.json({ message: 'Welcome from the backend!' });
});

// All other GET requests not handled before will return the frontend's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});


// Start the server after connecting to the database
connectToDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});