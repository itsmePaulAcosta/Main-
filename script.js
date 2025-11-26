// Theme Switcher Functionality
const themeOptions = document.querySelectorAll('.theme-option');
const root = document.documentElement;

const themes = {
    green: { primary: '#00ff88', rgb: '0, 255, 136' },
    blue: { primary: '#4ecdc4', rgb: '76, 205, 196' },
    purple: { primary: '#6c5ce7', rgb: '108, 92, 231' },
    orange: { primary: '#fd79a8', rgb: '253, 121, 168' },
    yellow: { primary: '#FFFF00', rgb: '255, 255, 0' },
    red: { primary: '#FF0000', rgb: '255, 0, 0' },
    cyan: { primary: '#00F8C9', rgb: '0, 248, 201' }
};

// Load saved theme or default to green
const savedTheme = localStorage.getItem('portfolioTheme') || 'green';
applyTheme(savedTheme);

themeOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        // prevent anchor default navigation
        if (e && e.preventDefault) e.preventDefault();
        const theme = option.getAttribute('data-theme');
        applyTheme(theme);
        localStorage.setItem('portfolioTheme', theme);
        // close inline swatches after selection (if present)
        const themeListEl = document.querySelector('.theme-list');
        if (themeListEl) themeListEl.classList.remove('open');
    });
});

function applyTheme(themeName) {
    const theme = themes[themeName];
    if (theme) {
        root.style.setProperty('--primary-color', theme.primary);
        root.style.setProperty('--primary-rgb', theme.rgb);
        
        // Update active theme option
        themeOptions.forEach(option => {
            option.classList.remove('active');
            if (option.getAttribute('data-theme') === themeName) {
                option.classList.add('active');
            }
        });
    }
}

function getPrimaryColor() {
    const val = getComputedStyle(root).getPropertyValue('--primary-color');
    return val ? val.trim() : themes.green.primary;
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile navigation toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));
}

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(10, 10, 10, 0.98)';
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
    }
});

// Animated counter for stats
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        element.textContent = Math.floor(start);
        
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        }
    }, 16);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            
            // Animate counters when stats section is visible
            if (entry.target.classList.contains('stats')) {
                const counters = entry.target.querySelectorAll('.stat-number');
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-target'));
                    animateCounter(counter, target);
                });
            }
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.service-card, .testimonial-card, .stat-item, .stats, .about-content, .contact-content');
    animateElements.forEach(el => {
        observer.observe(el);
    });
    // Theme list toggle: clicking the 'Themes' label shows/hides the swatches
    const themeLabel = document.querySelector('.theme-label');
    const themeList = document.querySelector('.theme-list');
    if (themeLabel && themeList) {
        // start collapsed
        themeList.classList.remove('open');
        themeLabel.style.cursor = 'pointer';
        themeLabel.addEventListener('click', (ev) => {
            ev.preventDefault();
            themeList.classList.toggle('open');
        });
        // close when clicking outside
        document.addEventListener('click', (ev) => {
            if (!themeList.contains(ev.target) && ev.target !== themeLabel) {
                themeList.classList.remove('open');
            }
        });
    }
});

// Tab functionality for About section (with ARIA + keyboard support)
const tabButtons = document.querySelectorAll('[data-tab]');
const tabPanes = document.querySelectorAll('.tab-pane');

function activateTab(button) {
    const targetTab = button.getAttribute('data-tab');

    tabButtons.forEach(btn => {
        const isActive = btn === button;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        btn.setAttribute('tabindex', isActive ? '0' : '-1');
        
        // Handle tab underlines
        const underline = btn.querySelector('.tab-underline');
        if (underline) {
            underline.classList.toggle('active', isActive);
        }
    });

    tabPanes.forEach(pane => {
        const isTarget = pane.id === targetTab;
        pane.classList.toggle('active', isTarget);
        pane.setAttribute('aria-hidden', isTarget ? 'false' : 'true');
        // clear inline animations so re-adding will replay
        pane.style.animation = 'none';
    });

    const pane = document.getElementById(targetTab);
    if (pane) {
        // trigger a short fade animation when pane becomes active
        void pane.offsetWidth; // force reflow
        pane.style.animation = 'fadeInUp 0.45s ease forwards';
    }
}

