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

/**
 * Check if domain is a Brazilian domain
 * @param {string} domain - Domain name
 * @returns {boolean} - True if Brazilian domain
 */
function isBrazilianDomain(domain) {
  return domain.endsWith('.br') || domain.endsWith('.com.br');
}

/**
 * Get provider from Brazilian WHOIS data
 * @param {Object} raw - Raw WHOIS data
 * @returns {string|null} - Provider string or null
 */
function getProvider(raw) {
  try {
    // Brazilian WHOIS has a "provider" field
    // Format examples:
    // "provider:     HSTDOMAINS (127)"
    // "provider:     NENHUM (none)"
    
    const providerValue = getValue(raw, 'provider');
    
    if (!providerValue || providerValue === 'N/A') {
      return null;
    }
    
    // Clean up the value
    const cleaned = providerValue.trim();
    
    // Handle "NENHUM" case (self-managed)
    if (cleaned.toLowerCase() === 'nenhum' || cleaned.toLowerCase().includes('none')) {
      return 'NENHUM (Self-managed)';
    }
    
    return cleaned;
  } catch (error) {
    console.error('Error extracting provider:', error);
    return null;
  }
}

/**
 * Get registrar with Brazilian domain handling
 * @param {Object} raw - Raw WHOIS data
 * @returns {string} - Registrar name
 */
function getRegistrar(raw) {
  try {
    // For Brazilian domains, registrar is always Registro.br
    const domainName = getValue(raw, 'domainName') || getValue(raw, 'domain');
    
    if (domainName && isBrazilianDomain(domainName)) {
      return 'Registro.br';
    }
    
    // For other domains, use existing logic
    const registrar = getValue(raw, 'registrar');
    return registrar !== 'N/A' ? registrar : 'Unknown';
  } catch (error) {
    console.error('Error extracting registrar:', error);
    return 'Unknown';
  }
}

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
// End lookupDomain function

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
  // End of getValue function

  // Helper function to get provider (for Brazilian domains)
  const getProvider = () => {
    const providerKeys = [
      'provider',
      'Provider'
    ];

    for (const key of providerKeys) {
      if (data[key]) {
        const value = typeof data[key] === 'string' ? data[key].trim() : data[key];
        
        // Handle "NENHUM" case (self-managed)
        if (value && (value.toLowerCase() === 'nenhum' || value.toLowerCase().includes('none'))) {
          return 'NENHUM (Self-managed)';
        }
        
        return value || null;
      }
    }
    
    return null;
  };
  // End of getProvider function

  // Helper function to format date
  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    // If it's already a Date object
    if (dateValue instanceof Date) {
      return dateValue.toISOString();
    }
    
    // If it's a string
    if (typeof dateValue === 'string') {
      // Brazilian format: "20180402 20241121" (created and updated)
      // Take the LAST date (most recent/relevant)
      const dates = dateValue.trim().split(/\s+/);
      const lastDate = dates[dates.length - 1];
      
      // Try to parse YYYYMMDD format (Brazilian)
      if (/^\d{8}$/.test(lastDate)) {
        // Format: YYYYMMDD -> YYYY-MM-DD
        const year = lastDate.substring(0, 4);
        const month = lastDate.substring(4, 6);
        const day = lastDate.substring(6, 8);
        
        try {
          const date = new Date(`${year}-${month}-${day}`);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        } catch (e) {
          // Fall through to standard parsing
        }
      }
      
      // Try standard date parsing
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
// End of formatDate function

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
          return value
            .map(ns => {
              // Brazilian format: "ns1.example.com.br 200.160.2.3"
              // Extract just the hostname (before the space)
              if (typeof ns === 'string') {
                return ns.split(/\s+/)[0].toLowerCase().trim();
              }
              return ns;
            })
            .filter(ns => ns && ns.trim());
        }
        
        // If it's a string, split by newlines or commas
        if (typeof value === 'string') {
          return value
            .split(/[\n,]/)
            .map(ns => {
              // Brazilian format: "ns1.example.com.br 200.160.2.3"
              // Extract just the hostname
              const cleaned = ns.trim().split(/\s+/)[0].toLowerCase();
              return cleaned;
            })
            .filter(ns => ns);
        }
      }
    }

    return [];
  };
  // End of getNameServers function


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
  // End of getStatus function

  // Temporary debug log for Brazilian domains
//   if (isBrazilianDomain(domain)) {
//     console.log('🇧🇷 Brazilian domain WHOIS keys:', Object.keys(data));
//     console.log('🇧🇷 Brazilian domain raw data sample:');
//     console.log('  created:', data.created);
//     console.log('  changed:', data.changed);
//     console.log('  expires:', data.expires);
//     console.log('  Creation Date:', data['Creation Date']);
//     console.log('  Updated Date:', data['Updated Date']);
//     console.log('  provider:', data.provider); // ADD THIS LINE
//     console.log('  Provider:', data.Provider); // ADD THIS LINE
//     console.log('  getProvider result:', getProvider()); // ADD THIS LINE
//   }

  // Extract all data
  return {
    domain: domain,
    registrar: isBrazilianDomain(domain) 
      ? 'Registro.br' 
      : (getValue([
          'Registrar',
          'registrar',
          'Registrar Name',
          'registrar name'
        ]) || 'N/A'),
    
    provider: isBrazilianDomain(domain) ? getProvider() : null, // NEW: Provider field for Brazilian domains
    
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
      'Updated Date', // Brazilian domains use this
      'updated date',
      'Last Updated',
      'last updated',
      'Modified Date',
      'changed'
    ])),
    
    expiresDate: formatDate(getValue([
      'Registry Expiry Date',
      'Registrar Registration Expiration Date',
      'Expiry Date',
      'expiry date',
      'Expiration Date',
      'expiration date',
      'expires',
      'Expiration Date' // Brazilian backup
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
// End parseWhoisData function