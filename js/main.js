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

    // --- NEXT-GEN SCROLL REVEAL OBSERVER ENGINE ---
    const revealObserverOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.12
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = el.getAttribute('data-delay');
                if (delay) {
                    setTimeout(() => {
                        el.classList.add('active');
                    }, parseInt(delay, 10));
                } else {
                    el.classList.add('active');
                }
                observer.unobserve(el);
            }
        });
    }, revealObserverOptions);

    window.initScrollReveal = function(targetScope) {
        const root = targetScope || document;
        const elements = root.querySelectorAll('.reveal, .reveal-up, .reveal-down, .reveal-left, .reveal-right, .reveal-zoom, .reveal-flip');
        elements.forEach(el => {
            if (!el.classList.contains('active')) {
                revealObserver.observe(el);
            }
        });
    };

    // Run reveal observer initial pass
    window.initScrollReveal();

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

/**
 * VECTOR ART POPUP MODAL HANDLER
 */
let currentActiveVectorId = 'JT-001';

window.openVectorPopup = function(imgUrl, vehicleCode, vehicleName) {
    const popupModal = document.getElementById('vectorPopupModal');
    const popupImg = document.getElementById('vectorPopupImg');
    const popupCode = document.getElementById('vectorPopupCode');
    const popupTitle = document.getElementById('vectorPopupTitle');
    
    currentActiveVectorId = vehicleCode;

    if (popupImg) popupImg.src = imgUrl;
    if (popupCode) popupCode.innerText = vehicleCode;
    if (popupTitle) popupTitle.innerText = vehicleName;
    
    if (popupModal) {
        popupModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

function closeVectorPopup() {
    const popupModal = document.getElementById('vectorPopupModal');
    if (popupModal) {
        popupModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

document.getElementById('vectorPopupClose')?.addEventListener('click', closeVectorPopup);
document.getElementById('vectorPopupModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'vectorPopupModal') closeVectorPopup();
});

document.getElementById('vectorPopupExploreBtn')?.addEventListener('click', () => {
    closeVectorPopup();
    if (typeof window.openVehicleModalGlobal === 'function') {
        window.openVehicleModalGlobal(currentActiveVectorId);
    } else {
        document.getElementById('fleet')?.scrollIntoView({ behavior: 'smooth' });
    }
});

/**
 * VECTOR TICKER SMOOTH DRAG-TO-SCROLL & INFINITE AUTO-TICKER
 */
const tickerContainer = document.querySelector('.vector-ticker-container');
const tickerTrack = document.querySelector('.vector-ticker-track');

if (tickerContainer && tickerTrack) {
    let isMouseDown = false;
    let isMouseHovered = false;
    let startX = 0;
    let scrollLeftStart = 0;
    let floatScrollPos = 0;
    const autoSpeed = 0.6; // Perfect smooth slow-motion move to left

    function getSingleGroupWidth() {
        const images = tickerTrack.querySelectorAll('.vector-truck-img');
        if (images.length >= 14) {
            const dist = images[7].offsetLeft - images[0].offsetLeft;
            if (dist > 0) return dist;
        }
        return tickerTrack.scrollWidth / 2;
    }

    // 1. 60fps Infinite Auto-Scroll Loop (Float Accumulator)
    function autoScrollLoop() {
        if (!isMouseDown && !isMouseHovered) {
            floatScrollPos += autoSpeed;
            const groupWidth = getSingleGroupWidth();
            if (groupWidth > 0 && floatScrollPos >= groupWidth) {
                floatScrollPos -= groupWidth; // Retains exact subpixel remainder for seamless loop
            }
            tickerContainer.scrollLeft = floatScrollPos;
        } else {
            floatScrollPos = tickerContainer.scrollLeft;
        }
        requestAnimationFrame(autoScrollLoop);
    }
    requestAnimationFrame(autoScrollLoop);

    // Hover detection
    tickerContainer.addEventListener('mouseenter', () => isMouseHovered = true);
    tickerContainer.addEventListener('mouseleave', () => {
        isMouseHovered = false;
        isMouseDown = false;
        tickerContainer.style.cursor = 'grab';
    });

    // 2. Mouse Drag-to-Scroll (Ultra Smooth)
    tickerContainer.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        startX = e.pageX - tickerContainer.offsetLeft;
        scrollLeftStart = tickerContainer.scrollLeft;
        floatScrollPos = scrollLeftStart;
        tickerContainer.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        const x = e.pageX - tickerContainer.offsetLeft;
        const walk = (x - startX) * 1.5;
        floatScrollPos = scrollLeftStart - walk;
        tickerContainer.scrollLeft = floatScrollPos;
    });

    window.addEventListener('mouseup', () => {
        isMouseDown = false;
        tickerContainer.style.cursor = 'grab';
    });

    // 3. Mobile Touch Drag
    let touchStartX = 0;
    let touchStartScroll = 0;

    tickerContainer.addEventListener('touchstart', (e) => {
        isMouseHovered = true;
        touchStartX = e.touches[0].pageX - tickerContainer.offsetLeft;
        touchStartScroll = tickerContainer.scrollLeft;
        floatScrollPos = touchStartScroll;
    }, { passive: true });

    tickerContainer.addEventListener('touchmove', (e) => {
        const x = e.touches[0].pageX - tickerContainer.offsetLeft;
        const walk = (x - touchStartX) * 1.5;
        floatScrollPos = touchStartScroll - walk;
        tickerContainer.scrollLeft = floatScrollPos;
    }, { passive: true });

    tickerContainer.addEventListener('touchend', () => {
        isMouseHovered = false;
    });
}
