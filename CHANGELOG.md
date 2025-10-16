# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- SSL Certificate Analysis (Stage 5)
- Hosting Provider Detection (Stage 6)
- CMS/Technology Detection (Stage 7)
- Website Screenshots (Stage 8)

---

## [2.2.0] - 2025-10-16

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


| Version | Date          | Stage   | Description                        |
|---------|---------------|---------|------------------------------------|
| 2.2.0   | Oct 16, 2025  | Stage 4 | DNS Propagation Checker            |
| 2.1.0   | Oct 13, 2025  | Stage 3 | DNS Records Query                  |
| 2.0.0   | Oct 10, 2025  | Stage 2 | WHOIS Lookup + UI Improvements     |
| 1.0.0   | Oct 05, 2025  | Stage 1 | Infrastructure & Hello World       |

---

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