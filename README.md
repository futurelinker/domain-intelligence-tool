# Domain Intelligence Tool

> Automated domain analysis tool for Customer Success workflows

[![Version](https://img.shields.io/badge/version-2.2.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-18.x-brightgreen.svg)](package.json)

## 🎯 Purpose

This tool automates daily domain intelligence gathering by consolidating WHOIS lookups, DNS queries, SSL certificate analysis, and hosting provider detection into a single interface.

**Built for:** Customer Success Specialists who need quick, comprehensive domain analysis.

---

## ✨ Features

### Current Features (v2.2.0)

- ✅ **WHOIS Lookup**
  - Domain registrar information
  - Registration and expiration dates
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

- ✅ **DNS Propagation Checker**
  - Check propagation across 11 global DNS servers
  - Real-time status indicators (Propagated/Propagating)
  - Percentage-based metrics
  - IP consistency verification
  - Geographic distribution (USA, Europe, Global)
  - Color-coded server results

- ✅ **Professional UI**
  - Tailwind CSS responsive design
  - 2-3 column responsive grid layout
  - Collapsible debug information
  - Mobile-friendly interface
  - Real-time lookup feedback

### Planned Features (Roadmap)

- 📋 **SSL Certificate Analysis** (Stage 5)
  - Certificate details and validation

- 📋 **Future Stages**
  - SSL Certificate Analysis
  - Hosting Provider Detection
  - CMS/Technology Detection
  - Website Screenshots

---

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Node.js 18+ (ES Modules)
- Express.js web framework
- whoiser (WHOIS lookups)

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- Tailwind CSS (CDN)
- Responsive design

**Infrastructure:**
- Docker & Docker Compose
- Nginx (reverse proxy)
- Let's Encrypt (SSL/TLS)
- VPS deployment (Ubuntu 24.04 LTS)

**Version Control:**
- Git / GitHub
- Semantic Versioning (SemVer)

---

## 📦 Project Structure

domain-intelligence-tool/
├── src/
│   ├── server.js           # Express server (ES Modules)
│   ├── whois.js            # WHOIS lookup module
│   ├── dns.js              # DNS query module (Stage 3)
│   └── public/
│       ├── index.html      # Frontend UI
│       ├── app.js          # Frontend JavaScript
│       └── style.css       # (Replaced by Tailwind)
├── .git/                   # Git repository
├── .gitignore              # Git ignore rules
├── .dockerignore           # Docker ignore rules
├── Dockerfile              # Container image definition
├── docker-compose.yml      # Container orchestration
├── package.json            # Node.js dependencies
├── README.md               # This file
├── CHANGELOG.md            # Version history
└── VERSION                 # Current version

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

## 🤝 Contributing
This is a personal project for internal use. If you'd like to contribute:

* Fork the repository
* Create a feature branch
* Make your changes
* Submit a pull request


## 📄 License
MIT License - see LICENSE file for details

## 🙏 Acknowledgments

whoiser - WHOIS data parsing
Express.js - Web framework
Tailwind CSS - UI styling
Docker - Containerization
Let's Encrypt - Free SSL certificates
Claude (Anthropic) - Development assistance


## 🗺️ Roadmap
See CHANGELOG.md for detailed version history.
Upcoming Features

 Stage 3: DNS Records Query
 Stage 4: DNS Propagation Checker
 Stage 5: SSL Certificate Deep Analysis
 Stage 6: Hosting Provider Detection
 Stage 7: CMS/Technology Detection
 Stage 8: Website Screenshots


Last Updated: 2025-01-11
Version: 2.2.0
Status: Production (Stage 4 Complete)