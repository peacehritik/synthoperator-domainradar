# Contributing to SynthOperator DomainRadar

Thank you for your interest in contributing to **SynthOperator DomainRadar**!

SynthOperator DomainRadar is an open-source, deterministic decision-intelligence platform for domain acquisition, portfolio retention, and brand-name selection.

We welcome bug fixes, performance improvements, documentation updates, testing improvements, and focused feature contributions.

## Getting Started

### 1. Fork the repository

Create your own fork of the SynthOperator DomainRadar repository on GitHub from:
**https://github.com/peacehritik/synthoperator-domainradar**

### 2. Clone your fork

```bash
git clone https://github.com/<your-username>/synthoperator-domainradar.git
cd synthoperator-domainradar
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

The application should then be available at the local development URL displayed by Vite.

## Development & Quality Standards

Before submitting a Pull Request, make sure all relevant validation checks pass successfully.

### Required checks

```bash
npm run lint
npm run typecheck
npm run i18n:check
npm run build
```

### What these checks cover

* **Lint & type validation:** Ensure the codebase complies with strict TypeScript type checking (tsc --noEmit).
* **Internationalization:** Ensure locale dictionaries remain 100% synchronized across all 5 supported languages (en, fr, ar, es, pt) with zero missing or empty keys.
* **Production build:** Ensure the application compiles without errors into the production bundle.

## Pull Request Guidelines

Please keep Pull Requests focused and easy to review.

A Pull Request should generally address one of the following:

* A specific bug fix
* A performance optimization
* A documentation improvement
* A testing improvement
* A discrete feature
* A focused refactoring that does not alter unrelated behavior

### Before opening a Pull Request

Please verify that:

* The application still builds successfully (npm run build).
* Existing functionality has not been unintentionally changed.
* Relevant tests and validation scripts pass (npm run typecheck && npm run i18n:check).
* No API keys, credentials, tokens, or other secrets have been committed.
* No private or sensitive user data has been added.
* Internationalization remains consistent across supported locales.
* New user-facing text is added to all 5 locale dictionaries (src/locales/*.json).

## Decision-Intelligence Integrity

SynthOperator DomainRadar is designed around evidence-based decision intelligence.

Contributors must respect the following core principle:

> **Never present an unobserved estimate as an observed fact.**

In particular:

* Do not represent an estimated domain value as a confirmed market sale.
* Do not fabricate comparable sales.
* Do not invent API results, market data, or external observations.
* Clearly distinguish observed data, calculated values, estimates, simulations, and fallback results.
* Do not silently replace missing evidence with fabricated data.
* Preserve the distinction between external evidence and locally calculated decision outputs.

When adding or modifying valuation or decision logic, explain the reasoning and data assumptions in the Pull Request.

## Internationalization

The project supports multiple locales (EN, FR, AR with RTL support, ES, PT).

When modifying user-facing text:

* Do not hardcode translatable strings directly into components when the project already uses the locale system.
* Maintain parity across all supported locale dictionaries.
* Run the internationalization validation command before submitting a Pull Request:

```bash
npm run i18n:check
```

## Security

Never commit:

* API keys (such as TYPESAFE_API_KEY)
* Access tokens
* Passwords
* Private credentials
* .env files containing secrets
* Private customer information
* Production data
* Internal infrastructure credentials

Use the project's .env.example file as the reference for required environment variables.

For security vulnerabilities, please follow the procedure described in SECURITY.md by emailing **[support@synthoperator.com](mailto:support@synthoperator.com)** rather than opening a public GitHub issue.

## Commit Guidelines

Keep commits clear and focused.

Prefer descriptive commit messages such as:

```text
fix: handle failed domain audit gracefully
feat: add renewal decision explanation
perf: parallelize bulk domain processing
docs: improve contributor setup
test: add bulk audit regression coverage
```

Avoid committing unrelated changes together with a Pull Request.

## Pull Request Description

When opening a Pull Request, briefly explain:

1. What was changed?
2. Why was it changed?
3. How was it tested?
4. Are there any known limitations or risks?
5. Does the change affect decision logic, valuation, JEV integration, or data collection?

For changes affecting decision logic, include before/after examples where useful.

## Questions or Support

For general project questions, contact:

📧 **[support@synthoperator.com](mailto:support@synthoperator.com)**

Project Creator: **Hafid Bas**

* GitHub: **@peacehritik**
* X / Twitter: **@hafid_bas**
* Official Platform: **https://synthoperator.com**

## Final Validation

Before submitting your Pull Request, run:

```bash
npm run typecheck && npm run i18n:check && npm run build
```

Please do not submit a Pull Request claiming that validation passed unless the commands were actually executed successfully.

---

### 4. Modèle de README pour votre Profil GitHub (`peacehritik/README.md`)

Voici un modèle de profil GitHub moderne prêt à l'emploi. Vous pouvez le placer dans votre repo spécial `peacehritik` sur GitHub pour présenter votre profil créateur et vos projets :

// filepath: GITHUB_PROFILE_README.md

```markdown
### Hi there, I'm Hafid Bas 👋

**Solo Founder & Systems Software Engineer** building **[SynthOperator](https://synthoperator.com)** — Elite AI Infrastructure & Deterministic Decision Intelligence.

[![Twitter Follow](https://img.shields.io/twitter/follow/hafid_bas?style=social)](https://x.com/hafid_bas)
[![Website](https://img.shields.io/badge/Website-synthoperator.com-emerald?style=flat)](https://synthoperator.com)

---

### ⚡ Featured Projects

- **[SynthOperator DomainRadar](https://github.com/peacehritik/synthoperator-domainradar)**: Autonomous, deterministic decision-intelligence engine for domain acquisitions, portfolio retention economics, and multi-domain startup brand naming.
- **[SynthOperator Platform](https://synthoperator.com)**: Elite AI Infrastructure and high-performance software systems.

---

### 🛠️ Tech Stack & Systems Engineering

- **Languages:** TypeScript, JavaScript, Python, Node.js
- **Frontend Architecture:** React 19, Tailwind CSS v4, Vite, Multi-language i18n (LTR & RTL)
- **Backend & Protocol:** Express, Node DNS native, RDAP RFC 7483, Wayback CDX, RESTful APIs
- **Decision Intelligence:** TypeSafe JEV System One, Actuarial Net EV Modeling, Deterministic Hard Gates, Cryptographic SHA-256 State Hashing

---

### 📫 Connect with Me

- **Official Website:** [https://synthoperator.com](https://synthoperator.com)
- **X / Twitter:** [@hafid_bas](https://x.com/hafid_bas)
- **Support & Inquiries:** [support@synthoperator.com](mailto:support@synthoperator.com)
```
