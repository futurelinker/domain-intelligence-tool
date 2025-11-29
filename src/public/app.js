// ============================================
// REAL-TIME CLOCKS & DATE
// ============================================

function updateClocks() {
  const now = new Date();
  
  // UTC Time
  const utcHours = String(now.getUTCHours()).padStart(2, '0');
  const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
  const utcSeconds = String(now.getUTCSeconds()).padStart(2, '0');
  const utcEl = document.getElementById('clockUTC');
  if (utcEl) utcEl.textContent = `${utcHours}:${utcMinutes}:${utcSeconds}`;
  
  // Vilnius Time (Europe/Vilnius timezone)
  try {
    const vilniusTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Vilnius' }));
    const vilniusHours = String(vilniusTime.getHours()).padStart(2, '0');
    const vilniusMinutes = String(vilniusTime.getMinutes()).padStart(2, '0');
    const vilniusSeconds = String(vilniusTime.getSeconds()).padStart(2, '0');
    const vilniusEl = document.getElementById('clockVilnius');
    if (vilniusEl) vilniusEl.textContent = `${vilniusHours}:${vilniusMinutes}:${vilniusSeconds}`;
  } catch (e) {
    console.error('Error getting Vilnius time:', e);
  }
  
  // Local Time
  const localHours = String(now.getHours()).padStart(2, '0');
  const localMinutes = String(now.getMinutes()).padStart(2, '0');
  const localSeconds = String(now.getSeconds()).padStart(2, '0');
  const localEl = document.getElementById('clockLocal');
  if (localEl) localEl.textContent = `${localHours}:${localMinutes}:${localSeconds}`;
}

// Update current date
function updateDate() {
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleDateString('en-US', { month: 'long' });
  const dateEl = document.getElementById('currentDate');
  if (dateEl) dateEl.textContent = `${day} ${month}`;
}

// Initialize clocks and date
setInterval(updateClocks, 1000);
updateClocks(); // Initial call
updateDate();

// ============================================
// ENHANCED TOGGLE FUNCTION FOR NEW DESIGN
// ============================================

function toggleSection(sectionId) {
  const section = document.getElementById(sectionId);
  const chevronId = sectionId.replace('Details', 'Chevron');
  const chevron = document.getElementById(chevronId);
  
  if (section && section.classList.contains('hidden')) {
    section.classList.remove('hidden');
    if (chevron) chevron.classList.add('rotate');
  } else if (section) {
    section.classList.add('hidden');
    if (chevron) chevron.classList.remove('rotate');
  }
}

// ============================================
// LOAD VERSION
// ============================================

async function loadFooterVersion() {
  try {
    const response = await fetch('/api/version');
    const data = await response.json();
    const versionEl = document.getElementById('footerVersion');
    if (versionEl) {
      versionEl.textContent = data.version;
    }
  } catch (error) {
    console.error('Failed to load version:', error);
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadFooterVersion);
} else {
  loadFooterVersion();
}


