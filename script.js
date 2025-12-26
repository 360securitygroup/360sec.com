// 360 Security Group - Interactive Features

// ===============================================
// Cookie Consent Management (GDPR Compliant)
// ===============================================

const CookieConsent = {
    // Cookie names
    CONSENT_COOKIE: 'cookie_consent_360sec',
    CONSENT_VERSION: '1.0',
    CONSENT_DURATION: 365, // days

    // Initialize cookie consent system
    init: function() {
        // Check if user has already made a choice
        const consent = this.getConsent();

        if (!consent) {
            // Show banner if no consent found
            this.showBanner();
        } else {
            // Apply saved preferences
            this.applyConsent(consent);
        }

        // Setup event listeners
        this.setupEventListeners();
    },

    // Show cookie consent banner
    showBanner: function() {
        const banner = document.getElementById('cookieConsent');
        if (banner) {
            banner.style.display = 'block';
        }
    },

    // Hide cookie consent banner
    hideBanner: function() {
        const banner = document.getElementById('cookieConsent');
        if (banner) {
            banner.style.display = 'none';
        }
    },

    // Show cookie preferences modal
    showModal: function() {
        const modal = document.getElementById('cookieModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            // Load current preferences
            const consent = this.getConsent();
            if (consent) {
                document.getElementById('functionalCookies').checked = consent.functional;
                document.getElementById('analyticsCookies').checked = consent.analytics;
                document.getElementById('marketingCookies').checked = consent.marketing;
            }
        }
    },

    // Hide cookie preferences modal
    hideModal: function() {
        const modal = document.getElementById('cookieModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    },

    // Setup event listeners for buttons
    setupEventListeners: function() {
        // Accept All button
        const acceptAllBtn = document.getElementById('acceptAll');
        if (acceptAllBtn) {
            acceptAllBtn.addEventListener('click', () => {
                this.saveConsent({
                    necessary: true,
                    functional: true,
                    analytics: true,
                    marketing: true
                });
                this.hideBanner();
            });
        }

        // Accept Necessary Only button
        const acceptNecessaryBtn = document.getElementById('acceptNecessary');
        if (acceptNecessaryBtn) {
            acceptNecessaryBtn.addEventListener('click', () => {
                this.saveConsent({
                    necessary: true,
                    functional: false,
                    analytics: false,
                    marketing: false
                });
                this.hideBanner();
            });
        }

        // Manage Preferences button
        const settingsBtn = document.getElementById('cookieSettings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showModal();
            });
        }

        // Close modal button
        const closeModalBtn = document.getElementById('closeModal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.hideModal();
            });
        }

        // Save Preferences button
        const savePreferencesBtn = document.getElementById('savePreferences');
        if (savePreferencesBtn) {
            savePreferencesBtn.addEventListener('click', () => {
                this.saveConsent({
                    necessary: true,
                    functional: document.getElementById('functionalCookies').checked,
                    analytics: document.getElementById('analyticsCookies').checked,
                    marketing: document.getElementById('marketingCookies').checked
                });
                this.hideModal();
                this.hideBanner();
            });
        }

        // Accept All in modal
        const acceptAllModalBtn = document.getElementById('acceptAllModal');
        if (acceptAllModalBtn) {
            acceptAllModalBtn.addEventListener('click', () => {
                this.saveConsent({
                    necessary: true,
                    functional: true,
                    analytics: true,
                    marketing: true
                });
                this.hideModal();
                this.hideBanner();
            });
        }

        // Close modal when clicking outside
        const modal = document.getElementById('cookieModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }
    },

    // Save consent preferences
    saveConsent: function(preferences) {
        const consent = {
            version: this.CONSENT_VERSION,
            timestamp: new Date().toISOString(),
            preferences: preferences
        };

        // Save to localStorage
        localStorage.setItem(this.CONSENT_COOKIE, JSON.stringify(consent));

        // Apply consent immediately
        this.applyConsent(consent);

        console.log('Cookie preferences saved:', preferences);
    },

    // Get saved consent
    getConsent: function() {
        const consentString = localStorage.getItem(this.CONSENT_COOKIE);
        if (consentString) {
            try {
                return JSON.parse(consentString);
            } catch (e) {
                console.error('Error parsing consent cookie:', e);
                return null;
            }
        }
        return null;
    },

    // Apply consent preferences (load scripts based on consent)
    applyConsent: function(consent) {
        const prefs = consent.preferences;

        // Always allow necessary cookies
        // (These are essential for the site to function)

        // Functional cookies - language preferences, etc.
        if (prefs.functional) {
            this.enableFunctionalCookies();
        }

        // Analytics cookies - Google Analytics, etc.
        if (prefs.analytics) {
            this.enableAnalyticsCookies();
        }

        // Marketing cookies - advertising, retargeting, etc.
        if (prefs.marketing) {
            this.enableMarketingCookies();
        }
    },

    // Enable functional cookies
    enableFunctionalCookies: function() {
        console.log('Functional cookies enabled');
        // Add your functional cookie scripts here
        // Example: Load chat widgets, preference management, etc.
    },

    // Enable analytics cookies
    enableAnalyticsCookies: function() {
        console.log('Analytics cookies enabled');
        // Add your analytics scripts here
        // Example: Google Analytics, Hotjar, etc.
        //
        // window.dataLayer = window.dataLayer || [];
        // function gtag(){dataLayer.push(arguments);}
        // gtag('js', new Date());
        // gtag('config', 'GA_MEASUREMENT_ID');
    },

    // Enable marketing cookies
    enableMarketingCookies: function() {
        console.log('Marketing cookies enabled');
        // Add your marketing cookie scripts here
        // Example: Facebook Pixel, Google Ads, etc.
    },

    // Clear all consent (for testing)
    clearConsent: function() {
        localStorage.removeItem(this.CONSENT_COOKIE);
        console.log('Cookie consent cleared');
    }
};

