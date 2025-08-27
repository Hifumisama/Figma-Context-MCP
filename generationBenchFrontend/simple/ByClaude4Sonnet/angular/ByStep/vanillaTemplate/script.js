// Portfolio Interactive Features

document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality
    initNavigation();
    
    // Smooth scrolling for navigation links
    initSmoothScrolling();
    
    // Resume button animation
    initResumeButton();
    
    // Project hover effects
    initProjectInteractions();
    
    // Contact form interactions (if needed)
    initContactInteractions();
    
    // Scroll animations
    initScrollAnimations();
});

// Navigation active state management
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    
    // Update active nav link on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= (sectionTop - 200)) {
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
    
    // Click event for navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Smooth scroll to target section
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed header
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Smooth scrolling for all anchor links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') {
                e.preventDefault();
                return;
            }
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                const offsetTop = targetElement.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Resume button interactions
function initResumeButton() {
    const resumeBtn = document.querySelector('.resume-btn');
    
    if (resumeBtn) {
        resumeBtn.addEventListener('click', function() {
            // Add click animation
            this.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // Here you would typically trigger a download or open a modal
            console.log('Resume button clicked - would download/open resume');
            
            // Example: Open resume in new tab
            // window.open('path/to/resume.pdf', '_blank');
        });
        
        // Add hover effects
        resumeBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 8px rgba(71, 67, 6, 0.2)';
        });
        
        resumeBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    }
}

// Project interaction effects
function initProjectInteractions() {
    const projects = document.querySelectorAll('.project');
    
    projects.forEach(project => {
        const projectImg = project.querySelector('.project-img');
        
        project.addEventListener('mouseenter', function() {
            if (projectImg) {
                projectImg.style.transform = 'scale(1.05)';
                projectImg.style.transition = 'transform 0.3s ease';
            }
            
            this.style.transform = 'translateY(-5px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        project.addEventListener('mouseleave', function() {
            if (projectImg) {
                projectImg.style.transform = 'scale(1)';
            }
            
            this.style.transform = 'translateY(0)';
        });
        
        // Click event for projects
        project.addEventListener('click', function() {
            const projectTitle = this.querySelector('.project-title').textContent;
            console.log(`Project clicked: ${projectTitle}`);
            
            // Here you would typically open a project detail page or modal
            // window.location.href = `/project-detail/${projectSlug}`;
        });
    });
}

// Contact interactions
function initContactInteractions() {
    const contactEmail = document.querySelector('.contact-email');
    const contactSocials = document.querySelectorAll('.contact-social');
    
    // Email click to copy or open mail client
    if (contactEmail) {
        contactEmail.addEventListener('click', function() {
            const email = this.textContent;
            
            // Copy to clipboard
            if (navigator.clipboard) {
                navigator.clipboard.writeText(email).then(() => {
                    showTooltip(this, 'Email copié!');
                });
            } else {
                // Fallback: open mail client
                window.location.href = `mailto:${email}`;
            }
        });
        
        contactEmail.style.cursor = 'pointer';
    }
    
    // Social links
    contactSocials.forEach(social => {
        social.addEventListener('click', function() {
            const socialText = this.textContent;
            let url = '';
            
            if (socialText.includes('twitter.com')) {
                url = `https://${socialText}`;
            } else if (socialText.includes('behance.com')) {
                url = `https://${socialText}`;
            }
            
            if (url) {
                window.open(url, '_blank');
            }
        });
        
        social.style.cursor = 'pointer';
    });
}

// Scroll animations
function initScrollAnimations() {
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
    const animatableElements = document.querySelectorAll('.timeline-item, .project, .section-title');
    
    animatableElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
}

// Utility function to show tooltip
function showTooltip(element, message) {
    const tooltip = document.createElement('div');
    tooltip.textContent = message;
    tooltip.style.cssText = `
        position: absolute;
        background: #474306;
        color: #F5EE84;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 1000;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(tooltip);
    
    // Position tooltip
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.top - 40) + 'px';
    
    // Show tooltip
    setTimeout(() => {
        tooltip.style.opacity = '1';
    }, 10);
    
    // Remove tooltip after 2 seconds
    setTimeout(() => {
        tooltip.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(tooltip);
        }, 300);
    }, 2000);
}

// Social icon interactions
document.querySelectorAll('.social-icon').forEach(icon => {
    icon.addEventListener('click', function(e) {
        e.preventDefault();
        
        const alt = this.alt.toLowerCase();
        let url = '';
        
        switch(alt) {
            case 'medium':
                url = 'https://medium.com/@johndoe';
                break;
            case 'behance':
                url = 'https://behance.net/johndoe';
                break;
            case 'twitter':
                url = 'https://twitter.com/johndoe';
                break;
        }
        
        if (url) {
            window.open(url, '_blank');
        }
    });
});

// Add CSS for scroll animations
const animationStyles = `
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .animate-on-scroll.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .timeline-item.animate-on-scroll {
        transform: translateX(-30px);
    }
    
    .timeline-item.animate-in {
        transform: translateX(0);
    }
`;

// Inject animation styles
const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);

