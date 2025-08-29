const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Use Render's port or 3000 for local dev

// This is the crucial part: serving static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// A simple API endpoint example
app.get('/api/data', (req, res) => {
    res.json({ message: 'Welcome from the backend!' });
});

// All other GET requests not handled before will return the frontend's index.html
// This is important for single-page applications.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