// initialize ARIA states and keyboard handlers
tabButtons.forEach((button, idx) => {
    // Ensure roles/attributes exist (some already set in HTML, but keep safe)
    button.setAttribute('role', 'tab');
    if (!button.id) button.id = `tab-${button.getAttribute('data-tab')}`;

    // click activates
    button.addEventListener('click', (e) => {
        activateTab(button);
        button.focus();
    });

    // keyboard navigation for tabs
    button.addEventListener('keydown', (e) => {
        const key = e.key;
        let newIndex = null;
        if (key === 'ArrowRight') newIndex = (idx + 1) % tabButtons.length;
        if (key === 'ArrowLeft') newIndex = (idx - 1 + tabButtons.length) % tabButtons.length;
        if (key === 'Home') newIndex = 0;
        if (key === 'End') newIndex = tabButtons.length - 1;
        if (newIndex !== null) {
            e.preventDefault();
            tabButtons[newIndex].focus();
        }

        if (key === 'Enter' || key === ' ') {
            e.preventDefault();
            activateTab(button);
        }
    });
});

// Contact form handling (show maintenance modal instead of sending)
const contactForm = document.getElementById('contactForm');
const submitBtn = document.querySelector('.submit-btn');

function openContactModal() {
    const contactModal = document.getElementById('contactModal');
    if (!contactModal) return;
    contactModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // focus the OK button for accessibility
    const ok = contactModal.querySelector('.contact-modal-ok');
    if (ok) ok.focus();

    // attach one-time close listeners (if not already attached)
    // use event delegation on document to avoid duplicate handlers
}

function closeContactModal() {
    const contactModal = document.getElementById('contactModal');
    if (!contactModal) return;
    contactModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // restore focus to the submit button
    if (submitBtn) submitBtn.focus();
}

// Global delegated click handler for modal controls and backdrop
document.addEventListener('click', function(e) {
    // close when clicking the close button or OK button
    if (e.target.closest('.contact-modal-close') || e.target.closest('.contact-modal-ok')) {
        closeContactModal();
        return;
    }

    // close when clicking the backdrop area
    if (e.target.classList && e.target.classList.contains('contact-modal-backdrop')) {
        closeContactModal();
        return;
    }
});

// Close on Escape when modal open
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const contactModal = document.getElementById('contactModal');
        if (contactModal && contactModal.getAttribute('aria-hidden') === 'false') {
            closeContactModal();
        }
    }
});

contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // Get form data
    const formData = new FormData(this);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    // Simple validation
    if (!name || !email || !message) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    // Show modal informing user the form is under maintenance
    openContactModal();
});

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 350px;
        word-wrap: break-word;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.background = getPrimaryColor();
            notification.style.color = '#000';
            break;
        case 'error':
            notification.style.background = '#ff4757';
            break;
        default:
            notification.style.background = '#3742fa';
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    const heroRoles = document.querySelector('.hero-roles');
    
    if (hero && scrolled < hero.offsetHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroRoles.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// Typing effect for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-title');
    const originalText = heroTitle.textContent;
    typeWriter(heroTitle, originalText, 150);
});

// Skill tags hover effect
document.querySelectorAll('.skill-tag').forEach(tag => {
    tag.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
        this.style.transition = 'all 0.3s ease';
    });
    
    tag.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});

// Testimonial cards animation on scroll
const testimonialCards = document.querySelectorAll('.testimonial-card');

const testimonialObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }, index * 200);
        }
    });
}, { threshold: 0.1 });

testimonialCards.forEach(card => {
    testimonialObserver.observe(card);
});

