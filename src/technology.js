import https from 'https';
import http from 'http';

/**
 * Detect technologies used by a website
 * @param {string} domain - Domain name
 * @returns {Promise<Object>} - Detected technologies
 */
export async function detectTechnologies(domain) {
  console.log(`🔍 Detecting technologies for: ${domain}`);

  try {
    // Fetch homepage
    const { headers, html } = await fetchWebsite(domain);

    // Analyze technologies
    const technologies = {
      cms: detectCMS(headers, html),
      frontend: detectFrontend(headers, html),
      backend: detectBackend(headers, html),
      server: detectServer(headers),
      libraries: detectLibraries(html),
      analytics: detectAnalytics(html),
      ecommerce: detectEcommerce(headers, html)
    };

    // Flatten and deduplicate
    const detected = [];
    const categories = {};

    Object.entries(technologies).forEach(([category, items]) => {
      if (items && items.length > 0) {
        categories[category] = items;
        detected.push(...items);
      }
    });

    console.log(`✅ Technology detection complete for ${domain}: ${detected.length} technologies found`);

    return {
      domain: domain,
      detected: detected,
      categories: categories,
      total: detected.length
    };

  } catch (error) {
    console.error(`❌ Technology detection failed for ${domain}:`, error.message);
    console.error('Full error:', error);
    throw new Error(`Technology detection failed: ${error.message}`);
  }
}

/**
 * Fetch website HTML and headers
 * @param {string} domain - Domain name
 * @returns {Promise<Object>} - Headers and HTML content
 */
