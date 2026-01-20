document.addEventListener("DOMContentLoaded", function() {
    window.addEventListener('load', () => {
    const preloader = document.getElementById('site-preloader');
    
    // Kam se kam 1 second dikhao taaki smooth lage
    setTimeout(() => {
        if(preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500); // Fade out effect ke liye wait
        }
        
        // Ab heavy notifications trigger karo
        // (Isse load time fast lagega kyunki user ko content dikh chuka hai)
    }, 1000); 
});
    // 1. NAVBAR LOAD (Priority #1 - Isse styling bikhregi nahi)
    $("#navbar-placeholder").load("navbar.html", function(response, status, xhr) {
        if (status == "success") {
            console.log("Navbar Loaded Successfully");
        }
    });

    // 2. DEVICE CHECK
    const isMobile = window.innerWidth <= 768;

    // 3. VIDEO LOGIC (Desktop Only)
    const video = document.getElementById('bg-video-desktop');
    const source = document.getElementById('video-source');

    if (!isMobile && video && source) {
        source.src = 'video/Facebook_1767247893151(720p).mp4';
        video.load();
    } else if (video) {
        video.remove(); // Mobile processor bachaane ke liye delete
    }

    // 4. MOBILE SLIDER LOGIC
    if (isMobile) {
        const sliderImages = document.querySelectorAll('#mobile-hero-slider .slider-image');
        if (sliderImages.length > 0) {
            let currentIdx = 0;
            setInterval(() => {
                sliderImages[currentIdx].classList.remove('active');
                currentIdx = (currentIdx + 1) % sliderImages.length;
                sliderImages[currentIdx].classList.add('active');
            }, 4000);
        }
    }

    // 5. TYPING ANIMATION (Slight delay for Performance)
    setTimeout(() => {
        if (typeof Typed !== 'undefined') {
            new Typed('#typing-text', {
                strings: ['KANPUR PUBLIC SCHOOL', 'ESTABLISHED 2009'],
                typeSpeed: 80,
                backSpeed: 50,
                loop: true,
                cursorChar: '|',
            });
        }
    }, 2000);

    // 6. INSTALL POPUP SETUP
    setupInstallPopup();

}); 

// --- SMART BACKGROUND LOADING (Score & Offline) ---
window.addEventListener('load', () => {
    
    // Service Worker (Offline Support)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js', { scope: '/' })
            .then(reg => console.log('SW Active'))
            .catch(err => console.log('SW Offline Error'));
    }

    // Heavy Tasks Scheduling
    const runHeavyTasks = () => {
        // Footer (1s delay after page ready)
        setTimeout(() => {
            fetch('footer.html').then(res => res.text()).then(html => {
                const footerPlace = document.getElementById('footer-placeholder');
                if(footerPlace) footerPlace.innerHTML = html;
            });
        }, 1000);

        // Google Sheets Data (Mobile Score Booster)
        setTimeout(() => {
            initAllData(); 
        }, 3000);

        // OneSignal Notification Popup
        setTimeout(() => {
            triggerNotifications();
        }, 6000);
    };

    if ('requestIdleCallback' in window) {
        requestIdleCallback(runHeavyTasks);
    } else {
        setTimeout(runHeavyTasks, 2000);
    }
});

// --- CORE FUNCTIONS ---

async function initAllData() {
    const NOTICE_URL = "https://docs.google.com/spreadsheets/d/1zkFojjLzFJLXgSR-ajn_BOMsughsjJUmbVBz8MjJPfI/export?format=csv";
    const VACANCY_URL = "https://docs.google.com/spreadsheets/d/12_QroDIVPlXTaKRc4fDB_vV4bZI2KeAsPKedx1poY_E/export?format=csv";

    try {
        const fetchOptions = { mode: 'cors', cache: 'no-cache' };
        const [nRes, vRes] = await Promise.all([
            fetch(NOTICE_URL, fetchOptions), 
            fetch(VACANCY_URL, fetchOptions)
        ]);
        const nText = await nRes.text();
        const vText = await vRes.text();
        renderNotices(nText);
        renderVacancies(vText);
    } catch (e) { 
        console.log("Running in Offline Mode"); 
    }
}

