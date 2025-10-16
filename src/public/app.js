// Get DOM elements
const domainInput = document.getElementById('domainInput');
const lookupBtn = document.getElementById('lookupBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');
const results = document.getElementById('results');
const dnsResults = document.getElementById('dnsResults');

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

// Perform full lookup (WHOIS + DNS)
async function performFullLookup(domain) {
  // Hide previous results/errors
  hideAll();
  
  // Show loading
  loading.classList.remove('hidden');
  lookupBtn.disabled = true;
  lookupBtn.textContent = 'Looking up...';

  try {
    // Call both APIs in parallel
    const [whoisResponse, dnsResponse] = await Promise.all([
      fetch('/api/whois', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      }),
      fetch('/api/dns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      })
    ]);

    const whoisData = await whoisResponse.json();
    const dnsData = await dnsResponse.json();

    // Check for errors
    if (!whoisResponse.ok || !whoisData.success) {
      throw new Error(whoisData.error || 'WHOIS lookup failed');
    }

    if (!dnsResponse.ok || !dnsData.success) {
      throw new Error(dnsData.error || 'DNS query failed');
    }

    // Display both results
    displayWhoisResults(whoisData.data);
    displayDnsResults(dnsData.data);

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
}

// Hide all
function hideAll() {
  error.classList.add('hidden');
  results.classList.add('hidden');
  dnsResults.classList.add('hidden');
}