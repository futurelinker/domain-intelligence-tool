# Domain Intelligence Tool

> Automated domain analysis tool for Customer Success workflows

[![Version](https://img.shields.io/badge/version-2.8.0-blue.svg)](CHANGELOG.md)
[![Grid Layout](https://img.shields.io/badge/layout-3--column%20grid-c5d5b8.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-18.x-brightgreen.svg)](package.json)


## 🎯 Purpose

This tool automates daily domain intelligence gathering by consolidating WHOIS lookups, DNS queries, SSL certificate analysis, and hosting provider detection into a single interface.

**Built for:** Customer Success Specialists who need quick, comprehensive domain analysis.

---

## ✨ Features

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


**Last Updated:** November 19, 2025
**Version: 2.6.0**
**Status:** Production (Stage 7 Complete - CMS/Technology Detection)