// Get DOM elements
const domainInput = document.getElementById('domainInput');
const lookupBtn = document.getElementById('lookupBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');
const results = document.getElementById('results');

// Lookup button click handler
lookupBtn.addEventListener('click', async () => {
  const domain = domainInput.value.trim();
  
  if (!domain) {
    showError('Please enter a domain name');
    return;
  }

  await performWhoisLookup(domain);
});

// Enter key handler
domainInput.addEventListener('keypress', async (e) => {
  if (e.key === 'Enter') {
    const domain = domainInput.value.trim();
    if (domain) {
      await performWhoisLookup(domain);
    }
  }
});

// Perform WHOIS lookup
async function performWhoisLookup(domain) {
  // Hide previous results/errors
  hideAll();
  
  // Show loading
  loading.classList.remove('hidden');
  lookupBtn.disabled = true;
  lookupBtn.textContent = 'Looking up...';

  try {
    // Call API
    const response = await fetch('/api/whois', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ domain })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'WHOIS lookup failed');
    }

    // Display results
    displayResults(data.data);

  } catch (err) {
    showError(err.message);
  } finally {
    // Hide loading
    loading.classList.add('hidden');
    lookupBtn.disabled = false;
    lookupBtn.textContent = 'Lookup';
  }
}

// Display WHOIS results
function displayResults(data) {
  // Populate domain info
  document.getElementById('domainName').textContent = data.domain;
  document.getElementById('registrar').textContent = data.registrar;
  document.getElementById('createdDate').textContent = formatDate(data.createdDate);
  document.getElementById('expiresDate').textContent = formatDate(data.expiresDate);

  // Display status
  const statusList = document.getElementById('statusList');
  statusList.innerHTML = '';
  
  if (Array.isArray(data.status)) {
    data.status.forEach(status => {
      const p = document.createElement('p');
      p.className = 'text-sm text-gray-700';
      p.textContent = status;
      statusList.appendChild(p);
    });
  } else if (data.status && data.status !== 'N/A') {
    const p = document.createElement('p');
    p.className = 'text-sm text-gray-700';
    p.textContent = data.status;
    statusList.appendChild(p);
  } else {
    statusList.innerHTML = '<p class="text-sm text-gray-500">No status information available</p>';
  }

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

  // Show results
  results.classList.remove('hidden');
}

// Format date string
function formatDate(dateStr) {
  if (!dateStr || dateStr === 'N/A') {
    return 'N/A';
  }

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr; // Return original if can't parse
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

// Show error message
function showError(message) {
  errorMessage.textContent = message;
  error.classList.remove('hidden');
  results.classList.add('hidden');
}

// Hide all sections
function hideAll() {
  error.classList.add('hidden');
  results.classList.add('hidden');
}