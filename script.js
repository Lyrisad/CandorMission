// Mobile Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    
    // Animate hamburger menu
    const bars = navToggle.querySelectorAll('.bar');
    bars.forEach((bar, index) => {
        if (navMenu.classList.contains('active')) {
            if (index === 0) bar.style.transform = 'rotate(45deg) translate(5px, 5px)';
            if (index === 1) bar.style.opacity = '0';
            if (index === 2) bar.style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            bar.style.transform = 'none';
            bar.style.opacity = '1';
        }
    });
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const bars = navToggle.querySelectorAll('.bar');
        bars.forEach(bar => {
            bar.style.transform = 'none';
            bar.style.opacity = '1';
        });
    });
});

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

// Active navigation link highlighting
window.addEventListener('scroll', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Only handle scroll-based highlighting on the home page
    if (currentPage === 'index.html' || currentPage === '') {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            // Skip external page links
            if (href.includes('.html') && !href.includes('#')) {
                return;
            }
            
            // Remove active class from internal links
            link.classList.remove('active');
            
            // Add active class to current section link
            if (href === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
});

// Set initial active state based on current page
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Remove all active classes first
        link.classList.remove('active');
        
        // Set active based on current page
        if (currentPage === 'presentation.html' && href === 'presentation.html') {
            link.classList.add('active');
        } else if (currentPage === 'index.html' || currentPage === '') {
            if (href === '#accueil') {
                link.classList.add('active');
            }
        }
    });
});

// Header background on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// Parallax effect for hero background
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        const rate = scrolled * -0.5;
        heroBackground.style.transform = `translateY(${rate}px) scale(1)`;
    }
    
    // Parallax effect for about section background
    const aboutBackground = document.querySelector('.about-background');
    if (aboutBackground) {
        const aboutSection = document.querySelector('.about');
        const aboutTop = aboutSection.offsetTop;
        const aboutHeight = aboutSection.offsetHeight;
        const windowHeight = window.innerHeight;
        
        // Only apply parallax when the section is in view
        if (scrolled + windowHeight > aboutTop && scrolled < aboutTop + aboutHeight) {
            const rate = (scrolled - aboutTop) * 0.3;
            aboutBackground.style.transform = `translateY(${rate}px) scale(1)`;
        }
    }
});

// Comic bubble effects for value cards
document.querySelectorAll('.value-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        const bubble = this.querySelector('.comic-bubble');
        const effect = this.getAttribute('data-effect');
        
        // Add visual feedback
        this.style.transform = 'translateY(-15px) scale(1.02)';
        
        // Create sparkle particles
        createSparkles(this);
        
        // Add sound effect (visual only - no actual sound)
        addVisualSoundEffect(this, effect);
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(-10px)';
    });
});

// Create sparkle particles effect
function createSparkles(card) {
    const sparkles = ['✨', '⭐', '💫', '🌟', '⚡'];
    const colors = ['#ff6b6b', '#4ecdc4', '#a8e6cf', '#ffd93d', '#6c5ce7'];
    
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.innerHTML = sparkles[Math.floor(Math.random() * sparkles.length)];
            sparkle.style.position = 'absolute';
            sparkle.style.fontSize = '1.5rem';
            sparkle.style.color = colors[Math.floor(Math.random() * colors.length)];
            sparkle.style.left = Math.random() * 100 + '%';
            sparkle.style.top = Math.random() * 100 + '%';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.zIndex = '1000';
            sparkle.style.animation = 'sparkleFloat 1.5s ease-out forwards';
            
            card.appendChild(sparkle);
            
            // Remove sparkle after animation
            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                }
            }, 1500);
        }, i * 100);
    }
}

// Add visual sound effect
function addVisualSoundEffect(card, effect) {
    const soundWave = document.createElement('div');
    soundWave.className = 'sound-wave';
    soundWave.style.position = 'absolute';
    soundWave.style.top = '50%';
    soundWave.style.left = '50%';
    soundWave.style.transform = 'translate(-50%, -50%)';
    soundWave.style.width = '0';
    soundWave.style.height = '0';
    soundWave.style.border = '2px solid rgba(255, 255, 255, 0.8)';
    soundWave.style.borderRadius = '50%';
    soundWave.style.animation = 'soundWave 0.8s ease-out forwards';
    soundWave.style.pointerEvents = 'none';
    soundWave.style.zIndex = '999';
    
    card.appendChild(soundWave);
    
    setTimeout(() => {
        if (soundWave.parentNode) {
            soundWave.parentNode.removeChild(soundWave);
        }
    }, 800);
}

// Intersection Observer for animations
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

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.value-card, .about-text');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Add CSS animations dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes sparkleFloat {
            0% {
                opacity: 0;
                transform: translateY(0) scale(0);
            }
            50% {
                opacity: 1;
                transform: translateY(-20px) scale(1);
            }
            100% {
                opacity: 0;
                transform: translateY(-40px) scale(0);
            }
        }
        
        @keyframes soundWave {
            0% {
                width: 0;
                height: 0;
                opacity: 1;
            }
            100% {
                width: 200px;
                height: 200px;
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
        
        // Déclencher l'animation d'entrée du background
        const heroBackground = document.querySelector('.hero-background');
        if (heroBackground) {
            setTimeout(() => {
                heroBackground.style.opacity = '1';
                // Ne pas modifier transform ici pour ne pas bloquer le parallax
            }, 200);
        }
    }, 100);
});

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        const bars = navToggle.querySelectorAll('.bar');
        bars.forEach(bar => {
            bar.style.transform = 'none';
            bar.style.opacity = '1';
        });
    }
});

// Touch support for mobile devices
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0 && navMenu.classList.contains('active')) {
            // Swipe up - close menu
            navMenu.classList.remove('active');
            const bars = navToggle.querySelectorAll('.bar');
            bars.forEach(bar => {
                bar.style.transform = 'none';
                bar.style.opacity = '1';
            });
        }
    }
} 