function renderNotices(csvData) {
    const rows = csvData.split(/\r?\n/).slice(1);
    const container = document.getElementById('notice-feed');
    if (!container) return;
    
    let html = '';
    const aajKiDate = new Date();
    // Time set to 00:00:00 for accurate day comparison
    aajKiDate.setHours(0, 0, 0, 0);

    rows.forEach(row => {
        if (!row.trim()) return;
        const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        
        if (cols.length >= 2) {
            const dateText = cols[0].replace(/"/g, "").trim(); 
            const status = cols[3] ? cols[3].replace(/"/g, "").toLowerCase().trim() : "active";

            // --- Date Parsing ---
            const parts = dateText.split('-')[0].trim().split('/');
            let isNew = false;

            if (parts.length === 3) {
                const nDay = parseInt(parts[0]);
                const nMonth = parseInt(parts[1]) - 1;
                const nYear = parseInt(parts[2]);
                const noticeDate = new Date(nYear, nMonth, nDay);
                
                const diffTime = aajKiDate - noticeDate;
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                
                // Agar notice aaj ka hai ya pichle 5 din ke andar ka hai
                if (diffDays <= 5 && diffDays >= -1) {
                    isNew = true;
                }
            }

            if (status !== 'archived') {
                html += `
                <div class="notice-item">
                    <div class="date-column">
                        <div class="date-box">${dateText}</div>
                    </div>
                    <div class="content-column">
                        <h4>
                            <span>${cols[1].replace(/"/g, "")}</span>
                            ${isNew ? '<span class="new-tag">NEW</span>' : ''}
                        </h4>
                        <p>${cols[2] ? cols[2].replace(/"/g, "") : "Visit office for details."}</p>
                    </div>
                </div>`;
            }
        }
    });
    container.innerHTML = html || '<p>No active notices.</p>';
}

function renderVacancies(csvText) {
    const rows = csvText.split('\n').slice(1);
    const container = document.getElementById('vacancy-list-index');
    if (!container) return;
    let html = '';
    rows.forEach(row => {
        if (!row.trim()) return;
        const cols = row.split(',');
        if (cols.length >= 4 && cols[0].trim() !== "") {
            html += `<div class="job-card">
                <div class="job-info"><h3>${cols[0]}</h3><p>Exp: ${cols[1]} | Qual: ${cols[2]}</p></div>
                <a href="mailto:kpskannauj@gmail.com" class="apply-btn-index">Apply Now</a>
            </div>`;
        }
    });
    container.innerHTML = html || "<p>No active vacancies.</p>";
}

function setupInstallPopup() {
    let deferredPrompt;
    const banner = document.getElementById('installBanner');
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (!localStorage.getItem('hideInstallPopup')) {
            setTimeout(() => { if (banner) banner.style.bottom = '0'; }, 8000);
        }
    });
    document.getElementById('btnInstall')?.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') localStorage.setItem('hideInstallPopup', 'true');
            if (banner) banner.style.bottom = '-100%';
        }
    });
}

window.closeInstallBanner = function() {
    const banner = document.getElementById('installBanner');
    if (banner) {
        banner.style.bottom = '-100%';
        localStorage.setItem('hideInstallPopup', 'true');
    }
};

function triggerNotifications() {
    if (window.OneSignalDeferred) {
        window.OneSignalDeferred.push(async function(OneSignal) {
            // Sirf tabhi prompt karo jab zaroorat ho
            const permission = OneSignal.Notifications.permission;
            
            if (permission === "default") {
                // 8 second ka delay do, taaki user pehle "New" notices padh le
                setTimeout(async () => {
                    // Force Slidedown to NOT push the layout
                    await OneSignal.Slidedown.promptPush({ force: true });
                }, 8000);
            }
        });
    }
}
// Disable Right-Click
document.addEventListener('contextmenu', event => event.preventDefault());

