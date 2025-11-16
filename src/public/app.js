// Get DOM elements
const domainInput = document.getElementById('domainInput');
const lookupBtn = document.getElementById('lookupBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');
const results = document.getElementById('results');
const dnsResults = document.getElementById('dnsResults');
const propagationResults = document.getElementById('propagationResults');

// Lookup button click handler
lookupBtn.addEventListener('click', async () => {
  const domain = domainInput.value.trim();
  
  if (!domain) {
    showError('Please enter a domain name');
    return;
  }

  await performFullLookup(domain);
});

// Enter key handler
domainInput.addEventListener('keypress', async (e) => {
  if (e.key === 'Enter') {
    const domain = domainInput.value.trim();
    if (domain) {
      await performFullLookup(domain);
    }
  }
});

// Collapsible raw data toggle
document.addEventListener('click', (e) => {
  if (e.target.id === 'toggleRawData' || e.target.closest('#toggleRawData')) {
    const content = document.getElementById('rawDataContent');
    const arrow = document.getElementById('rawDataArrow');
    
    if (content.classList.contains('hidden')) {
      content.classList.remove('hidden');
      arrow.textContent = '▲';
    } else {
      content.classList.add('hidden');
      arrow.textContent = '▼';
    }
  }
});

// Perform full lookup (WHOIS + DNS + Propagation)
async function performFullLookup(domain) {
  // Hide previous results/errors
  hideAll();
  error.classList.add('hidden');
  results.classList.add('hidden');
  document.getElementById('subdomainBanner').classList.add('hidden');
  // DON'T hide DNS and Propagation - we'll let the display functions handle it
  
  // Show loading
  loading.classList.remove('hidden');
  lookupBtn.disabled = true;
  lookupBtn.textContent = 'Looking up...';

  try {
    // Call all three APIs in parallel
    const [whoisResponse, dnsResponse, propagationResponse] = await Promise.all([
      fetch('/api/whois', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      }),
      fetch('/api/dns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      }),
      fetch('/api/propagation-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      })
    ]);

    const whoisData = await whoisResponse.json();
    const dnsData = await dnsResponse.json();
    const propagationData = await propagationResponse.json();

    // Check for errors
    if (!whoisResponse.ok || !whoisData.success) {
      throw new Error(whoisData.error || 'WHOIS lookup failed');
    }

    if (!dnsResponse.ok || !dnsData.success) {
      throw new Error(dnsData.error || 'DNS query failed');
    }

    if (!propagationResponse.ok || !propagationData.success) {
      throw new Error(propagationData.error || 'Propagation check failed');
    }

    // Display all results
    displayWhoisResults(whoisData.data);
    displayDnsResults(dnsData.data);
    displayPropagationResults(propagationData.data);

// For subdomains: Force DNS and Propagation to be visible
    if (whoisData.data.isSubdomain) {
      setTimeout(() => {
        const dns = document.getElementById('dnsResults');
        const prop = document.getElementById('propagationResults');
        
        // Remove hidden class
        dns.classList.remove('hidden');
        prop.classList.remove('hidden');
        
        // Force display
        dns.style.display = 'block';
        prop.style.display = 'block';
        
        // Also remove from parent if needed
        dns.style.visibility = 'visible';
        prop.style.visibility = 'visible';
        
        console.log('✅ Forced DNS/Prop visible:', {
          dnsClasses: dns.className,
          propClasses: prop.className,
          dnsDisplay: dns.style.display,
          propDisplay: prop.style.display
        });
      }, 200);
    }

  } catch (err) {
    showError(err.message);
  } finally {
    // Hide loading
    loading.classList.add('hidden');
    lookupBtn.disabled = false;
    lookupBtn.textContent = 'Full Lookup';
  }
}

  // Display WHOIS results
function displayWhoisResults(data) {
  // Check if subdomain
  const subdomainBanner = document.getElementById('subdomainBanner');
  
  if (data.isSubdomain) {
    // Show subdomain banner
    document.getElementById('subdomainName').textContent = data.domain;
    document.getElementById('rootDomainName').textContent = data.rootDomain;
    subdomainBanner.classList.remove('hidden');
    
    // Hide WHOIS section for subdomains
    results.classList.add('hidden');
    
    // Add click handler for "lookup root domain" button
    document.getElementById('lookupRootDomain').onclick = () => {
      domainInput.value = data.rootDomain;
      performFullLookup(data.rootDomain);
    };
    
    // Exit early - don't display WHOIS data
    return;

  } else {
    // Hide subdomain banner for root domains
    subdomainBanner.classList.add('hidden');
  }

  // Populate domain info
  document.getElementById('domainName').textContent = data.domain;
  document.getElementById('registrar').textContent = data.registrar;

   // Display provider (for Brazilian domains only)
  const providerContainer = document.getElementById('providerContainer');
  const providerElement = document.getElementById('provider');
  
  if (data.provider) {
    providerContainer.classList.remove('hidden');
    providerElement.textContent = data.provider;
  } else {
    providerContainer.classList.add('hidden');
  }
  
  // Populate dates
  document.getElementById('createdDate').textContent = formatDate(data.createdDate);
  document.getElementById('updatedDate').textContent = formatDate(data.updatedDate);
  document.getElementById('expiresDate').textContent = formatDate(data.expiresDate);

  // Display DNSSEC
  document.getElementById('dnssec').textContent = data.dnssec || 'N/A';

  // Display name servers
  const nameServers = document.getElementById('nameServers');
  nameServers.innerHTML = '';
  
  if (Array.isArray(data.nameServers) && data.nameServers.length > 0) {
    data.nameServers.forEach(ns => {
      const p = document.createElement('p');
      p.className = 'text-sm text-gray-700 font-mono';
      p.textContent = ns;
      nameServers.appendChild(p);
    });
  } else {
    nameServers.innerHTML = '<p class="text-sm text-gray-500">No name servers found</p>';
  }

  // Display status with links
  const statusList = document.getElementById('statusList');
  statusList.innerHTML = '';
  
  if (Array.isArray(data.status) && data.status.length > 0) {
    data.status.forEach(status => {
      const div = document.createElement('div');
      div.className = 'text-sm';
      
      const parsed = parseStatus(status);
      
      if (parsed.url) {
        div.innerHTML = `
          <span class="font-bold text-gray-900">${parsed.name}</span>
          <span class="text-gray-500"> - </span>
          <a href="${parsed.url}" target="_blank" class="text-blue-600 hover:text-blue-800 underline">${parsed.url}</a>
        `;
      } else {
        div.innerHTML = `<span class="font-bold text-gray-900">${parsed.name}</span>`;
      }
      
      statusList.appendChild(div);
    });
  } else {
    statusList.innerHTML = '<p class="text-sm text-gray-500">No status information available</p>';
  }

  // Display raw data
  const rawData = document.getElementById('rawData');
  rawData.textContent = JSON.stringify(data.raw, null, 2);
  
  // Reset collapsible state
  const rawDataContent = document.getElementById('rawDataContent');
  const rawDataArrow = document.getElementById('rawDataArrow');
  rawDataContent.classList.add('hidden');
  rawDataArrow.textContent = '▼';

  // Show results
  results.classList.remove('hidden');
}

// Display DNS results
function displayDnsResults(data) {
  console.log('📥 displayDnsResults called with data:', data);
  // A Records (IPv4)
  displayRecordList('aRecords', data.a, (record) => 
    `<span class="font-mono text-gray-900">${record.address}</span>`
  );

  // AAAA Records (IPv6)
  displayRecordList('aaaaRecords', data.aaaa, (record) => 
    `<span class="font-mono text-gray-900">${record.address}</span>`
  );

  // MX Records
  displayRecordList('mxRecords', data.mx, (record) => 
    `<span class="font-semibold text-gray-900">Priority ${record.priority}:</span> <span class="font-mono">${record.exchange}</span>`
  );

  // TXT Records
  displayRecordList('txtRecords', data.txt, (record) => {
    const text = record.text;
    const truncated = text.length > 100 ? text.substring(0, 100) + '...' : text;
    return `<span class="text-gray-700 break-all text-xs">${escapeHtml(truncated)}</span>`;
  });

  // NS Records
  displayRecordList('dnsNsRecords', data.ns, (record) => 
    `<span class="font-mono text-gray-900">${record.nameserver}</span>`
  );

  // SOA Record
  const soaDiv = document.getElementById('soaRecord');
  if (data.soa) {
    soaDiv.innerHTML = `
      <div class="space-y-1">
        <p><span class="font-semibold">Primary NS:</span> ${data.soa.nsname}</p>
        <p><span class="font-semibold">Admin:</span> ${data.soa.hostmaster}</p>
        <p><span class="font-semibold">Serial:</span> ${data.soa.serial}</p>
        <p><span class="font-semibold">Refresh:</span> ${data.soa.refresh}s</p>
        <p><span class="font-semibold">Retry:</span> ${data.soa.retry}s</p>
        <p><span class="font-semibold">Expire:</span> ${data.soa.expire}s</p>
        <p><span class="font-semibold">Min TTL:</span> ${data.soa.minttl}s</p>
      </div>
    `;
  } else {
    soaDiv.innerHTML = '<p class="text-sm text-gray-500">No SOA record found</p>';
  }

  // CAA Records
  displayRecordList('caaRecords', data.caa, (record) => {
    const critical = record.critical ? 'Critical: ' : '';
    const tag = record.issue || record.issuewild || record.iodef || 'unknown';
    const value = record.value || '';
    return `<span class="font-semibold">${critical}${tag}:</span> <span class="font-mono">${value}</span>`;
  });

  // Show DNS results section
  dnsResults.classList.remove('hidden');
}

// Display Propagation results (ALL record types)
function displayPropagationResults(data) {
  console.log('📥 displayDnsResults called with data:', data);
  // Display each record type
  displaySinglePropagation('a', data.a);
  displaySinglePropagation('ns', data.ns);
  displaySinglePropagation('mx', data.mx);
  displaySinglePropagation('txt', data.txt);
  
  // Show propagation results section
  propagationResults.classList.remove('hidden');
  propagationResults.style.display = 'block';
}

// Display single record type propagation (compact version)
function displaySinglePropagation(recordType, propagationData) {
  const analysis = propagationData.analysis;
  
  // Status badge
  const statusBadge = document.getElementById(`${recordType}StatusBadge`);
  if (analysis.isPropagated) {
    statusBadge.textContent = '✓ Propagated';
    statusBadge.className = 'px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800';
  } else if (analysis.respondedServers === 0) {
    statusBadge.textContent = 'No Records';
    statusBadge.className = 'px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600';
  } else {
    statusBadge.textContent = 'Propagating';
    statusBadge.className = 'px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800';
  }
  
  // Percentage badge
  document.getElementById(`${recordType}PercentageBadge`).textContent = `${analysis.percentage}%`;
  
  // Server count
  document.getElementById(`${recordType}ServerCount`).textContent = 
    `${analysis.respondedServers}/${analysis.totalServers} servers`;
  
  // Values Summary (more compact)
  const valuesDiv = document.getElementById(`${recordType}Values`);
  if (analysis.uniqueValues && analysis.uniqueValues.length > 0) {
    const isConsistent = analysis.uniqueRecordSets && analysis.uniqueRecordSets.length === 1;
    const bgColor = isConsistent ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200';
    
    let valuesHTML = `<div class="${bgColor} border rounded-lg p-3">`;
    valuesHTML += '<p class="text-xs font-semibold text-gray-700 mb-2">Values Found:</p>';
    valuesHTML += '<div class="flex flex-wrap gap-2">';
    
    analysis.uniqueValues.forEach(value => {
      const color = isConsistent ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
      valuesHTML += `<span class="${color} px-2 py-1 rounded text-xs font-mono break-all">${escapeHtml(value)}</span>`;
    });
    
    valuesHTML += '</div></div>';
    valuesDiv.innerHTML = valuesHTML;
  } else {
    valuesDiv.innerHTML = '<p class="text-sm text-gray-500 italic">No records found</p>';
  }
  
  // Server Results (more compact cards)
  const serverResults = document.getElementById(`${recordType}ServerResults`);
  serverResults.innerHTML = '';
  
  propagationData.servers.forEach(server => {
    const card = document.createElement('div');
    card.className = 'bg-white border rounded p-2 text-xs';
    
    // Determine status and styling
    let statusIcon = '';
    let borderColor = 'border-gray-300';
    let contentHTML = '';
    
    if (server.status === 'success' && server.addresses && server.addresses.length > 0) {
      statusIcon = '<span class="text-green-600">✓</span>';
      borderColor = 'border-green-300';
      contentHTML = `<div class="text-gray-600 mt-1 font-mono truncate" title="${escapeHtml(server.addresses[0])}">${escapeHtml(server.addresses[0])}</div>`;
    } else if (server.status === 'no_data') {
      statusIcon = '<span class="text-gray-400">○</span>';
      contentHTML = `<div class="text-gray-400 mt-1 text-xs">No data</div>`;
    } else {
      statusIcon = '<span class="text-red-600">✗</span>';
      borderColor = 'border-red-300';
      contentHTML = `<div class="text-red-500 mt-1 text-xs">Error</div>`;
    }
    
    card.className += ` ${borderColor}`;
    
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="font-semibold text-gray-800 truncate">${server.server}</span>
        ${statusIcon}
      </div>
      ${contentHTML}
    `;
    
    serverResults.appendChild(card);
  });
} // End of displaySinglePropagation

// Helper function to display record lists
function displayRecordList(elementId, records, formatter) {
  const element = document.getElementById(elementId);
  element.innerHTML = '';
  
  if (Array.isArray(records) && records.length > 0) {
    records.forEach(record => {
      const p = document.createElement('p');
      p.className = 'text-sm';
      p.innerHTML = formatter(record);
      element.appendChild(p);
    });
  } else {
    element.innerHTML = '<p class="text-sm text-gray-500">No records found</p>';
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Parse status string
function parseStatus(statusString) {
  const trimmed = statusString.trim();
  const parts = trimmed.split(/\s+/);
  const urlPart = parts.find(part => part.startsWith('http'));
  
  if (urlPart) {
    const name = trimmed.substring(0, trimmed.indexOf(urlPart)).trim();
    return { name: name || trimmed, url: urlPart };
  } else {
    return { name: trimmed, url: null };
  }
}

// Format date
function formatDate(dateStr) {
  if (!dateStr || dateStr === 'N/A') return 'N/A';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

// Show error
function showError(message) {
  errorMessage.textContent = message;
  error.classList.remove('hidden');
  results.classList.add('hidden');
  dnsResults.classList.add('hidden');
  propagationResults.classList.add('hidden');
}

// Hide all
function hideAll() {
  error.classList.add('hidden');
  results.classList.add('hidden');
  dnsResults.classList.add('hidden');
  propagationResults.classList.add('hidden');
  document.getElementById('subdomainBanner').classList.add('hidden');
}

// Toggle collapsible sections
function toggleSection(sectionId) {
  const section = document.getElementById(sectionId);
  const chevron = document.getElementById(sectionId.replace('Details', 'Chevron'));
  
  if (section.classList.contains('hidden')) {
    section.classList.remove('hidden');
    chevron.classList.add('rotate-180');
  } else {
    section.classList.add('hidden');
    chevron.classList.remove('rotate-180');
  }
}

// Load version on page load
async function loadVersion() {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    document.getElementById('footerVersion').textContent = data.version || '2.3.0';
  } catch (error) {
    console.error('Failed to load version:', error);
    document.getElementById('footerVersion').textContent = '2.3.0';
  }
}

// Call on page load
window.addEventListener('DOMContentLoaded', loadVersion);