# Citizen Saarthi (सिटीज़न सारथी / குடிமக்கள் சாரதி)
### *A Unified Indian Citizen Knowledge Portal*

> **Tagline:** Know Your Rights. Discover Your Opportunities.  
> **Supporting Statement:** Everything every Indian citizen should know about their rights, government benefits and opportunities — all in one place.

---

## 🌟 Project Vision

**Citizen Saarthi** is a premium, modern, startup-grade landing portal that serves as a single unified entry point connecting two independent citizen-focused platforms:

1. **SchemeSaarthi** – Helps Indian citizens discover central and state government schemes, understand eligibility criteria, calculate direct benefit transfer (DBT) assistance, and access step-by-step application procedures.
2. **LawSaarthi** – Helps citizens understand Indian legal acts, fundamental rights, consumer protections, complaint procedures, and how to exercise their constitutional remedies in simple, accessible language.

Citizen Saarthi **does not replace or merge** these platforms; they remain separate codebases and domains. Citizen Saarthi connects them seamlessly via configurable routing and interactive cards.

---

## 🎨 Visual Design System

Built to look like a high-end, funded technology startup rather than a conventional bureaucratic portal:
- **Deep Navy:** `#102B50` (Primary trust, authority)
- **Royal Blue:** `#2457A7` (SchemeSaarthi identity, links, primary actions)
- **Saffron Accent:** `#F2A541` (Indian civic identity, badges, high-priority highlights)
- **Soft Ivory:** `#FAF9F6` (Warm, premium background)
- **White:** `#FFFFFF` (Card surfaces, clean separation)
- **Muted Grey:** `#687386` (Accessible readability, editorial subtext)
- **Gold Accent:** `#F59E0B` / `#FCD34D` (LawSaarthi justice and constitutional elegance)

---

## 🚀 Key Features

1. **Sticky & Adaptive Navigation Bar:**
   - Custom SVG emblem combining a navigation compass star, Ashoka chakra geometry, and citizen shield.
   - Smooth compacting transition on scroll.
   - Global search spotlight launcher with `Ctrl+K` keyboard shortcut.
   - Live multilingual switcher: **English**, **हिन्दी (Hindi)**, and **தமிழ் (Tamil)** with instant DOM updates and persistent preference.
   - Responsive mobile drawer menu.

2. **Hero Section & Animated Standing Rights Guide ("Saarthi"):**
   - Editorial headline: *"Your Rights. Your Benefits. Your Future."*
   - **Animated Standing Citizen Guide ("Saarthi") on the right of the header:** A dignified Indian citizen guide in tailored attire holding the golden Constitution of Bharat, featuring breathing idle animations, animated gesturing arm, and head tilts.
   - **Interactive Live Rights Speech Bubble:** Dynamically speaks and cycles through 8 fundamental Indian constitutional rights and laws (Article 21 Life & Liberty, RTI Act 2005, Article 14 Equality, Article 19 Freedoms, Consumer Protection, Article 39A Free Legal Aid, Maternity Benefits, and Article 32 Constitutional Remedies).
   - **Text-to-Speech Voice Output:** Click 🔊 **"Listen"** to hear Saarthi actually speak the constitutional right aloud via Web Speech Synthesis.
   - **Interactive Tap-to-Talk:** Tap the character or navigation buttons (`←` / `→`) to rotate through rights, with auto-rotation every 6.5s.
   - Dual Call-to-Action routing directly to SchemeSaarthi and LawSaarthi.

3. **Explore Our Platforms (Dual Feature Cards):**
   - **Card 1 – SchemeSaarthi:** Royal blue aesthetic with saffron accents, custom portal vector art, 5 key highlights, live destination URL preview badge, and one-click redirection.
   - **Card 2 – LawSaarthi:** Deep navy aesthetic with golden justice accents, custom Constitution & Scales vector art, 5 key legal highlights, and direct redirection.

4. **Interactive Platform View Modes & 3D Gyroscope Physics:**
   - **Segmented View Mode Switcher:** Toggle between *Compare Both*, *SchemeSaarthi Focus*, and *LawSaarthi Focus*.
   - **3D Tilt & Specular Glare:** Interactive card tilt responding to mouse position in real-time with dynamic specular light reflection.
   - **Magnetic Physics Buttons:** Primary CTA buttons gravitate toward cursor on proximity.
   - **Hero Particle Constellation Canvas:** Interactive HTML5 canvas simulating citizen nodes interconnected with glowing dynamic links that react to mouse hover.
   - **Animated Flowing Energy Vectors:** Central citizen network SVG has animated flowing pulses (`stroke-dashoffset`) streaming data to all 6 civic sectors.
   - **Dynamic Animated Laser Progress Beam:** Moving gradient laser flows along the 3-step journey track with expanding radar ripples on step numbers.
   - **Smooth Numerical Count-Up:** Interactive statistical counters animate from 0 up to 1,200+, 500+, 28+8, and 100% on scroll.
   - **Ambient Cursor Spotlight:** Subtle luminous flashlight tracking cursor movements across surfaces.

5. **How Citizen Saarthi Helps You:**
   - 3-step numbered journey (*01 Discover*, *02 Understand*, *03 Take Action*) with connecting laser guidance line and interactive hover effects.

