import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { lookupDomain } from './whois.js';
import { queryAllRecords } from './dns.js';
import { checkPropagation, checkAllPropagation } from './propagation.js';
import { isSubdomain, getRootDomain } from './utils.js';
import { readFileSync } from 'fs'; 
import { checkSSL } from './ssl.js';
import { detectHosting } from './hosting.js';
import { detectTechnologies } from './technology.js';
import rateLimit from 'express-rate-limit';
import { validateDomainMiddleware } from './security.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read VERSION file once at startup
const VERSION = readFileSync(path.join(__dirname, '../VERSION'), 'utf8').trim();
console.log(`📌 Version: ${VERSION}`);

// ============================================
// RATE LIMITING CONFIGURATION
// ============================================

// Conservative rate limiting for public API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window per IP
  message: {
    success: false,
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again in 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for health check
  skip: (req) => req.path === '/api/health'
});

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json());

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Domain Intelligence Tool API is running',
    version: VERSION,
    timestamp: new Date().toISOString()
  });
});

// Version endpoint
app.get('/api/version', (req, res) => {
  res.json({
    version: VERSION
  });
});

// WHOIS lookup endpoint
app.post('/api/whois', validateDomainMiddleware, async (req, res) => {
  try {
    const { domain } = req.body;

    console.log(`📥 WHOIS request for: ${domain}`);

    // Perform WHOIS lookup
    const whoisData = await lookupDomain(domain);

    // Add subdomain detection info
    const isSubdomainResult = isSubdomain(domain);
    const enrichedData = {
      ...whoisData,
      isSubdomain: isSubdomainResult,
      rootDomain: isSubdomainResult ? getRootDomain(domain) : null
    };

    // Return results
    res.json({
      success: true,
      data: enrichedData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('WHOIS API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',  // ← Generic message
      message: 'An error occurred while processing your request. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
});

// DNS query endpoint
app.post('/api/dns', validateDomainMiddleware, async (req, res) => {
  try {
    const { domain } = req.body;

    // Validate input
    if (!domain) {
      return res.status(400).json({
        error: 'Domain is required',
        message: 'Please provide a domain name'
      });
    }

    console.log(`📥 DNS request for: ${domain}`);

    // Perform DNS query
    const dnsData = await queryAllRecords(domain);

    // Return results
    res.json({
      success: true,
      data: dnsData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('DNS API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',  // ← Generic message
      message: 'An error occurred while processing your request. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
});

// DNS propagation check endpoint
app.post('/api/propagation', validateDomainMiddleware, async (req, res) => {
  try {
    const { domain } = req.body;
    
    // Validate input
    if (!domain) {
      return res.status(400).json({
        error: 'Domain is required',
        message: 'Please provide a domain name'
      });
    }
    
    console.log(`📥 Propagation check request for: ${domain}`);

    // Perform propagation check
    const propagationData = await checkPropagation(domain);

    // Return results
    res.json({
      success: true,
      data: propagationData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Propagation API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',  // ← Generic message
      message: 'An error occurred while processing your request. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
});

// DNS Propagation ALL record types endpoint
app.post('/api/propagation-all', validateDomainMiddleware, async (req, res) => {
  try {
    const { domain } = req.body;

    // Validate input
    if (!domain) {
      return res.status(400).json({
        error: 'Domain is required',
        message: 'Please provide a domain name'
      });
    }

    console.log(`📥 Propagation-all check request for: ${domain}`);

    // Check propagation for all record types
    const propagationData = await checkAllPropagation(domain);

    // Return results
    res.json({
      success: true,
      data: propagationData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Propagation-all API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',  // ← Generic message
      message: 'An error occurred while processing your request. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
});

// SSL Certificate check endpoint
app.post('/api/ssl', validateDomainMiddleware, async (req, res) => {
  try {
    const { domain } = req.body;

    // Validate input
    if (!domain) {
      return res.status(400).json({
        error: 'Domain is required',
        message: 'Please provide a domain name'
      });
    }

    console.log(`📥 SSL check request for: ${domain}`);

    // Check SSL certificate
    const sslData = await checkSSL(domain);

    // Return results
    res.json({
      success: true,
      data: sslData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('SSL API error:', error);
    res.status(500).json({
      success: false,
       error: 'Internal server error',  // ← Generic message
      message: 'An error occurred while processing your request. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
});

// Hosting provider detection endpoint
app.post('/api/hosting', validateDomainMiddleware, async (req, res) => {
  try {
    const { domain } = req.body;

    // Validate input
    if (!domain) {
      return res.status(400).json({
        error: 'Domain is required',
        message: 'Please provide a domain name'
      });
    }

    console.log(`📥 Hosting detection request for: ${domain}`);

    // Detect hosting provider
    const hostingData = await detectHosting(domain);

    // Return results
    res.json({
      success: true,
      data: hostingData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Hosting API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',  // ← Generic message
      message: 'An error occurred while processing your request. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
});

// Technology detection endpoint
app.post('/api/technology', validateDomainMiddleware, async (req, res) => {
  try {
    const { domain } = req.body;

    // Validate input
    if (!domain) {
      return res.status(400).json({
        error: 'Domain is required',
        message: 'Please provide a domain name'
      });
    }

    console.log(`📥 Technology detection request for: ${domain}`);

    // Detect technologies
    const techData = await detectTechnologies(domain);

    // Return results
    res.json({
      success: true,
      data: techData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Technology API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',  // ← Generic message
      message: 'An error occurred while processing your request. Please try again later.',
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
