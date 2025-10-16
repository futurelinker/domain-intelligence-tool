import { promises as dnsPromises } from 'dns';

/**
 * Query all DNS records for a domain
 * @param {string} domain - Domain name to query
 * @returns {Promise<Object>} - DNS records
 */
export async function queryAllRecords(domain) {
  try {
    console.log(`🔍 Querying DNS records for: ${domain}`);

    // Query all record types in parallel
    const [
      aRecords,
      aaaaRecords,
      mxRecords,
      txtRecords,
      nsRecords,
      soaRecord,
      caaRecords
    ] = await Promise.allSettled([
      queryARecords(domain),
      queryAAAARecords(domain),
      queryMXRecords(domain),
      queryTXTRecords(domain),
      queryNSRecords(domain),
      querySOARecord(domain),
      queryCAARecords(domain)
    ]);

    // Extract results (handle fulfilled/rejected promises)
    const dnsData = {
      domain: domain,
      a: aRecords.status === 'fulfilled' ? aRecords.value : [],
      aaaa: aaaaRecords.status === 'fulfilled' ? aaaaRecords.value : [],
      mx: mxRecords.status === 'fulfilled' ? mxRecords.value : [],
      txt: txtRecords.status === 'fulfilled' ? txtRecords.value : [],
      ns: nsRecords.status === 'fulfilled' ? nsRecords.value : [],
      soa: soaRecord.status === 'fulfilled' ? soaRecord.value : null,
      caa: caaRecords.status === 'fulfilled' ? caaRecords.value : []
    };

    console.log(`✅ DNS query successful for ${domain}`);
    return dnsData;

  } catch (error) {
    console.error(`❌ DNS query failed:`, error.message);
    throw new Error(`DNS query failed: ${error.message}`);
  }
}

/**
 * Query A records (IPv4)
 */
async function queryARecords(domain) {
  try {
    const addresses = await dnsPromises.resolve4(domain);
    return addresses.map(ip => ({ address: ip }));
  } catch (error) {
    if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
      return [];
    }
    throw error;
  }
}

/**
 * Query AAAA records (IPv6)
 */
async function queryAAAARecords(domain) {
  try {
    const addresses = await dnsPromises.resolve6(domain);
    return addresses.map(ip => ({ address: ip }));
  } catch (error) {
    if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
      return [];
    }
    throw error;
  }
}

/**
 * Query MX records (Mail servers)
 */
async function queryMXRecords(domain) {
  try {
    const records = await dnsPromises.resolveMx(domain);
    // Sort by priority (lower = higher priority)
    return records.sort((a, b) => a.priority - b.priority);
  } catch (error) {
    if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
      return [];
    }
    throw error;
  }
}

/**
 * Query TXT records
 */
async function queryTXTRecords(domain) {
  try {
    const records = await dnsPromises.resolveTxt(domain);
    // Flatten array of arrays and join
    return records.map(record => ({ text: record.join('') }));
  } catch (error) {
    if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
      return [];
    }
    throw error;
  }
}

/**
 * Query NS records (Name servers)
 */
async function queryNSRecords(domain) {
  try {
    const nameservers = await dnsPromises.resolveNs(domain);
    return nameservers.map(ns => ({ nameserver: ns }));
  } catch (error) {
    if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
      return [];
    }
    throw error;
  }
}

/**
 * Query SOA record (Start of Authority)
 */
async function querySOARecord(domain) {
  try {
    const soa = await dnsPromises.resolveSoa(domain);
    return soa;
  } catch (error) {
    if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
      return null;
    }
    throw error;
  }
}

/**
 * Query CAA records (Certificate Authority Authorization)
 */
async function queryCAARecords(domain) {
  try {
    const records = await dnsPromises.resolveCaa(domain);
    return records;
  } catch (error) {
    if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
      return [];
    }
    throw error;
  }
}