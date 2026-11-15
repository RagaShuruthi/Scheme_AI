/**
 * Citizen Saarthi - Central Configuration
 * 
 * Configurable platform target URLs.
 * Modify these constants or use the Dev Settings modal to set custom URLs or localhost ports.
 */
const CITIZEN_CONFIG = {
  // Default target URLs for the two independent platforms
  SCHEME_SAARTHI_URL: "https://schemes.citizensaarthi.in",
  LAW_SAARTHI_URL: "http://127.0.0.1:8000",

  // Local development fallback URLs (uncomment or toggle via Dev Settings)
  DEV_SCHEME_SAARTHI_URL: "http://localhost:3000",
  DEV_LAW_SAARTHI_URL: "http://127.0.0.1:8000",

  // Whether to prioritize local URLs if running on localhost / 127.0.0.1
  AUTO_DETECT_LOCALHOST: true,

  // Helper function to resolve the current active SchemeSaarthi URL
  getSchemeUrl: function(path = "") {
    const base = this.isDevMode() 
      ? (localStorage.getItem("cs_scheme_url") || this.DEV_SCHEME_SAARTHI_URL)
      : (localStorage.getItem("cs_scheme_url") || this.SCHEME_SAARTHI_URL);
    return path ? `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}` : base;
  },

  // Helper function to resolve the current active LawSaarthi URL
  getLawUrl: function(path = "") {
    const base = this.isDevMode() 
      ? (localStorage.getItem("cs_law_url") || this.DEV_LAW_SAARTHI_URL)
      : (localStorage.getItem("cs_law_url") || this.LAW_SAARTHI_URL);
    return path ? `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}` : base;
  },

  // Helper to build a search URL with query parameters
  getSchemeSearchUrl: function(query = "") {
    const base = this.getSchemeUrl();
    if (!query) return base;
    return `${base}/?search=${encodeURIComponent(query)}`;
  },

  getLawSearchUrl: function(query = "") {
    const base = this.getLawUrl();
    if (!query) return base;
    return `${base}/?search=${encodeURIComponent(query)}`;
  },

  // Check if current session is running in dev/local mode
  isDevMode: function() {
    if (localStorage.getItem("cs_force_dev_mode") === "true") return true;
    if (localStorage.getItem("cs_force_dev_mode") === "false") return false;
    return this.AUTO_DETECT_LOCALHOST && (
      window.location.hostname === "localhost" || 
      window.location.hostname === "127.0.0.1" || 
      window.location.protocol === "file:"
    );
  },

  // Update target URLs programmatically
  setCustomUrls: function(schemeUrl, lawUrl) {
    if (schemeUrl) localStorage.setItem("cs_scheme_url", schemeUrl);
    if (lawUrl) localStorage.setItem("cs_law_url", lawUrl);
    // Trigger dynamic link refresh on the page
    if (window.refreshPlatformLinks) {
      window.refreshPlatformLinks();
    }
  },

  // Reset to default URLs
  resetUrls: function() {
    localStorage.removeItem("cs_scheme_url");
    localStorage.removeItem("cs_law_url");
    localStorage.removeItem("cs_force_dev_mode");
    if (window.refreshPlatformLinks) {
      window.refreshPlatformLinks();
    }
  }
};

// Export to global scope
window.CitizenConfig = CITIZEN_CONFIG;
