// Portfolio JavaScript Interactions

document.addEventListener('DOMContentLoaded', function() {
    // Navigation smooth scrolling
    initSmoothScrolling();
    
    // Resume button interactions
    initResumeButton();
    
    // Scroll animations
    initScrollAnimations();
    
    // Active navigation highlighting
    initActiveNavigation();
    
    // Social icons animations
    initSocialAnimations();
});

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update active navigation
                updateActiveNavigation(this);
            }
        });
    });
}

// Resume button interactions
function initResumeButton() {
    const resumeBtn = document.getElementById('resumeBtn');
    
    if (resumeBtn) {
        resumeBtn.addEventListener('click', function() {
            // Add click animation
            this.classList.add('clicked');
            
            // Create a simulated download action
            setTimeout(() => {
                this.classList.remove('clicked');
                
                // You can replace this with actual resume download logic
                alert('Téléchargement du CV en cours...');
                
                // Simulate download with a temporary link
                // In a real implementation, you would link to an actual PDF file
                console.log('Resume download initiated');
            }, 300);
        });
        
        // Add hover sound effect (optional)
        resumeBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        resumeBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    }
}

// Scroll animations for sections
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe sections and important elements
    const elementsToAnimate = document.querySelectorAll([
        '.hero-text',
        '.hero-image',
        '.btn-resume',
        '.section-title',
        '.section-description',
        '.experience-item',
        '.study-case',
        '.contact-content'
    ].join(', '));
    
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
}

// Active navigation highlighting
function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition <= sectionTop + sectionHeight) {
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
}

// Update active navigation manually
function updateActiveNavigation(clickedLink) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    clickedLink.classList.add('active');
}

// Social icons animations
function initSocialAnimations() {
    const socialLinks = document.querySelectorAll('.social-link');
    
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.2) rotate(5deg)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
        
        // Add click animation
        link.addEventListener('click', function(e) {
            e.preventDefault();
            this.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                this.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            }, 100);
            
            // Here you would typically open the social media link
            console.log('Social media link clicked:', this.querySelector('img').alt);
        });
    });
}

// Study case interactions
function initStudyCaseAnimations() {
    const studyCases = document.querySelectorAll('.study-case');
    
    studyCases.forEach(studyCase => {
        studyCase.addEventListener('mouseenter', function() {
            const image = this.querySelector('.case-image img');
            if (image) {
                image.style.transform = 'scale(1.05)';
            }
        });
        
        studyCase.addEventListener('mouseleave', function() {
            const image = this.querySelector('.case-image img');
            if (image) {
                image.style.transform = 'scale(1)';
            }
        });
        
        // Add click interaction for study cases
        studyCase.addEventListener('click', function() {
            const title = this.querySelector('.case-title').textContent;
            console.log('Study case clicked:', title);
            
            // You could implement a modal or navigation to a detailed case study page here
            alert(`Ouverture de l'étude de cas: ${title}`);
        });
    });
}

// Contact links interactions
function initContactLinks() {
    const contactLinks = document.querySelectorAll('.contact-link');
    
    contactLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // For email links, we let the default behavior work
            if (this.href.startsWith('mailto:')) {
                return;
            }
            
            e.preventDefault();
            const url = this.textContent;
            console.log('Contact link clicked:', url);
            
            // You could implement actual navigation here
            alert(`Redirection vers: ${url}`);
        });
    });
}

// Initialize additional animations when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add initial delays for staggered animations
    const experienceItems = document.querySelectorAll('.experience-item');
    experienceItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.2}s`;
    });
    
    const studyCases = document.querySelectorAll('.study-case');
    studyCases.forEach((studyCase, index) => {
        studyCase.style.animationDelay = `${index * 0.3}s`;
    });
    
    // Initialize study case and contact animations
    initStudyCaseAnimations();
    initContactLinks();
});

// Performance optimization: Throttle scroll events
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply throttling to scroll-based functions
const throttledScrollHandler = throttle(() => {
    initActiveNavigation();
}, 100);

window.addEventListener('scroll', throttledScrollHandler);

// Add CSS for active navigation state
const style = document.createElement('style');
style.textContent = `
    .nav-link.active {
        color: #F5EE84;
        font-weight: 600;
    }
    
    .study-case {
        cursor: pointer;
        transition: transform 0.3s ease;
    }
    
    .study-case:hover {
        transform: translateY(-5px);
    }
    
    .case-image img {
        transition: transform 0.3s ease;
    }
    
    .social-link {
        transition: transform 0.3s ease;
    }
`;
document.head.appendChild(style);
