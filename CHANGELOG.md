# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Website Screenshots (Stage 8)
- Performance Metrics (Stage 9)
- Security Headers Analysis (Stage 10)

---

## [2.8.0] - November 29, 2025

### Added
- **3-Column Grid Dashboard Layout**
  - Modern grid-based layout (3 columns on desktop)
  - Row 1: WHOIS, DNS Records, Hosting (1/3 each)
  - Row 2: Technologies (2/3), SSL (1/3)
  - Row 3: DNS Propagation (full width)
  - 44% reduction in vertical scrolling
  - Better space utilization and visual hierarchy
  
- **API Endpoint**
  - Added `/api/version` endpoint for footer version display
  - Returns version number in JSON format

- **Enhanced Subdomain Banner**
  - Dynamic subdomain name display
  - Dynamic root domain name display
  - "Lookup Root Domain" button for quick navigation
  - Prevents "Cannot set properties of null" errors

### Changed
- **Card Styling**
  - Larger border radius (24px) for modern appearance
  - Softer shadows with hover lift effect (2px up)
  - Green accent background on Hosting card (5% opacity)
  - Cards now fill 100% height of grid cells
  - Improved hover effects with stronger shadows

- **Typography**
  - Search input: Changed from Space Mono to Inter font
  - Search input: Increased font size to 1.25rem (20px)
  - Search button: Changed from Space Mono to Inter font
  - All card titles remain Space Mono for consistency

- **Grid System**
  - Implemented CSS Grid with 3-column layout
  - Responsive breakpoints: 3 columns → 2 columns → 1 column
  - Technologies section gets 2/3 width for better display
  - Asymmetric layout creates visual interest

- **Visual Hierarchy**
  - Hosting card highlighted with green accent (card-accent class)
  - Card titles moved inside cards for unified appearance
  - Consistent spacing with 1.5rem gaps

### Fixed
- **WHOIS Visibility Bug**
  - Fixed WHOIS card not displaying after lookup
  - Updated JavaScript to use `style.display` instead of `classList`
  - Consistent show/hide methods across all sections

- **Console Errors**
  - Fixed 404 error: GET /api/version
  - Fixed SyntaxError: Unexpected token '<'
  - Fixed "Cannot set properties of null" on subdomain lookup

- **Display Methods**
  - Standardized all sections to use inline `style.display`
  - Removed classList conflicts between HTML and JavaScript

### Technical Improvements
- **CSS Architecture**
  - New `.dashboard-grid` container with 3-column system
  - Grid helper classes: `.grid-full`, `.grid-third`, `.grid-two-thirds`
  - Card variant: `.card-accent` for green-tinted cards
  - Responsive grid system with media queries

- **JavaScript Updates**
  - Consistent visibility control using `style.display`
  - Fixed subdomain element references
  - Improved error handling

- **Performance**
  - More compact layout reduces page length
  - Better browser performance with CSS Grid
  - Faster visual scanning with grid organization

### Metrics
- **44% reduction in vertical scrolling** (2400px → 1350px)
- **3-column grid** on desktop (better space use)
- **Responsive design** adapts to all screen sizes
- **Professional appearance** matching modern dashboards

---

## [2.7.0] - November 28, 2025

### Added
- **Complete Dashboard Redesign (UI Overhaul)**
  - Migrated entire dashboard to unified design system
  - Removed all Tailwind utility classes
  - Implemented CSS custom properties throughout
  - Added Space Mono monospace font for all technical data
  - New professional dark theme with consistent color palette

