# KNOWBEFORE

> **From Information to Awareness to Action.**  
> *An interactive clinical education and disease-prevention platform bridging biological science and personal agency.*

---

## 01 — Product Philosophy

KnowBefore is built on a simple conviction:

> **Information is useful only when people understand it well enough to act on it.**

KnowBefore does **NOT** attempt to diagnose patients or generate symptom anxieties. Instead, it guides users through a deliberate 7-stage learning continuum:

$$\text{Discover} \longrightarrow \text{Understand} \longrightarrow \text{Test} \longrightarrow \text{Remember} \longrightarrow \text{Prevent} \longrightarrow \text{Act} \longrightarrow \text{Track}$$

---

## 02 — Design Direction & Visual Identity

KnowBefore avoids generic AI templates, gradient blobs, and cookie-cutter dashboards. Its design language sits at the intersection of:

**Editorial health publication $\times$ modern consumer product $\times$ interactive learning platform.**

* **Typography:**
  * *Display & Editorial Statements:* **Newsreader** (Google Fonts Serif with italic warmth)
  * *UI & Body Hierarchy:* **Plus Jakarta Sans** (Humanist geometric sans)
  * *Biomarkers & Categories:* **JetBrains Mono** (Clinical monospace for numbers like HbA1c, BP targets)
* **Color Palette:**
  * Alabaster / Warm Canvas (`#FBF9F5`, `#F4EFE6`)
  * Deep Ink / Charcoal (`#151816`, `#1D211E`)
  * Clinical Pine Forest (`#1D3D2F`, `#E7EFEA`)
  * Restrained Terracotta / Sienna Accent (`#BA4B24`, `#F9ECE6`)
  * Subdued Ochre / Amber (`#A67519`, `#FBF4E4`)
* **Aesthetics:** Clean hairlines, tactile paper-like elevations, intentional whitespace, and zero placeholder content.

---

## 03 — Core Modules

### 1. Home (`/`)
* Editorial statement: *"Understand your health. Before you have to."*
* The 5 interactive doorways:
  * `[ Something feels different ]` $\rightarrow$ Warning Sign Explorer
  * `[ I want to understand a disease ]` $\rightarrow$ Disease Library
  * `[ I want to test what I know ]` $\rightarrow$ Awareness Check
  * `[ I want prevention tips ]` $\rightarrow$ 5-Pillar Prevention Checklist
  * `[ I want to prepare for a doctor visit ]` $\rightarrow$ Doctor Discussion Planner
* Editorial Spotlight: *"The Silent Vascular Surge: Why Blood Pressure Gives No Daily Warning"*
* Interactive Myth vs Fact preview with instant reveal.

