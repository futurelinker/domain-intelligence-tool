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
    '.com.br', '.com.ar', '.com.mx', '.co.uk', 
    '.com.au', '.co.za', '.com.co'
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