// Get DOM elements
const domainInput = document.getElementById('domainInput');
const lookupBtn = document.getElementById('lookupBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const results = document.getElementById('results');
const dnsResults = document.getElementById('dnsResults');
const propagationResults = document.getElementById('propagationResults');
const sslResults = document.getElementById('sslResults');
const hostingResults = document.getElementById('hostingResults');
const technologyResults = document.getElementById('technologyResults');

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

// Perform full lookup (WHOIS + DNS + Propagation + SSL + Hosting + Technology)
async function performFullLookup(domain) {
  // Clean domain input (remove protocols, paths, etc.)
  domain = domain
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')   // Remove protocol
    .replace(/^www\./, '')         // Remove www
    .replace(/:\d+/, '')           // Remove port
    .replace(/\/.*$/, '')          // Remove path and everything after /
    .replace(/\?.*$/, '')          // Remove query string
    .replace(/#.*$/, '')           // Remove hash/fragment
    .replace(/\s+/g, '');          // Remove whitespace
  
  console.log(`🔍 Cleaned domain: ${domain}`);

  // Update input field with cleaned domain
  domainInput.value = domain;
  
  // Hide previous results/errors
  hideAll();
  
  // Show loading
  loading.classList.remove('hidden');
  lookupBtn.disabled = true;
  lookupBtn.textContent = 'Looking up...';

  try {
    // Call all three APIs in parallel
const [whoisResponse, dnsResponse, propagationResponse, sslResponse, hostingResponse, technologyResponse] = await Promise.all([
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
      }),
      fetch('/api/ssl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      }),
      fetch('/api/hosting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      }),
      fetch('/api/technology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      })
    ]);

    const whoisData = await whoisResponse.json();
    const dnsData = await dnsResponse.json();
    const propagationData = await propagationResponse.json();
    const sslData = await sslResponse.json();
    const hostingData = await hostingResponse.json();
    const technologyData = await technologyResponse.json();


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
    // SSL is optional - don't throw error if it fails
    if (!sslResponse.ok || !sslData.success) {
      console.warn('SSL check failed:', sslData.error);
      // We'll handle this gracefully in displaySSLResults
    }

     // Hosting is optional - don't throw error if it fails
    if (!hostingResponse.ok || !hostingData.success) {
      console.warn('Hosting detection failed:', hostingData.error);
    }

    // Technology is optional - don't throw error if it fails
    if (!technologyResponse.ok || !technologyData.success) {
      console.warn('Technology detection failed:', technologyData.error);
    }


    // Display all results
    displayWhoisResults(whoisData.data);
    displayDnsResults(dnsData.data);
    displayPropagationResults(propagationData.data);
    displaySSLResults(sslData); // Note: passing entire sslData, not just .data
    displayHostingResults(hostingData);
    displayTechnologyResults(technologyData);

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
    results.style.display = 'none';
    
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

  // Populate domain info (design system)
  const domainNameEl = document.getElementById('domainName');
  domainNameEl.textContent = data.domain;
  domainNameEl.className = 'data-value';
  
  const registrarEl = document.getElementById('registrar');
  registrarEl.textContent = data.registrar;
  registrarEl.className = 'data-value';

  // Display provider (for Brazilian domains only) - design system
  const providerContainer = document.getElementById('providerContainer');
  const providerElement = document.getElementById('provider');
  
  if (data.provider) {
    providerContainer.classList.remove('hidden');
    providerElement.textContent = data.provider;
    providerElement.className = 'data-value';
  } else {
    providerContainer.classList.add('hidden');
  }
   
  // Populate dates (design system)
  const createdDateEl = document.getElementById('createdDate');
  createdDateEl.textContent = formatDate(data.createdDate);
  createdDateEl.className = 'data-value';
  
  const updatedDateEl = document.getElementById('updatedDate');
  updatedDateEl.textContent = formatDate(data.updatedDate);
  updatedDateEl.className = 'data-value';
  
  const expiresDateEl = document.getElementById('expiresDate');
  expiresDateEl.textContent = formatDate(data.expiresDate);
  expiresDateEl.className = 'data-value';

  // Display DNSSEC (design system)
  const dnssecEl = document.getElementById('dnssec');
  dnssecEl.textContent = data.dnssec || 'N/A';
  dnssecEl.className = 'data-value';

  // Display name servers (design system)
  const nameServers = document.getElementById('nameServers');
  nameServers.innerHTML = '';
  
  if (Array.isArray(data.nameServers) && data.nameServers.length > 0) {
    data.nameServers.forEach(ns => {
      const p = document.createElement('p');
      p.className = 'data-value mono';
      p.style.cssText = 'margin-bottom: 0.25rem;';
      p.textContent = ns;
      nameServers.appendChild(p);
    });
  } else {
    nameServers.innerHTML = '<p style="font-size: 0.875rem; color: var(--text-muted);">No name servers found</p>';
  }

  // Display status with links (design system)
  const statusList = document.getElementById('statusList');
  statusList.innerHTML = '';
  
  if (Array.isArray(data.status) && data.status.length > 0) {
    data.status.forEach(status => {
      const div = document.createElement('div');
      div.style.cssText = 'font-size: 0.875rem; margin-bottom: 0.5rem;';
      
      const parsed = parseStatus(status);
      
      if (parsed.url) {
        div.innerHTML = `
          <span style="font-weight: 700; color: var(--text-primary);">${parsed.name}</span>
          <span style="color: var(--text-muted);"> - </span>
          <a href="${parsed.url}" target="_blank" style="color: var(--status-info); text-decoration: underline; transition: color 0.2s;" onmouseover="this.style.color='var(--accent-green)'" onmouseout="this.style.color='var(--status-info)'">${parsed.url}</a>
        `;
      } else {
        div.innerHTML = `<span style="font-weight: 700; color: var(--text-primary);">${parsed.name}</span>`;
      }
      
      statusList.appendChild(div);
    });
  } else {
    statusList.innerHTML = '<p style="font-size: 0.875rem; color: var(--text-muted);">No status information available</p>';
  }

  // Display raw data (design system styling already in HTML)
  const rawData = document.getElementById('rawData');
  rawData.textContent = JSON.stringify(data.raw, null, 2);
  rawData.style.cssText = 'font-family: "Space Mono", monospace; font-size: 0.6875rem; color: var(--text-secondary);';
  
  // Reset collapsible state
  const rawDataContent = document.getElementById('rawDataContent');
  const rawDataArrow = document.getElementById('rawDataArrow');
  rawDataContent.classList.add('hidden');
  rawDataArrow.textContent = '▼';

  // Show results
  results.style.display = 'block';
}

// Display DNS results
function displayDnsResults(data) {
  console.log('📥 displayDnsResults called with data:', data);
  // A Records (IPv4)
  displayRecordList('aRecords', data.a, (record) => 
    `<span class="data-value mono">${record.address}</span>`
  );

  // AAAA Records (IPv6)
  displayRecordList('aaaaRecords', data.aaaa, (record) => 
    `<span class="data-value mono">${record.address}</span>`
  );

  // MX Records
  displayRecordList('mxRecords', data.mx, (record) => 
    `<span style="font-weight: 600; color: var(--text-primary); font-size: 0.875rem;">Priority ${record.priority}:</span> <span class="data-value mono">${record.exchange}</span>`
  );

  // TXT Records
  displayRecordList('txtRecords', data.txt, (record) => {
    const text = record.text;
    const truncated = text.length > 100 ? text.substring(0, 100) + '...' : text;
    return `<span style="color: var(--text-secondary); word-break: break-all; font-size: 0.75rem; font-family: 'Space Mono', monospace; line-height: 1.5;">${escapeHtml(truncated)}</span>`;
  });

  // NS Records
  displayRecordList('dnsNsRecords', data.ns, (record) => 
    `<span class="font-mono text-gray-900">${record.nameserver}</span>`
  );

  // SOA Record (compact design)
  const soaDiv = document.getElementById('soaRecord');
  if (data.soa) {
    soaDiv.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; padding: 0.75rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
        <div>
          <span style="font-size: 0.6875rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Primary NS</span>
          <p style="font-size: 0.875rem; color: var(--text-primary); font-family: 'Space Mono', monospace; margin: 0.25rem 0 0 0;">${data.soa.nsname}</p>
        </div>
        <div>
          <span style="font-size: 0.6875rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Admin</span>
          <p style="font-size: 0.875rem; color: var(--text-primary); font-family: 'Space Mono', monospace; margin: 0.25rem 0 0 0;">${data.soa.hostmaster}</p>
        </div>
        <div>
          <span style="font-size: 0.6875rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Serial</span>
          <p style="font-size: 0.875rem; color: var(--text-primary); font-family: 'Space Mono', monospace; margin: 0.25rem 0 0 0;">${data.soa.serial}</p>
        </div>
        <div>
          <span style="font-size: 0.6875rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Refresh</span>
          <p style="font-size: 0.875rem; color: var(--text-primary); font-family: 'Space Mono', monospace; margin: 0.25rem 0 0 0;">${data.soa.refresh}s</p>
        </div>
        <div>
          <span style="font-size: 0.6875rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Retry</span>
          <p style="font-size: 0.875rem; color: var(--text-primary); font-family: 'Space Mono', monospace; margin: 0.25rem 0 0 0;">${data.soa.retry}s</p>
        </div>
        <div>
          <span style="font-size: 0.6875rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Expire</span>
          <p style="font-size: 0.875rem; color: var(--text-primary); font-family: 'Space Mono', monospace; margin: 0.25rem 0 0 0;">${data.soa.expire}s</p>
        </div>
        <div>
          <span style="font-size: 0.6875rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Min TTL</span>
          <p style="font-size: 0.875rem; color: var(--text-primary); font-family: 'Space Mono', monospace; margin: 0.25rem 0 0 0;">${data.soa.minttl}s</p>
        </div>
      </div>
    `;
  } else {
    soaDiv.innerHTML = '<p style="font-size: 0.875rem; color: var(--text-muted);">No SOA record found</p>';
  }

  // CAA Records
  displayRecordList('caaRecords', data.caa, (record) => {
    const critical = record.critical ? 'Critical: ' : '';
    const tag = record.issue || record.issuewild || record.iodef || 'unknown';
    const value = record.value || '';
    return `<span style="font-weight: 600; color: var(--text-primary); font-size: 0.875rem;">${critical}${tag}:</span> <span class="data-value mono">${value}</span>`;
  });

  // Show DNS results section
  dnsResults.style.display = 'block';
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
  
  // Status badge (design system)
  const statusBadge = document.getElementById(`${recordType}StatusBadge`);
  if (analysis.isPropagated) {
    statusBadge.textContent = '✓ Propagated';
    statusBadge.className = 'status-badge status-success';
  } else if (analysis.respondedServers === 0) {
    statusBadge.textContent = 'No Records';
    statusBadge.className = 'status-badge';
    statusBadge.style.cssText = 'background: rgba(168, 168, 168, 0.1); color: var(--text-muted); border: 1px solid var(--border-color);';
  } else {
    statusBadge.textContent = 'Propagating';
    statusBadge.className = 'status-badge status-warning';
  }

  // Percentage badge (design system)
  const percentageBadge = document.getElementById(`${recordType}PercentageBadge`);
  percentageBadge.textContent = `${analysis.percentage}%`;
  percentageBadge.style.cssText = 'font-family: "Space Mono", monospace; font-weight: 700; color: var(--accent-green);';
  
  // Server count (design system)
  const serverCount = document.getElementById(`${recordType}ServerCount`);
  serverCount.textContent = `${analysis.respondedServers}/${analysis.totalServers} servers`;
  serverCount.style.cssText = 'font-size: 0.75rem; color: var(--text-muted);';
  
  // Values Summary (design system)
  const valuesDiv = document.getElementById(`${recordType}Values`);
  if (analysis.uniqueValues && analysis.uniqueValues.length > 0) {
    const isConsistent = analysis.uniqueRecordSets && analysis.uniqueRecordSets.length === 1;
    const bgColor = isConsistent 
      ? 'background: rgba(197, 213, 184, 0.1); border-color: var(--accent-green);' 
      : 'background: rgba(251, 191, 36, 0.1); border-color: var(--status-warning);';
    
    let valuesHTML = `<div style="${bgColor} border: 1px solid; border-radius: var(--radius-sm); padding: 0.75rem;">`;
    valuesHTML += '<p style="font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem;">Values Found:</p>';
    valuesHTML += '<div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">';
    
    analysis.uniqueValues.forEach(value => {
      const pillStyle = isConsistent 
        ? 'background: rgba(197, 213, 184, 0.2); color: var(--accent-green-dark); border: 1px solid var(--accent-green);' 
        : 'background: rgba(251, 191, 36, 0.15); color: #d97706; border: 1px solid var(--status-warning);';
      valuesHTML += `<span style="${pillStyle} padding: 0.25rem 0.625rem; border-radius: 999px; font-size: 0.75rem; font-family: 'Space Mono', monospace; word-break: break-all;">${escapeHtml(value)}</span>`;
    });
    
    valuesHTML += '</div></div>';
    valuesDiv.innerHTML = valuesHTML;
  } else {
    valuesDiv.innerHTML = '<p style="font-size: 0.875rem; color: var(--text-muted); font-style: italic;">No records found</p>';
  }
  
  // Server Results (design system cards)
  const serverResults = document.getElementById(`${recordType}ServerResults`);
  serverResults.innerHTML = '';
  
  propagationData.servers.forEach(server => {
    const card = document.createElement('div');
    
    // Determine status and styling (design system)
    let statusIcon = '';
    let borderColor = 'var(--border-color)';
    let bgColor = 'var(--bg-primary)';
    let contentHTML = '';
    
    if (server.status === 'success' && server.addresses && server.addresses.length > 0) {
      statusIcon = '<span style="color: var(--status-success);">✓</span>';
      borderColor = 'var(--accent-green)';
      bgColor = 'rgba(197, 213, 184, 0.03)';
      contentHTML = `<div style="color: var(--text-secondary); margin-top: 0.25rem; font-family: 'Space Mono', monospace; font-size: 0.6875rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(server.addresses[0])}">${escapeHtml(server.addresses[0])}</div>`;
    } else if (server.status === 'no_data') {
      statusIcon = '<span style="color: var(--text-muted);">○</span>';
      contentHTML = `<div style="color: var(--text-muted); margin-top: 0.25rem; font-size: 0.6875rem;">No data</div>`;
    } else {
      statusIcon = '<span style="color: var(--status-error);">✗</span>';
      borderColor = 'var(--status-error)';
      bgColor = 'rgba(248, 113, 113, 0.03)';
      contentHTML = `<div style="color: var(--status-error); margin-top: 0.25rem; font-size: 0.6875rem;">Error</div>`;
    }
    
    card.style.cssText = `
      background: ${bgColor};
      border: 1px solid ${borderColor};
      border-radius: var(--radius-sm);
      padding: 0.5rem;
      font-size: 0.75rem;
    `;
    
    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${server.server}</span>
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

function showError(message) {
  console.log('❌ showError called with:', message);
  
  const errorEl = document.getElementById('error');
  if (errorEl) {
    errorEl.classList.remove('hidden');
    errorEl.textContent = message;
  }
  
  const loadingEl = document.getElementById('loading');
  if (loadingEl) loadingEl.classList.add('hidden');
  
  const lookupBtn = document.getElementById('lookupBtn');
  if (lookupBtn) {
    lookupBtn.disabled = false;
    lookupBtn.textContent = 'Full Lookup';
  }
}

// Hide all
function hideAll() {
  error.classList.add('hidden');
  results.style.display = 'none';
  dnsResults.style.display = 'none';  // ← Changed
  propagationResults.style.display = 'none';  // ← Changed
  sslResults.style.display = 'none';
  hostingResults.style.display = 'none';
  technologyResults.style.display = 'none';
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

// Display SSL Certificate results
function displaySSLResults(response) {
  // Handle SSL check failure
  if (!response.success) {
    console.log('SSL not available:', response.error);
    sslResults.style.display = 'none';
    return;
  }

  const data = response.data;

// Status badge (using design system colors)
  const statusBadge = document.getElementById('sslStatusBadge');
  if (data.valid) {
    statusBadge.textContent = '✓ Valid & Trusted';
    statusBadge.className = 'status-badge status-success';
  } else if (data.selfSigned) {
    statusBadge.textContent = '⚠ Self-Signed';
    statusBadge.className = 'status-badge status-warning';
  } else {
    statusBadge.textContent = '✗ Invalid';
    statusBadge.className = 'status-badge status-error';
  }

// Expiry badge with color coding (design system colors)
  const expiryBadge = document.getElementById('sslExpiryBadge');
  const days = data.daysRemaining;
  
  if (days < 0) {
    expiryBadge.innerHTML = '<span style="color: var(--status-error); font-family: \'Space Mono\', monospace; font-weight: 700;">⚠ Expired!</span>';
  } else if (days <= 7) {
    expiryBadge.innerHTML = `<span style="color: var(--status-error); font-family: 'Space Mono', monospace; font-weight: 700;">⚠ Expires in ${days} days</span>`;
  } else if (days <= 30) {
    expiryBadge.innerHTML = `<span style="color: var(--status-warning); font-family: 'Space Mono', monospace; font-weight: 700;">⏰ Expires in ${days} days</span>`;
  } else {
    expiryBadge.innerHTML = `<span style="color: var(--status-success); font-family: 'Space Mono', monospace; font-weight: 700;">✓ Expires in ${days} days</span>`;
  }

// IP Address (using design system)
  const ipElement = document.getElementById('sslIPAddress');
  if (data.ipAddresses && data.ipAddresses.length > 0) {
    ipElement.textContent = data.ipAddresses.join(', ');
    ipElement.className = 'data-value mono';
  } else {
    ipElement.textContent = 'Not resolved';
    ipElement.style.cssText = 'font-size: 0.875rem; color: var(--text-muted); font-family: "Space Mono", monospace;';
  }

  // Server Type (using design system)
  const serverElement = document.getElementById('sslServerType');
  if (data.serverType && data.serverType !== 'Unknown') {
    serverElement.textContent = data.serverType;
    serverElement.className = 'data-value';
  } else {
    serverElement.textContent = 'Unknown';
    serverElement.style.cssText = 'font-size: 0.875rem; color: var(--text-muted);';
  }

  // Certificate details
  document.getElementById('sslIssuer').textContent = 
    `${data.issuer.organization} (${data.issuer.commonName})`;
  
  document.getElementById('sslValidFrom').textContent = 
    new Date(data.validFrom).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
  
  document.getElementById('sslValidTo').textContent = 
    new Date(data.validTo).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
  
  document.getElementById('sslDaysRemaining').textContent = 
    days >= 0 ? `${days} days` : 'Expired';

// Subject Alternative Names (design system styling)
  const sansDiv = document.getElementById('sslSANs');
  sansDiv.innerHTML = '';
  
  if (data.subjectAltNames && data.subjectAltNames.length > 0) {
    data.subjectAltNames.forEach(san => {
      const badge = document.createElement('span');
      badge.className = 'status-badge status-info';
      badge.textContent = san;
      sansDiv.appendChild(badge);
    });
  } else {
    sansDiv.innerHTML = '<span style="color: var(--text-muted); font-size: 0.875rem;">No alternative names</span>';
  }

// Certificate Chain - COMPACT VERSION
  const chainDiv = document.getElementById('sslChain');
  const chainCountElement = document.getElementById('sslChainCount');
  chainDiv.innerHTML = '';
  
  if (data.chain && data.chain.length > 0) {
    chainCountElement.textContent = `${data.chain.length} certificate${data.chain.length > 1 ? 's' : ''}`;
    chainCountElement.className = 'status-badge status-info';
    
    data.chain.forEach((cert, index) => {
      const chainItem = document.createElement('div');
      
      // Determine type and styling (design system)
      let bgColor = 'var(--bg-primary)';
      let borderColor = 'var(--border-color)';
      let icon = '🔗';
      let typeLabel = 'Intermediate';
      let typeBadgeStyle = 'background: rgba(168, 168, 168, 0.15); color: var(--text-secondary);';
      
      if (cert.type === 'leaf') {
        bgColor = 'rgba(96, 165, 250, 0.05)';
        borderColor = 'var(--status-info)';
        icon = '📄';
        typeLabel = 'End Entity';
        typeBadgeStyle = 'background: rgba(96, 165, 250, 0.15); color: var(--status-info);';
      } else if (cert.type === 'root') {
        bgColor = 'rgba(197, 213, 184, 0.05)';
        borderColor = 'var(--accent-green)';
        icon = '🏛️';
        typeLabel = 'Root CA';
        typeBadgeStyle = 'background: rgba(197, 213, 184, 0.2); color: var(--accent-green-dark);';
      }
      
      chainItem.style.cssText = `
        background: ${bgColor};
        border: 1px solid ${borderColor};
        border-radius: var(--radius-sm);
        padding: 0.75rem;
        margin-bottom: 0.5rem;
      `;
      
      // Expiry status (design system colors)
      let expiryColor = 'var(--status-success)';
      let expiryText = `${cert.daysRemaining} days`;
      
      if (cert.expired) {
        expiryColor = 'var(--status-error)';
        expiryText = 'Expired';
      } else if (cert.daysRemaining < 30) {
        expiryColor = 'var(--status-warning)';
      }
      
      chainItem.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.625rem; flex: 1; min-width: 0;">
            <span style="font-size: 1.25rem; line-height: 1; flex-shrink: 0;">${icon}</span>
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                <p style="font-size: 0.8125rem; font-weight: 600; color: var(--text-primary); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(cert.commonName)}</p>
                <span style="font-size: 0.6875rem; padding: 0.125rem 0.375rem; border-radius: 4px; font-weight: 600; white-space: nowrap; ${typeBadgeStyle}">${typeLabel}</span>
              </div>
              ${cert.organization ? `<p style="font-size: 0.6875rem; color: var(--text-secondary); margin: 0;">Org: ${escapeHtml(cert.organization)}</p>` : ''}
            </div>
          </div>
          <div style="text-align: right; flex-shrink: 0;">
            <p style="font-size: 0.6875rem; color: ${expiryColor}; font-weight: 700; margin: 0; font-family: 'Space Mono', monospace;">${expiryText}</p>
            <p style="font-size: 0.6875rem; color: var(--text-muted); margin: 0;">${new Date(cert.validTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>
      `;
      
      chainDiv.appendChild(chainItem);
    });
  } else {
    chainCountElement.textContent = 'Unknown';
    chainCountElement.className = 'status-badge';
    chainDiv.innerHTML = '<p style="font-size: 0.875rem; color: var(--text-muted);">Chain information not available</p>';
  }

// Security badges (design system)
  const selfSignedBadge = document.getElementById('sslSelfSignedBadge');
  if (data.selfSigned) {
    selfSignedBadge.className = 'data-item text-center';
    selfSignedBadge.style.cssText = 'background: rgba(251, 191, 36, 0.1); border: 1px solid var(--status-warning);';
    selfSignedBadge.innerHTML = '<p style="font-size: 0.75rem; font-weight: 700; color: var(--status-warning); margin: 0;">⚠ Self-Signed</p>';
  } else {
    selfSignedBadge.className = 'data-item text-center';
    selfSignedBadge.style.cssText = 'background: rgba(197, 213, 184, 0.1); border: 1px solid var(--accent-green);';
    selfSignedBadge.innerHTML = '<p style="font-size: 0.75rem; font-weight: 700; color: var(--accent-green-dark); margin: 0;">✓ CA Signed</p>';
  }

  const wildcardBadge = document.getElementById('sslWildcardBadge');
  if (data.wildcard) {
    wildcardBadge.className = 'data-item text-center';
    wildcardBadge.style.cssText = 'background: rgba(96, 165, 250, 0.1); border: 1px solid var(--status-info);';
    wildcardBadge.innerHTML = '<p style="font-size: 0.75rem; font-weight: 700; color: var(--status-info); margin: 0;">✓ Wildcard</p>';
  } else {
    wildcardBadge.className = 'data-item text-center';
    wildcardBadge.style.cssText = 'background: var(--bg-primary); border: 1px solid var(--border-color);';
    wildcardBadge.innerHTML = '<p style="font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin: 0;">Single Domain</p>';
  }

  const trustedBadge = document.getElementById('sslTrustedBadge');
  if (data.valid) {
    trustedBadge.className = 'data-item text-center';
    trustedBadge.style.cssText = 'background: rgba(197, 213, 184, 0.1); border: 1px solid var(--accent-green);';
    trustedBadge.innerHTML = '<p style="font-size: 0.75rem; font-weight: 700; color: var(--accent-green-dark); margin: 0;">✓ Trusted</p>';
  } else {
    trustedBadge.className = 'data-item text-center';
    trustedBadge.style.cssText = 'background: rgba(248, 113, 113, 0.1); border: 1px solid var(--status-error);';
    trustedBadge.innerHTML = '<p style="font-size: 0.75rem; font-weight: 700; color: var(--status-error); margin: 0;">✗ Not Trusted</p>';
  }

  // SSL Labs link
  document.getElementById('sslLabsLink').href = 
    `https://www.ssllabs.com/ssltest/analyze.html?d=${encodeURIComponent(data.domain)}`;

  // Show SSL results
  sslResults.style.display = 'block';
}

// Display Hosting Provider results
function displayHostingResults(response) {
  console.log('🏢 displayHostingResults called with:', response);
  
  try {
    if (!response.success) {
      const hostingCard = document.getElementById('hostingResults');
      if (hostingCard) hostingCard.style.display = 'none';
      return;
    }
    
    const data = response.data;
    const countryFlag = data.location.countryCode ? getCountryFlag(data.location.countryCode) : '🌍';
    
    // Populate provider name
    const providerEl = document.getElementById('hostingProvider');
    if (providerEl) providerEl.textContent = data.provider.name;
    
    // Populate provider badge
    const providerBadgeEl = document.getElementById('hostingProviderBadge');
    if (providerBadgeEl) {
      providerBadgeEl.textContent = data.provider.name;
      providerBadgeEl.className = 'status-badge status-info';
    }
    
    // Populate type badge
    const typeBadgeEl = document.getElementById('hostingTypeBadge');
    if (typeBadgeEl) {
      typeBadgeEl.textContent = data.provider.type.toUpperCase();
      if (data.provider.type === 'cloud') {
        typeBadgeEl.className = 'status-badge status-success';
      } else if (data.provider.type === 'cdn') {
        typeBadgeEl.className = 'status-badge';
        typeBadgeEl.style.cssText = 'background: rgba(168, 85, 247, 0.1); color: #a855f7; border: 1px solid #a855f7;';
      } else {
        typeBadgeEl.className = 'status-badge';
      }
    }
    
    // Populate IP
    const ipEl = document.getElementById('hostingIP');
    if (ipEl) ipEl.textContent = data.ipAddress;
    
    // Populate Organization
    const orgEl = document.getElementById('hostingOrg');
    if (orgEl) orgEl.textContent = data.network.organization;
    
    // Populate ASN
    const asnEl = document.getElementById('hostingASN');
    if (asnEl) asnEl.textContent = data.network.asn || 'N/A';
    
    // Populate ISP
    const ispEl = document.getElementById('hostingISP');
    if (ispEl) ispEl.textContent = data.network.isp || data.network.organization;
    
    // Populate Country
    const countryEl = document.getElementById('hostingCountry');
    if (countryEl) countryEl.textContent = `${countryFlag} ${data.location.country}`;
    
    // Populate City
    const cityEl = document.getElementById('hostingCity');
    if (cityEl) cityEl.textContent = data.location.city || 'Unknown';
    
    // Populate Region
    const regionEl = document.getElementById('hostingRegion');
    if (regionEl) regionEl.textContent = data.location.region || 'Unknown';
    
    // Populate Timezone
    const timezoneEl = document.getElementById('hostingTimezone');
    if (timezoneEl) timezoneEl.textContent = data.location.timezone || 'Unknown';
    
    // Cloud badge with description (YOUR EXISTING CODE)
    const cloudBadge = document.getElementById('hostingCloudBadge');
    if (cloudBadge) {
      if (data.isCloud) {
        cloudBadge.innerHTML = `
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">☁️</div>
          <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem; font-size: 0.875rem;">Cloud Hosted</div>
          <div style="font-size: 0.6875rem; color: var(--text-muted); line-height: 1.4;">Scalable infrastructure with elastic resources and pay-as-you-go pricing</div>
        `;
      } else {
        cloudBadge.innerHTML = `
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🏢</div>
          <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem; font-size: 0.875rem;">Traditional Hosting</div>
          <div style="font-size: 0.6875rem; color: var(--text-muted); line-height: 1.4;">Fixed server resources on dedicated or shared infrastructure</div>
        `;
      }
    }

    // CDN badge with description (YOUR EXISTING CODE)
    const cdnBadge = document.getElementById('hostingCDNBadge');
    if (cdnBadge) {
      if (data.isCDN) {
        cdnBadge.innerHTML = `
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🌐</div>
          <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem; font-size: 0.875rem;">CDN Enabled</div>
          <div style="font-size: 0.6875rem; color: var(--text-muted); line-height: 1.4;">Content distributed across global edge servers for faster delivery</div>
        `;
      } else {
        cdnBadge.innerHTML = `
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">📡</div>
          <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem; font-size: 0.875rem;">Direct Connection</div>
          <div style="font-size: 0.6875rem; color: var(--text-muted); line-height: 1.4;">Served directly from origin server without CDN caching layer</div>
        `;
      }
    }
    
    // Show hosting results
    const hostingSection = document.getElementById('hostingResults');
    if (hostingSection) {
      hostingSection.style.display = 'block';
      console.log('✅ Hosting section set to display block');
    }
    
  } catch (error) {
    console.error('❌ Error in displayHostingResults:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Helper: Get country flag emoji
function getCountryFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

// Display Technology Detection results
function displayTechnologyResults(response) {
  console.log('🔍 displayTechnologyResults called with:', response);
  
  try {
    if (!response.success) {
      console.log('❌ Technology failed:', response.error);
      const technologyCard = document.getElementById('technologyResults');
      if (technologyCard) technologyCard.style.display = 'none';
      return;
    }
    
    const data = response.data;
    
    // Technology count badge (accent green)
    const countBadge = document.getElementById('technologyCount');
    if (countBadge) {
      countBadge.textContent = `${data.total} ${data.total === 1 ? 'technology' : 'technologies'} detected`;
      countBadge.className = 'px-3 py-1 text-xs font-medium rounded-full';
      countBadge.style.cssText = 'background: var(--accent-green); color: var(--text-on-accent); border: 1px solid var(--accent-green-dark);';
    }

    // Hide all category sections first
    const sections = ['techCMSSection', 'techFrontendSection', 'techBackendSection', 'techServerSection', 'techLibrariesSection', 'techAnalyticsSection', 'techEcommerceSection', 'techNone'];
    sections.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) section.classList.add('hidden');
    });
    
    // Display technologies by category
    if (data.total === 0) {
      const noneSection = document.getElementById('techNone');
      if (noneSection) noneSection.classList.remove('hidden');
    } else {
      // CMS (make it prominent)
      if (data.categories.cms && data.categories.cms.length > 0) {
        displayCMS(data.categories.cms);
      }
      
      // Frontend
      if (data.categories.frontend && data.categories.frontend.length > 0) {
        displayTechCategory('techFrontend', 'techFrontendSection', data.categories.frontend);
      }
      
      // Backend
      if (data.categories.backend && data.categories.backend.length > 0) {
        displayTechCategory('techBackend', 'techBackendSection', data.categories.backend);
      }
      
      // Server
      if (data.categories.server && data.categories.server.length > 0) {
        displayTechCategory('techServer', 'techServerSection', data.categories.server);
      }
      
      // Libraries
      if (data.categories.libraries && data.categories.libraries.length > 0) {
        displayTechCategory('techLibraries', 'techLibrariesSection', data.categories.libraries);
      }
      
      // Analytics
      if (data.categories.analytics && data.categories.analytics.length > 0) {
        displayTechCategory('techAnalytics', 'techAnalyticsSection', data.categories.analytics);
      }
      
      // E-commerce
      if (data.categories.ecommerce && data.categories.ecommerce.length > 0) {
        displayTechCategory('techEcommerce', 'techEcommerceSection', data.categories.ecommerce);
      }
    }
    
    // Show technology results
    const technologySection = document.getElementById('technologyResults');
    if (technologySection) {
      technologySection.style.display = 'block';
      console.log('✅ Technology section set to display block');
    }
    
  } catch (error) {
    console.error('❌ Error in displayTechnologyResults:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Helper: Display CMS (prominent)
function displayCMS(technologies) {
  const container = document.getElementById('techCMS');
  const section = document.getElementById('techCMSSection');
  
  if (!container || !section) return;
  
  container.innerHTML = '';
  
  technologies.forEach(tech => {
    const badge = document.createElement('div');
    badge.style.cssText = `
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--accent-green);
      color: var(--text-on-accent);
      border: 2px solid var(--accent-green-dark);
      border-radius: var(--radius-md);
      padding: 1rem 1.5rem;
      font-weight: 700;
      font-size: 1.125rem;
    `;
    
    badge.innerHTML = `
      <span style="font-size: 1.5rem;">${tech.icon}</span>
      <span>${escapeHtml(tech.name)}</span>
      <span style="font-size: 0.75rem; opacity: 0.8; background: rgba(0,0,0,0.1); padding: 0.25rem 0.5rem; border-radius: 4px;">${tech.confidence}</span>
    `;
    
    container.appendChild(badge);
  });
  
  section.classList.remove('hidden');
}

// Helper: Display CMS (prominent)
function displayCMS(technologies) {
  const container = document.getElementById('techCMS');
  const section = document.getElementById('techCMSSection');
  
  if (!container || !section) return;
  
  container.innerHTML = '';
  
  technologies.forEach(tech => {
    const badge = document.createElement('div');
    badge.style.cssText = `
      display: flex;
      align-items: center;
      gap: 1rem;
      background: var(--accent-green);
      color: var(--text-on-accent);
      border: 2px solid var(--accent-green-dark);
      border-radius: var(--radius-md);
      padding: 1.25rem 1.75rem;
      font-family: 'Space Mono', monospace;
      font-weight: 700;
      font-size: 1.25rem;
    `;
    
    badge.innerHTML = `
      <span style="font-size: 2rem;">${tech.icon}</span>
      <span>${escapeHtml(tech.name)}</span>
      <span style="font-size: 0.75rem; opacity: 0.8; background: rgba(0,0,0,0.15); padding: 0.375rem 0.625rem; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em;">${tech.confidence}</span>
    `;
    
    container.appendChild(badge);
  });
  
  section.classList.remove('hidden');
}

// Helper: Display technologies in a category (non-CMS)
function displayTechCategory(containerId, sectionId, technologies) {
  const container = document.getElementById(containerId);
  const section = document.getElementById(sectionId);
  
  if (!container || !section) return;
  
  container.innerHTML = '';
  
  technologies.forEach(tech => {
    const badge = document.createElement('div');
    badge.style.cssText = `
      display: flex;
      align-items: center;
      gap: 0.625rem;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 0.75rem 1.125rem;
      font-size: 0.875rem;
      color: var(--text-primary);
      transition: all 0.2s ease;
    `;
    
    // Add hover effect
    badge.addEventListener('mouseenter', function() {
      this.style.borderColor = 'var(--accent-green)';
      this.style.background = 'rgba(197, 213, 184, 0.05)';
    });
    badge.addEventListener('mouseleave', function() {
      this.style.borderColor = 'var(--border-color)';
      this.style.background = 'var(--bg-primary)';
    });
    
    // Confidence color - better contrast
    let confidenceStyle = 'background: rgba(168, 168, 168, 0.15); color: var(--text-secondary); border: 1px solid var(--border-color);';
    if (tech.confidence === 'high') {
      confidenceStyle = 'background: rgba(197, 213, 184, 0.2); color: var(--accent-green-dark); border: 1px solid var(--accent-green);';
    } else if (tech.confidence === 'medium') {
      confidenceStyle = 'background: rgba(251, 191, 36, 0.15); color: #d97706; border: 1px solid #fbbf24;';
    }
    
    badge.innerHTML = `
      <span style="font-size: 1.5rem; line-height: 1;">${tech.icon}</span>
      <span style="font-weight: 500; flex: 1;">${escapeHtml(tech.name)}</span>
      <span style="font-size: 0.6875rem; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.025em; ${confidenceStyle}">${tech.confidence}</span>
    `;
    
    container.appendChild(badge);
  });
  
  section.classList.remove('hidden');
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