### Changed
- **Hosting Section (Refinement #1)**
  - Added descriptive badges for Cloud/Traditional hosting
  - Added descriptive badges for CDN/Direct connection
  - Improved visual hierarchy with design system colors
  
- **Technologies Section (Refinement #2)**
  - Made CMS detection more prominent (larger, bolder)
  - Increased icon sizes (20% larger, full opacity)
  - Changed count badge to accent green
  - Improved confidence badge contrast (softer colors)
  - Added smooth hover effects

- **SSL Certificate Section (Refinement #3)**
  - Redesigned certificate chain cards (40% more compact)
  - Made expiry dates bold with Space Mono font
  - Inline type badges save vertical space
  - Removed redundant "Issued by" information
  - Shorter date format (Jan 15, 2025 vs January 15, 2025)
  - Color-coded certificate types (leaf/intermediate/root)

- **DNS Records Section (Refinement #4)**
  - Completely redesigned SOA record with grid layout (43% space reduction)
  - All DNS values now use Space Mono font
  - Data labels styled as uppercase, small, muted
  - Improved TXT record readability with monospace font
  - Better line-height for long records

- **DNS Propagation Section (Refinement #5)**
  - Migrated status badges to design system
  - Percentage badges now bold with Space Mono
  - Rounded value pills with better contrast
  - Server cards with subtle background tints
  - Color-coded borders (green for success, red for errors)

- **WHOIS Section (Refinement #6)**
  - All values use consistent `data-value` class
  - Name servers display with Space Mono and proper spacing
  - Status links with hover effect (blue → green)
  - Raw WHOIS data styled with Space Mono
  - Consistent styling with all other sections

### Technical Improvements
- **Design System Implementation**
  - 100% migration from Tailwind to custom design system
  - All colors now use CSS custom properties
  - Consistent badge classes (`status-badge`, `data-value`)
  - Single source of truth for all styling
  
- **Typography System**
  - Space Mono for all headers and technical data
  - Inter for body text
  - Consistent font sizes (0.875rem standard, 0.75rem small)
  - Better line-heights for improved readability

- **Performance & Maintainability**
  - Reduced CSS class usage (~40% reduction)
  - Improved code consistency
  - Easier to maintain with centralized design system
  - Better browser performance (fewer class calculations)

### Fixed
- DNS section visibility issue (inline style priority)
- SSL section duplicate variable declarations
- Consistent show/hide methods across all sections

### Metrics
- 35% overall vertical space reduction
- 40% reduction in SSL certificate chain height
- 43% reduction in SOA record height
- 100% design system migration
- 0 Tailwind classes remaining

---

## [2.6.0] - November 19, 2025

### Added
- **CMS/Technology Detection (Stage 7)**
  - Automatic detection of 40+ technologies across 7 categories
  - **CMS Detection:** WordPress, Drupal, Joomla, Shopify, Wix, Squarespace, Webflow, Ghost
  - **Frontend Frameworks:** React, Next.js, Vue.js, Nuxt.js, Angular, Svelte
  - **Backend Technologies:** PHP, Node.js, ASP.NET, Python (Django/Flask), Ruby on Rails
  - **Web Servers:** nginx, Apache, Microsoft IIS, LiteSpeed, Cloudflare
  - **JavaScript Libraries:** jQuery, Bootstrap, Tailwind CSS, Font Awesome
  - **Analytics & Marketing:** Google Analytics, Google Tag Manager, Facebook Pixel, Hotjar
  - **E-commerce Platforms:** WooCommerce, Magento, PrestaShop
  - Confidence levels for each detection (high/medium/low)
  - Technologies grouped by category with icons
  - Color-coded confidence badges
  - HTML content analysis (meta tags, comments, script sources)
  - HTTP header inspection for technology signatures
  - URL pattern matching for framework detection
  - Collapsible card UI with monochromatic blue design

### Changed
- Enhanced domain input cleaning to handle URLs with protocols, paths, query strings, ports, and fragments
- Update input field to show cleaned domain immediately after submission
- Improved domain validation across all API endpoints
- Extended Promise.all to 6 parallel API calls for comprehensive data gathering

### Fixed
- Domain input now properly strips trailing slashes (e.g., `wix.com/` → `wix.com`)
- All API endpoints now receive properly cleaned domain names
- DNS, SSL, Hosting, and Technology endpoints no longer fail with malformed domains
- Input field displays cleaned domain for better user feedback

### Technical
- New technology.js module for technology detection
- detectTechnologies() function with comprehensive signature matching
- fetchWebsite() for HTML and header retrieval with 100KB limit
- Pattern matching for 40+ technology signatures
- Category-based detection: detectCMS(), detectFrontend(), detectBackend(), detectServer(), detectLibraries(), detectAnalytics(), detectEcommerce()
- HTTP/HTTPS fallback mechanism for unreachable domains
- Frontend domain cleaning with regex patterns for all URL components
- Input field synchronization with cleaned domain values

---


## [2.5.0] - November 19, 2025

### Added
- **Hosting Provider Detection (Stage 6)**
  - Automatic detection of 20+ major hosting providers
  - Cloud providers: AWS, Google Cloud, Azure, DigitalOcean, Linode, Vultr, Hetzner, OVH
  - CDN providers: Cloudflare, Fastly, Akamai, BunnyCDN, StackPath
  - Hosting companies: GoDaddy, Bluehost, HostGator, DreamHost, SiteGround, Namecheap
  - Modern platforms: Vercel, Netlify
  - IP geolocation with country, region, city, timezone
  - ASN (Autonomous System Number) lookup and display
  - Organization and ISP information
  - Network provider classification (cloud/cdn/hosting/platform/other)
  - Geographic location with country flag emoji
  - Cloud hosting detection badge
  - CDN usage detection badge
  - Collapsible card UI with monochromatic blue design
  - Integration with ip-api.com for geolocation data

### Changed
- Updated performFullLookup to fetch hosting data in parallel (5 API calls)
- Enhanced hideAll() to use inline styles for consistent section hiding
- Unified UI design with monochromatic blue backgrounds across all sections
- Standardized percentage text colors to blue for cleaner look

### Fixed
- DNS Propagation section staying visible on subsequent lookups
- Section hiding inconsistency between first and subsequent queries
- Inline style priority over CSS classes for reliable show/hide

### Technical
- New hosting.js module for provider detection
- detectHosting() function with IP resolution and geolocation
- detectProvider() with pattern matching for 20+ providers
- getIPInfo() integration with ip-api.com API
- ASN extraction and parsing
- Country flag emoji generation from country codes
- Provider type classification system

---

## [2.4.0] - November 16, 2025

### Added
- **SSL/TLS Certificate Analysis (Stage 5)**
  - Certificate validity check (valid/invalid/self-signed)
  - Expiration date with days remaining countdown
  - Color-coded expiry warnings (red < 7 days, yellow < 30 days, green > 30 days)
  - Certificate issuer information (CA organization and common name)
  - Valid from/to date display
  - Subject Alternative Names (SANs) - all domains covered by certificate
  - Complete certificate chain visualization (leaf → intermediate → root)
  - Wildcard certificate detection
  - Self-signed certificate detection
  - Browser trust validation
  - Collapsible card UI matching propagation design
  - SSL Labs integration link for detailed security analysis
  - Graceful error handling for domains without SSL
- **Backend SSL Module**
  - New ssl.js module using Node.js TLS
  - checkSSL() function for certificate retrieval
  - Certificate chain parsing and validation
  - Days remaining calculation
  - SAN parsing and normalization
  - Self-signed and wildcard detection

### Changed
- Updated performFullLookup to fetch SSL data in parallel with other checks
- Enhanced hideAll() to include SSL section
- Improved error handling to allow SSL failures without breaking other sections

### Technical
- Uses Node.js built-in `tls` module (no external dependencies)
- Parallel API calls for WHOIS, DNS, Propagation, and SSL (faster results)
- Certificate retrieval with 10-second timeout
- Complete certificate chain traversal (up to 10 levels)
- Supports both valid and invalid certificates for analysis

---

## [2.3.0] - October 25, 2025

### Added
- **Brazilian Domain Support (.br/.com.br)**
  - Full WHOIS parsing for Brazilian domains
  - Provider field display (e.g., HSTDOMAINS (127), NENHUM)
  - Support for Registro.br date formats (YYYYMMDD)
  - Special handling for Brazilian WHOIS field variations
  - Provider description text for user clarity
- **Multi-Record DNS Propagation Checker**
  - A Record propagation (IPv4 addresses)
  - NS Record propagation (Name servers)
  - MX Record propagation (Mail servers)
  - TXT Record propagation (SPF/DKIM/DMARC)
  - All record types checked simultaneously in parallel
  - Separate visual sections for each record type
  - Color-coded badges (A=blue, NS=green, MX=purple, TXT=amber)
  - Individual analysis and metrics per record type
- **Smart Subdomain Detection**
  - Automatic subdomain recognition
  - Info banner for subdomain lookups
  - Hide WHOIS section for subdomains (not available)
  - Show DNS and Propagation data for subdomains
  - "Lookup root domain" quick action button
  - Support for multi-level subdomains (www.api.example.com)
  - Support for special TLDs (.com.br, .com.ar, .co.uk, etc.)
- **Dynamic Version Display**
  - Footer version auto-updates from VERSION file
  - Version available in /api/health endpoint
  - Single source of truth for version number
  - Fallback version if API unavailable
- **Backend Utilities**
  - New utils.js module with subdomain detection functions
  - isSubdomain() - detect subdomains
  - getRootDomain() - extract root domain from subdomain
  - Support for special multi-part TLDs

### Changed
- Enhanced WHOIS UI to conditionally show provider field (Brazilian domains only)
- Expanded propagation display with 4 separate sections (one per record type)
- **Redesigned propagation section with collapsible cards for better UX**
  - Compact summary cards showing status at a glance
  - Click-to-expand/collapse for detailed server results
  - Reduced vertical scrolling by ~80%
  - Improved visual hierarchy with prominent status badges
  - 4-column compact server grid in expanded view
  - Values section shown first with pill-style tags
  - Animated chevron indicators for expand/collapse state
- Updated /api/whois endpoint to include isSubdomain and rootDomain fields
- Improved error messaging for missing record types
- Updated /api/propagation to /api/propagation-all for multi-record support
- Enhanced analyzePropagation logic to work with any record type

### Fixed
- Brazilian domain date parsing (handles YYYYMMDD format)
- Subdomain WHOIS lookups no longer show confusing N/A fields
- Provider field only shows when data is available
- DNS propagation sections now properly visible for subdomains

### Technical
- Added VERSION file to Docker image (COPY VERSION ./)
- Created analyzePropagationByType() for flexible record analysis
- Created checkPropagationByType() for single record type queries
- Created checkAllPropagation() export for all record types
- Query functions for NS, MX, TXT records (queryNsRecords, queryMxRecords, queryTxtRecords)
- Subdomain detection uses domain part counting with TLD awareness

---

## [2.2.0] - October 16, 2025

### Added
- **DNS Propagation Checker** (Stage 4)
  - Check DNS propagation across 11 global DNS servers
  - Query major providers: Google, Cloudflare, Quad9, OpenDNS, AdGuard, DNS.WATCH, Verisign, Level3
  - Real-time propagation status with visual indicators
  - Percentage-based propagation metrics
  - IP address consistency checking across servers
  - Geographic distribution (USA, Europe, Global servers)
- **Backend Module**
  - `src/propagation.js` module with custom DNS resolvers
  - Parallel DNS queries across all servers (1-2 seconds)
  - `/api/propagation` API endpoint
  - Smart propagation analysis algorithm
  - 5-second timeout per server query
  - Comprehensive error handling for timeouts and failures
- **Frontend Features**
  - Beautiful gradient summary box with key metrics
  - Status indicators with emojis (✅ Propagated, ⏳ Propagating)
  - Propagation percentage display
  - Server response count (e.g., 10/11 servers)
  - IP address summary showing unique IPs and server counts
  - Color-coded server cards (green = success, yellow = no data, red = error)
  - 2-3 column responsive grid for server results
  - Visual consistency with WHOIS and DNS sections
- **Performance Optimization**
  - All 3 APIs (WHOIS, DNS, Propagation) called in parallel
  - Total lookup time: 2-5 seconds for complete analysis
  - Promise.allSettled for resilient parallel queries

### Changed
- Updated Full Lookup to include propagation check
- Enhanced loading states and error handling
- Improved mobile responsiveness for all sections

### Technical
- Using Node.js built-in DNS `Resolver` class
- Custom DNS resolver per server for accurate results
- No external dependencies required

---

## [2.1.0] - 2025-10-15

### Added
- **DNS Records Query** (Stage 3)
  - Complete DNS record analysis for all major record types
  - A Records (IPv4 addresses)
  - AAAA Records (IPv6 addresses)
  - MX Records (Mail servers with priority)
  - TXT Records (SPF, DKIM, DMARC, verification records)
  - NS Records (Name servers from DNS)
  - SOA Record (Start of Authority with full details)
  - CAA Records (Certificate Authority Authorization)
- **Backend Module**
  - `src/dns.js` module using Node.js built-in DNS
  - Parallel DNS queries for fast performance (1-2 seconds)
  - `/api/dns` API endpoint
  - Comprehensive error handling for missing records
- **Frontend Improvements**
  - DNS records displayed in responsive 2-3 column grid layout
  - Visual consistency with WHOIS section (same container)
  - TXT records full-width display (handles long content)
  - Mobile-responsive design (1 column on mobile, 2-3 on desktop)
  - "No records found" messaging for optional record types
- **Performance Optimization**
  - Parallel WHOIS + DNS API calls (faster than sequential)
  - Promise.allSettled for DNS queries (all types at once)
- **WHOIS Lookup Feature** (Stage 2)
  - Full domain registration information
  - Registrar details with creation/expiration dates
  - Domain status with clickable ICANN reference links
  - DNSSEC status display
  - Name servers from WHOIS data
  - Helper functions for robust data parsing (getValue, formatDate, getNameServers, getStatus)
- **Improved Frontend UI**
  - 3-column date display (Created, Updated, Expires)
  - Name Servers + DNSSEC side-by-side layout
  - Bold domain status with clickable ICANN links
  - Collapsible raw WHOIS data debug section
  - Tailwind CSS responsive design
  - Professional gradient styling
  - Mobile-friendly interface
- **Backend Modules**
  - `src/whois.js` module with whoiser library
  - Comprehensive helper functions for data extraction
  - Error handling and fallback logic
  - Support for multiple TLD formats
- **ES Modules Migration**
  - Converted entire project from CommonJS to ES Modules
  - Updated all imports/exports to modern syntax
  - Fixed __dirname compatibility for ES Modules

### Changed
- Updated main container to include both WHOIS and DNS results
- Reorganized DNS record display for better space utilization
- Improved record formatting (monospace fonts for technical data)
- Button text: "Analyze" → "Full Lookup"
- Reorganized UI sections for better UX
- Moved Name Servers section above Domain Status
- Enhanced error messages with user-friendly text

### Fixed
- WHOIS data parsing for different TLD formats (.com, .org, .net, .ar, .es, etc.)
- Name server extraction from various WHOIS response formats
- Date formatting inconsistencies across different registrars
- Domain status link parsing and display

### Technical
- Using Node.js built-in `dns` module (no external dependencies)
- ES Modules throughout
- XSS protection for TXT record display
- Package: Added `whoiser@^1.17.3`
- Package: Added `"type": "module"` for ES Modules support
- Improved Docker build process
- Enhanced error handling in API endpoints
- Parallel WHOIS queries for better performance

---

## [2.0.0] - 2025-10-10

### Added
- **Initial Release** (Stage 1)
- **Infrastructure Setup**
  - VPS configuration (Ubuntu 24.04 LTS, 8GB RAM, 2 vCPU)
  - Docker & Docker Compose installation and configuration
  - Nginx reverse proxy setup
  - UFW firewall configuration (ports 22, 80, 443)
  - Git & GitHub SSH authentication
- **SSL/HTTPS**
  - Let's Encrypt SSL certificate
  - Automatic HTTP to HTTPS redirect
  - Auto-renewal configuration with Certbot
- **DNS Configuration**
  - Domain: futurelink.space
  - Subdomain: domain-check.futurelink.space
  - DNS propagation verification
- **Project Structure**
  - Node.js + Express backend
  - Docker containerization
  - Nginx reverse proxy
  - Git version control workflow
- **Hello World Application**
  - Basic Express server
  - Simple HTML frontend with Tailwind CSS
  - Health check API endpoint (`/api/health`)
  - Docker deployment configuration
- **Development Workflow**
  - Local development → Git → VPS deployment pipeline
  - VS Code development environment
  - Docker Compose for local testing
  - Git workflow established

### Technical
- Node.js 18.x
- Express.js ^4.18.2
- Docker & Docker Compose
- Nginx 1.24
- Ubuntu 24.04 LTS
- Tailwind CSS (CDN)

---

## Version History Summary

| Version | Date          | Stage            | Description                              |
|---------|---------------|------------------|------------------------------------------|
| 2.8.0   | Nov 29, 2025  | Grid Layout      | 3-column dashboard + bug fixes           |
| 2.7.0   | Nov 28, 2025  | UI Redesign      | Complete dashboard redesign              |
| 2.6.0   | Nov 19, 2025  | Stage 7          | CMS/Technology Detection                 |
| 2.5.0   | Nov 19, 2025  | Stage 6          | Hosting Provider Detection               |
| 2.4.0   | Nov 16, 2025  | Stage 5          | SSL/TLS Certificate Analysis             |
| 2.3.0   | Oct 16, 2025  | Improvements     | Brazilian domains, Multi-record propagation, Subdomain detection |
| 2.2.0   | Oct 16, 2025  | Stage 4          | DNS Propagation Checker                  |
| 2.1.0   | Oct 15, 2025  | Stage 3          | DNS Records Query                        |
| 2.0.0   | Oct 10, 2025  | Stage 2          | WHOIS Lookup + UI Improvements           |
| 1.0.0   | Oct 05, 2025  | Stage 1          | Infrastructure & Hello World             |


## Versioning Guidelines

- **MAJOR (X.0.0):** Breaking changes, major new features
- **MINOR (x.X.0):** New features, backward compatible
- **PATCH (x.x.X):** Bug fixes, minor improvements

---

## Release Process

1. Update VERSION file
2. Update CHANGELOG.md with changes (move from Unreleased to new version)
3. Update README.md if needed
4. Commit: `git commit -m "chore: release vX.X.X"`
5. Create tag: `git tag -a vX.X.X -m "Release vX.X.X"`
6. Push: `git push origin main --tags`
7. Deploy to VPS

---

**Format:** [Keep a Changelog](https://keepachangelog.com/)  
**Versioning:** [Semantic Versioning](https://semver.org/)