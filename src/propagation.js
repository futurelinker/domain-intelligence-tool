import { Resolver } from 'dns';
import { promisify } from 'util';

// List of public DNS servers to query
const DNS_SERVERS = [
  { name: 'Google Primary', ip: '8.8.8.8', location: 'Global' },
  { name: 'Google Secondary', ip: '8.8.4.4', location: 'Global' },
  { name: 'Cloudflare Primary', ip: '1.1.1.1', location: 'Global' },
  { name: 'Cloudflare Secondary', ip: '1.0.0.1', location: 'Global' },
  { name: 'Quad9', ip: '9.9.9.9', location: 'Global' },
  { name: 'OpenDNS Primary', ip: '208.67.222.222', location: 'USA' },
  { name: 'OpenDNS Secondary', ip: '208.67.220.220', location: 'USA' },
  { name: 'AdGuard DNS', ip: '94.140.14.14', location: 'Global' },
  { name: 'DNS.WATCH', ip: '84.200.69.80', location: 'Europe' },
  { name: 'Verisign', ip: '64.6.64.6', location: 'USA' },
  { name: 'Level3', ip: '209.244.0.3', location: 'USA' },
];

/**
 * Check DNS propagation across multiple global DNS servers
 * @param {string} domain - Domain name to check
 * @returns {Promise<Object>} - Propagation results
 */
export async function checkPropagation(domain) {
  try {
    console.log(`🌍 Checking DNS propagation for: ${domain}`);

    // Query all DNS servers in parallel
    const results = await Promise.allSettled(
      DNS_SERVERS.map(server => queryDnsServer(domain, server))
    );

    // Extract results
    const serverResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          server: DNS_SERVERS[index].name,
          ip: DNS_SERVERS[index].ip,
          location: DNS_SERVERS[index].location,
          addresses: [],
          error: result.reason?.message || 'Query failed',
          status: 'error'
        };
      }
    });

    // Analyze propagation
    const analysis = analyzePropagation(serverResults);

    console.log(`✅ Propagation check complete for ${domain}`);
    console.log(`📊 Status: ${analysis.isPropagated ? 'Fully Propagated' : 'Propagating'} (${analysis.percentage}%)`);

    return {
      domain: domain,
      servers: serverResults,
      analysis: analysis,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`❌ Propagation check failed:`, error.message);
    throw new Error(`Propagation check failed: ${error.message}`);
  }
}

/**
 * Query a specific DNS server for A records
 * @param {string} domain - Domain to query
 * @param {Object} server - DNS server info
 * @returns {Promise<Object>} - Query result
 */
async function queryDnsServer(domain, server) {
  return new Promise((resolve, reject) => {
    // Create a resolver for this specific DNS server
    const resolver = new Resolver();
    resolver.setServers([server.ip]);

    // Set timeout
    const timeout = setTimeout(() => {
      reject(new Error('Query timeout'));
    }, 5000); // 5 second timeout

    // Query A records
    resolver.resolve4(domain, (err, addresses) => {
      clearTimeout(timeout);

      if (err) {
        // Handle common errors
        if (err.code === 'ENODATA' || err.code === 'ENOTFOUND') {
          resolve({
            server: server.name,
            ip: server.ip,
            location: server.location,
            addresses: [],
            error: 'No A records found',
            status: 'no_data'
          });
        } else {
          reject(err);
        }
      } else {
        resolve({
          server: server.name,
          ip: server.ip,
          location: server.location,
          addresses: addresses,
          status: 'success'
        });
      }
    });
  });
} // End of queryDnsServer

/**
 * Query NS records from a specific DNS server
 * @param {string} domain - Domain to query
 * @param {Object} server - DNS server info
 * @returns {Promise<Object>} - Query result
 */
async function queryNsRecords(domain, server) {
  return new Promise((resolve, reject) => {
    const resolver = new Resolver();
    resolver.setServers([server.ip]);

    const timeout = setTimeout(() => {
      reject(new Error('Query timeout'));
    }, 5000);

    resolver.resolveNs(domain, (err, addresses) => {
      clearTimeout(timeout);

      if (err) {
        if (err.code === 'ENODATA' || err.code === 'ENOTFOUND') {
          resolve({
            server: server.name,
            ip: server.ip,
            location: server.location,
            addresses: [],
            error: 'No NS records found',
            status: 'no_data'
          });
        } else {
          reject(err);
        }
      } else {
        resolve({
          server: server.name,
          ip: server.ip,
          location: server.location,
          addresses: addresses.sort(), // Sort for consistent comparison
          status: 'success'
        });
      }
    });
  });
}  // End of queryNsRecords

/**
 * Query MX records from a specific DNS server
 * @param {string} domain - Domain to query
 * @param {Object} server - DNS server info
 * @returns {Promise<Object>} - Query result
 */
