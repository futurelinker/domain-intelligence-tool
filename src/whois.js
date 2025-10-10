import * as whoiser from 'whoiser';

// DEBUG: See what whoiser exports
console.log('whoiser object:', whoiser);
console.log('whoiser keys:', Object.keys(whoiser));
console.log('Type of whoiser:', typeof whoiser);

/**
 * Lookup WHOIS information for a domain
 * @param {string} domain - Domain name to lookup
 * @returns {Promise<Object>} - WHOIS data
 */
export async function lookupDomain(domain) {
  try {
    // Remove http://, https://, www. if present
    const cleanDomain = domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .trim()
      .toLowerCase();

    // Validate domain format (basic check)
    if (!cleanDomain || !cleanDomain.includes('.')) {
      throw new Error('Invalid domain format');
    }

    console.log(`🔍 Looking up WHOIS for: ${cleanDomain}`);

    // Query WHOIS server with options - USE whoiser.domain()
    const result = await whoiser.whoisDomain(cleanDomain, {
      follow: 2,  // Follow up to 2 referrals
      timeout: 10000  // 10 second timeout
    });

    // whoiser returns data per WHOIS server
    // Get the first result (usually the registrar)
    const whoisData = result[Object.keys(result)[0]];

    if (!whoisData) {
      throw new Error('No WHOIS data available for this domain');
    }

    // Parse and normalize the data
    const parsedData = parseWhoisData(cleanDomain, whoisData);

    console.log(`✅ WHOIS lookup successful for ${cleanDomain}`);
    return parsedData;

  } catch (error) {
    console.error(`❌ WHOIS lookup failed:`, error.message);
    throw new Error(`WHOIS lookup failed: ${error.message}`);
  }
}

/**
 * Parse WHOIS data into consistent format
 * @param {string} domain - Domain name
 * @param {Object} data - Raw WHOIS data
 * @returns {Object} - Parsed WHOIS data
 */
function parseWhoisData(domain, data) {
  // Helper function to extract value from multiple possible keys
  const getValue = (keys) => {
    for (const key of keys) {
      if (data[key]) {
        return data[key];
      }
    }
    return null;
  };

  // Helper function to format date
  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    // If it's already a Date object
    if (dateValue instanceof Date) {
      return dateValue.toISOString();
    }
    
    // If it's a string
    if (typeof dateValue === 'string') {
      try {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      } catch (e) {
        // Return original string if can't parse
        return dateValue;
      }
    }
    
    return 'N/A';
  };

  // Helper function to extract name servers
  const getNameServers = () => {
    // Try multiple possible keys
    const nsKeys = [
      'Name Server',
      'name server',
      'nameserver',
      'nameServer',
      'nserver',
      'Name Servers',
      'nameservers'
    ];

    for (const key of nsKeys) {
      if (data[key]) {
        const value = data[key];
        
        // If it's an array, return it
        if (Array.isArray(value)) {
          return value.filter(ns => ns && ns.trim());
        }
        
        // If it's a string, split by newlines or commas
        if (typeof value === 'string') {
          return value
            .split(/[\n,]/)
            .map(ns => ns.trim())
            .filter(ns => ns);
        }
      }
    }

    return [];
  };

  // Helper function to get status
  const getStatus = () => {
    const statusKeys = [
      'Domain Status',
      'domain status',
      'status',
      'Status'
    ];

    for (const key of statusKeys) {
      if (data[key]) {
        const value = data[key];
        
        if (Array.isArray(value)) {
          return value;
        }
        
        if (typeof value === 'string') {
          return [value];
        }
      }
    }

    return ['No status information'];
  };

  // Extract all data
  return {
    domain: domain,
    registrar: getValue([
      'Registrar',
      'registrar',
      'Registrar Name',
      'registrar name'
    ]) || 'N/A',
    
    registrarUrl: getValue([
      'Registrar URL',
      'registrar url',
      'Registrar Web',
      'registrar web'
    ]) || 'N/A',
    
    createdDate: formatDate(getValue([
      'Creation Date',
      'creation date',
      'Created Date',
      'created',
      'Registration Time',
      'registered'
    ])),
    
    updatedDate: formatDate(getValue([
      'Updated Date',
      'updated date',
      'Last Updated',
      'last updated',
      'Modified Date'
    ])),
    
    expiresDate: formatDate(getValue([
      'Registry Expiry Date',
      'Registrar Registration Expiration Date',
      'Expiry Date',
      'expiry date',
      'Expiration Date',
      'expiration date',
      'expires'
    ])),
    
    status: getStatus(),
    
    nameServers: getNameServers(),
    
    dnssec: getValue([
      'DNSSEC',
      'dnssec'
    ]) || 'N/A',
    
    raw: data // Keep raw data for debugging
  };
}