5. **Why Citizen Saarthi?:**
   - 4 feature cards: *Citizen First*, *Simple Explanations*, *Reliable Sources*, and *Two Independent Platforms*.

6. **Interactive Search & Routing System:**
   - Real-time search across schemes and laws with category filtering (*All*, *Government Schemes*, *Laws & Rights*).
   - Quick-suggestion chips (PM-Kisan, Ayushman Bharat, RTI Act, Consumer Protection, etc.).
   - Instant search dropdown displaying matches with tags and direct routing buttons into the target platform with pre-filled search queries.

7. **Citizen Awareness Section:**
   - Editorial visual cards: *Know Your Government*, *Know Your Benefits*, and *Know Your Rights* with custom vector illustrations.

8. **About Section & Impact Metrics:**
   - Clear mission statement bridging the citizen-government information gap.
   - Real-world civic metrics (1,200+ schemes, 500+ decoded laws, 28+8 states & UTs).

9. **Official Government Resources & Disclaimer:**
   - Direct links to verified portals (`india.gov.in`, `myscheme.gov.in`, `ecourts.gov.in`, `nalsa.gov.in`).
   - Clear legal disclaimer clarifying independent platform status.

10. **Developer Settings Modal:**
    - Live URL configuration modal accessible from the footer to switch SchemeSaarthi and LawSaarthi URLs on the fly without editing code.

---

## 🛠️ Technology Stack

- **HTML5:** Semantic markup, accessible ARIA roles, clean structure.
- **CSS3:** Custom bespoke design system, CSS variables, glassmorphism, responsive flex/grid layouts, no bloated UI framework required.
- **JavaScript (ES6+):** Pure vanilla JavaScript without heavy dependencies or React.
- **Lucide Icons:** Modern crisp SVG icons loaded via CDN.
- **GSAP & ScrollTrigger:** High-performance subtle motion and scroll reveals with graceful fallback.

---

## 📁 Project Structure

```
Citizen sarathi/
├── index.html                   # Main unified portal entry point
├── config.js                    # Centralized platform target URLs (Scheme & Law)
├── README.md                    # Project documentation & instructions
├── css/
│   ├── style.css                # Core design system, typography, cards & responsiveness
│   └── animations.css           # Floating keyframes, pulses, and scroll reveals
├── js/
│   ├── app.js                   # Navigation, interactive search, modals & event logic
│   └── translations.js          # Multilingual dictionary (English, Hindi, Tamil)
└── assets/
    ├── favicon.svg              # Browser tab icon
    └── images/
        ├── logo.svg             # Custom Citizen Saarthi emblem
        ├── hero-illustration.svg# Empowered citizen connected network illustration
        ├── scheme-illustration.svg # SchemeSaarthi welfare & DBT illustration
        ├── law-illustration.svg    # LawSaarthi scales & constitution illustration
        ├── awareness-government.svg# Parliament and governance illustration
        ├── awareness-benefits.svg  # Direct benefits transfer illustration
        └── awareness-rights.svg    # Fundamental rights & protection illustration
```

---

## ⚙️ Configuration (`config.js`)

Platform target URLs are configured in a single file (`config.js`). All navigation links, cards, and search redirections consume these variables:

```javascript
const CITIZEN_CONFIG = {
  // Default Production URLs
  SCHEME_SAARTHI_URL: "https://schemes.citizensaarthi.in",
  LAW_SAARTHI_URL: "https://laws.citizensaarthi.in",

  // Local Development URLs
  DEV_SCHEME_SAARTHI_URL: "http://localhost:3000",
  DEV_LAW_SAARTHI_URL: "http://localhost:3001",

  AUTO_DETECT_LOCALHOST: true
};
```

### Changing URLs for Local Development:
1. Open `config.js` and change `DEV_SCHEME_SAARTHI_URL` or `DEV_LAW_SAARTHI_URL`.
2. Or simply click **Dev Config** at the bottom right of the footer to configure the URLs directly from the UI.

---

## 💻 How to Run Locally

You can run Citizen Saarthi with any standard static HTTP server or simply open `index.html` in your browser.

### Option 1: Python HTTP Server (Recommended)
```bash
# In the project root directory:
python -m http.server 8080
```
Then open: `http://localhost:8080` in your web browser.

### Option 2: Node.js `serve` / `http-server`
```bash
npx serve .
# or
npx http-server -p 8080
```

### Option 3: VS Code Live Server
Right-click `index.html` in VS Code and select **"Open with Live Server"**.

### Option 4: Direct Browser Open
Double-click `index.html` to open it in Chrome, Edge, Safari, or Firefox.

---

## 📱 Responsive Testing Matrix

The layout is tested across:
- **Desktop (1440px / 1280px):** Full dual-column platform cards, expanded hero grid with full orbital network illustration.
- **Tablet (768px - 1024px):** Adaptive stacked grids, touch-friendly target sizes.
- **Mobile (< 768px):** Compact sticky header, slide-out drawer menu, single-column cards, full-width search bar, no horizontal scrolling.

---

## ⚖️ License & Disclaimer

**Citizen Saarthi** is an independent citizen-information platform created to serve the public interest. It is not an official government website and is not affiliated with any government authority. Information should be verified with official government gazettes and portals.
