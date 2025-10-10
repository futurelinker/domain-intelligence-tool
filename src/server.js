import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { lookupDomain } from './whois.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Domain Intelligence Tool API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// WHOIS lookup endpoint
app.post('/api/whois', async (req, res) => {
  try {
    const { domain } = req.body;

    // Validate input
    if (!domain) {
      return res.status(400).json({
        error: 'Domain is required',
        message: 'Please provide a domain name'
      });
    }

    console.log(`📥 WHOIS request for: ${domain}`);

    // Perform WHOIS lookup
    const whoisData = await lookupDomain(domain);

    // Return results
    res.json({
      success: true,
      data: whoisData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('WHOIS API error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Domain Intelligence Tool running on port ${PORT}`);
  console.log(`📍 Access at: http://localhost:${PORT}`);
});
