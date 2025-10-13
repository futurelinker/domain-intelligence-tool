# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- DNS Records Query (Stage 3)
- DNS Propagation Checker (Stage 4)
- SSL Certificate Analysis (Stage 5)
- Hosting Provider Detection (Stage 6)
- CMS/Technology Detection (Stage 7)
- Website Screenshots (Stage 8)

---

## [2.0.0] - 2025-01-11

### Added
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
- Package: Added `whoiser@^1.17.3`
- Package: Added `"type": "module"` for ES Modules support
- Improved Docker build process
- Enhanced error handling in API endpoints
- Parallel WHOIS queries for better performance

---

## [1.0.0] - 2025-01-10

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

| Version | Date       | Description                    | Stage   |
|---------|------------|--------------------------------|---------|
| 2.0.0   | 2025-01-11 | WHOIS Lookup + UI Improvements | Stage 2 |
| 1.0.0   | 2025-01-10 | Infrastructure & Hello World   | Stage 1 |

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