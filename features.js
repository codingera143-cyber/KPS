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

async function runToofaniVoice() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday

    try {
        const response = await fetch(STATUS_URL);
        const csvData = await response.text();
        const rows = csvData.split('\n').map(row => row.split(','));
        
        const statusValue = rows[1][0] ? rows[1][0].replace(/"/g, '').trim().toLowerCase() : "";
        const holidayName = rows[1][1] ? rows[1][1].replace(/"/g, '').trim() : "";

        let finalSpeech = "";

        // 1. DATA CHECK LOGIC
        if (statusValue.includes('open')) {
            finalSpeech = "School is Open Today. Have You Sent Your Ward To The School?";
        } 
        else {
            let reason = (day === 0) ? "Sunday" : holidayName;
            finalSpeech = `School is Closed Today Because Today is ${reason || 'a Holiday'}. Enjoy Your Day!`;
        }

        // 2. TRIGGER MALE VOICE (On first click only)
        const triggerMaleVoice = () => {
            const utterance = new SpeechSynthesisUtterance(finalSpeech);
            
            // Male Voice Selection
            const voices = window.speechSynthesis.getVoices();
            // Google US English Male ya Microsoft Ravi (India) dhoondne ki koshish
            const maleVoice = voices.find(v => v.name.includes('Male') || v.name.includes('David') || v.name.includes('Google India'));
            
            if (maleVoice) utterance.voice = maleVoice;
            
            utterance.rate = 0.85; // Professional aur clear speed
            utterance.pitch = 0.9; // Thodi bhari (Male) voice ke liye pitch kam
            
            window.speechSynthesis.speak(utterance);
            
            // 3. REMOVE LISTENER (Sirf ek baar bulwane ke liye)
            window.removeEventListener('click', triggerMaleVoice);
        };

        window.addEventListener('click', triggerMaleVoice);

    } catch (e) {
        console.log("Voice Engine Error");
    }
}

// Initial Run
runToofaniVoice();
// Chrome/Edge mein voices load hone mein time leti hain
if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = runToofaniVoice;
}