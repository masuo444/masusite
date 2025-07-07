/**
 * FOMUS Child Theme JavaScript
 * まっすー個人サイト - 子テーマ用JavaScript
 */

(function($) {
    'use strict';

    // DOM Ready
    $(document).ready(function() {
        initFomusChildTheme();
    });

    function initFomusChildTheme() {
        initPortfolioFilters();
        initSlideshows();
        initTabSwitchers();
        initContactEnhancements();
        initScrollAnimations();
        initMobileEnhancements();
        initInstagramIntegration();
        initPerformanceOptimizations();
    }

    // Portfolio Filters
    function initPortfolioFilters() {
        $('.portfolio-filter').on('click', function(e) {
            e.preventDefault();
            
            const filter = $(this).data('filter');
            const $portfolioItems = $('.portfolio-item');
            
            // Update active filter
            $('.portfolio-filter').removeClass('active');
            $(this).addClass('active');
            
            // Filter items
            if (filter === 'all') {
                $portfolioItems.show().addClass('fade-in');
            } else {
                $portfolioItems.hide().removeClass('fade-in');
                $portfolioItems.filter(`[data-type="${filter}"]`).show().addClass('fade-in');
            }
            
            // Analytics tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'portfolio_filter', {
                    'event_category': 'portfolio',
                    'event_label': filter
                });
            }
        });
    }

    // Enhanced Slideshows
    function initSlideshows() {
        $('.slideshow-container').each(function() {
            const $container = $(this);
            const $slides = $container.find('.slide');
            const $dots = $container.find('.dot');
            let currentSlide = 0;
            let autoplayInterval;

            // Initialize first slide
            if ($slides.length > 0) {
                $slides.eq(0).addClass('active');
                $dots.eq(0).addClass('active');
            }

            // Navigation functions
            function showSlide(index) {
                $slides.removeClass('active');
                $dots.removeClass('active');
                
                if (index >= $slides.length) index = 0;
                if (index < 0) index = $slides.length - 1;
                
                $slides.eq(index).addClass('active');
                $dots.eq(index).addClass('active');
                currentSlide = index;
            }

            function nextSlide() {
                showSlide(currentSlide + 1);
            }

            function prevSlide() {
                showSlide(currentSlide - 1);
            }

            // Button events
            $container.find('.slide-next').on('click', function(e) {
                e.preventDefault();
                nextSlide();
                stopAutoplay();
            });

            $container.find('.slide-prev').on('click', function(e) {
                e.preventDefault();
                prevSlide();
                stopAutoplay();
            });

            // Dot navigation
            $dots.on('click', function(e) {
                e.preventDefault();
                const index = $(this).index();
                showSlide(index);
                stopAutoplay();
            });

            // Autoplay functionality
            function startAutoplay() {
                autoplayInterval = setInterval(nextSlide, 5000);
            }

            function stopAutoplay() {
                if (autoplayInterval) {
                    clearInterval(autoplayInterval);
                    autoplayInterval = null;
                }
            }

            // Touch/swipe support
            let startX = 0;
            let endX = 0;

            $container.on('touchstart', function(e) {
                startX = e.originalEvent.touches[0].clientX;
                stopAutoplay();
            });

            $container.on('touchend', function(e) {
                endX = e.originalEvent.changedTouches[0].clientX;
                
                if (startX - endX > 50) {
                    nextSlide(); // Swipe left - next slide
                } else if (endX - startX > 50) {
                    prevSlide(); // Swipe right - previous slide
                }
            });

            // Keyboard navigation
            $container.on('keydown', function(e) {
                if (e.keyCode === 37) { // Left arrow
                    prevSlide();
                    stopAutoplay();
                } else if (e.keyCode === 39) { // Right arrow
                    nextSlide();
                    stopAutoplay();
                }
            });

            // Make container focusable
            $container.attr('tabindex', '0');

            // Pause on hover
            $container.on('mouseenter', stopAutoplay);
            $container.on('mouseleave', function() {
                if ($slides.length > 1) {
                    startAutoplay();
                }
            });

            // Start autoplay if multiple slides
            if ($slides.length > 1) {
                startAutoplay();
            }
        });
    }

    // Tab Switchers Enhancement
    function initTabSwitchers() {
        $('.works-tab, .services-tab').on('click', function(e) {
            e.preventDefault();
            
            const $tab = $(this);
            const tabGroup = $tab.hasClass('works-tab') ? 'works' : 'services';
            const targetTab = $tab.data('tab');
            
            // Remove active from all tabs in group
            $(`.${tabGroup}-tab`).removeClass('active');
            
            // Add active to clicked tab
            $tab.addClass('active');
            
            // Hide all content panels
            if (tabGroup === 'works') {
                $('.works-tab-content').removeClass('active');
                $(`#${targetTab}-content`).addClass('active');
            } else {
                $('.tab-content').removeClass('active');
                $(`#${targetTab}-services`).addClass('active');
            }
            
            // Analytics tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'tab_switch', {
                    'event_category': 'navigation',
                    'event_label': `${tabGroup}_${targetTab}`
                });
            }
            
            // Trigger custom event
            $(document).trigger('tabSwitched', [tabGroup, targetTab]);
        });
    }

    // Contact Form Enhancements
    function initContactEnhancements() {
        // Form validation
        $('.wpcf7-form').on('submit', function(e) {
            const $form = $(this);
            let isValid = true;
            
            // Check required fields
            $form.find('[required]').each(function() {
                const $field = $(this);
                const value = $field.val().trim();
                
                if (!value) {
                    $field.addClass('error');
                    isValid = false;
                } else {
                    $field.removeClass('error');
                }
                
                // Email validation
                if ($field.attr('type') === 'email' && value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        $field.addClass('error');
                        isValid = false;
                    }
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showNotification('必須項目を正しく入力してください。', 'error');
            }
        });
        
        // Remove error class on input
        $('.wpcf7-form input, .wpcf7-form textarea, .wpcf7-form select').on('input change', function() {
            $(this).removeClass('error');
        });
        
        // Success/Error handling
        $(document).on('wpcf7mailsent', function(event) {
            showNotification('メッセージが送信されました。ありがとうございます！', 'success');
            
            // Reset form styling
            $('.wpcf7-form').find('input, textarea, select').removeClass('error');
            
            // Analytics tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'contact_form_success', {
                    'event_category': 'engagement',
                    'event_label': 'contact_form'
                });
            }
        });
        
        $(document).on('wpcf7mailfailed', function(event) {
            showNotification('送信に失敗しました。もう一度お試しください。', 'error');
        });
    }

    // Scroll Animations
    function initScrollAnimations() {
        // Intersection Observer for fade-in animations
        if ('IntersectionObserver' in window) {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);
            
            // Observe elements
            $('.collection-item, .service-card-modern, .collaboration-item, .fomus-title').each(function() {
                this.classList.add('fade-in');
                observer.observe(this);
            });
        }
        
        // Parallax scrolling
        $(window).on('scroll', throttle(function() {
            const scrollTop = $(window).scrollTop();
            
            $('.parallax-element').each(function() {
                const $element = $(this);
                const speed = $element.data('speed') || 0.5;
                const yPos = -(scrollTop * speed);
                $element.css('transform', `translateY(${yPos}px)`);
            });
        }, 16));
        
        // Progress bar
        $(window).on('scroll', throttle(function() {
            const winScroll = $(window).scrollTop();
            const height = $(document).height() - $(window).height();
            const scrolled = (winScroll / height) * 100;
            $('.scroll-progress').css('width', scrolled + '%');
        }, 16));
    }

    // Mobile Enhancements
    function initMobileEnhancements() {
        // Mobile menu
        $('.mobile-menu-toggle').on('click', function() {
            $(this).toggleClass('active');
            $('.nav-menu').toggleClass('active');
            $('body').toggleClass('menu-open');
        });
        
        // Close menu on link click
        $('.nav-menu a').on('click', function() {
            $('.mobile-menu-toggle').removeClass('active');
            $('.nav-menu').removeClass('active');
            $('body').removeClass('menu-open');
        });
        
        // Touch-friendly hover effects
        if ('ontouchstart' in window) {
            $('.collection-item, .service-card-modern').on('touchstart', function() {
                $(this).addClass('touch-hover');
            }).on('touchend', function() {
                setTimeout(() => {
                    $(this).removeClass('touch-hover');
                }, 300);
            });
        }
        
        // Viewport height fix for mobile
        function setVH() {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }
        
        setVH();
        $(window).on('resize', throttle(setVH, 100));
    }

    // Instagram Integration
    function initInstagramIntegration() {
        // Enhanced Instagram button
        $('.instagram-method').on('click', function(e) {
            // Analytics tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'instagram_click', {
                    'event_category': 'social',
                    'event_label': 'instagram'
                });
            }
        });
        
        // Instagram widget enhancement
        $('.fomus-instagram-feed').each(function() {
            const $feed = $(this);
            // Add loading animation or fetch real Instagram posts via API
            // This would require Instagram Basic Display API integration
        });
    }

    // Performance Optimizations
    function initPerformanceOptimizations() {
        // Lazy loading for images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            img.classList.add('loaded');
                            observer.unobserve(img);
                        }
                    }
                });
            });
            
            $('.lazy').each(function() {
                imageObserver.observe(this);
            });
        }
        
        // Preload critical resources
        const criticalImages = [
            '/wp-content/themes/fomus-child/assets/images/profile.jpg',
            '/wp-content/themes/fomus-child/assets/images/fomus-logo.jpg'
        ];
        
        criticalImages.forEach(function(src) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
        
        // Service Worker registration
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    console.log('SW registered: ', registration);
                })
                .catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                });
        }
    }

    // Utility Functions
    function throttle(func, limit) {
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
    }

    function showNotification(message, type) {
        const notification = $(`
            <div class="fomus-notification fomus-notification-${type}">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `);
        
        $('body').append(notification);
        
        setTimeout(function() {
            notification.addClass('show');
        }, 100);
        
        // Auto hide
        setTimeout(function() {
            hideNotification(notification);
        }, 5000);
        
        // Manual close
        notification.find('.notification-close').on('click', function() {
            hideNotification(notification);
        });
    }

    function hideNotification($notification) {
        $notification.removeClass('show');
        setTimeout(function() {
            $notification.remove();
        }, 300);
    }

    // Global functions for backward compatibility
    window.FomusChild = {
        showNotification: showNotification,
        hideNotification: hideNotification
    };

    // Error handling
    window.onerror = function(msg, url, lineNo, columnNo, error) {
        console.error('FOMUS Child Theme Error:', {
            message: msg,
            source: url,
            line: lineNo,
            column: columnNo,
            error: error
        });
        
        // Send error to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'javascript_error', {
                'event_category': 'error',
                'event_label': msg,
                'value': lineNo
            });
        }
        
        return false;
    };

})(jQuery);

// CSS for notifications
const notificationCSS = `
<style>
.fomus-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    color: #333;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    display: flex;
    align-items: center;
    gap: 1rem;
    max-width: 400px;
}

.fomus-notification.show {
    transform: translateX(0);
}

.fomus-notification-success {
    border-left: 4px solid #28a745;
}

.fomus-notification-error {
    border-left: 4px solid #dc3545;
}

.fomus-notification-warning {
    border-left: 4px solid #ffc107;
}

.notification-close {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #999;
    padding: 0;
    margin-left: auto;
}

.notification-close:hover {
    color: #666;
}

.fade-in {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-in-visible {
    opacity: 1;
    transform: translateY(0);
}

.touch-hover {
    transform: scale(1.02);
}

@media (max-width: 768px) {
    .fomus-notification {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', notificationCSS);