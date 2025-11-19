import tls from 'tls';
import https from 'https';

 /**
 * Get server type from HTTPS response headers
 * @param {string} domain - Domain name
 * @returns {Promise<string>} - Server type
 */
function getServerType(domain) {
  return new Promise((resolve) => {
    const options = {
      hostname: domain,
      port: 443,
      path: '/',
      method: 'HEAD',
      timeout: 5000,
      rejectUnauthorized: false
    };

    const req = https.request(options, (res) => {
      const server = res.headers['server'] || res.headers['Server'] || 'Unknown';
      resolve(server);
    });

    req.on('error', () => {
      resolve('Unknown');
    });

    req.on('timeout', () => {
      req.destroy();
      resolve('Unknown');
    });

    req.end();
  });
}

/**
 * Check SSL certificate for a domain
 * @param {string} domain - Domain name to check
 * @returns {Promise<Object>} - SSL certificate information
 */
export async function checkSSL(domain) {
    // First, resolve domain to IP
  const dns = await import('dns/promises');
  let ipAddresses = [];
  
  try {
    const addresses = await dns.resolve4(domain);
    ipAddresses = addresses;
  } catch (err) {
    console.log(`Could not resolve IPv4 for ${domain}, trying IPv6...`);
    try {
      const addresses = await dns.resolve6(domain);
      ipAddresses = addresses;
    } catch (err2) {
      console.log(`Could not resolve IP for ${domain}`);
    }
  }
  return new Promise((resolve, reject) => {
    console.log(`🔒 Checking SSL certificate for: ${domain}`);

    const options = {
      host: domain,
      port: 443,
      servername: domain,
      rejectUnauthorized: false // Allow checking invalid certs
    };

    const socket = tls.connect(options, () => {
      try {
        const cert = socket.getPeerCertificate(true);
        const authorized = socket.authorized;

        // Parse certificate data
        const result = {
          domain: domain,
          valid: authorized,
          ipAddresses: ipAddresses, 
          
          // Basic info
          issuer: {
            organization: cert.issuer?.O || 'Unknown',
            commonName: cert.issuer?.CN || 'Unknown',
            country: cert.issuer?.C || null
          },
          
          subject: {
            commonName: cert.subject?.CN || domain,
            organization: cert.subject?.O || null,
            country: cert.subject?.C || null
          },
          
          // Validity dates
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          daysRemaining: getDaysRemaining(cert.valid_to),
          
          // Additional info
          subjectAltNames: parseSubjectAltNames(cert.subjectaltname),
          serialNumber: cert.serialNumber,
          fingerprint: cert.fingerprint,
          
          // Certificate chain
          chain: buildCertificateChain(cert),
          
// Security flags
          selfSigned: !authorized && cert.issuer?.CN === cert.subject?.CN,
          wildcard: isWildcard(cert.subject?.CN, cert.subjectaltname)
        };

        socket.end();
        
        // Get server type before resolving
        getServerType(domain)
          .then(serverType => {
            result.serverType = serverType;
            console.log(`✅ SSL check complete for ${domain}: ${result.valid ? 'Valid' : 'Invalid'} - ${result.daysRemaining} days remaining - Server: ${serverType}`);
            resolve(result);
          })
          .catch(() => {
            result.serverType = 'Unknown';
            console.log(`✅ SSL check complete for ${domain}: ${result.valid ? 'Valid' : 'Invalid'} - ${result.daysRemaining} days remaining - Server: Unknown`);
            resolve(result);
          });

      } catch (error) {
        socket.end();
        reject(error);
      }
    });

    socket.on('error', (error) => {
      console.error(`❌ SSL check failed for ${domain}:`, error.message);
      
      // Return error but with some info
      if (error.code === 'ENOTFOUND') {
        reject(new Error('Domain not found or does not exist'));
      } else if (error.code === 'ECONNREFUSED') {
        reject(new Error('Connection refused - no SSL certificate on port 443'));
      } else if (error.code === 'CERT_HAS_EXPIRED') {
        reject(new Error('SSL certificate has expired'));
      } else {
        reject(new Error(`SSL check failed: ${error.message}`));
      }
    });

    // Timeout after 10 seconds
    socket.setTimeout(10000);
    socket.on('timeout', () => {
      socket.end();
      reject(new Error('SSL check timeout - server did not respond'));
    });
  });
}
//  End of checkSSL function

/**
 * Calculate days remaining until certificate expires
 * @param {string} validTo - Valid to date string
 * @returns {number} - Days remaining
 */
function getDaysRemaining(validTo) {
  const expiryDate = new Date(validTo);
  const today = new Date();
  const diffTime = expiryDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Parse Subject Alternative Names
 * @param {string} subjectaltname - SAN string from certificate
 * @returns {Array} - Array of domain names
 */
function parseSubjectAltNames(subjectaltname) {
  if (!subjectaltname) return [];
  
  return subjectaltname
    .split(', ')
    .map(san => san.replace('DNS:', ''))
    .filter(san => san.length > 0);
}

/**
 * Build certificate chain information with more details
 * @param {Object} cert - Certificate object
 * @returns {Array} - Certificate chain with enhanced info
 */
function buildCertificateChain(cert) {
  const chain = [];
  let current = cert;
  let depth = 0;
  
  while (current) {
    const daysRemaining = getDaysRemaining(current.valid_to);
    const isExpired = daysRemaining < 0;
    
    chain.push({
      commonName: current.subject?.CN || 'Unknown',
      organization: current.subject?.O || current.issuer?.O || null,
      issuer: current.issuer?.CN || 'Unknown',
      validFrom: current.valid_from,
      validTo: current.valid_to,
      daysRemaining: daysRemaining,
      expired: isExpired,
      type: depth === 0 ? 'leaf' : (chain.length > 1 && !current.issuerCertificate ? 'root' : 'intermediate')
    });
    
    current = current.issuerCertificate;
    depth++;
    
    // Prevent infinite loop (self-signed at root)
    if (current && current.fingerprint === cert.fingerprint) {
      break;
    }
    
    // Max chain depth of 10
    if (chain.length >= 10) {
      break;
    }
  }
  
  return chain;
}
// End of buildCertificateChain

/**
 * Check if certificate is a wildcard certificate
 * @param {string} commonName - Common name
 * @param {string} subjectaltname - Subject alternative names
 * @returns {boolean} - True if wildcard
 */
function isWildcard(commonName, subjectaltname) {
  if (commonName && commonName.startsWith('*.')) {
    return true;
  }
  
  if (subjectaltname && subjectaltname.includes('*')) {
    return true;
  }
  
  return false;

 
}