/**
 * Utility functions for domain analysis
 */

/**
 * Check if domain is a subdomain
 * @param {string} domain - Domain to check
 * @returns {boolean} - True if subdomain
 */
export function isSubdomain(domain) {
  if (!domain) return false;
  
  const parts = domain.toLowerCase().split('.');
  
  // Handle special multi-part TLDs
  const specialTLDs = [
    '.com.br', '.com.ar', '.com.mx', '.co.uk', 
    '.com.au', '.co.za', '.com.co'
  ];
  
  // Check if domain ends with a special TLD
  for (const tld of specialTLDs) {
    if (domain.endsWith(tld)) {
      // For .com.br: example.com.br = 3 parts (not subdomain)
      // For .com.br: api.example.com.br = 4 parts (subdomain)
      return parts.length > 3;
    }
  }
  
  // Standard TLD: example.com = 2 parts (not subdomain)
  // Standard TLD: api.example.com = 3 parts (subdomain)
  return parts.length > 2;
}

/**
 * Get root domain from subdomain or regular domain
 * @param {string} domain - Domain to extract root from
 * @returns {string} - Root domain
 */
export function getRootDomain(domain) {
  if (!domain) return domain;
  
  const parts = domain.toLowerCase().split('.');
  
  // Handle special multi-part TLDs
  const specialTLDs = [
    // South America
    '.com.br', '.net.br', '.org.br', '.gov.br',
    '.com.ar', '.gov.ar', '.org.ar',
    '.com.mx', '.gob.mx', '.org.mx',
    '.com.co', '.gov.co', '.org.co',
    '.com.cl', '.gob.cl', '.org.cl',
    '.com.pe', '.gob.pe', '.org.pe',
    '.com.ve', '.gob.ve', '.org.ve',
    
    // Europe
    '.co.uk', '.gov.uk', '.org.uk', '.ac.uk', '.net.uk',
    '.co.de', '.gov.de',
    '.co.fr', '.gouv.fr',
    '.co.es', '.gob.es',
    '.co.it', '.gov.it',
    '.co.pl', '.gov.pl',
    '.co.ru', '.gov.ru',
    
    // Asia
    '.co.jp', '.ne.jp', '.or.jp', '.go.jp', '.ac.jp',
    '.co.kr', '.go.kr', '.or.kr', '.ac.kr',
    '.com.cn', '.gov.cn', '.org.cn', '.net.cn',
    '.co.in', '.gov.in', '.org.in', '.net.in', '.ac.in',
    '.co.id', '.go.id', '.or.id', '.ac.id',
    '.co.th', '.go.th', '.or.th', '.ac.th',
    '.com.sg', '.gov.sg', '.org.sg',
    
    // Oceania
    '.com.au', '.gov.au', '.org.au', '.net.au', '.edu.au',
    '.co.nz', '.govt.nz', '.org.nz', '.net.nz', '.ac.nz',
    
    // Africa
    '.co.za', '.gov.za', '.org.za', '.net.za', '.ac.za',
    '.co.ke', '.go.ke', '.or.ke', '.ac.ke',
    '.com.ng', '.gov.ng', '.org.ng',
    
    // Middle East
    '.co.il', '.gov.il', '.org.il', '.ac.il',
    '.com.tr', '.gov.tr', '.org.tr',
    '.co.ae', '.gov.ae', '.org.ae',
    '.com.sa', '.gov.sa', '.org.sa',
    
    // North America (Canada)
    '.co.ca', '.gc.ca', '.on.ca', '.qc.ca'
  ];

  // Check if domain ends with a special TLD
  for (const tld of specialTLDs) {
    if (domain.endsWith(tld)) {
      // Return last 3 parts: api.example.com.br → example.com.br
      return parts.slice(-3).join('.');
    }
  }
  
  // Standard TLD: return last 2 parts
  // api.example.com → example.com
  return parts.slice(-2).join('.');
}