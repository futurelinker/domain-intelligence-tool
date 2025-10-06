const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

//API endpoint to check server status
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'API is running smoothly',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Domain Intelligence Tool running on port ${PORT}`);
    console.log(`📍 Access at: http://localhost:${PORT}`);
});
