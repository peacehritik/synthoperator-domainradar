# SynthOperator DomainRadar

**An open-source deterministic decision-intelligence engine for domain acquisitions, portfolio retention economics, and startup brand-name selection.**

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react)](https://react.dev/)
[![i18n](https://img.shields.io/badge/i18n-5_Languages-emerald.svg)](https://synthoperator.com)
[![Platform](https://img.shields.io/badge/Platform-SynthOperator-black.svg)](https://synthoperator.com)
[![Creator](https://img.shields.io/badge/Creator-@hafid__bas-1DA1F2.svg?logo=x)](https://x.com/hafid_bas)

[Live Platform](https://synthoperator.com) • [Report Issue](https://github.com/peacehritik/synthoperator-domainradar/issues) • [Contributing](CONTRIBUTING.md) • [Security Policy](SECURITY.md)
</div>

---

## ⚡ Overview

Traditional domain appraisal tools rely on opaque linear regressions or ungrounded LLM hallucinations that treat speculative estimates as observed facts.

**SynthOperator DomainRadar** replaces guesswork with an **evidence-based deterministic decision protocol**. It isolates verified public telemetry, executes atomic semantic judgments, evaluates capital-proportional risk gates, and calculates actuarial Net Expected Value (**Net EV**).

```text
                                USER INPUT
                        (Domain + Target Asking Price)
                                     │
                                     ▼
                ┌─────────────────────────────────────────┐
                │        PARALLEL FREE TELEMETRY          │
                │  RDAP • Wayback CDX • Google Suggest    │
                │    Native DNS • 1,000+ Brand Index      │
                └────────────────────┬────────────────────┘
                                     │
                                     ▼
                ┌─────────────────────────────────────────┐
                │       CANONICAL STATE & SHA-256         │
                │        Deterministic State Hash         │
                └────────────────────┬────────────────────┘
                                     │
                                     ▼
                ┌─────────────────────────────────────────┐
                │      ATOMIC EVALUATION LAYER            │
                │   TypeSafe JEV Cloud / Local Engine     │
                └────────────────────┬────────────────────┘
                                     │
                                     ▼
                ┌─────────────────────────────────────────┐
                │       DETERMINISTIC FINANCIAL CORE      │
                │  Wholesale / Retail • Net EV Spread     │
                │   Holding Efficiency • 4 Hard Gates     │
                └────────────────────┬────────────────────┘
                                     │
                                     ▼
                               DECISION VERDICT
                   BUY  │  REVIEW  │  PASS  │  RENEW  │  DROP
```

## 💎 Core Capabilities

### 1. Mode A — Secondary Buy Diligence

**Actuarial Net EV:**

```math
Net EV = Gross Expected Value - Acquisition Cost - Broker Fees (15%) - 2-Year Registry Carry
```

**Four Inviolable Hard Gates:**

| Gate | Description |
|------|-------------|
| 🔒 **Trademark Collision Gate** | Flags collisions against an indexed dictionary of 1,000+ global brands. |
| 🔒 **Evidence Sufficiency Gate** | Enforces minimum 35% data coverage before allowing automated Buy signals. |
| 🔒 **Capital Budget Gate** | Scales verification requirements relative to capital exposure ($30 to $2,500+). |
| 🔒 **Negative Spread Gate** | Halts automated recommendation when asking price exceeds expected net resale yield. |

### 2. Mode B — Portfolio Retention & Drop Engine

**Forward-Looking Cashflow:** Past acquisition price is treated strictly as a sunk cost (weight = 0).

**Holding Efficiency Ratio:**

```math
Ratio = \frac{Parking Revenue + Inbound Inquiries Yield + Gross Resale Yield}{Annual Registry Renewal Cost}
```

Categorizes portfolio assets into:

| Category | Ratio Range |
|----------|-------------|
| 🟢 **Surplus Hold** | ≥ 2.0× |
| 🟡 **Break-Even Review** | 1.0× − 2.0× |
| 🔴 **Sunk Cost Drop Candidate** | < 1.0× |

### 3. Mode C — Multi-Domain Brand Selection

Evaluates up to 10 candidate domains concurrently against structured business positioning (industry, customer segment, geography, and strategic priority). Dispatches parallel per-domain evaluation contracts and computes cross-domain trade-offs (e.g. auditory leakage with prefixes, trust loss with non-.com TLDs).

### 4. High-Performance Bulk Processing

Batch-processes up to 100 domains with a controlled concurrency worker pool (4 parallel workers by default) to optimize throughput while protecting system resilience. Complete per-domain error isolation: a network hiccup on one domain never fails the batch.

## 🚀 Quickstart (Zero-Configuration)

The Community Edition is fully functional out of the box with zero external dependencies, no required paid API subscriptions, and no database setup:

```bash
# 1. Clone the repository
git clone https://github.com/peacehritik/synthoperator-domainradar.git
cd synthoperator-domainradar

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open http://localhost:3000 in your browser. The platform runs using:

- Native Node.js DNS resolution
- Public ICANN RDAP protocols
- Free open telemetry (Wayback Machine CDX, Google Suggest open API)
- Built-in deterministic local simulation engine (evaluateJEVLocally)

## ⚙️ Environment Configuration (Optional)

To enable live cloud inference with upstream TypeSafe JEV System One, copy `.env.example`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
APP_NAME="SynthOperator DomainRadar"
APP_URL="https://synthoperator.com"

# Optional: Add your TypeSafe JEV API Key
TYPESAFE_API_KEY=

# Batch Audit Concurrency Limit (Default: 4)
BULK_AUDIT_CONCURRENCY=4
```

## 🔑 Dual-Mode JEV API Configuration (Interface or .env)

SynthOperator DomainRadar supports **two flexible ways** to configure the TypeSafe JEV System One decision engine:

| Configuration Method | How to Configure | Storage Location | Recommended Use Case |
| :--- | :--- | :--- | :--- |
| **Option A: In the Web Interface (BYOK)** | Open ⚙️ **Settings** in the top navigation bar and enter your key | Stored in browser `localStorage` (transmitted via `x-typesafe-key`) | Individual users, personal evaluation, demo testing |
| **Option B: Server-Side in `.env`** | Set `TYPESAFE_API_KEY=your_key` in root `.env` | Stored securely in server environment variables | Production deployments, public multi-user hosting |
| **Option C: Zero-Cost Local Engine (Default)** | *Leave blank (no key needed)* | In-memory deterministic contract simulation (`evaluateJEVLocally`) | Offline development, zero-budget testing |

### Environment Configuration (.env)

To configure the server environment, copy `.env.example`:

```bash
cp .env.example .env

Edit .env:

PORT=3000
APP_NAME="SynthOperator DomainRadar"
APP_URL="https://synthoperator.com"

# Optional: Server-side TypeSafe JEV API Key (Overrides or acts as fallback)
TYPESAFE_API_KEY=

# Batch Audit Concurrency Limit (Default: 4)
BULK_AUDIT_CONCURRENCY=4


---

## ⚙️ Environment Configuration (Optional)

To enable live cloud inference with upstream TypeSafe JEV System One, copy `.env.example`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
APP_NAME="SynthOperator DomainRadar"
APP_URL="https://synthoperator.com"

# Optional: Add your TypeSafe JEV API Key
TYPESAFE_API_KEY=

# Batch Audit Concurrency Limit (Default: 4)
BULK_AUDIT_CONCURRENCY=4

**Client-Side BYOK Notice:** Individual users can also supply their own TypeSafe API key directly in the browser via the Settings modal (localStorage). For multi-user public deployments, set TYPESAFE_API_KEY server-side.

## 🌐 Supported Locales & Internationalization

SynthOperator DomainRadar natively supports 5 locales with strict glossary compliance and layout isolation:

| Code | Language | Layout | Font |
|------|----------|--------|------|
| en | English | LTR | Inter / Sans |
| fr | Français | LTR | Inter / Sans |
| es | Español | LTR | Inter / Sans |
| pt | Português | LTR | Inter / Sans |
| ar | العربية | RTL | Google Amiri (with `<LtrIsolate>` for technical terms) |

Audit integrity across all 507 dictionary keys can be verified anytime:

```bash
npm run i18n:check
```

## 🚀 Validation & Code Quality

Before opening pull requests, ensure all automated quality gates pass:

```bash
# Strict TypeScript compilation check
npm run typecheck

# Internationalization parity & protected glossary audit
npm run i18n:check

# Production Vite bundle build
npm run build
```

## 🏛️ Open Core Architecture & Trademark Notice

- **Software Code:** Licensed under the Apache License 2.0.
- **Trademark Policy:** "SynthOperator", the SynthOperator logo, and associated visual assets are trademarks of Hafid Bas. The Apache 2.0 license grants permissions for the software source code, but does not grant rights to use the trademark SynthOperator in commercial derivatives without explicit written consent.
- **Market Data Provenance:** Comparable domain sales records are documented, public historical facts reported by DNJournal, NameBio, Sedo, and public brokerages.

## 👤 Creator & Maintainer

- **Built by:** Hafid Bas — Solo Founder & Systems Software Engineer
- **Brand & AI Infrastructure:** SynthOperator
- **GitHub:** @peacehritik
- **X / Twitter:** @hafid_bas
- **Support & Inquiries:** support@synthoperator.com