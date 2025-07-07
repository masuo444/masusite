// Main JavaScript file for MaSU Portfolio Site
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initializeLoadingScreen();
    initializeMobileMenu();
    initializeLanguageSystem();
    initializeSmoothScrolling();
    initializeContactForm();
    initializeAnimations();
    
    console.log('MaSU Portfolio Site initialized successfully');
});

// Loading Screen
function initializeLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const body = document.body;
    
    if (loadingScreen) {
        // Hide loading screen after page is fully loaded
        window.addEventListener('load', function() {
            setTimeout(() => {
                loadingScreen.classList.add('hide');
                body.classList.remove('loading');
                
                // Remove loading screen from DOM after transition
                setTimeout(() => {
                    if (loadingScreen.parentNode) {
                        loadingScreen.parentNode.removeChild(loadingScreen);
                    }
                }, 500);
            }, 1000); // Show for at least 1 second
        });
    }
}

// Mobile Menu
function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }
}

// Language System Integration
function initializeLanguageSystem() {
    // Ensure translation system is loaded
    if (typeof initializeTranslations === 'function') {
        initializeTranslations();
    }
    
    // Add language change event listeners
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            if (typeof changeLanguage === 'function') {
                changeLanguage(lang);
            }
            
            // Update active state
            langButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    // Add smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Contact Form
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });
            
            // Basic validation
            if (!validateContactForm(formObject)) {
                return;
            }
            
            // Show loading state
            const submitButton = this.querySelector('.form-submit-btn');
            const originalText = submitButton.textContent;
            submitButton.textContent = '送信中...';
            submitButton.disabled = true;
            
            // Simulate form submission (replace with actual submission logic)
            setTimeout(() => {
                alert('お問い合わせありがとうございます。3営業日以内にご返信いたします。');
                contactForm.reset();
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }, 2000);
        });
    }
}

// Form Validation
function validateContactForm(formData) {
    const requiredFields = ['clientType', 'name', 'email', 'message'];
    const errors = [];
    
    // Check required fields
    requiredFields.forEach(field => {
        if (!formData[field] || formData[field].trim() === '') {
            errors.push(`${field} is required`);
        }
    });
    
    // Validate email
    if (formData.email && !isValidEmail(formData.email)) {
        errors.push('Invalid email format');
    }
    
    // Check privacy agreement
    if (!formData.privacy) {
        errors.push('Privacy agreement is required');
    }
    
    if (errors.length > 0) {
        alert('必須項目を入力してください。');
        return false;
    }
    
    return true;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Scroll Animations
function initializeAnimations() {
    // Add intersection observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll(
        '.hero-content, .fomus-main-section, .collection-item, .service-card-modern, .works-tab-content'
    );
    
    animateElements.forEach(el => {
        el.classList.add('animate-element');
        observer.observe(el);
    });
    
    // Add CSS for animations
    addAnimationStyles();
}

// Add animation styles dynamically
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .animate-element {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .animate-element.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .collection-item.animate-element {
            transition-delay: 0.1s;
        }
        
        .collection-item:nth-child(2).animate-element {
            transition-delay: 0.2s;
        }
        
        .collection-item:nth-child(3).animate-element {
            transition-delay: 0.3s;
        }
        
        .service-card-modern.animate-element {
            transition-delay: 0.1s;
        }
        
        .service-card-modern:nth-child(2).animate-element {
            transition-delay: 0.2s;
        }
        
        .service-card-modern:nth-child(3).animate-element {
            transition-delay: 0.3s;
        }
        
        .service-card-modern:nth-child(4).animate-element {
            transition-delay: 0.4s;
        }
    `;
    document.head.appendChild(style);
}

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Add scrolled header styles
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .header.scrolled {
            background: rgba(255, 255, 255, 0.98);
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }
        
        body.menu-open {
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);
});

// Utility functions
const utils = {
    // Debounce function
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Check if element is in viewport
    isInViewport: function(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// Performance optimization
window.addEventListener('resize', utils.debounce(function() {
    // Handle responsive layout adjustments
    console.log('Window resized');
}, 250));

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
});

// Export for other scripts
window.MaSUPortfolio = {
    utils: utils,
    initializeLoadingScreen: initializeLoadingScreen,
    initializeMobileMenu: initializeMobileMenu,
    initializeLanguageSystem: initializeLanguageSystem
};