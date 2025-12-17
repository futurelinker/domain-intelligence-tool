import dns from 'dns/promises';
import net from 'net';

/**
 * Security Module
 * Provides SSRF protection, input validation, and utilities
 */


// ============================================
// DOMAIN CLEANING
// ============================================

/**
 * Clean and normalize domain input
 * Removes protocols, www, paths, ports, query strings, etc.
 * @param {string} domain - Raw domain input
 * @returns {string} - Cleaned domain
 */
export function cleanDomain(domain) {
  if (!domain || typeof domain !== 'string') {
    return '';
  }

  return domain
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')   // Remove http:// or https://
    .replace(/^www\./, '')         // Remove www.
    .replace(/:\d+/, '')           // Remove port (:8080)
    .replace(/\/.*$/, '')          // Remove path and everything after /
    .replace(/\?.*$/, '')          // Remove query string (?param=value)
    .replace(/#.*$/, '')           // Remove hash/fragment (#section)
    .replace(/\s+/g, '')           // Remove all whitespace
    .replace(/^\.+|\.+$/g, '');    // Remove leading/trailing dots
}

// ============================================
// INPUT VALIDATION
// ============================================

// ============================================
// INPUT VALIDATION
// ============================================

/**
 * Validate domain name format
 * @param {string} domain - Domain to validate
 * @returns {boolean} - True if valid
 */
export function isValidDomain(domain) {
  if (!domain || typeof domain !== 'string') {
    return false;
  }

  // Remove whitespace
  domain = domain.trim();

  // Check length (max 253 chars for FQDN)
  if (domain.length === 0 || domain.length > 253) {
    return false;
  }

  // Regex for valid domain format
  // Allows: letters, numbers, hyphens, dots
  // Does not allow: spaces, special chars, leading/trailing dots
  const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,}$/;
  
  if (!domainRegex.test(domain)) {
    return false;
  }

  // Additional checks
  // No consecutive dots
  if (domain.includes('..')) {
    return false;
  }

  // No leading/trailing dots or hyphens
  if (domain.startsWith('.') || domain.endsWith('.') || 
      domain.startsWith('-') || domain.endsWith('-')) {
    return false;
  }

  return true;
}

// ============================================
// SSRF PROTECTION
// ============================================

/**
 * Check if an IP address is private/internal
 * @param {string} ip - IP address to check
 * @returns {boolean} - True if private
 */
export function isPrivateIP(ip) {
  // Check if valid IPv4
  if (!net.isIPv4(ip)) {
    // For simplicity, block non-IPv4 (could be IPv6 or invalid)
    // In production, you might want to handle IPv6 properly
    return true; // Block by default for safety
  }

  const parts = ip.split('.').map(Number);

  // 127.0.0.0/8 (localhost)
  if (parts[0] === 127) {
    return true;
  }

  // 10.0.0.0/8 (private network)
  if (parts[0] === 10) {
    return true;
  }

  // 172.16.0.0/12 (private network)
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
    return true;
  }

  // 192.168.0.0/16 (private network)
  if (parts[0] === 192 && parts[1] === 168) {
    return true;
  }

  // 169.254.0.0/16 (link-local)
  if (parts[0] === 169 && parts[1] === 254) {
    return true;
  }

  // 0.0.0.0/8 (current network)
  if (parts[0] === 0) {
    return true;
  }

  // 224.0.0.0/4 (multicast)
  if (parts[0] >= 224 && parts[0] <= 239) {
    return true;
  }

  // 240.0.0.0/4 (reserved)
  if (parts[0] >= 240) {
    return true;
  }

  return false;
}

/**
 * Validate domain does not resolve to private IP (SSRF protection)
 * @param {string} domain - Domain to check
 * @returns {Promise<Object>} - { safe: boolean, reason?: string, ip?: string }
 */
export async function validateDomainSSRF(domain) {
  try {
    // Resolve domain to IPv4 addresses
    const addresses = await dns.resolve4(domain);

    // Check each resolved IP
    for (const ip of addresses) {
      if (isPrivateIP(ip)) {
        console.warn(`⚠️ SSRF attempt blocked: ${domain} resolves to private IP ${ip}`);
        return {
          safe: false,
          reason: 'Domain resolves to private IP address',
          ip: ip
        };
      }
    }

    // All IPs are public
    return {
      safe: true,
      ip: addresses[0] // Return first public IP
    };

  } catch (error) {
    // DNS resolution failed
    // This could be:
    // - Domain doesn't exist
    // - DNS server error
    // - Network issue
    
    if (error.code === 'ENOTFOUND') {
      return {
        safe: false,
        reason: 'Domain not found'
      };
    }

    if (error.code === 'ENODATA') {
      return {
        safe: false,
        reason: 'No DNS records found'
      };
    }

    // Other DNS errors
    return {
      safe: false,
      reason: `DNS resolution failed: ${error.message}`
    };
  }
}

/**
 * Middleware to validate domain input and SSRF protection
 * Apply this to endpoints that accept domain parameter
 */
export async function validateDomainMiddleware(req, res, next) {
  let { domain } = req.body;

  // Check if domain exists
  if (!domain) {
    return res.status(400).json({
      success: false,
      error: 'Domain is required',
      message: 'Please provide a domain name'
    });
  }

  // Clean domain input (remove protocols, www, paths, etc.)
  domain = cleanDomain(domain);
  
  // Update request body with cleaned domain
  req.body.domain = domain;

  // Check if cleaned domain is empty
  if (!domain) {
    return res.status(400).json({
      success: false,
      error: 'Invalid domain format',
      message: 'Please provide a valid domain name (e.g., example.com)'
    });
  }

  // Validate domain format
  if (!isValidDomain(domain)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid domain format',
      message: 'Please provide a valid domain name (e.g., example.com)'
    });
  }

  // SSRF protection - check if domain resolves to private IP
  const ssrfCheck = await validateDomainSSRF(domain);
  
  if (!ssrfCheck.safe) {
    console.warn(`🚫 SSRF protection triggered for domain: ${domain}`);
    return res.status(400).json({
      success: false,
      error: 'Invalid domain',
      message: ssrfCheck.reason || 'Domain validation failed'
    });
  }

  // Domain is safe, continue
  console.log(`✅ Domain validated: ${domain} (${ssrfCheck.ip})`);
  next();
}