// Initialize cookie consent when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        CookieConsent.init();
    });
} else {
    CookieConsent.init();
}

// Expose CookieConsent to window for manual management
window.CookieConsent = CookieConsent;

// ===============================================
// PDF Viewer Modal
// ===============================================

const PDFViewer = {
    modal: null,
    iframe: null,
    title: null,
    downloadBtn: null,

    init: function() {
        this.modal = document.getElementById('pdfModal');
        this.iframe = document.getElementById('pdfViewer');
        this.title = document.getElementById('pdfModalTitle');
        this.downloadBtn = document.getElementById('pdfDownloadBtn');

        // Close modal button
        const closeBtn = document.getElementById('closePdfModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Close when clicking outside
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.style.display === 'flex') {
                this.close();
            }
        });
    },

    open: function(pdfUrl, title) {
        if (!this.modal || !this.iframe) return;

        // Set title
        if (this.title) {
            this.title.textContent = title || 'Document';
        }

        // Set PDF URL in iframe
        this.iframe.src = pdfUrl;

        // Set download link
        if (this.downloadBtn) {
            this.downloadBtn.href = pdfUrl;
            this.downloadBtn.download = title ? `${title.replace(/\s+/g, '_')}.pdf` : 'document.pdf';
        }

        // Show modal
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    },

    close: function() {
        if (!this.modal || !this.iframe) return;

        // Hide modal
        this.modal.style.display = 'none';
        document.body.style.overflow = '';

        // Clear iframe after a delay to prevent flash
        setTimeout(() => {
            this.iframe.src = '';
        }, 300);
    }
};

// Initialize PDF viewer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        PDFViewer.init();
    });
} else {
    PDFViewer.init();
}

// Expose PDFViewer to window for manual use
window.PDFViewer = PDFViewer;

// Helper function to open policy PDFs
function openPrivacyPolicy() {
    PDFViewer.open('legal/privacy-policy.pdf', 'Privacy Policy');
}

function openCookiePolicy() {
    PDFViewer.open('legal/cookie-policy.pdf', 'Cookie Policy');
}

