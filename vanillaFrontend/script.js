// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Add smooth scrolling to all nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 100; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Resume button interaction
    const resumeBtn = document.querySelector('.resume-btn');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', function() {
            // Add a simple animation effect
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // You can add resume download functionality here
            console.log('Resume button clicked!');
        });
    }
    
    // Add active navigation highlighting
    function updateActiveNav() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Listen for scroll events
    window.addEventListener('scroll', updateActiveNav);
    
    // Initial call to set active nav
    updateActiveNav();
    
    // Add scroll animation for decorative elements
    function animateOnScroll() {
        const decorativeElements = document.querySelector('.decorative-elements');
        const heroSection = document.querySelector('.hero');
        
        if (decorativeElements && heroSection) {
            const scrolled = window.scrollY;
            const rate = scrolled * -0.5;
            
            decorativeElements.style.transform = `translateY(${rate}px)`;
        }
    }
    
    // Add parallax effect to decorative elements
    window.addEventListener('scroll', animateOnScroll);
    
    // Add hover effects to project cards
    const projectCards = document.querySelectorAll('.project');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click functionality to social links
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const icon = this.querySelector('img');
            const iconSrc = icon.src;
            
            // Determine which social platform based on icon filename
            if (iconSrc.includes('twitter')) {
                window.open('https://twitter.com/johndoe', '_blank');
            } else if (iconSrc.includes('behance')) {
                window.open('https://behance.com/johndoe', '_blank');
            } else if (iconSrc.includes('medium')) {
                window.open('https://medium.com/@johndoe', '_blank');
            }
        });
    });
    
    // Add contact items click functionality
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach(item => {
        item.addEventListener('click', function() {
            const text = this.textContent;
            
            if (text.includes('@')) {
                // Email
                window.location.href = `mailto:${text}`;
            } else if (text.includes('twitter')) {
                // Twitter
                window.open(`https://${text}`, '_blank');
            } else if (text.includes('behance')) {
                // Behance
                window.open(`https://${text}`, '_blank');
            }
        });
        
        // Add cursor pointer style
        item.style.cursor = 'pointer';
        
        // Add hover effect
        item.addEventListener('mouseenter', function() {
            this.style.color = '#474306';
            this.style.textDecoration = 'underline';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.color = '#03045E';
            this.style.textDecoration = 'none';
        });
    });
    
    // Add intersection observer for animations
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
    
    // Observe timeline items for animation
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`;
        observer.observe(item);
    });
    
    // Observe project cards for animation
    projectCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.3}s, transform 0.6s ease ${index * 0.3}s`;
        observer.observe(card);
    });
});
