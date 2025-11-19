import dns from 'dns/promises';

/**
 * Detect hosting provider and location for a domain
 * @param {string} domain - Domain name
 * @returns {Promise<Object>} - Hosting information
 */
export async function detectHosting(domain) {
  console.log(`🌍 Detecting hosting provider for: ${domain}`);

  try {
    // Step 1: Resolve domain to IP
    let ipAddress = null;
    try {
      const addresses = await dns.resolve4(domain);
      ipAddress = addresses[0]; // Use first IP
    } catch (err) {
      // Try IPv6 if IPv4 fails
      try {
        const addresses = await dns.resolve6(domain);
        ipAddress = addresses[0];
      } catch (err2) {
        throw new Error('Could not resolve domain to IP address');
      }
    }

    console.log(`📍 Resolved ${domain} to IP: ${ipAddress}`);

    // Step 2: Get geolocation and ISP data
    const geoData = await getIPInfo(ipAddress);

    // Step 3: Detect hosting provider from ASN/Org
    const provider = detectProvider(geoData);

    // Step 4: Build result
    const result = {
      domain: domain,
      ipAddress: ipAddress,
      provider: provider,
      location: {
        country: geoData.country || 'Unknown',
        countryCode: geoData.countryCode || null,
        region: geoData.regionName || geoData.region || null,
        city: geoData.city || null,
        timezone: geoData.timezone || null,
        coordinates: {
          lat: geoData.lat || null,
          lon: geoData.lon || null
        }
      },
      network: {
        asn: geoData.as || null,
        asnNumber: extractASN(geoData.as),
        organization: geoData.org || geoData.isp || 'Unknown',
        isp: geoData.isp || null
      },
      isCDN: provider.type === 'cdn',
      isCloud: provider.type === 'cloud'
    };

    console.log(`✅ Hosting detection complete for ${domain}: ${provider.name}`);
    return result;

  } catch (error) {
    console.error(`❌ Hosting detection failed for ${domain}:`, error.message);
    throw error;
  }
}

/**
 * Get IP geolocation info from ip-api.com
 * @param {string} ip - IP address
 * @returns {Promise<Object>} - Geolocation data
 */
async function getIPInfo(ip) {
  const url = `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,timezone,isp,org,as`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'fail') {
      throw new Error(data.message || 'IP lookup failed');
    }

    return data;
  } catch (error) {
    throw new Error(`IP geolocation lookup failed: ${error.message}`);
  }
}

/**
 * Detect hosting provider from ASN and organization name
 * @param {Object} geoData - Geolocation data
 * @returns {Object} - Provider information
 */
function detectProvider(geoData) {
  const org = (geoData.org || geoData.isp || '').toLowerCase();
  const asn = (geoData.as || '').toLowerCase();

  // Cloud Providers
  if (org.includes('amazon') || asn.includes('amazon') || org.includes('aws')) {
    return { name: 'Amazon Web Services (AWS)', type: 'cloud', icon: '☁️' };
  }
  if (org.includes('google') || asn.includes('google') || org.includes('gcp')) {
    return { name: 'Google Cloud Platform (GCP)', type: 'cloud', icon: '☁️' };
  }
  if (org.includes('microsoft') || org.includes('azure')) {
    return { name: 'Microsoft Azure', type: 'cloud', icon: '☁️' };
  }
  if (org.includes('digitalocean')) {
    return { name: 'DigitalOcean', type: 'cloud', icon: '🌊' };
  }
  if (org.includes('linode') || org.includes('akamai')) {
    return { name: 'Linode (Akamai)', type: 'cloud', icon: '☁️' };
  }
  if (org.includes('vultr')) {
    return { name: 'Vultr', type: 'cloud', icon: '☁️' };
  }
  if (org.includes('hetzner')) {
    return { name: 'Hetzner', type: 'cloud', icon: '☁️' };
  }
  if (org.includes('ovh')) {
    return { name: 'OVH', type: 'cloud', icon: '☁️' };
  }

  // CDN Providers
  if (org.includes('cloudflare')) {
    return { name: 'Cloudflare', type: 'cdn', icon: '🛡️' };
  }
  if (org.includes('fastly')) {
    return { name: 'Fastly', type: 'cdn', icon: '⚡' };
  }
  if (org.includes('akamai') && !org.includes('linode')) {
    return { name: 'Akamai CDN', type: 'cdn', icon: '🌐' };
  }
  if (org.includes('bunnycdn') || org.includes('bunny')) {
    return { name: 'BunnyCDN', type: 'cdn', icon: '🐰' };
  }
  if (org.includes('stackpath')) {
    return { name: 'StackPath', type: 'cdn', icon: '🌐' };
  }

  // Hosting Companies
  if (org.includes('godaddy')) {
    return { name: 'GoDaddy', type: 'hosting', icon: '🏢' };
  }
  if (org.includes('bluehost')) {
    return { name: 'Bluehost', type: 'hosting', icon: '🏢' };
  }
  if (org.includes('hostgator')) {
    return { name: 'HostGator', type: 'hosting', icon: '🏢' };
  }
  if (org.includes('dreamhost')) {
    return { name: 'DreamHost', type: 'hosting', icon: '🏢' };
  }
  if (org.includes('siteground')) {
    return { name: 'SiteGround', type: 'hosting', icon: '🏢' };
  }
  if (org.includes('namecheap')) {
    return { name: 'Namecheap', type: 'hosting', icon: '🏢' };
  }

  // Vercel, Netlify (modern hosting)
  if (org.includes('vercel')) {
    return { name: 'Vercel', type: 'platform', icon: '▲' };
  }
  if (org.includes('netlify')) {
    return { name: 'Netlify', type: 'platform', icon: '🌐' };
  }

  // Default: Use ISP/Org name
  return {
    name: geoData.org || geoData.isp || 'Unknown Provider',
    type: 'other',
    icon: '🌐'
  };
}

/**
 * Extract ASN number from AS string
 * @param {string} asString - AS string (e.g., "AS15169 Google LLC")
 * @returns {number|null} - ASN number
 */
function extractASN(asString) {
  if (!asString) return null;
  const match = asString.match(/AS(\d+)/i);
  return match ? parseInt(match[1]) : null;
}