### 2. Disease Library (`/diseases`)
* 10 fully articulated chronic, infectious, and metabolic conditions:
  1. **Hypertension** (Cardiovascular)
  2. **Type 2 Diabetes & Pre-Diabetes** (Metabolic & Endocrine)
  3. **Coronary Artery Disease** (Cardiovascular)
  4. **Polycystic Ovary Syndrome (PCOS)** (Women's Health & Endocrine)
  5. **Bronchial Asthma** (Respiratory)
  6. **Tuberculosis (TB)** (Infectious & Respiratory)
  7. **Dengue Fever** (Vector-Borne Infectious)
  8. **Colorectal Cancer** (Oncology & Screening)
  9. **Depressive & Anxiety Disorders** (Mental & Cognitive Health)
  10. **Chronic Kidney Disease (CKD)** (Renal & Metabolic)
* Search by name, keyword, or anatomical system.
* Switchable view modes: **Editorial Cards** and **Index Table**.

### 3. Disease Detail Experience (`/diseases/:slug`)
A structured 8-module guided exploration experience:
* `01. At a Glance` — Plain-language physiological mechanics & natural history
* `02. Warning Signs` — Early clues vs progressive indicators vs emergency red-flags
* `03. Risk Factors` — Modifiable lifestyle habits vs non-modifiable genetics
* `04. Prevention Pillars` — The 5-pillar actionable framework with checkable steps
* `05. Myth vs Fact` — Interactive reveal cards with peer-reviewed evidence citations
* `06. When to Seek Care` — Routine, Prompt, and Emergency action guidelines
* `07. Questions to Ask a Doctor` — 1-click addition to the personal consultation sheet
* `08. Clinical Resources` — Authoritative clinical guidelines (WHO, AHA, ADA, GINA, USPSTF)

### 4. Warning Sign Explorer (`/warning-signs`)
* Interactive body system navigation: *Energy & Fatigue*, *Cardiovascular & Chest*, *Metabolic & Thirst*, *Respiratory & Cough*, *Pain & Discomfort*, *Skin & Physical Changes*, *Cognitive & Mood*.
* Master-detail layout detailing the underlying **Biological Mechanism**, **Clinical Significance**, and **Responsible Next Steps**.
* Strict non-diagnostic framing: *"This physical cue can be associated with several different health conditions."*

### 5. Myth vs Fact Interactive (`/myth-fact`)
* Interactive reveal interaction: users see the common misconception and click *"Reveal Verified Biological Fact"* to read the evidence.
* Covers all major disease categories.

### 6. Awareness Check (`/awareness-check`)
* Focused question flow with immediate educational explanations for every choice.
* Final **Awareness Snapshot** breaking down scores across *Understanding*, *Prevention*, *Action*, and *Myth Awareness*.

### 7. 5-Pillar Prevention Checklists (`/prevention-checklist`)
* Actionable continuum: **KNOW**, **WATCH**, **PREVENT**, **PREPARE**, **ACT**.
* Interactive completion checkboxes persisting to user journey profile.
* Clean print stylesheet for offline reference.

### 8. Doctor Discussion List (`/doctor-discussion`)
* Consultation preparation workspace to eliminate doctor-visit anxiety.
* Priority sorting (High vs Routine), disease tagging, and discussed toggles.
* Inline doctor advice/notes capture.
* Formatted printable clinical worksheet.

### 9. Public Health Action Campaigns (`/campaigns`)
* Active community initiatives with goal targets and live participant tallies:
  * *Under Pressure: Know Your Baseline Numbers*
  * *Sugar & Cell: The Pre-Diabetes Window*
  * *Breathing Room: Recognizing Airway Inflammation*
* Interactive personal action pledge modal.

### 10. User Journey Dashboard (`/dashboard`)
* Personal awareness workspace answering three fundamental questions:
  * **What have I learned?** (Completed quizzes & accuracy)
  * **What should I revisit?** (Active checklists in progress)
  * **What can I do next?** (Personalized recommendations)

### 11. Admin Management Console (`/admin`)
* Real-time platform analytics: total users, quiz attempts, checklist completions, questions created, and campaign pledges.
* User management table with live role modification (`user`, `admin`, `guest`).
* Disease content management with new condition authoring form.
* Public health campaign controls (archive/activate).
* Community submission moderation (review and publish question suggestions and stories).

---

## 04 — Technical Architecture

```
KnowBefore/
├── client/                     # Modern React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Navbar, Footer, SearchModal, AuthModal, MedicalDisclaimer
│   │   ├── context/            # AuthContext (JWT + Demo Switcher)
│   │   ├── pages/              # 11 Dedicated Product Pages
│   │   ├── index.css           # Custom Design System Tokens & Foundations
│   │   ├── App.jsx             # Route Orchestrator & Dynamic Title Sync
│   │   └── main.jsx            # React 18 Entry Point
│   ├── index.html              # HTML Shell with Google Fonts & SEO
│   └── vite.config.js          # Vite Server with /api Proxy
├── server/                     # Node.js + Express REST API Backend
│   ├── middleware/             # JWT Authentication & Admin RBAC
│   ├── routes/                 # Modular REST API Endpoints
│   ├── db.js                   # SQLite Database with Relational Schemas
│   ├── seedData.js             # Comprehensive Medical & Editorial Seed
│   └── index.js                # Express App Entry Point (Port 5000)
└── package.json                # Root Orchestrator (Concurrent Dev Script)
```

---

## 05 — Quick Start

### Prerequisites
* Node.js v18+ (tested on Node.js v24)
* npm v9+

### Installation & Starting
To start both the Express API and Vite React frontend with a single command:

```bash
npm run dev
```

* **Frontend (Vite Dev Server):** [http://localhost:5173/](http://localhost:5173/)
* **Backend (Express REST API):** [http://localhost:5000/](http://localhost:5000/)

### Standalone Production Build
The frontend is pre-built into `client/dist`. Starting the backend standalone also serves the full client:

```bash
npm start
# Visit http://localhost:5000/
```

---

## 06 — Evaluation Roles & Demo Accounts

For immediate evaluator review without typing credentials, KnowBefore includes a **1-Click Role Switcher** in the user dropdown and sign-in modal:

| Profile | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Clara Henderson** | `clara@example.com` | `user123` | **Registered User** (Full dashboard, saved conditions, checklists) |
| **Dr. Aris Thorne** | `admin@knowbefore.org` | `admin123` | **Administrator** (Full admin console, analytics, content controls) |
| **Guest Visitor** | — | — | **Guest** (Public exploration, temporary session checklists) |

---

## 07 — Clinical & Legal Disclaimer

*KnowBefore provides structured health education and awareness. We do not provide clinical medical diagnosis or treatment plans. Health signals can be associated with multiple physiological conditions. If you are experiencing concerning symptoms, please consult a qualified healthcare professional. In an acute medical emergency, call emergency services immediately.*