// Active navigation link highlighting
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Scroll to top functionality
function createScrollToTopButton() {
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: ${getPrimaryColor()};
        color: #000;
        border: none;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        font-size: 18px;
    `;
    
    document.body.appendChild(scrollBtn);
    
    // Show/hide button on scroll
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.visibility = 'visible';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.visibility = 'hidden';
        }
    });
    
    // Scroll to top on click
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Hover effects
    scrollBtn.addEventListener('mouseenter', () => {
        scrollBtn.style.transform = 'scale(1.1)';
        // slightly darker hover using rgba of primary rgb
        const rgb = getComputedStyle(root).getPropertyValue('--primary-rgb').trim();
        scrollBtn.style.background = `rgba(${rgb}, 0.9)`;
    });
    
    scrollBtn.addEventListener('mouseleave', () => {
        scrollBtn.style.transform = 'scale(1)';
        scrollBtn.style.background = getPrimaryColor();
    });
}

// Initialize scroll to top button
document.addEventListener('DOMContentLoaded', createScrollToTopButton);

// Loading animation
window.addEventListener('load', () => {
    // Hide loading screen if exists
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
    
    // Add fade-in animation to main content
    document.body.style.opacity = '1';
});

// Initialize all animations and effects
document.addEventListener('DOMContentLoaded', () => {
    // Set initial opacity for smooth fade-in
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    // Trigger fade-in after a short delay
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // Certificate lightbox: open full-size image when a thumbnail is clicked
    const certThumbs = document.querySelectorAll('.cert-thumb');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');

    let priorActiveElement = null;
    let lightboxKeyHandler = null;

    function openLightbox(src, alt) {
        if (!lightbox || !lightboxImg) return;
        priorActiveElement = document.activeElement;
        lightboxImg.src = src;
        lightboxImg.alt = alt || 'Certificate preview';
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // move focus into the dialog
        const closeBtn = document.getElementById('lightboxClose');
        if (closeBtn) closeBtn.focus();

        // trap focus inside the lightbox
        lightboxKeyHandler = function(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeLightbox();
                return;
            }

            if (e.key === 'Tab') {
                const focusable = Array.from(lightbox.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
                    .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        };

        document.addEventListener('keydown', lightboxKeyHandler);
    }

    function closeLightbox() {
        if (!lightbox || !lightboxImg) return;
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        lightboxImg.src = '';
        document.body.style.overflow = '';

        // remove key handler
        if (lightboxKeyHandler) {
            document.removeEventListener('keydown', lightboxKeyHandler);
            lightboxKeyHandler = null;
        }

        // restore focus
        if (priorActiveElement && typeof priorActiveElement.focus === 'function') {
            priorActiveElement.focus();
        }
        priorActiveElement = null;
    }

    certThumbs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const src = btn.getAttribute('data-src') || btn.querySelector('img')?.src;
            const alt = btn.querySelector('img')?.alt || '';
            if (src) openLightbox(src, alt);
        });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) lightbox.addEventListener('click', (e) => {
        // close when clicking the overlay outside the image
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
    
    // DIAGNOSTIC: report computed widths for about column and description
    try {
        const aboutCol = document.querySelector('.about .container > .about-content');
        const aboutDesc = document.querySelector('.about-description');
        if (aboutCol) {
            const colRect = aboutCol.getBoundingClientRect();
            console.log('DIAG: .about-content bounding width:', Math.round(colRect.width), 'px');
            const cs = window.getComputedStyle(aboutCol);
            console.log('DIAG: .about-content computed max-width:', cs.getPropertyValue('max-width'));
        }
        if (aboutDesc) {
            const descRect = aboutDesc.getBoundingClientRect();
            console.log('DIAG: .about-description bounding width:', Math.round(descRect.width), 'px');
            const cs2 = window.getComputedStyle(aboutDesc);
            console.log('DIAG: .about-description computed max-width:', cs2.getPropertyValue('max-width'));
        }
    } catch (err) {
        console.warn('DIAG: about sizing check failed', err);
    }
});

// Ensure initial ARIA state matches the markup: activate the button that has .active or the first one
const initiallyActive = document.querySelector('[data-tab].active') || tabButtons[0];
if (initiallyActive) activateTab(initiallyActive);

// Floating Navigation Active States
function updateFloatingNavActiveStates() {
    const sections = ['home', 'services', 'about', 'contact'];
    const navLinks = document.querySelectorAll('.floating-nav a');
    
    let current = '';
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                current = sectionId;
            }
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('text-accent2');
        link.classList.add('text-white/50');
        
        const href = link.getAttribute('href');
        if (href === `#${current}`) {
            link.classList.remove('text-white/50');
            link.classList.add('text-accent2');
        }
    });
}

// Update active states on scroll
window.addEventListener('scroll', updateFloatingNavActiveStates);

// Initialize active states
document.addEventListener('DOMContentLoaded', updateFloatingNavActiveStates);

// Prevent any scaling effects on floating navigation
document.addEventListener('DOMContentLoaded', function() {
    const floatingNavLinks = document.querySelectorAll('.floating-nav a');
    
    floatingNavLinks.forEach(link => {
        // Override any scaling effects
        link.addEventListener('mousedown', function(e) {
            this.style.transform = 'none !important';
        });
        
        link.addEventListener('mouseup', function(e) {
            this.style.transform = 'none !important';
        });
        
        link.addEventListener('click', function(e) {
            this.style.transform = 'none !important';
        });
        
        link.addEventListener('touchstart', function(e) {
            this.style.transform = 'none !important';
        });
        
        link.addEventListener('touchend', function(e) {
            this.style.transform = 'none !important';
        });
    });
});