// Expose functions globally
window.openPrivacyPolicy = openPrivacyPolicy;
window.openCookiePolicy = openCookiePolicy;

// ===============================================
// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');

        // Animate hamburger icon
        const spans = mobileMenuBtn.querySelectorAll('span');
        if (mobileMenuBtn.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// Dropdown menu toggle for mobile
document.querySelectorAll('.nav-link-dropdown').forEach(dropdownLink => {
    dropdownLink.addEventListener('click', (e) => {
        if (window.innerWidth <= 968) {
            e.preventDefault();
            const dropdown = dropdownLink.parentElement;

            // Toggle dropdown
            dropdown.classList.toggle('active');

            // Close other dropdowns
            document.querySelectorAll('.nav-dropdown').forEach(otherDropdown => {
                if (otherDropdown !== dropdown) {
                    otherDropdown.classList.remove('active');
                }
            });
        }
    });
});

// Language selector mobile toggle
const langBtn = document.querySelector('.lang-btn');
const langSelector = document.querySelector('.language-selector');

if (langBtn && window.innerWidth <= 768) {
    langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langSelector.classList.toggle('active');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!langSelector.contains(e.target)) {
            langSelector.classList.remove('active');
        }
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Only prevent default if href is not just "#"
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                }
            }
        }
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe solution cards
document.querySelectorAll('.solution-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `all 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
});

// Observe features list items
document.querySelectorAll('.features-list li').forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-30px)';
    item.style.transition = `all 0.5s ease ${index * 0.1}s`;
    observer.observe(item);
});

// Stats counter animation
const animateCounter = (element, target, duration = 2000) => {
    const start = 0;
    const increment = target / (duration / 16); // 60 FPS
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
};

// Animate stats when they come into view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');

            // Simple animation - just fade in for text-based stats
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat').forEach((stat, index) => {
    stat.style.opacity = '0';
    stat.style.transform = 'translateY(20px)';
    stat.style.transition = `all 0.6s ease ${index * 0.2}s`;
    statsObserver.observe(stat);
});

// Add hover effect to trust logos
document.querySelectorAll('.trust-logo').forEach(logo => {
    logo.addEventListener('mouseenter', () => {
        logo.style.transform = 'scale(1.1)';
        logo.style.transition = 'all 0.3s ease';
    });

    logo.addEventListener('mouseleave', () => {
        logo.style.transform = 'scale(1)';
    });
});

// Parallax effect for hero background
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero-background');

    if (heroBackground && scrolled < 800) {
        heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Form validation (if contact form is added)
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Add loading states to CTA buttons
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
    button.addEventListener('click', function(e) {
        // Only add loading state if it's not a regular anchor link
        if (this.getAttribute('href') === '#demo' || this.getAttribute('href') === '#contact') {
            e.preventDefault();

            const originalText = this.textContent;
            this.style.pointerEvents = 'none';
            this.style.opacity = '0.7';

            // Simulate loading
            setTimeout(() => {
                this.style.pointerEvents = 'auto';
                this.style.opacity = '1';

                // In a real application, this would navigate to a demo/contact page
                console.log('CTA clicked:', originalText);
            }, 1000);
        }
    });
});

// Add dynamic year to footer
const currentYear = new Date().getFullYear();
const footerText = document.querySelector('.footer-bottom p');
if (footerText) {
    footerText.textContent = `© ${currentYear} 360 Security Group. All rights reserved.`;
}

// Console easter egg
console.log('%c360 Security Group', 'font-size: 20px; font-weight: bold; background: linear-gradient(135deg, #2F2A99 0%, #1673FF 100%); color: white; padding: 10px 20px; border-radius: 5px;');
console.log('%cProtecting the digital world, one endpoint at a time.', 'font-size: 12px; color: #1673FF; padding: 5px;');

// Performance monitoring
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`Page loaded in ${Math.round(loadTime)}ms`);

    // You can send this to analytics in production
    if (loadTime > 3000) {
        console.warn('Page load time is above optimal threshold');
    }
});

