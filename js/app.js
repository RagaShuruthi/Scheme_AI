/**
 * Citizen Saarthi - Core Application Logic
 * Senior Frontend Architecture & Interactive Controls
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Knowledge Base for Live Interactive Search Demo
  const SEARCH_DATABASE = [
    {
      id: "pm-kisan",
      name: "PM-Kisan Samman Nidhi",
      category: "schemes",
      badge: "Agriculture & DBT",
      description: "Direct income support of ₹6,000 per year in 3 equal installments to eligible farmer families across India.",
      platform: "scheme",
      targetQuery: "PM-Kisan Samman Nidhi"
    },
    {
      id: "ayushman-bharat",
      name: "Ayushman Bharat (PM-JAY)",
      category: "schemes",
      badge: "Healthcare",
      description: "Health cover of up to ₹5 Lakh per family per year for secondary and tertiary care hospitalization for vulnerable citizens.",
      platform: "scheme",
      targetQuery: "Ayushman Bharat PMJAY"
    },
    {
      id: "pm-awas",
      name: "Pradhan Mantri Awas Yojana (PMAY)",
      category: "schemes",
      badge: "Housing",
      description: "Affordable housing for urban and rural citizens with interest subsidy on home loans under Credit Linked Subsidy.",
      platform: "scheme",
      targetQuery: "PMAY Housing"
    },
    {
      id: "sukanya-samriddhi",
      name: "Sukanya Samriddhi Yojana",
      category: "schemes",
      badge: "Women & Child",
      description: "High-interest savings scheme for the girl child under the Beti Bachao Beti Padhao initiative.",
      platform: "scheme",
      targetQuery: "Sukanya Samriddhi Yojana"
    },
    {
      id: "post-matric-scholarship",
      name: "National Post-Matric Scholarship",
      category: "schemes",
      badge: "Education",
      description: "Financial assistance for meritorious students from marginalized backgrounds pursuing higher education.",
      platform: "scheme",
      targetQuery: "Post Matric Scholarship"
    },
    {
      id: "standup-india",
      name: "Stand-Up India / MUDRA Yojana",
      category: "schemes",
      badge: "Entrepreneurship",
      description: "Collateral-free micro loans and financial assistance for SC/ST and women entrepreneurs.",
      platform: "scheme",
      targetQuery: "Mudra Scheme"
    },
    {
      id: "rti-act",
      name: "Right to Information (RTI) Act, 2005",
      category: "laws",
      badge: "Fundamental Right",
      description: "Empowers citizens to request information from any public authority, fostering transparency and accountability in governance.",
      platform: "law",
      targetQuery: "Right to Information Act"
    },
    {
      id: "consumer-protection",
      name: "Consumer Protection Act, 2019",
      category: "laws",
      badge: "Consumer Rights",
      description: "Protects consumers against unfair trade practices, misleading advertisements, and provides fast-track dispute redressal.",
      platform: "law",
      targetQuery: "Consumer Protection Act"
    },
    {
      id: "dpdp-act",
      name: "Digital Personal Data Protection (DPDP) Act",
      category: "laws",
      badge: "Digital Rights",
      description: "Protects citizens' personal digital data, mandates consent, and establishes clear duties for data fiduciaries.",
      platform: "law",
      targetQuery: "Digital Personal Data Protection Act"
    },
    {
      id: "maternity-benefit",
      name: "Maternity Benefit Act",
      category: "laws",
      badge: "Labor Protections",
      description: "Protects women's employment during maternity and entitles them to 26 weeks paid absence to care for their child.",
      platform: "law",
      targetQuery: "Maternity Benefit Act"
    },
    {
      id: "legal-aid",
      name: "Legal Services Authorities Act (NALSA)",
      category: "laws",
      badge: "Access to Justice",
      description: "Guarantees free and competent legal services to marginalized sections and organizes Lok Adalats for amicable settlements.",
      platform: "law",
      targetQuery: "NALSA Free Legal Aid"
    },
    {
      id: "posh-act",
      name: "POSH Act (Prevention of Sexual Harassment)",
      category: "laws",
      badge: "Workplace Safety",
      description: "Provides a safe, secure workplace for women, mandating Internal Complaints Committees (ICC) in all institutions.",
      platform: "law",
      targetQuery: "POSH Act 2013"
    }
  ];

  // 3. Platform Dynamic Linking System
  window.refreshPlatformLinks = function() {
    if (!window.CitizenConfig) return;

    const schemeUrl = window.CitizenConfig.getSchemeUrl();
    const lawUrl = window.CitizenConfig.getLawUrl();

    // Update all elements with data-platform="scheme"
    document.querySelectorAll('[data-platform="scheme"]').forEach(el => {
      if (el.tagName === 'A') {
        el.href = schemeUrl;
        el.target = "_blank";
        el.rel = "noopener noreferrer";
      }
    });

    // Update all elements with data-platform="law"
    document.querySelectorAll('[data-platform="law"]').forEach(el => {
      if (el.tagName === 'A') {
        el.href = lawUrl;
        el.target = "_blank";
        el.rel = "noopener noreferrer";
      }
    });

    // Update URL preview badges on cards
    const schemePreview = document.getElementById("schemeUrlPreview");
    if (schemePreview) schemePreview.textContent = schemeUrl;

    const lawPreview = document.getElementById("lawUrlPreview");
    if (lawPreview) lawPreview.textContent = lawUrl;

    // Update dev modal inputs if present
    const devSchemeInput = document.getElementById("devSchemeUrlInput");
    const devLawInput = document.getElementById("devLawUrlInput");
    if (devSchemeInput) devSchemeInput.value = localStorage.getItem("cs_scheme_url") || window.CitizenConfig.SCHEME_SAARTHI_URL;
    if (devLawInput) devLawInput.value = localStorage.getItem("cs_law_url") || window.CitizenConfig.LAW_SAARTHI_URL;
  };

  // Run initial link refresh
  window.refreshPlatformLinks();

  // 4. Sticky Navigation Bar Scroll Effect
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // 5. Mobile Navigation Drawer Controls
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileDrawer = document.getElementById("mobileDrawer");
  const mobileDrawerOverlay = document.getElementById("mobileDrawerOverlay");
  const drawerCloseBtn = document.getElementById("drawerCloseBtn");

  function openMobileMenu() {
    mobileDrawer.classList.add("active");
    mobileDrawerOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeMobileMenu() {
    mobileDrawer.classList.remove("active");
    mobileDrawerOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener("click", openMobileMenu);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener("click", closeMobileMenu);
  if (mobileDrawerOverlay) mobileDrawerOverlay.addEventListener("click", closeMobileMenu);

  document.querySelectorAll(".drawer-link").forEach(link => {
    link.addEventListener("click", closeMobileMenu);
  });

  // 6. Multilingual Language Switcher Logic
  const currentLang = localStorage.getItem("cs_lang") || "en";
  const langDropdown = document.getElementById("langDropdown");
  const langBtn = document.getElementById("langBtn");
  const currentLangLabel = document.getElementById("currentLangLabel");

  function setLanguage(lang) {
    if (!window.CitizenTranslations || !window.CitizenTranslations[lang]) return;
    const dict = window.CitizenTranslations[lang];

    localStorage.setItem("cs_lang", lang);
    document.documentElement.lang = lang;

    // Update visible button label
    const labels = { en: "English", hi: "हिन्दी", ta: "தமிழ்" };
    if (currentLangLabel) currentLangLabel.textContent = labels[lang] || "English";

    // Update active state in dropdown
    document.querySelectorAll(".lang-option").forEach(opt => {
      opt.classList.toggle("active", opt.dataset.lang === lang);
    });

    // Translate all elements with data-i18n attribute
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) {
        if (el.tagName === "INPUT" && el.hasAttribute("placeholder")) {
          el.placeholder = dict[key];
        } else {
          el.innerHTML = dict[key];
        }
      }
    });

    // Re-initialize icons in case any were inside translated strings
    if (window.lucide) window.lucide.createIcons();

    // Close dropdown
    if (langDropdown) langDropdown.classList.remove("active");
  }

  if (langBtn && langDropdown) {
    langBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle("active");
    });

    document.addEventListener("click", () => {
      langDropdown.classList.remove("active");
    });

    document.querySelectorAll(".lang-option").forEach(option => {
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        setLanguage(option.dataset.lang);
      });
    });
  }

  // Set default language on boot
  setLanguage(currentLang);

  // 7. Interactive Search Functionality
  const searchInput = document.getElementById("mainSearchInput");
  const searchResultsPanel = document.getElementById("searchResultsPanel");
  const searchResultsList = document.getElementById("searchResultsList");
  const searchSubmitBtn = document.getElementById("searchSubmitBtn");
  let activeSearchCategory = "all";

  // Category filter tabs
  document.querySelectorAll(".category-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".category-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      activeSearchCategory = tab.dataset.category;
      performSearch(searchInput ? searchInput.value : "");
    });
  });

  // Quick suggestion chips
  document.querySelectorAll(".search-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const query = chip.dataset.query || chip.textContent.trim();
      if (searchInput) {
        searchInput.value = query;
        performSearch(query);
        searchInput.focus();
      }
    });
  });

  function performSearch(query) {
    const cleanQuery = (query || "").trim().toLowerCase();

    if (!cleanQuery) {
      if (searchResultsPanel) searchResultsPanel.classList.remove("has-results");
      return;
    }

    // Filter database
    const matches = SEARCH_DATABASE.filter(item => {
      const matchesCategory = (activeSearchCategory === "all") || (item.category === activeSearchCategory);
      const matchesText = item.name.toLowerCase().includes(cleanQuery) ||
                          item.description.toLowerCase().includes(cleanQuery) ||
                          item.badge.toLowerCase().includes(cleanQuery);
      return matchesCategory && matchesText;
    });

    renderSearchResults(matches, cleanQuery);
  }

  function renderSearchResults(results, query) {
    if (!searchResultsPanel || !searchResultsList) return;

    if (results.length === 0) {
      searchResultsList.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--color-grey);">
          <p style="font-weight: 600; margin-bottom: 6px;">No exact local matches found for "${escapeHtml(query)}"</p>
          <p style="font-size: 0.875rem; margin-bottom: 16px;">Would you like to search directly in our dedicated platforms?</p>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <a href="${window.CitizenConfig.getSchemeSearchUrl(query)}" target="_blank" class="btn btn-royal" style="padding: 8px 16px; font-size: 0.8125rem;">
              Search SchemeSaarthi <i data-lucide="arrow-up-right" style="width: 14px; height: 14px;"></i>
            </a>
            <a href="${window.CitizenConfig.getLawSearchUrl(query)}" target="_blank" class="btn btn-primary" style="padding: 8px 16px; font-size: 0.8125rem;">
              Search LawSaarthi <i data-lucide="arrow-up-right" style="width: 14px; height: 14px;"></i>
            </a>
          </div>
        </div>
      `;
      searchResultsPanel.classList.add("has-results");
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const html = results.map(item => {
      const isScheme = item.platform === "scheme";
      const targetUrl = isScheme 
        ? window.CitizenConfig.getSchemeSearchUrl(item.targetQuery)
        : window.CitizenConfig.getLawSearchUrl(item.targetQuery);
      
      const destinationName = isScheme ? "SchemeSaarthi" : "LawSaarthi";
      const badgeClass = isScheme ? "badge-scheme-result" : "badge-law-result";

      return `
        <div class="result-item">
          <div class="result-info">
            <div class="result-header">
              <span class="result-name">${escapeHtml(item.name)}</span>
              <span class="result-category-badge ${badgeClass}">${escapeHtml(item.badge)}</span>
            </div>
            <p class="result-snippet">${escapeHtml(item.description)}</p>
          </div>
          <a href="${targetUrl}" target="_blank" rel="noopener noreferrer" class="result-action-link" title="Open in ${destinationName}">
            <span>Open in ${destinationName}</span>
            <i data-lucide="arrow-up-right" style="width: 16px; height: 16px;"></i>
          </a>
        </div>
      `;
    }).join("");

    searchResultsList.innerHTML = html;
    searchResultsPanel.classList.add("has-results");
    if (window.lucide) window.lucide.createIcons();
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      performSearch(e.target.value);
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        routeSearchQuery();
      }
    });
  }

  if (searchSubmitBtn) {
    searchSubmitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      routeSearchQuery();
    });
  }

  function routeSearchQuery() {
    const query = (searchInput ? searchInput.value : "").trim();
    if (!query) {
      if (searchInput) searchInput.focus();
      return;
    }

    if (activeSearchCategory === "laws") {
      window.open(window.CitizenConfig.getLawSearchUrl(query), "_blank");
    } else {
      window.open(window.CitizenConfig.getSchemeSearchUrl(query), "_blank");
    }
  }

  // 8. Global Keyboard Shortcut for Search (Ctrl+K / Cmd+K)
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      const searchBox = document.getElementById("searchBox");
      if (searchBox) {
        searchBox.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          if (searchInput) searchInput.focus();
        }, 500);
      }
    }
  });

  const navSearchBtn = document.getElementById("navSearchBtn");
  if (navSearchBtn) {
    navSearchBtn.addEventListener("click", () => {
      const searchBox = document.getElementById("searchBox");
      if (searchBox) {
        searchBox.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          if (searchInput) searchInput.focus();
        }, 500);
      }
    });
  }

  // 9. Developer Settings Modal (URL Configuration)
  const devSettingsBtn = document.getElementById("devSettingsBtn");
  const devSettingsModal = document.getElementById("devSettingsModal");
  const closeDevModalBtn = document.getElementById("closeDevModalBtn");
  const cancelDevModalBtn = document.getElementById("cancelDevModalBtn");
  const saveDevSettingsBtn = document.getElementById("saveDevSettingsBtn");
  const resetDevSettingsBtn = document.getElementById("resetDevSettingsBtn");

  function openDevModal() {
    if (devSettingsModal) devSettingsModal.classList.add("active");
  }

  function closeDevModal() {
    if (devSettingsModal) devSettingsModal.classList.remove("active");
  }

  if (devSettingsBtn) devSettingsBtn.addEventListener("click", openDevModal);
  if (closeDevModalBtn) closeDevModalBtn.addEventListener("click", closeDevModal);
  if (cancelDevModalBtn) cancelDevModalBtn.addEventListener("click", closeDevModal);

  if (saveDevSettingsBtn) {
    saveDevSettingsBtn.addEventListener("click", () => {
      const schemeVal = document.getElementById("devSchemeUrlInput").value.trim();
      const lawVal = document.getElementById("devLawUrlInput").value.trim();
      window.CitizenConfig.setCustomUrls(schemeVal, lawVal);
      closeDevModal();
      showToast("Platform URLs updated successfully!");
    });
  }

  if (resetDevSettingsBtn) {
    resetDevSettingsBtn.addEventListener("click", () => {
      window.CitizenConfig.resetUrls();
      closeDevModal();
      showToast("Reset to default production URLs.");
    });
  }

  // 10. Toast Notification Helper
  function showToast(message) {
    let toast = document.getElementById("appToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "appToast";
      toast.className = "toast-notice";
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i data-lucide="check-circle" style="color: #10B981; width: 18px; height: 18px;"></i> <span>${escapeHtml(message)}</span>`;
    if (window.lucide) window.lucide.createIcons();
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }
  window.showCitizenToast = showToast;

  // =========================================================================
  // 11. ADVANCED ANIMATION SUITE
  // =========================================================================

  // A. Interactive Hero Particle Constellation Canvas
  function initHeroParticles() {
    const canvas = document.getElementById("heroParticlesCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const particles = [];
    const count = Math.min(Math.floor(width / 26), 48);
    const colors = ["#2457A7", "#F2A541", "#102B50", "#3B82F6"];

    let mouse = { x: null, y: null, radius: 140 };

    window.addEventListener("resize", () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    });

    const heroSection = document.getElementById("home");
    if (heroSection) {
      heroSection.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });

      heroSection.addEventListener("mouseleave", () => {
        mouse.x = null;
        mouse.y = null;
      });
    }

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.radius = Math.random() * 2 + 1.2;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.baseX = this.x;
        this.baseY = this.y;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.55;
        ctx.fill();
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;

        // Mouse gentle repel
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 2.5;
            this.y -= (dy / dist) * force * 2.5;
          }
        }
      }
    }

    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Connect near particles with lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = particles[i].color;
            ctx.globalAlpha = (1 - dist / 110) * 0.22;
            ctx.lineWidth = 0.9;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  initHeroParticles();

  // B. Interactive 3D Card Tilt with Specular Glare
  function init3DTiltCards() {
    const cards = document.querySelectorAll(".tilt-card");

    cards.forEach(card => {
      let glare = card.querySelector(".card-glare");
      if (!glare) {
        glare = document.createElement("div");
        glare.className = "card-glare";
        card.appendChild(glare);
      }

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6; // Max 6 deg
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
        card.style.setProperty("--mouse-x", `${(x / rect.width) * 100}%`);
        card.style.setProperty("--mouse-y", `${(y / rect.height) * 100}%`);
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
      });
    });
  }

  init3DTiltCards();

  // C. Interactive Platform View Mode Switcher
  function initPlatformViewModes() {
    const modePills = document.querySelectorAll(".view-mode-pill");
    const platformsGrid = document.querySelector(".platforms-grid");

    if (!modePills.length || !platformsGrid) return;

    modePills.forEach(pill => {
      pill.addEventListener("click", () => {
        modePills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");

        const mode = pill.dataset.mode;
        platformsGrid.classList.remove("mode-scheme-focus", "mode-law-focus");

        if (mode === "scheme") {
          platformsGrid.classList.add("mode-scheme-focus");
          const schemeCard = document.getElementById("schemeSaarthiCard");
          if (schemeCard) {
            schemeCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        } else if (mode === "law") {
          platformsGrid.classList.add("mode-law-focus");
          const lawCard = document.getElementById("lawSaarthiCard");
          if (lawCard) {
            lawCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }
      });
    });
  }

  initPlatformViewModes();

  // D. Magnetic Hover Effect on Primary Buttons
  function initMagneticButtons() {
    const magnetics = document.querySelectorAll(".magnetic-btn");

    magnetics.forEach(btn => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate(0px, 0px)";
      });
    });
  }

  initMagneticButtons();

  // E. Interactive Click Ripple Effect
  function initClickRipple() {
    document.addEventListener("click", (e) => {
      const target = e.target.closest(".btn, .platform-card, .search-chip, .category-tab");
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const circle = document.createElement("span");
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left}px`;
      circle.style.top = `${e.clientY - rect.top}px`;
      circle.classList.add("cs-ripple");

      const existingRipple = target.querySelector(".cs-ripple");
      if (existingRipple) existingRipple.remove();

      target.appendChild(circle);

      setTimeout(() => {
        circle.remove();
      }, 700);
    });
  }

  initClickRipple();

  // F. Ambient Cursor Follower Spotlight
  function initCursorSpotlight() {
    let spotlight = document.getElementById("cursorFollowerSpotlight");
    if (!spotlight) {
      spotlight = document.createElement("div");
      spotlight.id = "cursorFollowerSpotlight";
      document.body.appendChild(spotlight);
    }

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    window.addEventListener("mousemove", (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    });

    function loop() {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      spotlight.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    }

    loop();
  }

  initCursorSpotlight();

  // G. Dynamic Animated Number Counter
  function initStatCounters() {
    const stats = document.querySelectorAll(".stat-number");
    if (!stats.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const targetStr = el.dataset.counter || el.textContent.trim();
          obs.unobserve(el);

          // Parse number & suffix
          const match = targetStr.match(/([\d,]+)(.*)/);
          if (!match) return;

          const endNum = parseInt(match[1].replace(/,/g, ""), 10);
          const suffix = match[2] || "";
          let startNum = 0;
          const duration = 1800;
          const startTime = performance.now();

          function updateCounter(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOut * endNum);

            el.textContent = current.toLocaleString() + suffix;

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = targetStr;
            }
          }

          requestAnimationFrame(updateCounter);
        }
      });
    }, { threshold: 0.3 });

    stats.forEach(s => observer.observe(s));
  }

  initStatCounters();

  // 13. Animated Standing Puppet Citizen Guide ("Saarthi") Explaining the Website & Rights
  
  // =========================================================================
  // 12. Professional Citizen Saarthi Guide (Single Dedicated Subtitle & Speech)
  // =========================================================================
  
  // Helper: Select the most natural human voice available in the browser/OS
  function getBestNaturalVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. High-fidelity Microsoft Natural / Neural voices (Windows 11 Edge/Chrome)
    let best = voices.find(v => (v.name.includes("Natural") || v.name.includes("Neural")) && (v.lang.includes("en-IN") || v.lang.includes("hi-IN")));
    if (!best) best = voices.find(v => (v.name.includes("Natural") || v.name.includes("Neural")) && v.lang.startsWith("en"));

    // 2. Google High Quality Voices (Chrome)
    if (!best) best = voices.find(v => v.name.includes("Google") && (v.lang.includes("en-IN") || v.name.includes("English")));

    // 3. Any Indian English voice
    if (!best) best = voices.find(v => v.lang.includes("en-IN") || v.name.includes("India"));

    // 4. Any modern Online / non-Desktop voice
    if (!best) best = voices.find(v => (v.name.includes("Online") || !v.name.includes("Desktop")) && v.lang.startsWith("en"));

    return best || voices[0];
  }


  function initSaarthiRightsGuide() {
    const voiceBtn = document.getElementById("speechVoiceBtn");
    if (!voiceBtn) return;
    const voiceLabel = document.getElementById("speechVoiceLabel");
    const manTrigger = document.getElementById("saarthiManTrigger");

    const message = "What? Don't you know about your schemes and laws? Don't worry, I am your Saarthi to help you! Every Indian citizen deserves to know their rights, government welfare benefits, and legal protections — all in simple words, with zero middlemen.";
    let isSpeaking = false;

    function speakCurrentRight() {
      if (!('speechSynthesis' in window)) {
        if (window.showCitizenToast) {
          window.showCitizenToast("Speech synthesis is not supported on this device/browser.");
        }
        return;
      }

      if (isSpeaking) {
        window.speechSynthesis.cancel();
        stopSpeech();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.94;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voice = getBestNaturalVoice();
      if (voice) utterance.voice = voice;

      utterance.onstart = () => {
        isSpeaking = true;
        if (voiceBtn) voiceBtn.classList.add("speaking");
        if (voiceLabel) voiceLabel.textContent = "Stop";
        if (manTrigger) manTrigger.classList.add("saarthi-wobble-active");
      };

      utterance.onend = utterance.onerror = () => {
        stopSpeech();
      };

      window.speechSynthesis.speak(utterance);
    }

    function stopSpeech() {
      if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      isSpeaking = false;
      if (voiceBtn) voiceBtn.classList.remove("speaking");
      if (voiceLabel) voiceLabel.textContent = "Listen";
      if (manTrigger) manTrigger.classList.remove("saarthi-wobble-active");
    }

    if (voiceBtn) voiceBtn.addEventListener("click", speakCurrentRight);

    if (manTrigger) {
      manTrigger.addEventListener("click", () => {
        speakCurrentRight();
      });
    }
  }

  initSaarthiRightsGuide();

  // =========================================================================
  // 13. About Section Saarthi Guide (Single Dedicated Pledge Speech)
  // =========================================================================
  function initAboutSaarthiGuide() {
    const voiceBtn = document.getElementById("aboutVoiceBtn");
    if (!voiceBtn) return;
    const trigger = document.getElementById("aboutManTrigger");
    const voiceLabel = document.getElementById("aboutVoiceLabel");

    const message = "What? You don't know about your schemes and laws? Don't worry, I am your Saarthi to help you!";
    let isSpeaking = false;

    function speakMessage() {
      if (!('speechSynthesis' in window)) {
        if (window.showCitizenToast) {
          window.showCitizenToast("Speech synthesis is not supported on this device/browser.");
        }
        return;
      }

      if (isSpeaking) {
        window.speechSynthesis.cancel();
        stopSpeaking();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.94;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const naturalVoice = getBestNaturalVoice();
      if (naturalVoice) utterance.voice = naturalVoice;

      utterance.onstart = () => {
        isSpeaking = true;
        if (voiceBtn) voiceBtn.classList.add("speaking");
        if (voiceLabel) voiceLabel.textContent = "Stop";
        if (trigger) trigger.classList.add("about-wobble-active");
      };

      utterance.onend = utterance.onerror = () => {
        stopSpeaking();
      };

      window.speechSynthesis.speak(utterance);
    }

    function stopSpeaking() {
      if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      isSpeaking = false;
      if (voiceBtn) voiceBtn.classList.remove("speaking");
      if (voiceLabel) voiceLabel.textContent = "Listen";
      if (trigger) trigger.classList.remove("about-wobble-active");
    }

    if (voiceBtn) voiceBtn.addEventListener("click", speakMessage);
    if (trigger) {
      trigger.addEventListener("click", speakMessage);
    }
  }

  initAboutSaarthiGuide();




  // 12. Safe Motion & Scroll Reveals (Guaranteed 100% Content Visibility)
  if (window.gsap) {
    // Ensure all critical cards are immediately visible with no opacity locks
    gsap.set(".platform-card, .step-card, .why-card, .awareness-card", {
      opacity: 1,
      visibility: "visible",
      clearProps: "opacity,visibility"
    });

    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.refresh();
    }

    // Hero subtle entrance
    gsap.from(".badge-saffron", { y: -15, opacity: 0.2, duration: 0.6, ease: "power2.out" });
    gsap.from(".hero-headline", { y: 20, opacity: 0.2, duration: 0.7, ease: "power2.out", delay: 0.1 });
    gsap.from(".hero-description", { y: 15, opacity: 0.2, duration: 0.6, ease: "power2.out", delay: 0.2 });
  }

  // Fail-safe: Ensure all reveal elements are marked visible
  document.querySelectorAll(".reveal-on-scroll").forEach(el => {
    el.classList.add("is-visible");
  });
});
