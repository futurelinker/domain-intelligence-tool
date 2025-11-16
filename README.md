# Domain Intelligence Tool

> Automated domain analysis tool for Customer Success workflows

[![Version](https://img.shields.io/badge/version-2.3.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-18.x-brightgreen.svg)](package.json)

## 🎯 Purpose

This tool automates daily domain intelligence gathering by consolidating WHOIS lookups, DNS queries, SSL certificate analysis, and hosting provider detection into a single interface.

**Built for:** Customer Success Specialists who need quick, comprehensive domain analysis.

---

## ✨ Features

### Current Features (v2.3.0)

- ✅ **WHOIS Lookup**
  - Domain registrar information
  - Registration and expiration dates
  - **Brazilian domain support (.br, .com.br)**
  - **Provider field for Brazilian domains**
  - Domain status with ICANN reference links
  - DNSSEC status
  - Name servers

- ✅ **DNS Records Query**
  - A Records (IPv4 addresses)
  - AAAA Records (IPv6 addresses)
  - MX Records (Mail servers with priority)
  - TXT Records (SPF, DKIM, DMARC)
  - NS Records (Name servers)
  - SOA Record (Start of Authority)
  - CAA Records (Certificate Authority)

- ✅ **Multi-Record DNS Propagation Checker**
  - Check A, NS, MX, TXT record propagation
  - 11 global DNS servers queried simultaneously
  - Real-time status indicators (Propagated/Propagating)
  - **Collapsible cards with summary view**
  - **Click-to-expand for detailed server results**
  - Color-coded visual indicators
  - Compact 4-column server grid

- ✅ **Dynamic Version Display**
  - Auto-updates from VERSION file
  - Single source of truth

- ✅ **Professional UI**
  - Tailwind CSS responsive design
  - 2-3 column responsive grid layout
  - Collapsible debug information
  - Mobile-friendly interface
  - Real-time lookup feedback
  - Visual status indicators

### Planned Features (Roadmap)

- **Stage 5:** SSL Certificate Deep Analysis
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


**Last Updated:** October 25, 2025
**Version: 2.3.0**
**Status:** Production (Improvements Release Complete)