async function queryMxRecords(domain, server) {
  return new Promise((resolve, reject) => {
    const resolver = new Resolver();
    resolver.setServers([server.ip]);

    const timeout = setTimeout(() => {
      reject(new Error('Query timeout'));
    }, 5000);

    resolver.resolveMx(domain, (err, addresses) => {
      clearTimeout(timeout);

      if (err) {
        if (err.code === 'ENODATA' || err.code === 'ENOTFOUND') {
          resolve({
            server: server.name,
            ip: server.ip,
            location: server.location,
            addresses: [],
            error: 'No MX records found',
            status: 'no_data'
          });
        } else {
          reject(err);
        }
      } else {
        // Extract just exchange names (ignore priority for comparison)
        const exchanges = addresses
          .map(mx => mx.exchange.toLowerCase())
          .sort();
        
        resolve({
          server: server.name,
          ip: server.ip,
          location: server.location,
          addresses: exchanges,
          fullRecords: addresses, // Keep full records with priority
          status: 'success'
        });
      }
    });
  });
} // End of queryMxRecords

/**
 * Query TXT records from a specific DNS server
 * @param {string} domain - Domain to query
 * @param {Object} server - DNS server info
 * @returns {Promise<Object>} - Query result
 */
async function queryTxtRecords(domain, server) {
  return new Promise((resolve, reject) => {
    const resolver = new Resolver();
    resolver.setServers([server.ip]);

    const timeout = setTimeout(() => {
      reject(new Error('Query timeout'));
    }, 5000);

    resolver.resolveTxt(domain, (err, addresses) => {
      clearTimeout(timeout);

      if (err) {
        if (err.code === 'ENODATA' || err.code === 'ENOTFOUND') {
          resolve({
            server: server.name,
            ip: server.ip,
            location: server.location,
            addresses: [],
            error: 'No TXT records found',
            status: 'no_data'
          });
        } else {
          reject(err);
        }
      } else {
        // Flatten and sort TXT records
        const txtRecords = addresses
          .map(record => record.join(''))
          .sort();
        
        resolve({
          server: server.name,
          ip: server.ip,
          location: server.location,
          addresses: txtRecords,
          status: 'success'
        });
      }
    });
  });
} // End of queryTxtRecords


/**
 * Analyze propagation results
 * @param {Array} serverResults - Results from all servers
 * @returns {Object} - Analysis
 */
function analyzePropagation(serverResults) {
  // Filter successful queries
  const successfulQueries = serverResults.filter(
    r => r.status === 'success' && r.addresses.length > 0
  );

  if (successfulQueries.length === 0) {
    return {
      isPropagated: false,
      percentage: 0,
      totalServers: serverResults.length,
      respondedServers: 0,
      uniqueIPs: [],
      message: 'No DNS servers returned A records'
    };
  }

  // Get all unique IP addresses
  const allIPs = new Set();
  successfulQueries.forEach(result => {
    result.addresses.forEach(ip => allIPs.add(ip));
  });

  // Check if all successful queries return the same IPs
  const uniqueIPSets = new Map();
  successfulQueries.forEach(result => {
    const ipSet = result.addresses.sort().join(',');
    if (!uniqueIPSets.has(ipSet)) {
      uniqueIPSets.set(ipSet, []);
    }
    uniqueIPSets.get(ipSet).push(result.server);
  });

  // Calculate propagation percentage
  const totalServers = serverResults.length;
  const respondedServers = successfulQueries.length;
  const percentage = Math.round((respondedServers / totalServers) * 100);

  // Check if fully propagated (all servers return same IPs)
  const isPropagated = uniqueIPSets.size === 1 && respondedServers === totalServers;

  return {
    isPropagated: isPropagated,
    percentage: percentage,
    totalServers: totalServers,
    respondedServers: respondedServers,
    uniqueIPs: Array.from(allIPs),
    uniqueIPSets: Array.from(uniqueIPSets.entries()).map(([ips, servers]) => ({
      ips: ips.split(','),
      servers: servers
    })),
    message: isPropagated 
      ? 'DNS fully propagated globally' 
      : `DNS propagation in progress (${percentage}% of servers responding)`
  };
} // End of analyzePropagation

/**
 * Check propagation for a specific record type
 * @param {string} domain - Domain name
 * @param {string} recordType - Record type (A, NS, MX, TXT)
 * @returns {Promise<Object>} - Propagation results
 */
async function checkPropagationByType(domain, recordType) {
  try {
    console.log(`🔍 Checking ${recordType} record propagation for: ${domain}`);

    // Select appropriate query function
    let queryFunction;
    switch (recordType) {
      case 'A':
        queryFunction = queryDnsServer;
        break;
      case 'NS':
        queryFunction = queryNsRecords;
        break;
      case 'MX':
        queryFunction = queryMxRecords;
        break;
      case 'TXT':
        queryFunction = queryTxtRecords;
        break;
      default:
        throw new Error(`Unsupported record type: ${recordType}`);
    }

    // Query all DNS servers in parallel
    const results = await Promise.allSettled(
      DNS_SERVERS.map(server => queryFunction(domain, server))
    );

    // Extract results
    const serverResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          server: DNS_SERVERS[index].name,
          ip: DNS_SERVERS[index].ip,
          location: DNS_SERVERS[index].location,
          addresses: [],
          error: result.reason?.message || 'Query failed',
          status: 'error'
        };
      }
    });

    // Analyze propagation
    const analysis = analyzePropagationByType(serverResults, recordType);

    console.log(`✅ ${recordType} propagation check complete: ${analysis.percentage}%`);

    return {
      recordType: recordType,
      servers: serverResults,
      analysis: analysis
    };

  } catch (error) {
    console.error(`❌ ${recordType} propagation check failed:`, error.message);
    throw error;
  }

} // End of checkPropagationByType

