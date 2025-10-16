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
      fetch('/api/propagation', {
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
  // Populate domain info
  document.getElementById('domainName').textContent = data.domain;
  document.getElementById('registrar').textContent = data.registrar;
  
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

// Display Propagation results (NEW!)
function displayPropagationResults(data) {
  const analysis = data.analysis;
  
  // Status with emoji
  const statusElement = document.getElementById('propagationStatus');
  if (analysis.isPropagated) {
    statusElement.innerHTML = '<span class="text-green-600">✅ Propagated</span>';
  } else {
    statusElement.innerHTML = '<span class="text-yellow-600">⏳ Propagating</span>';
  }
  
  // Percentage
  document.getElementById('propagationPercentage').innerHTML = 
    `<span class="text-blue-600">${analysis.percentage}%</span>`;
  
  // Server count
  document.getElementById('propagationServers').innerHTML = 
    `<span class="text-gray-800">${analysis.respondedServers} / ${analysis.totalServers}</span>`;
  
  // Message
  document.getElementById('propagationMessage').textContent = analysis.message;
  
  // IP Summary
  const ipSummary = document.getElementById('ipSummary');
  if (analysis.uniqueIPSets && analysis.uniqueIPSets.length > 0) {
    let summaryHTML = '<div class="bg-gray-50 p-4 rounded-lg"><p class="text-sm font-semibold text-gray-700 mb-2">IP Addresses Found:</p><ul class="space-y-1">';
    
    analysis.uniqueIPSets.forEach(ipSet => {
      const ips = ipSet.ips.join(', ');
      const serverCount = ipSet.servers.length;
      const isConsistent = analysis.uniqueIPSets.length === 1;
      const color = isConsistent ? 'text-green-700' : 'text-yellow-700';
      
      summaryHTML += `
        <li class="text-sm ${color}">
          <span class="font-mono font-semibold">${ips}</span>
          <span class="text-gray-600"> (${serverCount} server${serverCount > 1 ? 's' : ''})</span>
        </li>
      `;
    });
    
    summaryHTML += '</ul></div>';
    ipSummary.innerHTML = summaryHTML;
  } else {
    ipSummary.innerHTML = '<p class="text-sm text-gray-500">No IP addresses found</p>';
  }
  
  // Server Results
  const serverResults = document.getElementById('serverResults');
  serverResults.innerHTML = '';
  
  data.servers.forEach(server => {
    const card = document.createElement('div');
    card.className = 'bg-gray-50 p-4 rounded-lg border-l-4';
    
    // Determine status and styling
    let statusIcon = '';
    let borderColor = '';
    let addressHTML = '';
    
    if (server.status === 'success' && server.addresses.length > 0) {
      statusIcon = '✅';
      borderColor = 'border-green-500';
      addressHTML = server.addresses.map(ip => 
        `<p class="font-mono text-sm text-gray-900">${ip}</p>`
      ).join('');
    } else if (server.status === 'no_data') {
      statusIcon = '⚠️';
      borderColor = 'border-yellow-500';
      addressHTML = '<p class="text-sm text-gray-500">No A records</p>';
    } else {
      statusIcon = '❌';
      borderColor = 'border-red-500';
      addressHTML = `<p class="text-sm text-red-600">${server.error || 'Error'}</p>`;
    }
    
    card.className += ` ${borderColor}`;
    
    card.innerHTML = `
      <div class="flex items-start justify-between mb-2">
        <div>
          <p class="font-semibold text-gray-900">${statusIcon} ${server.server}</p>
          <p class="text-xs text-gray-500">${server.ip} (${server.location})</p>
        </div>
      </div>
      <div class="mt-2">
        ${addressHTML}
      </div>
    `;
    
    serverResults.appendChild(card);
  });
  
  // Show propagation results section
  propagationResults.classList.remove('hidden');
}

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
}