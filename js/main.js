/**
 * JAYASOORIYA TRANSPORT - MAIN UI LOGIC
 * Handles navigation, scroll effects, statistics counters, and contact form.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- STICKY NAVBAR ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- MOBILE MENU ---
    const mobileToggleBtn = document.getElementById('mobileToggle');
    const closeDrawerBtn = document.getElementById('closeDrawer');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const drawerLinks = document.querySelectorAll('.drawer-close-trigger');

    function openMenu() {
        mobileDrawer.classList.add('open');
        drawerOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        mobileDrawer.classList.remove('open');
        drawerOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (mobileToggleBtn) mobileToggleBtn.addEventListener('click', openMenu);
    if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeMenu);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeMenu);
    
    drawerLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // --- ACTIVE NAV LINK HIGHLIGHTING ---
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
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

    // --- COUNTER ANIMATION ---
    const statNumbers = document.querySelectorAll('.stat-number [data-target]');
    let hasAnimated = false;

    const animateCounters = () => {
        statNumbers.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            
            let current = 0;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.innerText = Math.ceil(current).toString().padStart(2, '0');
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target.toString().padStart(2, '0');
                }
            };
            updateCounter();
        });
    };

    const statsObserver = new IntersectionObserver((entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
            animateCounters();
            hasAnimated = true;
        }
    }, { threshold: 0.5 });

    const statsContainer = document.getElementById('statsContainer');
    if (statsContainer) {
        statsObserver.observe(statsContainer);
    }

    // --- CONTACT FORM SUBMISSION (DEMO) ---
    const contactForm = document.getElementById('contactForm');
    const toastBox = document.getElementById('toastBox');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('senderName')?.value || '',
                phone: document.getElementById('senderPhone')?.value || '',
                email: document.getElementById('senderEmail')?.value || '',
                serviceType: document.getElementById('serviceSelect')?.value || 'general',
                vehicleId: document.getElementById('inquiryVehicleId')?.value || null,
                message: document.getElementById('messageText')?.value || ''
            };

            // Save to Neon DB if connected
            if (typeof window.sendInquiryToNeon === 'function') {
                try {
                    await window.sendInquiryToNeon(formData);
                    console.log("Inquiry saved to Neon Postgres DB!");
                } catch (err) {
                    console.warn("Could not save inquiry to Neon DB:", err);
                }
            }

            // Show toast notification
            toastBox.classList.add('show');
            
            // Reset form
            contactForm.reset();
            const vehicleGroup = document.getElementById('vehicleIdGroup');
            if (vehicleGroup) vehicleGroup.style.display = 'none';
            document.getElementById('serviceSelect').value = "";

            // Hide toast after 3.5s
            setTimeout(() => {
                toastBox.classList.remove('show');
            }, 3500);
        });
    }

});

/**
 * Helper to prefill contact form with a specific vehicle inquiry
 */
window.inquireAboutVehicle = function(vehicleId) {
    const serviceSelect = document.getElementById('serviceSelect');
    const specificOption = document.getElementById('specificVehicleOption');
    const vehicleGroup = document.getElementById('vehicleIdGroup');
    const inquiryVehicleId = document.getElementById('inquiryVehicleId');
    
    // Close modal if open
    if(window.closeVehicleModalGlobal) {
        window.closeVehicleModalGlobal();
    }

    // Scroll to contact form
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });

    // Set form fields
    if (serviceSelect && specificOption) {
        specificOption.selected = true;
        vehicleGroup.style.display = 'flex';
        inquiryVehicleId.value = vehicleId;
    }
    
    // Highlight input briefly
    setTimeout(() => {
        inquiryVehicleId.focus();
    }, 800);
}

document.getElementById('serviceSelect')?.addEventListener('change', (e) => {
    const vehicleGroup = document.getElementById('vehicleIdGroup');
    if (e.target.value === 'specific_vehicle') {
        vehicleGroup.style.display = 'flex';
    } else {
        vehicleGroup.style.display = 'none';
    }
});