// Disable Key Shortcuts
document.onkeydown = function(e) {
    if (e.keyCode == 123) return false; // F12
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) return false; // Inspect
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) return false; // Console
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) return false; // View Source
};
const STATUS_URL = 'https://docs.google.com/spreadsheets/d/1nxEQWnLKJW39vOwS3bM-4jDVvZAR6uwSfg_bjcnKg_g/export?format=csv&gid=0';

async function updateSchoolStatus() {
    const dot = document.getElementById('status-dot');
    const text = document.getElementById('status-text');

    try {
        const response = await fetch(STATUS_URL);
        const data = await response.text();
        
        
        const rows = data.split('\n').map(row => row.replace(/"/g, '').trim());
        
        
        let val = rows[0].toLowerCase();
        let status = (val === 'status' || val === '') ? rows[1] : rows[0];

        if (status.toLowerCase().includes('open')) {
            dot.className = 'dot status-open';
            text.style.color = '#1b5e20'; // Dark Green text
            text.innerText = 'School is Open Today';
        } else {
            dot.className = 'dot status-closed';
            text.style.color = '#b71c1c'; // Dark Red text
            text.innerText = 'School Closed (Holiday)';
        }
    } catch (e) {
        dot.className = 'dot';
        dot.style.backgroundColor = '#f39c12';
        text.innerText = 'Live: Academic Session 2026';
    }
}
updateSchoolStatus();
const NEWS_TICKER_URL = 'https://docs.google.com/spreadsheets/d/1iI6ocpm_dHj7fLHZdUXBPzICBFGQ7JGxO6ETyMK3U_0/export?format=csv';

async function fetchNewsTicker() {
    const newsDisplay = document.getElementById('news-content');

    try {
        const response = await fetch(NEWS_TICKER_URL, { cache: "no-store" });
        const data = await response.text();
        
        // CSV parsing
        const rows = data.split('\n');
        
        // A2, A3, A4 se news uthana aur quotes hatana
        let newsList = [];
        for (let i = 1; i <= 3; i++) {
            if (rows[i]) {
                let cleanNews = rows[i].replace(/"/g, '').trim();
                if (cleanNews) newsList.push(cleanNews);
            }
        }

        if (newsList.length > 0) {
            // Teeno news ko join karna with extra space and divider
            // &nbsp; space ke liye hai taaki news repeat hone mein delay lage
            let fullNewsString = newsList.join(' &nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp; ');
            
            // Ticker ko lamba karne ke liye repeat karna with huge gap at the end
            newsDisplay.innerHTML = `${fullNewsString} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${fullNewsString}`;
        }
    } catch (error) {
        console.error("News Ticker Error:", error);
        newsDisplay.innerText = "Check back later for more updates!";
    }
}

fetchNewsTicker();
function updateSmartContext() {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hour + (minutes / 60);

    const msgElement = document.getElementById("smart-footer-msg");
    const iconElement = document.getElementById("smart-icon");
    
    if (!msgElement) return;

    let message = "";
    let icon = "";

    if (currentTime >= 8 && currentTime < 9.75) {
        message = "School buses are on their way! 🚌";
        icon = "🌅";
    } 
    else if (currentTime >= 9.75 && currentTime < 10) {
        message = "Assembly Time: Students are gathering for prayers. 🙏";
        icon = "🔔";
    } 
    else if (currentTime >= 10 && currentTime < 15) {
        message = "Learning in Progress: Students are in their classrooms. 📖";
        icon = "✍️";
    } 
    else if (currentTime >= 15 && currentTime < 16) {
        message = "Dispersal Time: Please drive safely near school gates. 🚗";
        icon = "🏫";
    } 
    else if (currentTime >= 16 && currentTime < 17) {
        message = "Evening: Teachers are reviewing today's progress. ✨";
        icon = "🌤️";
    } 
    else {
        message = "K.P.S. Portal is in Sleep Mode. See you tomorrow! 🌙";
        icon = "😴";
    }

    msgElement.innerText = message;
    if(iconElement) iconElement.innerText = icon;
}

// 1. TURANT CALL (Bina kisi event ka wait kiye)
updateSmartContext();

// 2. Refresh every 30 seconds (For accuracy)
setInterval(updateSmartContext, 30000);
