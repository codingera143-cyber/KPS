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
const STATUS_URL = 'https://docs.google.com/spreadsheets/d/1nxEQWnLKJW39vOwS3bM-4jDVvZAR6uwSfg_bjcnKg_g/export?format=csv&gid=0';

async function runToofaniFeatures() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday
    const hour = now.getHours();

    // 1. DYNAMIC ATMOSPHERE (Background Colors)
    applyAtmosphere(hour);

    try {
        const response = await fetch(STATUS_URL);
        const csvData = await response.text();
        const rows = csvData.split('\n').map(row => row.split(','));
        
        const statusValue = rows[1][0] ? rows[1][0].replace(/"/g, '').trim().toLowerCase() : "";
        const holidayName = rows[1][1] ? rows[1][1].replace(/"/g, '').trim() : "";

        let finalSpeech = "";

        // 2. LOGIC FOR VOICE MESSAGE
        if (statusValue.includes('open')) {
            finalSpeech = "School is Open Today. Have You Sent Your Ward To The School?";
        } 
        else {
            // Check if it's Sunday or a Special Holiday
            let reason = (day === 0) ? "Sunday" : holidayName;
            finalSpeech = `School is Closed Today Because Today is ${reason || 'a Holiday'}. Enjoy Your Day!`;
        }

        // 3. TRIGGER AI VOICE (On first click)
        triggerVoice(finalSpeech);

    } catch (e) {
        console.log("Speech Engine Error");
    }
}

// Background Theme Logic
function applyAtmosphere(hour) {
    let gradient = "";
    if (hour >= 5 && hour < 11)      gradient = "linear-gradient(135deg, #FF9A9E, #FAD0C4)"; // Morning
    else if (hour >= 11 && hour < 16) gradient = "linear-gradient(135deg, #89f7fe, #66a6ff)"; // Day
    else if (hour >= 16 && hour < 20) gradient = "linear-gradient(135deg, #f093fb, #f5576c)"; // Evening
    else                             gradient = "linear-gradient(135deg, #2c3e50, #000000)"; // Night

    document.body.style.transition = "background 2s ease-in-out";
    document.body.style.background = gradient;
    document.body.style.minHeight = "100vh";
}

// Voice Trigger Logic
function triggerVoice(text) {
    const handleInteraction = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; // Professional speed
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
        
        // Remove listener after first interaction to avoid repeated speaking
        window.removeEventListener('click', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
}

// Start the engine
runToofaniFeatures();
