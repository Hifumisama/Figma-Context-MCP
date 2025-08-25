// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    
    // Update active navigation link based on scroll position
    function updateActiveNav() {
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // Smooth scroll to section when nav link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Listen for scroll events to update active nav
    window.addEventListener('scroll', updateActiveNav);
    
    // Initial call to set active nav on page load
    updateActiveNav();
    
    // Parallax effect for hero decorations
    const heroDecorations = document.querySelector('.hero-decorations');
    
    if (heroDecorations) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;
            
            heroDecorations.style.transform = `translateY(${parallax}px)`;
        });
    }
    
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.timeline-item, .project-card, .section-title');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });
    
    // Interactive rating bars
    const ratingBars = document.querySelectorAll('.rating-bar');
    let animationDelay = 0;
    
    ratingBars.forEach(bar => {
        setTimeout(() => {
            bar.style.animation = 'barGrow 0.6s ease forwards';
        }, animationDelay);
        animationDelay += 100;
    });
    
    // Add hover effect to project cards
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add click interaction to resume button
    const resumeBtn = document.querySelector('.btn-resume');
    
    if (resumeBtn) {
        resumeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Create a temporary message
            const originalText = this.textContent;
            this.textContent = 'Downloaded!';
            this.style.backgroundColor = '#F7F197';
            
            setTimeout(() => {
                this.textContent = originalText;
                this.style.backgroundColor = '#F5EE84';
            }, 2000);
        });
    }
    
    // Add subtle animation to social links
    const socialLinks = document.querySelectorAll('.social-link');
    
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) rotate(5deg)';
            this.style.transition = 'transform 0.2s ease';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    });
    
    // Mobile menu toggle (if needed for smaller screens)
    const navMenu = document.querySelector('.nav-menu');
    let isMobileMenuOpen = false;
    
    // Add mobile menu button for very small screens
    if (window.innerWidth <= 480) {
        const header = document.querySelector('.header .container');
        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.innerHTML = '☰';
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 24px;
            color: #03045E;
            cursor: pointer;
            display: none;
        `;
        
        header.appendChild(mobileMenuBtn);
        
        mobileMenuBtn.addEventListener('click', function() {
            isMobileMenuOpen = !isMobileMenuOpen;
            navMenu.style.display = isMobileMenuOpen ? 'block' : 'none';
            this.innerHTML = isMobileMenuOpen ? '✕' : '☰';
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 480) {
            navMenu.style.display = 'block';
        }
    });
});

// CSS animations (to be added to CSS if needed)
const style = document.createElement('style');
style.textContent = `
    @keyframes barGrow {
        from {
            height: 0;
        }
        to {
            height: 29.44px;
        }
    }
    
    .mobile-menu-btn {
        display: none !important;
    }
    
    @media (max-width: 480px) {
        .mobile-menu-btn {
            display: block !important;
        }
        
        .nav-menu {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: #FBF8CC;
            border: 1px solid rgba(3, 4, 94, 0.1);
            border-radius: 8px;
            padding: 20px;
            margin-top: 10px;
        }
        
        .nav-menu ul {
            flex-direction: column;
            gap: 15px;
        }
    }
`;

document.head.appendChild(style);
