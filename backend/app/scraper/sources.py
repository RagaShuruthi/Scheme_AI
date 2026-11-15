from urllib.parse import urlparse

# Strict official government domain allowlist
ALLOWED_GOV_DOMAINS = [
    "gov.in",
    "nic.in",
    "myscheme.gov.in",
    "india.gov.in",
    "pib.gov.in",
    "dbtbharat.gov.in",
    "tn.gov.in",
    "nabard.org",
    "education.gov.in",
    "socialjustice.gov.in",
    "wcd.gov.in",
    "msme.gov.in",
    "agriwelfare.gov.in",
    "rural.gov.in",
    "mohua.gov.in",
    "pmkisan.gov.in",
    "pmjay.gov.in",
    "scholarships.gov.in",
    "mudra.org.in",
    "agricoop.nic.in",
    "nsap.nic.in"
]

def clean_url(url: str) -> str:
    """Strips query parameters like ?utm_source=chatgpt.com and trailing slashes."""
    if not url:
        return ""
    parsed = urlparse(url.strip())
    # Canonical clean url without query parameters
    cleaned = f"{parsed.scheme}://{parsed.netloc}{parsed.path}".rstrip("/")
    return cleaned

def is_trusted_official_domain(url: str) -> bool:
    """
    Validates that a URL strictly belongs to an official government domain or statutory body.
    Prevents scraping or publishing unauthorized third-party blogs.
    """
    try:
        parsed = urlparse(url)
        hostname = parsed.hostname
        if not hostname:
            return False
        hostname = hostname.lower()
        return any(hostname == domain or hostname.endswith("." + domain) for domain in ALLOWED_GOV_DOMAINS)
    except Exception:
        return False
