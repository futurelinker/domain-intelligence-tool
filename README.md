# Domain Intelligence Tool

> Automated domain analysis tool for Customer Success workflows

[![Version](https://img.shields.io/badge/version-2.10.1-blue.svg)](CHANGELOG.md)
[![Grid Layout](https://img.shields.io/badge/layout-3--column%20grid-c5d5b8.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-18.x-brightgreen.svg)](package.json)


## 🎯 Purpose

This tool automates daily domain intelligence gathering by consolidating WHOIS lookups, DNS queries, SSL certificate analysis, and hosting provider detection into a single interface.

**Built for:** Customer Success Specialists who need quick, comprehensive domain analysis.

---

## ✨ Features

### Current Features (v2.10.1)

- ✅ **Enterprise-Grade Security** (v2.10.1) 🔒
  - **SSRF Protection**: Blocks private IPs, localhost, cloud metadata endpoints
  - **Input Validation**: Strict domain format checking with regex
  - **Multi-Layer Rate Limiting**: 
    - Cloudflare (recommended): DDoS and bot protection
    - Nginx: 10 requests/minute per IP
    - Express: 50 requests/15 minutes per IP
  - **Generic Error Messages**: Prevents information leakage
  - **80+ TLD Support**: International domain handling

### Current Features (v2.9.0)

- ✅ **Light/Dark Theme Toggle**
  - Switch between light and dark themes
  - Purple accent preserved in both themes
  - Preference saved automatically

- ✅ **Modern Purple Theme**
  - Vibrant purple accent color
  - Dark blue-purple background
  - Professional appearance

### Visual Design (v2.9.0)

**Modern Purple Theme:**
- Vibrant purple accent (#8b5cf6) throughout interface
- Dark blue-purple background for professional look
- Enhanced hover effects and transitions
- Consistent with modern web design patterns

**3-Column Grid Layout:**
- Row 1: WHOIS | DNS Records | Hosting (purple accent)
- Row 2: SSL (2/3 width) | Technologies (1/3 width)
- Row 3: DNS Propagation (full width, collapsible)
- Responsive: 3 columns → 2 columns → 1 column

**Enhanced Sections:**
- SSL: Collapsible Certificate Covers & Chain
- Technologies: Unified boxes with CMS purple accent
- DNS Propagation: Consistent formatting, bigger badges
- Input fields: Focus highlights border only (no background change)

**Design Improvements:**
- Larger rounded corners (24px)
- Soft shadows with hover lift effects
- Purple-tinted accent cards
- Better visual hierarchy


### Current Features (v2.8.0)

- ✅ **Modern 3-Column Grid Dashboard**
  - Responsive grid layout (3 → 2 → 1 columns)
  - 44% reduction in vertical scrolling
  - Better space utilization
  - Professional card design with hover effects

- ✅ **WHOIS Lookup**
  - Domain registrar information
  - Registration and expiration dates
  - Brazilian domain support (.br, .com.br)
  - Provider field for Brazilian domains
  - Domain status with ICANN reference links
  - DNSSEC status
  - Name servers

- ✅ **DNS Records Query**
  - A Records (IPv4 addresses)
  - AAAA Records (IPv6 addresses)
  - MX Records (Mail servers with priority)
  - TXT Records (SPF, DKIM, DMARC)
  - NS Records (Name servers)
  - SOA Record (Grid layout - easy to scan)
  - CAA Records (Certificate Authority)

- ✅ **Multi-Record DNS Propagation Checker**
  - Check A, NS, MX, TXT record propagation
  - 11 global DNS servers queried simultaneously
  - Real-time status indicators (Propagated/Propagating)
  - Collapsible cards with summary view
  - Click-to-expand for detailed server results
  - Color-coded visual indicators
  - Compact 4-column server grid

- ✅ **SSL/TLS Certificate Analysis**
  - Certificate validity and trust status
  - Expiration tracking with color-coded warnings
  - Certificate issuer (CA) information
  - Subject Alternative Names (all covered domains)
  - Complete certificate chain visualization (40% more compact)
  - Wildcard and self-signed detection
  - Integration with SSL Labs for deep analysis

- ✅ **Hosting Provider Detection**
  - Automatic detection of 20+ major providers
  - Cloud platforms (AWS, GCP, Azure, DigitalOcean, etc.)
  - CDN services (Cloudflare, Fastly, Akamai, etc.)
  - Traditional hosting (GoDaddy, Bluehost, etc.)
  - Modern platforms (Vercel, Netlify)
  - IP geolocation (country, region, city, timezone)
  - ASN and organization information
  - Descriptive badges for hosting type

- ✅ **CMS/Technology Detection**
  - Automatic detection of 40+ technologies
  - Prominent CMS display (WordPress, Drupal, Shopify, etc.)
  - Frontend frameworks (React, Vue, Angular, Next.js, etc.)
  - Backend technologies (PHP, Node.js, Python, Ruby, ASP.NET)
  - Web servers (nginx, Apache, IIS, LiteSpeed)
  - JavaScript libraries (jQuery, Bootstrap, Tailwind CSS)
  - Analytics tools (Google Analytics, Tag Manager, Facebook Pixel)
  - E-commerce platforms (WooCommerce, Magento, PrestaShop)
  - Confidence level indicators (high/medium/low)

- ✅ **Professional UI**
  - Unified design system (no Tailwind)
  - Responsive dark theme
  - Collapsible sections for better UX
  - Mobile-friendly interface
  - Real-time lookup feedback
  - Visual status indicators

### Dashboard Layout (v2.8.0)

**3-Column Grid System:**

**Row 1:** Primary Information (3 equal columns)
- WHOIS Information (domain ownership)
- DNS Records (technical configuration)
- Hosting & Network (infrastructure) - with green accent ✨

**Row 2:** Secondary Information (asymmetric layout)
- Website Technologies (2/3 width - needs space for badges)
- SSL Certificate (1/3 width - compact info)

**Row 3:** Detailed Analysis (full width)
- DNS Propagation Status (4 collapsible tabs)

**Responsive Behavior:**
- Desktop (>1024px): 3-column grid
- Tablet (768-1024px): 2-column grid
- Mobile (<768px): 1-column stack

**Visual Features:**
- Larger rounded corners (24px)
- Soft shadows with hover lift effects
- Green accent on Hosting card
- Space Mono typography for technical data
- Professional dark theme

---

### UI Design System (v2.7.0)

**Complete redesign** with a professional, unified design system:

- **Color Palette**: Consistent dark theme with accent green
- **Typography**: Space Mono for technical data, Inter for body text
- **Components**: Reusable badge, card, and data display classes
- **Spacing**: 35% more compact layout without losing readability
- **Consistency**: Same visual language across all 6 sections

**Key Improvements:**
- SSL certificate chain: 40% more compact
- SOA DNS record: Grid layout (43% space reduction)
- All technical values: Space Mono monospace font
- Status badges: Unified design system classes
- Hover effects: Smooth transitions throughout

### Planned Features (Roadmap)

- **Stage 6:** Hosting Provider Detection
- **Stage 7:** CMS/Technology Detection
- **Stage 8:** Website Screenshots

---
# Security Policy

## Version 2.10.1 - Security Hardening

This document outlines the security measures implemented in the Domain Intelligence Tool.

## Security Features

### 1. SSRF Protection (VULN-01 - High Severity) ✅
**Status**: Fixed in v2.10.1

The application validates that all user-provided domains resolve to public IP addresses only.

**Blocked IP Ranges:**
- `127.0.0.0/8` - Localhost
- `10.0.0.0/8` - Private network
- `172.16.0.0/12` - Private network
- `192.168.0.0/16` - Private network (home/office)
- `169.254.0.0/16` - Link-local (AWS metadata)
- `224.0.0.0/4` - Multicast
- `240.0.0.0/4` - Reserved

**Implementation**: `src/security.js` - `validateDomainSSRF()`

### 2. Input Validation (VULN-02 - Medium Severity) ✅
**Status**: Fixed in v2.10.1

All domain inputs are validated against strict format rules.

**Validation Rules:**
- Must be valid domain format (regex)
- Maximum 253 characters (FQDN limit)
- No special characters (only letters, numbers, hyphens, dots)
- No consecutive dots
- No leading/trailing dots or hyphens

**Implementation**: `src/security.js` - `isValidDomain()`

### 3. Rate Limiting (VULN-03 - Medium Severity) ✅
**Status**: Fixed in v2.10.1

Multi-layer rate limiting prevents abuse and DoS attacks.

**Rate Limits:**
1. **Cloudflare** (recommended): Configurable in dashboard
2. **Nginx**: 10 requests/minute per IP
3. **Express**: 50 requests/15 minutes per IP

**Implementation**: 
- Nginx: `/etc/nginx/sites-available/domain-check.futurelink.space`
- Express: `src/server.js` with `express-rate-limit`

### 4. Generic Error Messages (VULN-05 - Low Severity) ✅
**Status**: Fixed in v2.10.1

Prevents information leakage through verbose error messages.

**Implementation**: All API endpoints return generic error messages to users while logging detailed errors server-side.

### 5. TLD Parsing (VULN-06 - Low Severity) ✅
**Status**: Fixed in v2.10.1

Expanded support for country-code TLDs from 7 to 80+.

**Implementation**: `src/utils.js` - `specialTLDs` array

### 6. Authentication (VULN-04) ⚠️
**Status**: Not Implemented (By Design)

This is a public tool designed for open access. Authentication is not required. Security is maintained through:
- Rate limiting
- SSRF protection
- Input validation
- Cloudflare protection (recommended)

## Reporting a Vulnerability

If you discover a security vulnerability, please email: security@futurelink.space

**Please include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

**Response Time**: We aim to respond within 48 hours.

## Security Audit History

- **2025-12-02**: Initial security audit by Antigravity AI
  - Identified 6 vulnerabilities
  - Overall risk: Medium-High
  
- **2025-12-10**: Security hardening release (v2.10.1)
  - Fixed 5 out of 6 vulnerabilities
  - Remaining: Authentication (not required by design)
  - New risk level: Low

## Security Best Practices for Deployment

### Required
1. ✅ Deploy behind Nginx with rate limiting
2. ✅ Use HTTPS (Let's Encrypt SSL)
3. ✅ Keep dependencies updated
4. ✅ Monitor logs for abuse

### Recommended
1. ☁️ Enable Cloudflare (free tier)
2. 🔒 Configure Cloudflare WAF rules
3. 📊 Set up monitoring/alerts
4. 🔄 Regular security updates

### Optional
1. Enable Cloudflare "Under Attack Mode" when needed
2. Set up fail2ban for SSH protection
3. Configure UFW firewall rules
4. Regular security audits

## Version History

- **v2.10.1** (2025-12-10): Security hardening release
- **v2.10.0** (2025-12-09): Theme toggle feature
- **v2.9.0** (2025-12-02): Purple theme redesign
- **v2.6.0** (2025-11-19): Technology detection

---

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Node.js 18+ (ES Modules)
- Express.js web framework
- whoiser (WHOIS lookups)
- Node.js built-in DNS module (DNS queries & propagation)

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- Tailwind CSS (CDN)
- Responsive design
- No external JavaScript libraries

**Infrastructure:**
- Docker & Docker Compose
- Nginx (reverse proxy)
- Let's Encrypt (SSL/TLS)
- VPS deployment (Ubuntu 24.04 LTS)

**Version Control:**
- Git / GitHub
- Semantic Versioning (SemVer)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Docker & Docker Compose installed
- Git installed
- GitHub account

### Local Development

1. **Clone the repository:**
```bash
   git clone git@github.com:YOUR_USERNAME/domain-intelligence-tool.git
   cd domain-intelligence-tool
```

2. **Install dependencies:**
```bash
    npm install
```

3. **Run locally(Without Docker):**
```bash
    npm start
   # Access at: http://localhost:3000
```

4. **Run with Docker**
```bash
    docker compose up -d
   # Access at: http://localhost:3001
```

5. **View Logs**
```bash
    docker compose logs -f
```

6. **Stop Containeer**

```bash
    docker compose down    
```

## 🔄 Git Workflow

### Making changes
1. Make changes in VS Code
2. Test locally:
```bash
    docker compose down
    docker compose up -d --build
```
3. Commit changes:
```bash
    git add .
    git commit -m "description of changes"
    git push origin main
```

### Commint Message Convention
Follow mentioned commits:
* feat: New feature
* fix: Bug fix
* docs: Documentation changes
* style: Code style changes (formatting)
* refactor: Code refactoring
* test: Adding tests
* chore: Maintenance tasks
Examples: 
```bash
    git commit -m "feat: add DNS record lookup"
    git commit -m "fix: correct name server parsing"
    git commit -m "docs: update README"
```

## 📊 Versioning
This project uses Semantic Versioning:

MAJOR.MINOR.PATCH (e.g., 2.0.0)

* MAJOR: Breaking changes
* MINOR: New features (backward compatible)
* PATCH: Bug fixes

Current Version: See VERSION file and CHANGELOG.md

## 📄 License
MIT License - see LICENSE file for details

## 🙏 Acknowledgments

+ whoiser - WHOIS data parsing
+ Express.js - Web framework
+ Tailwind CSS - UI styling
+ Docker - Containerization
+ Let's Encrypt - Free SSL certificates
+ Claude (Anthropic) - Development assistance


## 🗺️ Roadmap
See CHANGELOG.md for detailed version history.
Upcoming Features

 Stage 5: SSL Certificate Deep Analysis
 Stage 6: Hosting Provider Detection
 Stage 7: CMS/Technology Detection
 Stage 8: Website Screenshots


**Last Updated:** December 14, 2025
**Version: 2.10.1**
**Status:** Production (Security Hardened)