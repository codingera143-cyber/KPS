const scrollTopBtn = document.getElementById('scrollTopBtn');
const whatsappFab = document.getElementById('whatsappFab');

const isIndexPage = window.location.pathname.endsWith('index.html') || 
                   window.location.pathname.endsWith('/') || 
                   window.location.pathname === '';

function handleScrollLogic() {
    if (!scrollTopBtn) return;

    // Har tarah ke container se scroll position nikalna
    const scrollPos = window.pageYOffset || 
                      document.documentElement.scrollTop || 
                      document.body.scrollTop || 0;

    let canShowScroll = false;

    if (isIndexPage && whatsappFab) {
        if (window.getComputedStyle(whatsappFab).display === "none") {
            canShowScroll = true;
        }
    } else {
        canShowScroll = true;
    }

    if (canShowScroll && scrollPos > 200) {
        scrollTopBtn.style.display = "block";
    } else {
        scrollTopBtn.style.display = "none";
    }
}

// 1. WhatsApp Close Logic
window.closeFab = function() {
    if (whatsappFab) {
        whatsappFab.style.display = 'none';
        handleScrollLogic();
    }
};

// 2. Event Listeners
window.addEventListener('scroll', handleScrollLogic, { passive: true });
window.addEventListener('load', handleScrollLogic);

// 3. Final Smooth Scroll Fix
if (scrollTopBtn) {
    scrollTopBtn.onclick = function(e) {
        e.preventDefault();
        
        // Sabse pehle modern smooth scroll try karo
        try {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } catch (err) {
            // Agar purana browser hai toh manual scroll
            window.scrollTo(0, 0);
        }
    };
}