/**
 * Analyze propagation results for any record type (IMPROVED)
 * @param {Array} serverResults - Results from all servers
 * @param {string} recordType - Type of record being analyzed
 * @returns {Object} - Analysis
 */
function analyzePropagationByType(serverResults, recordType) {
  // Separate successful queries from errors/timeouts
  const successfulQueries = serverResults.filter(
    r => r.status === 'success' && r.addresses && r.addresses.length > 0
  );
  
  const noDataQueries = serverResults.filter(
    r => r.status === 'no_data'
  );
  
  const errorQueries = serverResults.filter(
    r => r.status === 'error'
  );
  
  // Calculate responding servers (success + no_data, exclude errors/timeouts)
  const respondingServers = successfulQueries.length + noDataQueries.length;
  const totalServers = serverResults.length;
  
  // If no servers responded at all
  if (respondingServers === 0) {
    return {
      isPropagated: false,
      percentage: 0,
      totalServers: totalServers,
      respondedServers: 0,
      errorCount: errorQueries.length,
      uniqueValues: [],
      message: `No ${recordType} records found on any DNS server`
    };
  }
  
  // If no successful queries (all returned no_data)
  if (successfulQueries.length === 0) {
    return {
      isPropagated: true, // Consider it "propagated" if all responding servers agree (no records)
      percentage: 100,
      totalServers: totalServers,
      respondedServers: respondingServers,
      errorCount: errorQueries.length,
      uniqueValues: [],
      message: `No ${recordType} records configured (consistent across all responding servers)`
    };
  }
  
  // Collect unique record sets
  const recordSets = new Map();
  successfulQueries.forEach(result => {
    const recordKey = result.addresses.sort().join('|');
    if (!recordSets.has(recordKey)) {
      recordSets.set(recordKey, {
        records: result.addresses,
        servers: []
      });
    }
    recordSets.get(recordKey).servers.push(result.server);
  });
  
  // Calculate propagation based on RESPONDING servers only
  const percentage = Math.round((successfulQueries.length / respondingServers) * 100);
  
  // Check if all responding servers agree
  const isPropagated = recordSets.size === 1 && noDataQueries.length === 0;
  
  // Get all unique values
  const allUniqueValues = new Set();
  successfulQueries.forEach(result => {
    result.addresses.forEach(record => allUniqueValues.add(record));
  });
  
  // Build message
  let message;
  if (isPropagated) {
    if (errorQueries.length > 0) {
      message = `${recordType} records fully propagated (${errorQueries.length} server${errorQueries.length > 1 ? 's' : ''} did not respond)`;
    } else {
      message = `${recordType} records fully propagated globally`;
    }
  } else if (recordSets.size > 1) {
    message = `${recordType} records inconsistent - multiple values detected`;
  } else {
    message = `${recordType} records propagation in progress (${percentage}% of responding servers)`;
  }
  
  return {
    isPropagated: isPropagated,
    percentage: percentage,
    totalServers: totalServers,
    respondedServers: respondingServers, // Only servers that responded (success + no_data)
    errorCount: errorQueries.length, // Servers that timed out or errored
    uniqueValues: Array.from(allUniqueValues),
    uniqueRecordSets: Array.from(recordSets.entries()).map(([key, value]) => ({
      records: value.records,
      servers: value.servers
    })),
    message: message
  };
} // End of analyzePropagationByType

/**
 * Check propagation for all record types
 * @param {string} domain - Domain name to check
 * @returns {Promise<Object>} - All propagation results
 */
export async function checkAllPropagation(domain) {
  try {
    console.log(`🌍 Checking all DNS propagation for: ${domain}`);

    // Query all record types in parallel
    const [aResults, nsResults, mxResults, txtResults] = await Promise.allSettled([
      checkPropagationByType(domain, 'A'),
      checkPropagationByType(domain, 'NS'),
      checkPropagationByType(domain, 'MX'),
      checkPropagationByType(domain, 'TXT')
    ]);

    const extractResult = (result) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          recordType: 'unknown',
          servers: [],
          analysis: {
            isPropagated: false,
            percentage: 0,
            totalServers: 0,
            respondedServers: 0,
            uniqueValues: [],
            message: `Query failed: ${result.reason?.message || 'Unknown error'}`
          }
        };
      }
    };

    return {
      domain: domain,
      a: extractResult(aResults),
      ns: extractResult(nsResults),
      mx: extractResult(mxResults),
      txt: extractResult(txtResults),
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`❌ All propagation check failed:`, error.message);
    throw new Error(`All propagation check failed: ${error.message}`);
  }
}