function fetchWebsite(domain) {
  return new Promise((resolve, reject) => {
    console.log(`📡 Fetching website: https://${domain}`);
    
    const options = {
      hostname: domain,
      port: 443,
      path: '/',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000,
      rejectUnauthorized: false
    };

    const req = https.request(options, (res) => {
      console.log(`✅ Got response from ${domain}: ${res.statusCode}`);
      
      let html = '';

  res.on('data', (chunk) => {
        html += chunk.toString();
        // Limit HTML to first 100KB to avoid memory issues
        if (html.length > 100000) {
          console.log(`⚠️ HTML too large, truncating at 100KB`);
          res.destroy();
          // Resolve immediately with what we have
          resolve({
            headers: res.headers,
            html: html.substring(0, 100000),
            statusCode: res.statusCode
          });
        }
      });

      res.on('end', () => {
        console.log(`✅ Finished fetching ${domain}, HTML length: ${html.length} bytes`);
        resolve({
          headers: res.headers,
          html: html,
          statusCode: res.statusCode
        });
      });
    });

    req.on('error', (error) => {
      console.error(`❌ HTTPS request failed for ${domain}:`, error.code, error.message);
      // Try HTTP if HTTPS fails
      console.log(`🔄 Trying HTTP for ${domain}...`);
      tryHTTP(domain).then(resolve).catch(reject);
    });

    req.on('timeout', () => {
      console.error(`⏱️ Request timeout for ${domain}`);
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * Try HTTP if HTTPS fails
 */
function tryHTTP(domain) {
  return new Promise((resolve, reject) => {
    console.log(`📡 Trying HTTP: http://${domain}`);
    
    const options = {
      hostname: domain,
      port: 80,
      path: '/',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    };

    const req = http.request(options, (res) => {
      console.log(`✅ Got HTTP response from ${domain}: ${res.statusCode}`);
      
      let html = '';

    res.on('data', (chunk) => {
        html += chunk.toString();
        if (html.length > 100000) {
          console.log(`⚠️ HTML too large, truncating at 100KB`);
          res.destroy();
          // Resolve immediately with what we have
          resolve({
            headers: res.headers,
            html: html.substring(0, 100000),
            statusCode: res.statusCode
          });
        }
      });

      res.on('end', () => {
        console.log(`✅ Finished HTTP fetch for ${domain}, HTML length: ${html.length} bytes`);
        resolve({
          headers: res.headers,
          html: html,
          statusCode: res.statusCode
        });
      });
    });

    req.on('error', (error) => {
      console.error(`❌ HTTP request also failed for ${domain}:`, error.code, error.message);
      reject(new Error(`Failed to fetch website: ${error.message}`));
    });

    req.on('timeout', () => {
      console.error(`⏱️ HTTP request timeout for ${domain}`);
      req.destroy();
      reject(new Error('HTTP request timeout'));
    });

    req.end();
  });
}

/**
 * Detect CMS (Content Management Systems)
 */
function detectCMS(headers, html) {
  const detected = [];

  // WordPress
  if (html.includes('/wp-content/') || html.includes('/wp-includes/') || 
      html.includes('wp-json') || headers['x-powered-by']?.includes('WordPress')) {
    detected.push({ name: 'WordPress', category: 'CMS', icon: '📝', confidence: 'high' });
  }

  // Drupal
  if (html.includes('Drupal') || html.includes('/sites/default/files/') || 
      headers['x-generator']?.includes('Drupal')) {
    detected.push({ name: 'Drupal', category: 'CMS', icon: '💧', confidence: 'high' });
  }

  // Joomla
  if (html.includes('/components/com_') || html.includes('Joomla')) {
    detected.push({ name: 'Joomla', category: 'CMS', icon: '🎯', confidence: 'high' });
  }

  // Shopify
  if (html.includes('cdn.shopify.com') || html.includes('myshopify.com') || 
      headers['x-shopid']) {
    detected.push({ name: 'Shopify', category: 'CMS', icon: '🛍️', confidence: 'high' });
  }

  // Wix
  if (html.includes('wix.com') || html.includes('parastorage.com')) {
    detected.push({ name: 'Wix', category: 'CMS', icon: '🎨', confidence: 'high' });
  }

  // Squarespace
  if (html.includes('squarespace.com') || html.includes('static.squarespace')) {
    detected.push({ name: 'Squarespace', category: 'CMS', icon: '⬛', confidence: 'high' });
  }

  // Webflow
  if (html.includes('webflow.com') || html.includes('webflow.io')) {
    detected.push({ name: 'Webflow', category: 'CMS', icon: '🌊', confidence: 'high' });
  }

  // Ghost
  if (html.includes('ghost.org') || html.includes('ghost.io') || 
      headers['x-powered-by']?.includes('Ghost')) {
    detected.push({ name: 'Ghost', category: 'CMS', icon: '👻', confidence: 'high' });
  }

  return detected;
}

/**
 * Detect Frontend Frameworks
 */
function detectFrontend(headers, html) {
  const detected = [];

  // React
  if (html.includes('react') || 
      html.includes('_react') || 
      html.includes('data-reactroot') ||
      html.includes('data-reactid') ||
      html.includes('__REACT') ||
      html.includes('react-dom') ||
      html.includes('/__react') ||
      headers['x-powered-by']?.toLowerCase().includes('react')) {
    detected.push({ name: 'React', category: 'Frontend', icon: '⚛️', confidence: 'high' });
  }

  // Next.js
  if (html.includes('/_next/') || html.includes('__NEXT_DATA__')) {
    detected.push({ name: 'Next.js', category: 'Frontend', icon: '▲', confidence: 'high' });
  }

  // Vue.js
  if (html.includes('vue.js') || html.includes('data-v-')) {
    detected.push({ name: 'Vue.js', category: 'Frontend', icon: '💚', confidence: 'high' });
  }

  // Nuxt.js
  if (html.includes('nuxt') || html.includes('/_nuxt/')) {
    detected.push({ name: 'Nuxt.js', category: 'Frontend', icon: '💚', confidence: 'high' });
  }

  // Angular
  if (html.includes('ng-version') || html.includes('angular')) {
    detected.push({ name: 'Angular', category: 'Frontend', icon: '🅰️', confidence: 'high' });
  }

  // Svelte
  if (html.includes('svelte') || html.includes('_svelte')) {
    detected.push({ name: 'Svelte', category: 'Frontend', icon: '🔥', confidence: 'high' });
  }

  return detected;
}

/**
 * Detect Backend Technologies
 */
function detectBackend(headers, html) {
  const detected = [];

  const poweredBy = headers['x-powered-by'] || '';
  const server = headers['server'] || '';

  // PHP
  if (poweredBy.includes('PHP') || html.includes('.php')) {
    const version = poweredBy.match(/PHP\/([\d.]+)/)?.[1];
    detected.push({ 
      name: version ? `PHP ${version}` : 'PHP', 
      category: 'Backend', 
      icon: '🐘', 
      confidence: 'high' 
    });
  }

  // Node.js / Express
  if (poweredBy.includes('Express') || poweredBy.includes('Node')) {
    detected.push({ name: 'Node.js', category: 'Backend', icon: '🟢', confidence: 'high' });
  }

  // ASP.NET
  if (poweredBy.includes('ASP.NET') || server.includes('IIS') || html.includes('aspnet')) {
    detected.push({ name: 'ASP.NET', category: 'Backend', icon: '🔷', confidence: 'high' });
  }

  // Python
  if (html.includes('django') || html.includes('flask')) {
    detected.push({ name: 'Python', category: 'Backend', icon: '🐍', confidence: 'medium' });
  }

  // Ruby
  if (poweredBy.includes('Ruby') || html.includes('rails')) {
    detected.push({ name: 'Ruby on Rails', category: 'Backend', icon: '💎', confidence: 'high' });
  }

  return detected;
}

/**
 * Detect Web Server
 */
function detectServer(headers) {
  const detected = [];
  const server = headers['server'] || '';

  if (server.includes('nginx')) {
    detected.push({ name: 'nginx', category: 'Server', icon: '🟩', confidence: 'high' });
  }

  if (server.includes('Apache')) {
    detected.push({ name: 'Apache', category: 'Server', icon: '🪶', confidence: 'high' });
  }

  if (server.includes('IIS')) {
    detected.push({ name: 'Microsoft IIS', category: 'Server', icon: '🪟', confidence: 'high' });
  }

  if (server.includes('LiteSpeed')) {
    detected.push({ name: 'LiteSpeed', category: 'Server', icon: '⚡', confidence: 'high' });
  }

  if (server.includes('cloudflare')) {
    detected.push({ name: 'Cloudflare', category: 'Server', icon: '🛡️', confidence: 'high' });
  }

  return detected;
}

/**
 * Detect JavaScript Libraries
 */
function detectLibraries(html) {
  const detected = [];

  if (html.includes('jquery')) {
    detected.push({ name: 'jQuery', category: 'Library', icon: '📚', confidence: 'high' });
  }

  if (html.includes('bootstrap')) {
    detected.push({ name: 'Bootstrap', category: 'Library', icon: '🅱️', confidence: 'high' });
  }

  if (html.includes('tailwind') || html.includes('tw-')) {
    detected.push({ name: 'Tailwind CSS', category: 'Library', icon: '🎨', confidence: 'high' });
  }

  if (html.includes('font-awesome') || html.includes('fontawesome')) {
    detected.push({ name: 'Font Awesome', category: 'Library', icon: '🎭', confidence: 'high' });
  }

  return detected;
}

/**
 * Detect Analytics & Marketing
 */
function detectAnalytics(html) {
  const detected = [];

  if (html.includes('google-analytics.com') || html.includes('gtag') || html.includes('ga.js')) {
    detected.push({ name: 'Google Analytics', category: 'Analytics', icon: '📊', confidence: 'high' });
  }

  if (html.includes('googletagmanager.com') || html.includes('GTM-')) {
    detected.push({ name: 'Google Tag Manager', category: 'Analytics', icon: '🏷️', confidence: 'high' });
  }

  if (html.includes('facebook.com/tr') || html.includes('fbq(')) {
    detected.push({ name: 'Facebook Pixel', category: 'Analytics', icon: '📘', confidence: 'high' });
  }

  if (html.includes('hotjar.com')) {
    detected.push({ name: 'Hotjar', category: 'Analytics', icon: '🔥', confidence: 'high' });
  }

  return detected;
}

/**
 * Detect E-commerce Platforms
 */
function detectEcommerce(headers, html) {
  const detected = [];

  if (html.includes('woocommerce') || html.includes('/wc-')) {
    detected.push({ name: 'WooCommerce', category: 'E-commerce', icon: '🛒', confidence: 'high' });
  }

  if (html.includes('magento') || html.includes('Mage.')) {
    detected.push({ name: 'Magento', category: 'E-commerce', icon: '🛍️', confidence: 'high' });
  }

  if (html.includes('prestashop')) {
    detected.push({ name: 'PrestaShop', category: 'E-commerce', icon: '🛒', confidence: 'high' });
  }

  return detected;
}