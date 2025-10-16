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
}

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
}